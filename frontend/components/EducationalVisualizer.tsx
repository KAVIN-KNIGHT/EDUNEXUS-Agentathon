"use client";

import React, { useState } from "react";
import { VisualizationData } from "../lib/types";

interface EducationalVisualizerProps {
  visualization: VisualizationData;
}

export default function EducationalVisualizer({ visualization }: EducationalVisualizerProps) {
  const { type, title, data } = visualization;

  return (
    <div className="my-4 rounded-xl border border-indigo-500/30 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            Viz
          </span>
          <h4 className="text-sm font-semibold text-white tracking-wide">
            {title || "Educational Visualization"}
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          whitelisted • {type}
        </span>
      </div>

      {type === "array_indexing" && <ArrayIndexingVisualizer data={data} />}
      {type === "binary_search" && <BinarySearchVisualizer data={data} />}
      {type === "stack_queue" && <StackQueueVisualizer data={data} />}
      {type === "concept_hierarchy" && <ConceptHierarchyVisualizer data={data} />}
    </div>
  );
}

// -------------------------------------------------------------------------
// 1. Array Indexing & Slicing Visualizer
// -------------------------------------------------------------------------
function ArrayIndexingVisualizer({ data }: { data: any }) {
  const items: any[] = data.items || [10, 20, 30, 40, 50];
  const [sliceStart, setSliceStart] = useState<number>(data.highlighted_range?.[0] ?? 1);
  const [sliceStop, setSliceStop] = useState<number>(data.highlighted_range?.[1] ?? 4);

  const slicedItems = items.slice(sliceStart, sliceStop);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <p className="italic">
          Zero-based indexing & slice extraction. Stop index is <strong className="text-amber-400">exclusive</strong>.
        </p>
        <div className="flex items-center gap-2 font-mono text-xs bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
          <span className="text-indigo-400">nums</span>
          <span className="text-slate-400">[</span>
          <span className="text-emerald-400">{sliceStart}</span>
          <span className="text-slate-500">:</span>
          <span className="text-amber-400">{sliceStop}</span>
          <span className="text-slate-400">]</span>
          <span className="text-slate-400">→</span>
          <span className="text-cyan-300 font-bold">[{slicedItems.join(", ")}]</span>
        </div>
      </div>

      {/* Visual Array Grid */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-4">
        {items.map((val, idx) => {
          const negIdx = idx - items.length;
          const isSelected = idx >= sliceStart && idx < sliceStop;
          const isStopBoundary = idx === sliceStop;

          return (
            <div key={idx} className="flex flex-col items-center">
              {/* Positive Index Label */}
              <span className="text-[11px] font-mono font-medium text-slate-400 mb-1">
                +{idx}
              </span>

              {/* Element Box */}
              <div
                className={`relative flex h-14 w-14 items-center justify-center rounded-lg border-2 text-base font-bold transition-all duration-200 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-900/40 scale-105"
                    : isStopBoundary
                    ? "border-dashed border-amber-500/80 bg-amber-500/10 text-slate-300"
                    : "border-slate-700 bg-slate-800/80 text-slate-300"
                }`}
              >
                {val}
                {isSelected && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              {/* Negative Index Label */}
              <span className="text-[11px] font-mono text-slate-500 mt-1">
                {negIdx}
              </span>
            </div>
          );
        })}
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-slate-400">Start (inclusive):</label>
          <select
            value={sliceStart}
            onChange={(e) => setSliceStart(Number(e.target.value))}
            className="rounded bg-slate-800 border border-slate-700 text-white px-2 py-1 focus:outline-none focus:border-indigo-500"
          >
            {items.map((_, i) => (
              <option key={i} value={i}>
                Index {i}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-400">Stop (exclusive):</label>
          <select
            value={sliceStop}
            onChange={(e) => setSliceStop(Number(e.target.value))}
            className="rounded bg-slate-800 border border-slate-700 text-white px-2 py-1 focus:outline-none focus:border-indigo-500"
          >
            {items.concat(null as any).map((_, i) => (
              <option key={i} value={i}>
                Index {i} {i === items.length ? "(End)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 2. Binary Search Visualizer
// -------------------------------------------------------------------------
function BinarySearchVisualizer({ data }: { data: any }) {
  const array: number[] = data.array || [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  const steps: any[] = data.steps || [];
  const target: number = data.target ?? 23;

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const currentStep = steps[currentStepIdx] || { low: data.low ?? 0, high: data.high ?? array.length - 1, mid: data.mid ?? 0, action: "Searching..." };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Target to find: <strong className="text-amber-400 font-mono text-sm">{target}</strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentStepIdx === 0}
            onClick={() => setCurrentStepIdx((p) => Math.max(0, p - 1))}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-medium"
          >
            ← Prev
          </button>
          <span className="text-slate-400 font-mono">
            Step {currentStepIdx + 1} / {Math.max(1, steps.length)}
          </span>
          <button
            disabled={currentStepIdx >= steps.length - 1}
            onClick={() => setCurrentStepIdx((p) => Math.min(steps.length - 1, p + 1))}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-medium"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Array Elements with Low / Mid / High markers */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 py-4 overflow-x-auto">
        {array.map((val, idx) => {
          const isLow = idx === currentStep.low;
          const isHigh = idx === currentStep.high;
          const isMid = idx === currentStep.mid;
          const isTargetFound = val === target && isMid;
          const inRange = idx >= currentStep.low && idx <= currentStep.high;

          return (
            <div key={idx} className="flex flex-col items-center min-w-[40px]">
              {/* Pointer Badges */}
              <div className="h-5 flex items-center justify-center text-[10px] font-bold">
                {isMid ? (
                  <span className="bg-amber-500 text-slate-950 px-1 rounded">MID</span>
                ) : isLow ? (
                  <span className="bg-blue-500 text-white px-1 rounded">LOW</span>
                ) : isHigh ? (
                  <span className="bg-rose-500 text-white px-1 rounded">HIGH</span>
                ) : null}
              </div>

              {/* Element Box */}
              <div
                className={`flex h-12 w-11 items-center justify-center rounded-lg border-2 text-sm font-bold transition-all duration-200 ${
                  isTargetFound
                    ? "border-emerald-400 bg-emerald-500/30 text-emerald-200 ring-2 ring-emerald-500"
                    : isMid
                    ? "border-amber-400 bg-amber-500/20 text-amber-200"
                    : inRange
                    ? "border-slate-600 bg-slate-800/80 text-white"
                    : "border-slate-800/40 bg-slate-950/40 text-slate-600 opacity-40"
                }`}
              >
                {val}
              </div>

              <span className="text-[10px] font-mono text-slate-500 mt-1">{idx}</span>
            </div>
          );
        })}
      </div>

      {/* Step Description Action */}
      <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700/60 text-xs text-slate-300">
        <span className="font-semibold text-indigo-400">Action: </span>
        {currentStep.action || "Comparing midpoint with target value."}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 3. Stack & Queue Visualizer
// -------------------------------------------------------------------------
function StackQueueVisualizer({ data }: { data: any }) {
  const kind: "stack" | "queue" = data.kind || "stack";
  const elements: string[] = data.elements || [];
  const rule: string = data.rule || "";

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-400 italic">
        {rule || (kind === "stack" ? "LIFO: Last-In, First-Out" : "FIFO: First-In, First-Out")}
      </div>

      {kind === "stack" ? (
        /* Vertical Stack Box */
        <div className="flex flex-col items-center">
          <div className="text-xs font-mono text-indigo-400 mb-1">TOP OF STACK ⭣</div>
          <div className="w-64 border-x-2 border-b-2 border-indigo-500/60 rounded-b-xl p-2 bg-slate-950/60 flex flex-col-reverse gap-1.5 min-h-[140px] justify-start">
            {elements.map((elem, idx) => (
              <div
                key={idx}
                className={`py-2 px-3 rounded text-center text-xs font-semibold border ${
                  idx === elements.length - 1
                    ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-300"
                    : "border-slate-700 bg-slate-800/90 text-slate-300"
                }`}
              >
                {elem}
              </div>
            ))}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">CLOSED BOTTOM</div>
        </div>
      ) : (
        /* Horizontal Queue Conduit */
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-between w-full text-xs text-slate-400 font-mono px-2">
            <span>⭠ FRONT (Exit)</span>
            <span>REAR (Entry) ⭠</span>
          </div>
          <div className="flex items-center gap-2 border-y-2 border-cyan-500/50 py-3 px-4 w-full justify-start overflow-x-auto bg-slate-950/60 rounded-lg">
            {elements.map((elem, idx) => (
              <div
                key={idx}
                className={`py-2 px-4 rounded text-xs font-semibold whitespace-nowrap border ${
                  idx === 0
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                    : "border-slate-700 bg-slate-800 text-slate-300"
                }`}
              >
                {elem}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------------------
// 4. Concept Hierarchy Visualizer
// -------------------------------------------------------------------------
function ConceptHierarchyVisualizer({ data }: { data: any }) {
  const root = data.root_concept || "Topic Knowledge";
  const nodes: Array<{ id: string; label: string; description: string; parent_id: string | null }> = data.nodes || [];

  return (
    <div className="space-y-4">
      {/* Root Node */}
      <div className="flex justify-center">
        <div className="rounded-xl border border-indigo-500 bg-indigo-500/20 px-4 py-2 text-center shadow-lg shadow-indigo-950/50">
          <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Root Topic</span>
          <h5 className="text-sm font-bold text-white">{root}</h5>
        </div>
      </div>

      <div className="h-4 flex justify-center">
        <div className="w-0.5 bg-indigo-500/40"></div>
      </div>

      {/* Sub-nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="rounded-lg border border-slate-700/80 bg-slate-800/70 p-3 hover:border-indigo-500/50 transition-colors"
          >
            <h6 className="text-xs font-bold text-indigo-300 mb-1">{node.label}</h6>
            <p className="text-xs text-slate-400 leading-relaxed">{node.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
