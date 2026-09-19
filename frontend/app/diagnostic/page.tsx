"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DiagnosticQuiz from "@/components/DiagnosticQuiz";
import {
  DiagnosticGenerateResponse,
  submitDiagnostic,
  generateDiagnostic,
  DiagnosticSubmitResponse,
} from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";

function DiagnosticContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [diagnostic, setDiagnostic] = useState<DiagnosticGenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initDiagnostic() {
      // 1. Check if cached in sessionStorage
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("edunexus_diagnostic");
        if (stored) {
          try {
            const parsed: DiagnosticGenerateResponse = JSON.parse(stored);
            setDiagnostic(parsed);
            setIsLoading(false);
            return;
          } catch (e) {
            console.error("Failed to parse cached diagnostic:", e);
          }
        }
      }

      // 2. If not cached, generate default demo topic diagnostic
      try {
        const defaultTopic = "Python Lists — Indexing and Slicing";
        const generated = await generateDiagnostic(defaultTopic);
        setDiagnostic(generated);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("edunexus_diagnostic", JSON.stringify(generated));
        }
      } catch (err: any) {
        setError(err.message || "Failed to load diagnostic assessment.");
      } finally {
        setIsLoading(false);
      }
    }

    initDiagnostic();
  }, [searchParams]);

  const handleSubmit = async (answers: Record<string, string>): Promise<DiagnosticSubmitResponse> => {
    if (!diagnostic) {
      throw new Error("No active diagnostic assessment found.");
    }
    return await submitDiagnostic(diagnostic.diagnostic_id, "demo_student", answers);
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("edunexus_diagnostic");
    }
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Preparing Diagnostic Assessment...</h2>
        <p className="text-sm text-slate-400">Grounded in syllabus source material via vector retrieval.</p>
      </div>
    );
  }

  if (error || !diagnostic) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-panel rounded-2xl border border-red-800/60 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">Assessment Unavailable</h2>
        <p className="text-sm text-slate-300 mb-6">{error || "Could not retrieve diagnostic assessment."}</p>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          Return to Topics
        </button>
      </div>
    );
  }

  return (
    <DiagnosticQuiz
      diagnosticId={diagnostic.diagnostic_id}
      topic={diagnostic.topic}
      questions={diagnostic.questions}
      onSubmit={handleSubmit}
      onReset={handleReset}
    />
  );
}

export default function DiagnosticPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <DiagnosticContent />
    </Suspense>
  );
}
