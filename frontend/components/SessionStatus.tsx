"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertOctagon, Clock, ArrowRight, RotateCcw } from "lucide-react";

interface SessionStatusProps {
  status: string;
  score?: number;
  cycle?: number;
  onRestartTopic?: () => void;
}

export default function SessionStatus({ status, score = 0, cycle = 1, onRestartTopic }: SessionStatusProps) {
  if (status === "MASTERED") {
    return (
      <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
          Mastery Verified
        </span>
        <h3 className="text-2xl font-bold text-white mt-3 mb-2">
          Conceptual Mastery Achieved!
        </h3>
        <p className="text-slate-300 text-sm max-w-lg mx-auto mb-6">
          You scored <strong>2/2</strong> on the transfer verification. Your misconception has been completely corrected and recorded in long-term memory.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/progress"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
          >
            View Mastery Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/topics"
            className="px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium text-sm transition-colors"
          >
            Choose Next Topic
          </Link>
        </div>
      </div>
    );
  }

  if (status === "DEFERRED") {
    return (
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wider">
          Deferred by Learner
        </span>
        <h3 className="text-2xl font-bold text-white mt-3 mb-2">
          Topic Deferred
        </h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          You selected &ldquo;Skip for Now&rdquo;. This misconception is saved in your memory profile and can be revisited at any time.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/topics"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
          >
            Return to Topics
          </Link>
        </div>
      </div>
    );
  }

  if (status === "UNRESOLVED_AFTER_LIMIT") {
    return (
      <div className="bg-gradient-to-b from-rose-950/30 to-slate-900 border border-rose-500/40 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
          Cycles Limit Reached
        </span>
        <h3 className="text-2xl font-bold text-white mt-3 mb-2">
          Unresolved After 2 Remediation Cycles
        </h3>
        <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
          Both remediation strategies were attempted, but transfer verification was not passed (Score: {score}/2). The topic is flagged for teacher or deeper review.
        </p>
        <div className="flex items-center justify-center gap-4">
          {onRestartTopic && (
            <button
              onClick={onRestartTopic}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Fresh Session
            </button>
          )}
          <Link
            href="/topics"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
          >
            Browse Other Topics
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
