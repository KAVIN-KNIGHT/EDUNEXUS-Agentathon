"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchStudentMemory } from "@/lib/api";
import { LearnerMemoryRecord, MasteryRecord } from "@/lib/types";
import { Brain, CheckCircle2, AlertTriangle, Clock, AlertOctagon, ArrowRight } from "lucide-react";

export default function MemoryPage() {
  const [memoryData, setMemoryData] = useState<{
    student_id: string;
    memories: LearnerMemoryRecord[];
    masteries: MasteryRecord[];
    misconceptions: any[];
    total_mastered: number;
    active_misconceptions_count: number;
    deferred_count: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudentMemory("Ananya")
      .then((data) => {
        setMemoryData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Loading learner memory...</div>;
  }

  const memories = memoryData?.memories || [];
  const masteries = memoryData?.masteries || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
          <Brain className="w-4 h-4" />
          Long-Term Cognitive Memory
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Learner Memory Profile: Ananya
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mt-1">
          EDUNEXUS persists conceptual misconceptions and verified masteries in SQLite. Future sessions load this history to prevent redundant questioning and customize pedagogical strategy.
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">
            Mastered Concepts
          </span>
          <p className="text-3xl font-extrabold text-emerald-400">{masteries.length}</p>
          <p className="text-xs text-slate-400 mt-1">Demonstrated 2/2 transfer verification</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">
            Total Memory Traces
          </span>
          <p className="text-3xl font-extrabold text-indigo-400">{memories.length}</p>
          <p className="text-xs text-slate-400 mt-1">Persisted misconception events</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">
            Deferred Items
          </span>
          <p className="text-3xl font-extrabold text-amber-400">{memoryData?.deferred_count || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Awaiting learner-initiated revision</p>
        </div>
      </div>

      {/* Mastered Records */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Verified Mastered Sub-concepts
        </h3>
        {masteries.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No masteries recorded yet. Complete a learning loop to verify mastery.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {masteries.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/20 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-white text-base">{m.subconcept}</h4>
                  <span className="text-xs text-emerald-400 font-mono">
                    Score: {m.verification_score}/2 Verified
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  MASTERED
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Persistent Misconception Log */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          Tracked Misconceptions & Cognitive History
        </h3>
        {memories.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No historical misconceptions logged.</p>
        ) : (
          <div className="space-y-3">
            {memories.map((mem) => {
              const badgeColor =
                mem.status === "MASTERED"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : mem.status === "DEFERRED"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : mem.status === "UNRESOLVED"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

              return (
                <div
                  key={mem.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-100 font-mono">
                      &ldquo;{mem.misconception}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>First observed: {mem.first_seen ? new Date(mem.first_seen).toLocaleDateString() : "Recent"}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${badgeColor}`}>
                    {mem.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
