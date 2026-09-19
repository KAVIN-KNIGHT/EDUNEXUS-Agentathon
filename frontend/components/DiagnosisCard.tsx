"use client";

import React from "react";
import { AlertTriangle, BookOpen, Clock, ArrowRight, ShieldAlert } from "lucide-react";

interface DiagnosisCardProps {
  hypothesis: string;
  evidence: string[];
  weakSubconcepts: string[];
  onRevise: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export default function DiagnosisCard({
  hypothesis,
  evidence,
  weakSubconcepts,
  onRevise,
  onSkip,
  isLoading = false,
}: DiagnosisCardProps) {
  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Stage 2: Diagnosis Complete
            </span>
            <h3 className="text-xl font-bold text-white">Targeted Misconception Identified</h3>
          </div>
        </div>

        {/* Misconception statement */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6 mb-6">
          <p className="text-xs uppercase font-semibold text-amber-400/80 mb-1">
            Diagnostic Hypothesis
          </p>
          <p className="text-lg font-semibold text-amber-200 leading-relaxed">
            &ldquo;{hypothesis}&rdquo;
          </p>
        </div>

        {/* Weak sub-concepts tags */}
        {weakSubconcepts && weakSubconcepts.length > 0 && (
          <div className="mb-6">
            <span className="text-xs text-slate-400 block mb-2 font-medium">
              Flagged Sub-concept(s) below mastery threshold (&lt; 60%):
            </span>
            <div className="flex flex-wrap gap-2">
              {weakSubconcepts.map((sub, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Supporting Evidence */}
        <div className="mb-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Supporting Answer Patterns (Evidence)
          </h4>
          <div className="space-y-2.5">
            {evidence && evidence.length > 0 ? (
              evidence.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 text-sm text-slate-300 font-mono leading-relaxed"
                >
                  <span className="text-amber-400 font-bold mr-2">#{idx + 1}</span>
                  {item}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">Two recurring error signals detected.</p>
            )}
          </div>
        </div>

        {/* Decision Actions */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 max-w-sm">
            EDUNEXUS requires your active decision. Interventions are never forced automatically without your approval.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isLoading}
              onClick={onSkip}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              Skip for Now
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onRevise}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Revise Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
