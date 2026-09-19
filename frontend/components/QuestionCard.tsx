"use client";

import React from "react";
import { QuestionClientView } from "@/lib/api";

interface QuestionCardProps {
  question: QuestionClientView;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onSelectAnswer: (answer: string) => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
}: QuestionCardProps) {
  const letters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800">
      {/* Meta header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {question.subconcept}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            ID: {question.id}
          </span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question Text */}
      <h2
        id={`question-title-${question.id}`}
        className="text-lg sm:text-xl font-semibold text-slate-100 mb-8 leading-relaxed"
      >
        {question.question}
      </h2>

      {/* Options List */}
      <div className="space-y-3" role="radiogroup" aria-labelledby={`question-title-${question.id}`}>
        {question.options.map((option, idx) => {
          const letter = letters[idx] || `${idx + 1}`;
          const isSelected = selectedAnswer === option || selectedAnswer === letter;

          return (
            <button
              key={idx}
              id={`option-${question.id}-${idx}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectAnswer(option)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-start gap-4 border ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 hover:text-white"
              }`}
            >
              {/* Option Letter Indicator */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {letter}
              </div>

              {/* Option Text */}
              <span className="text-sm sm:text-base pt-1 font-normal leading-relaxed">
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
