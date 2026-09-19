"use client";

import React, { useState } from "react";
import { AgentEvent } from "@/lib/types";
import { Activity, ChevronDown, ChevronUp, Bot, Clock } from "lucide-react";

interface AgentTraceProps {
  events: AgentEvent[];
}

export default function AgentTrace({ events }: AgentTraceProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!events || events.length === 0) return null;

  const formatEventLabel = (type: string): string => {
    switch (type) {
      case "SESSION_STARTED":
        return "Adaptive learning session started";
      case "DIAGNOSTIC_GENERATED":
        return "Grounded diagnostic questions generated";
      case "DIAGNOSTIC_SUBMITTED":
        return "Diagnostic responses recorded";
      case "ANALYSIS_COMPLETED":
        return "Diagnostic responses analyzed";
      case "MISCONCEPTION_IDENTIFIED":
        return "Targeted misconception hypothesis formulated";
      case "LEARNER_SELECTED_REVISE":
        return "Learner authorized remediation intervention";
      case "REMEDIATION_GENERATED":
        return "Focused pedagogical remediation generated";
      case "VERIFICATION_GENERATED":
        return "Transfer verification questions generated";
      case "VERIFICATION_FAILED":
        return "Verification test failed; triggering replan";
      case "REMEDIATION_CYCLE_STARTED":
        return "Next remediation cycle started with differentiated strategy";
      case "VERIFICATION_PASSED":
        return "Transfer verification passed successfully";
      case "MASTERY_RECORDED":
        return "Mastery record written to long-term memory";
      case "MISCONCEPTION_DEFERRED":
        return "Topic deferred to learner memory";
      case "UNRESOLVED_AFTER_LIMIT":
        return "Maximum cycles reached; flagged as unresolved";
      default:
        return type.replace(/_/g, " ").toLowerCase();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-950/60 hover:bg-slate-950 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Multi-Agent Activity Feed ({events.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-2 max-h-64 overflow-y-auto font-mono text-xs divide-y divide-slate-800/60">
          {events.map((evt, idx) => (
            <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                <div>
                  <span className="text-slate-200 font-medium">
                    {formatEventLabel(evt.event_type)}
                  </span>
                  {evt.payload && Object.keys(evt.payload).length > 0 && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {evt.payload.strategy && (
                        <span className="text-teal-300 mr-2">Strategy: {evt.payload.strategy}</span>
                      )}
                      {evt.payload.cycle && (
                        <span className="text-amber-300 mr-2">Cycle: {evt.payload.cycle}</span>
                      )}
                      {evt.payload.score !== undefined && (
                        <span className="text-emerald-300">Score: {evt.payload.score}/2</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {evt.timestamp && (
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(evt.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
