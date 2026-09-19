"use client";

import React from "react";
import { Topic } from "@/lib/types";
import { BookOpen, Layers, ArrowRight } from "lucide-react";

interface TopicCardProps {
  topic: Topic;
  onSelect: (topicName: string) => void;
  isLoading?: boolean;
}

export default function TopicCard({ topic, onSelect, isLoading = false }: TopicCardProps) {
  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all rounded-3xl p-7 shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            {topic.chunk_count} RAG chunks
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
          {topic.name}
        </h3>

        <div className="mb-6">
          <span className="text-xs text-slate-400 block mb-2 font-medium">Included Sub-concepts:</span>
          <div className="flex flex-wrap gap-1.5">
            {topic.subconcepts.map((sub, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={isLoading}
        onClick={() => onSelect(topic.name)}
        className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        Start Adaptive Loop
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
