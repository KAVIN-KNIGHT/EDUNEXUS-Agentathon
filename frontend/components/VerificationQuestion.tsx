"use client";

import React from "react";
import { Question } from "@/lib/types";
import { Check, X } from "lucide-react";

interface VerificationQuestionProps {
  question: Question;
  index: number;
  total: number;
  selectedAnswer: string;
  onSelectAnswer: (answer: string) => void;
  resultStatus?: {
    isSubmitted: boolean;
    isCorrect: boolean;
  };
  disabled?: boolean;
}

export default function VerificationQuestion({
  question,
  index,
  total,
  selectedAnswer,
  onSelectAnswer,
  resultStatus,
  disabled = false,
}: VerificationQuestionProps) {
  const isSubmitted = resultStatus?.isSubmitted;
  const isCorrect = resultStatus?.isCorrect;

  return (
    <div
      className={`border rounded-2xl p-6 transition-all shadow-md ${
        isSubmitted
          ? isCorrect
            ? "bg-emerald-950/20 border-emerald-500/40"
            : "bg-rose-950/20 border-rose-500/40"
          : "bg-slate-900/80 border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
          Verification Task {index + 1} of {total}
        </span>

        {isSubmitted && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isCorrect
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            {isCorrect ? "Correct" : "Incorrect"}
          </span>
        )}
      </div>

      <h4 className="text-base font-semibold text-slate-100 leading-relaxed mb-5 font-mono">
        {question.question}
      </h4>

      <div className="space-y-3">
        {question.options.map((option, optIdx) => {
          const isSelected = selectedAnswer === option;

          return (
            <button
              key={optIdx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectAnswer(option)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                isSelected
                  ? "bg-teal-600/20 border-teal-500 text-white ring-1 ring-teal-500/40 shadow-md shadow-teal-500/10"
                  : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
              } ${disabled ? "cursor-default" : "cursor-pointer"}`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isSelected ? "bg-teal-600 text-white" : "bg-slate-700 text-slate-400"
                }`}
              >
                {String.fromCharCode(65 + optIdx)}
              </span>
              <span className="text-sm leading-snug">{option}</span>
            </button>
          );
        })}
      </div>

      {isSubmitted && question.explanation && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <strong className="text-slate-300">Explanation: </strong>
          {question.explanation}
        </div>
      )}
    </div>
  );
}
