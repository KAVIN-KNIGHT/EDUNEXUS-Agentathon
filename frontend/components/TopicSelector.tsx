"use client";

import React, { useState } from "react";
import { Topic } from "@/lib/api";
import { BookOpen, Sparkles, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

interface TopicSelectorProps {
  topics: Topic[];
  selectedTopic: string;
  onSelectTopic: (topicName: string) => void;
  onStartDiagnostic: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

export default function TopicSelector({
  topics,
  selectedTopic,
  onSelectTopic,
  onStartDiagnostic,
  isLoading,
  errorMessage,
}: TopicSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          First Working Component: Diagnostic Agent
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          EDUNEXUS
        </h1>
        <p className="text-xl sm:text-2xl font-medium text-indigo-300 mb-4">
          Adaptive Mastery Learning
        </p>
        <p className="text-slate-400 max-w-xl mx-auto text-base sm:text-lg">
          Choose a topic to begin your diagnostic.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-sm flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
          <div>
            <strong className="font-semibold">Grounding Error:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Topic Selection Grid */}
      <div className="grid grid-cols-1 gap-6 mb-10">
        {topics.map((topic) => {
          const isSelected = selectedTopic === topic.name;
          return (
            <div
              key={topic.id}
              onClick={() => onSelectTopic(topic.name)}
              className={`glass-panel-interactive cursor-pointer p-6 sm:p-8 rounded-2xl border transition-all ${
                isSelected
                  ? "border-indigo-500 bg-slate-900/90 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500"
                  : "border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">
                      {topic.name}
                    </h2>
                    <span className="text-xs text-slate-400">
                      Grounded Syllabus Module • Vector Store Indexed
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "border-slate-700 bg-slate-900 text-transparent"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              {/* Sub-concepts */}
              <div className="mt-4 pt-4 border-t border-slate-800/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Targeted Sub-concepts:
                </div>
                <div className="flex flex-wrap gap-2">
                  {topic.subconcepts.map((sub, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="text-sm text-slate-400 text-center sm:text-left">
          Selected Topic: <span className="font-semibold text-slate-200">{selectedTopic}</span>
        </div>
        <button
          id="btn-start-diagnostic"
          type="button"
          onClick={onStartDiagnostic}
          disabled={isLoading || !selectedTopic}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Assessment...</span>
            </>
          ) : (
            <>
              <span>Start Diagnostic</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
