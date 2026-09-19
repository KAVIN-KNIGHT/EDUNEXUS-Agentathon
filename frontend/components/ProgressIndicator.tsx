"use client";

import React from "react";
import { CheckCircle2, Circle, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";

interface ProgressIndicatorProps {
  currentState: string;
  cycle?: number;
  finalStatus?: string;
}

const STAGES = [
  { id: "TEST", label: "TEST", sub: "Diagnostic 5-Q" },
  { id: "DIAGNOSE", label: "DIAGNOSE", sub: "Misconception Analysis" },
  { id: "INTERVENE", label: "INTERVENE", sub: "Targeted Remediation" },
  { id: "VERIFY", label: "VERIFY", sub: "2-Q Transfer Test" },
  { id: "REPLAN", label: "REPLAN", sub: "Outcome & Mastery" },
];

export default function ProgressIndicator({ currentState, cycle = 0, finalStatus }: ProgressIndicatorProps) {
  const getActiveStageIndex = (): number => {
    switch (currentState) {
      case "TOPIC_SELECTED":
      case "GENERATE_DIAGNOSTIC":
      case "AWAITING_ANSWERS":
        return 0;
      case "ANALYSE":
      case "AWAITING_LEARNER_DECISION":
        return 1;
      case "REMEDIATE":
        return 2;
      case "VERIFY":
      case "AWAITING_VERIFICATION_ANSWERS":
        return 3;
      case "MASTERED":
      case "DEFERRED":
      case "UNRESOLVED_AFTER_LIMIT":
        return 4;
      default:
        return 0;
    }
  };

  const activeIdx = getActiveStageIndex();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">
            Adaptive Mastery Loop
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">Learning Workflow</h3>
        </div>
        {cycle > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            Remediation Cycle {cycle} of 2
          </span>
        )}
      </div>

      <div className="relative flex items-center justify-between">
        {/* Connection line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 transition-all duration-500 -z-0"
          style={{ width: `${(activeIdx / (STAGES.length - 1)) * 100}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIdx || finalStatus === "MASTERED";
          const isCurrent = idx === activeIdx && finalStatus !== "MASTERED";

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : isCurrent
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-500/30 shadow-lg shadow-indigo-500/30 scale-110"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span
                className={`mt-2 text-xs font-semibold tracking-wide transition-colors ${
                  isCurrent ? "text-indigo-400 font-bold" : isCompleted ? "text-emerald-400" : "text-slate-500"
                }`}
              >
                {stage.label}
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:block max-w-[90px] text-center truncate">
                {stage.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
