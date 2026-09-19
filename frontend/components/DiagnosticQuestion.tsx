"use client";

import React from "react";
import { Question } from "@/lib/types";

interface DiagnosticQuestionProps {
  question: Question;
  index: number;
  total: number;
  selectedAnswer: string;
  onSelectAnswer: (answer: string) => void;
  disabled?: boolean;
}

export default function DiagnosticQuestion({
  question,
  index,
  total,
  selectedAnswer,
  onSelectAnswer,
  disabled = false,
}: DiagnosticQuestionProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Question {index + 1} of {total}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          Sub-concept: <strong className="text-teal-400">{question.subconcept}</strong>
        </span>
      </div>

      <h4 className="text-base font-semibold text-slate-100 leading-relaxed mb-5 font-mono">
        {question.question}
      </h4>

      <div className="space-y-3">
        {question.options.map((option, optIdx) => {
          const letter = chr(65 + optIdx);
          const isSelected = selectedAnswer === option || selectedAnswer === letter;

          return (
            <button
              key={optIdx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectAnswer(option)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40"
                  : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isSelected ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-400"
                }`}
              >
                {chr(65 + optIdx)}
              </span>
              <span className="text-sm leading-snug">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function chr(code: number) {
  return String.fromCharCode(code);
}
