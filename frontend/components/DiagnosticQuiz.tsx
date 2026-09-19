"use client";

import React, { useState } from "react";
import { QuestionClientView, DiagnosticSubmitResponse } from "@/lib/api";
import QuestionCard from "./QuestionCard";
import { CheckCircle, ChevronLeft, ChevronRight, Send, ArrowLeft, Loader2 } from "lucide-react";

interface DiagnosticQuizProps {
  diagnosticId: string;
  topic: string;
  questions: QuestionClientView[];
  onSubmit: (answers: Record<string, string>) => Promise<DiagnosticSubmitResponse>;
  onReset: () => void;
}

export default function DiagnosticQuiz({
  diagnosticId,
  topic,
  questions,
  onSubmit,
  onReset,
}: DiagnosticQuizProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<DiagnosticSubmitResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isFirstQuestion = currentIndex === 0;

  const handleSelectAnswer = (answer: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await onSubmit(answers);
      setSubmissionResult(res);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit diagnostic.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- After Submission View ---
  if (submissionResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Diagnostic submitted successfully.
          </h2>

          <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800 text-indigo-300 text-sm font-semibold mb-6">
            {submissionResult.questions_answered} questions answered.
          </div>

          <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
            {submissionResult.feedback_notice}
          </p>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-8 text-left text-xs font-mono text-slate-400 space-y-1.5">
            <div><strong>Attempt ID:</strong> {submissionResult.attempt_id}</div>
            <div><strong>Diagnostic ID:</strong> {submissionResult.diagnostic_id}</div>
            <div><strong>Topic:</strong> {topic}</div>
            <div><strong>Student ID:</strong> {submissionResult.student_id}</div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="px-6 py-3 rounded-xl font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Topic Selection</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const answeredCount = Object.keys(answers).length;
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
              EDUNEXUS
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Diagnostic Assessment
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block mb-1">Progress</span>
            <span className="text-sm font-bold text-indigo-300">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
        </div>

        <div className="text-sm text-slate-300 mb-4">
          Topic: <span className="font-semibold text-white">{topic}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-sm">
          {submitError}
        </div>
      )}

      {/* Current Question Card */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={totalQuestions}
        selectedAnswer={answers[currentQuestion.id]}
        onSelectAnswer={handleSelectAnswer}
      />

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4 mt-8">
        {/* Previous Button */}
        <button
          id="btn-previous-question"
          type="button"
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          className="px-5 py-3 rounded-xl text-sm font-medium border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-xs text-slate-400">
          {answeredCount} of {totalQuestions} answered
        </div>

        {/* Next or Submit Button */}
        {isLastQuestion ? (
          <button
            id="btn-submit-diagnostic"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount < totalQuestions}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Diagnostic</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            id="btn-next-question"
            type="button"
            onClick={handleNext}
            className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-2"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
