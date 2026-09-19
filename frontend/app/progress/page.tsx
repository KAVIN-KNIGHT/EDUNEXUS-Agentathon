"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchStudentProgress } from "@/lib/api";
import { BarChart3, CheckCircle2, RotateCcw, ArrowRight, BookOpen, Layers } from "lucide-react";

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<{
    student_id: string;
    total_sessions: number;
    completed_sessions: number;
    mastered_subconcepts: any[];
    sessions: any[];
    memory_records: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudentProgress("Ananya")
      .then((data) => {
        setProgressData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Loading progress profile...</div>;
  }

  const sessions = progressData?.sessions || [];
  const masteries = progressData?.mastered_subconcepts || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
          <BarChart3 className="w-4 h-4" />
          Mastery Analytics & Longitudinal Progress
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Learning Progress: Ananya
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mt-1">
          Longitudinal tracking of all diagnostic attempts, remediation interventions, and transfer verification outcomes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">
            Total Sessions
          </span>
          <p className="text-3xl font-extrabold text-white">{progressData?.total_sessions || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Adaptive learning encounters</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">
            Completed Loops
          </span>
          <p className="text-3xl font-extrabold text-teal-400">{progressData?.completed_sessions || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Concluded learning cycles</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">
            Mastered Concepts
          </span>
          <p className="text-3xl font-extrabold text-emerald-400">{masteries.length}</p>
          <p className="text-xs text-slate-400 mt-1">Validated via 2/2 transfer tests</p>
        </div>
      </div>

      {/* Session History Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Adaptive Session History
        </h3>

        {sessions.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No sessions logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 font-mono">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 pb-3">
                <tr>
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Cycle</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {sessions.map((s, idx) => {
                  const statusColor =
                    s.final_status === "MASTERED"
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : s.final_status === "DEFERRED"
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : s.final_status === "UNRESOLVED_AFTER_LIMIT"
                      ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                      : "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";

                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-200">{s.session_id.slice(0, 13)}</td>
                      <td className="py-3.5 px-4 text-white font-sans">{s.topic_name}</td>
                      <td className="py-3.5 px-4">Cycle {s.remediation_cycle}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold border ${statusColor}`}>
                          {s.final_status || s.current_state}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/session/${s.session_id}`}
                          className="text-teal-400 hover:text-teal-300 font-sans font-semibold inline-flex items-center gap-1"
                        >
                          Open <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
