"use client";

import React from "react";
import { RemediationContent } from "@/lib/types";
import { Lightbulb, Code2, ArrowRight, Compass, Sparkles } from "lucide-react";

interface RemediationCardProps {
  remediation: RemediationContent;
  onProceedToVerification: () => void;
  isLoading?: boolean;
}

export default function RemediationCard({
  remediation,
  onProceedToVerification,
  isLoading = false,
}: RemediationCardProps) {
  const strategyLabel =
    remediation.strategy === "conceptual_rule"
      ? "Cycle 1 Strategy: Conceptual Rule & Formula"
      : "Cycle 2 Strategy: Worked Example & Boundary Index Tracing";

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-teal-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Stage 3: Targeted Intervention
              </span>
              <h3 className="text-xl font-bold text-white">{remediation.title}</h3>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 shrink-0">
            <Compass className="w-3.5 h-3.5" />
            {strategyLabel}
          </span>
        </div>

        {/* Misconception targeted */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 mb-6 text-xs text-slate-300">
          <span className="text-slate-500 font-semibold block uppercase mb-1">
            Targeted Misconception
          </span>
          <span className="text-slate-200 font-medium font-mono">
            {remediation.misconception_addressed}
          </span>
        </div>

        {/* Focused explanation */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Conceptual Insight & Explanation
          </h4>
          <div className="text-slate-200 leading-relaxed text-sm whitespace-pre-line space-y-2">
            {remediation.explanation}
          </div>
        </div>

        {/* Examples / Tracing Walkthrough */}
        {remediation.examples && remediation.examples.length > 0 && (
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-teal-400" />
              Trace & Worked Examples
            </h4>
            <div className="space-y-2 bg-slate-950 rounded-2xl p-5 border border-slate-800/80 font-mono text-xs">
              {remediation.examples.map((ex, i) => (
                <div
                  key={i}
                  className={`${
                    ex.startsWith("#") ? "text-slate-500 italic" : "text-emerald-300 font-medium"
                  }`}
                >
                  {ex}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Call to Action */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Reading alone is <strong>not</strong> mastery. You must demonstrate conceptual mastery on the transfer verification.
          </p>
          <button
            type="button"
            disabled={isLoading}
            onClick={onProceedToVerification}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
          >
            Start Transfer Verification
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
