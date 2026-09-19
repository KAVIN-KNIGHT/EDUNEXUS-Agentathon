"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchTopics, createSession } from "@/lib/api";
import { Topic, DocumentUploadResponse } from "@/lib/types";
import TopicCard from "@/components/TopicCard";
import DocumentUpload from "@/components/DocumentUpload";
import LearningMaterialsList from "@/components/LearningMaterialsList";
import { BookOpen, Sparkles, FolderOpen } from "lucide-react";

export default function TopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSessionTopic, setActiveSessionTopic] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadTopics = () => {
    setIsLoading(true);
    fetchTopics()
      .then((data) => {
        setTopics(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Topics fetch error:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadTopics();
  }, [refreshTrigger]);

  const handleSelectTopic = async (topicName: string) => {
    try {
      setActiveSessionTopic(topicName);
      const res = await createSession("Ananya", topicName);
      router.push(`/session/${res.session_id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start session. Ensure the backend server is running.");
      setActiveSessionTopic(null);
    }
  };

  const handleUploadSuccess = (_doc: DocumentUploadResponse) => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
          <BookOpen className="w-4 h-4" />
          Grounded Course & Document Memory
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Learning Library & Uploads
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mt-1">
          Learn either from pre-indexed textbook modules or upload your own PDF/TXT document. Every question and remediation is strictly grounded in the selected source.
        </p>
      </div>

      {/* Document Upload Section */}
      <DocumentUpload onUploadSuccess={handleUploadSuccess} />

      {/* Uploaded Materials List */}
      <LearningMaterialsList refreshTrigger={refreshTrigger} />

      {/* Pre-indexed Curriculum Topics */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
              Pre-Indexed Course Topics
            </h2>
            <p className="text-xs text-slate-400">
              Standard curriculum topics seeded in ChromaDB vector memory.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-slate-400 font-medium">
            Loading topic library...
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            No topics found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((t) => (
              <TopicCard
                key={t.id}
                topic={t}
                isLoading={activeSessionTopic === t.name}
                onSelect={handleSelectTopic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
