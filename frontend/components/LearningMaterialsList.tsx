"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  FileCode,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  BookOpen,
  Loader2,
  Sparkles
} from "lucide-react";
import { fetchDocuments, createSession } from "@/lib/api";
import { DocumentItem } from "@/lib/types";

interface LearningMaterialsListProps {
  studentId?: string;
  refreshTrigger?: number;
}

export default function LearningMaterialsList({
  studentId = "Ananya",
  refreshTrigger = 0
}: LearningMaterialsListProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startingDocId, setStartingDocId] = useState<string | null>(null);

  const loadDocs = () => {
    setIsLoading(true);
    fetchDocuments()
      .then((data) => {
        setDocuments(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load documents:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadDocs();
  }, [refreshTrigger]);

  const handleStartSession = async (doc: DocumentItem) => {
    try {
      setStartingDocId(doc.document_id);
      const res = await createSession(studentId, doc.topic_name, doc.document_id);
      router.push(`/session/${res.session_id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to start learning session.");
      setStartingDocId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
        <span>Loading learning materials...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <p className="font-semibold text-slate-300">No uploaded documents yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Upload a PDF or TXT above to start an adaptive loop grounded in your own content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-400" />
            Uploaded Learning Materials ({documents.length})
          </h3>
          <p className="text-xs text-slate-400">
            Click to launch an adaptive mastery loop strictly scoped to that document.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const isStarting = startingDocId === doc.document_id;
          const isPdf = doc.source_type === "pdf" || doc.filename.endsWith(".pdf");
          return (
            <div
              key={doc.document_id}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0">
                      {isPdf ? <FileText className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {doc.filename}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {doc.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    {doc.chunk_count} chunks
                  </span>
                  <span>•</span>
                  <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span className="truncate max-w-[120px] text-teal-400/80">
                    {doc.topic_name}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  {doc.document_id}
                </span>

                <button
                  type="button"
                  onClick={() => handleStartSession(doc)}
                  disabled={isStarting}
                  className="px-4 py-2 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/40 text-teal-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Session</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
