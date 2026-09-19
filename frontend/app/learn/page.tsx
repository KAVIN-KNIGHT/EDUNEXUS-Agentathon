"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  fetchTopics, fetchDocuments, uploadDocument, sendLearnChat,
  checkUnderstanding, fetchLearningHistory, generateAnimation,
  Topic, DocumentItem, LearnChatResponse, LearnedConceptRecord, Question, AnimationData
} from "../../lib/api";
import EducationalVisualizer from "../../components/EducationalVisualizer";
import AnimatedTutorPlayer from "../../components/AnimatedTutorPlayer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: LearnChatResponse["sources"];
  visualization?: LearnChatResponse["visualization"];
  learnedConcept?: LearnChatResponse["learned_concept"];
  suggestedFollowups?: string[];
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm your study companion. You can ask me to explain any concept, or select a document above to ground our conversation in your own notes.\n\nWhat would you like to learn today?",
  suggestedFollowups: [
    "Explain binary search step-by-step",
    "How does Python list slicing work?",
    "What is the difference between a Stack and a Queue?",
  ],
};

export default function LearnPage() {
  const studentId = "student_demo";
  const [topics, setTopics] = useState<Topic[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [activeAnimations, setActiveAnimations] = useState<Record<string, { data?: AnimationData; isLoading: boolean }>>({});
  const [learningHistory, setLearningHistory] = useState<LearnedConceptRecord[]>([]);

  const [activeCheck, setActiveCheck] = useState<{
    conceptName: string; topicId: string;
    question: Question | null; selectedOption: string;
    result: { isCorrect: boolean; feedback: string } | null;
    isChecking: boolean;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeCheck]);

  async function loadInitialData() {
    try {
      const [tList, dList, hData] = await Promise.all([
        fetchTopics(),
        fetchDocuments(),
        fetchLearningHistory(studentId).catch(() => ({ learned_concepts: [] })),
      ]);
      setTopics(tList);
      setDocuments(dList);
      setLearningHistory(hData.learned_concepts || []);
      if (tList.length > 0 && !selectedTopicId) setSelectedTopicId(tList[0].id);
    } catch (err) {
      console.error("Learn load error:", err);
    }
  }

  async function handleSendMessage(queryText?: string) {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: Message = { id: `u_${Date.now()}`, role: "user", content: q };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await sendLearnChat({
        studentId, query: q,
        topicId: selectedTopicId || undefined,
        documentId: selectedDocId || undefined,
        history: historyPayload,
      });

      setMessages(prev => [...prev, {
        id: `a_${Date.now()}`, role: "assistant",
        content: res.response,
        sources: res.sources,
        visualization: res.visualization,
        learnedConcept: res.learned_concept,
        suggestedFollowups: res.suggested_followups,
      }]);

      const updated = await fetchLearningHistory(studentId);
      setLearningHistory(updated.learned_concepts || []);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `e_${Date.now()}`, role: "assistant",
        content: `Something went wrong: ${err.message || "Please try again."}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const uploaded = await uploadDocument(file, file.name);
      const updatedDocs = await fetchDocuments();
      setDocuments(updatedDocs);
      setSelectedDocId(uploaded.document_id);
      setMessages(prev => [...prev, {
        id: `sys_${Date.now()}`, role: "assistant",
        content: `I've read **${uploaded.filename}** and indexed it into memory. I'll now answer your questions based on this document.`,
      }]);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleTriggerCheck(conceptName: string, topicId: string) {
    setActiveCheck({ conceptName, topicId, question: null, selectedOption: "", result: null, isChecking: true });
    try {
      const res = await checkUnderstanding({ studentId, topicId, conceptName });
      setActiveCheck(prev => prev ? { ...prev, question: (res.question as Question) || null, isChecking: false } : null);
    } catch (err: any) {
      alert(`Failed to load check question: ${err.message}`);
      setActiveCheck(null);
    }
  }

  async function handleSubmitCheckAnswer() {
    if (!activeCheck || !activeCheck.selectedOption || !activeCheck.question) return;
    try {
      const res = await checkUnderstanding({
        studentId, topicId: activeCheck.topicId, conceptName: activeCheck.conceptName,
        answer: activeCheck.selectedOption, questionId: activeCheck.question.id,
      });
      setActiveCheck(prev => prev ? {
        ...prev, result: { isCorrect: Boolean(res.is_correct), feedback: res.feedback || "" }
      } : null);
      const updated = await fetchLearningHistory(studentId);
      setLearningHistory(updated.learned_concepts || []);
    } catch (err: any) {
      alert(`Error verifying answer: ${err.message}`);
    }
  }

  async function handleWatchAnimation(msgId: string, text: string, conceptName?: string) {
    setActiveAnimations(prev => ({ ...prev, [msgId]: { isLoading: true } }));
    try {
      const cleanSentences = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .split(/[.\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 8)
        .slice(0, 3)
        .join(". ") + ".";
      const anim = await generateAnimation({
        text: cleanSentences.slice(0, 240),
        concept_name: conceptName || "Core Concept",
        title: conceptName ? `Understanding ${conceptName}` : "Interactive Animated Lesson",
      });
      setActiveAnimations(prev => ({ ...prev, [msgId]: { data: anim, isLoading: false } }));
    } catch (err: any) {
      alert(`Animation error: ${err.message || "Failed to generate video"}`);
      setActiveAnimations(prev => {
        const copy = { ...prev };
        delete copy[msgId];
        return copy;
      });
    }
  }

  function handleCloseAnimation(msgId: string) {
    setActiveAnimations(prev => {
      const copy = { ...prev };
      delete copy[msgId];
      return copy;
    });
  }

  // ── Status label helper ──────────────────────────────────────────────────────
  function statusLabel(status: string) {
    if (status === "MASTERED")       return { text: "Mastered",   cls: "badge-success" };
    if (status === "NEEDS_REVISION") return { text: "Review",     cls: "badge-warning" };
    return                                  { text: "Explored",   cls: "badge-accent"  };
  }

  return (
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 140px)", minHeight: 520 }}>

      {/* ── Main chat panel ──────────────────────────────────────────────────── */}
      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header bar */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid var(--border)",
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>Learn</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 1 }}>
              {selectedDocId
                ? `Focused on: ${documents.find(d => d.document_id === selectedDocId)?.filename || "your document"}`
                : "General study session"}
            </div>
          </div>

          {/* Topic selector */}
          <select
            value={selectedTopicId}
            onChange={e => setSelectedTopicId(e.target.value)}
            style={{
              border: "1px solid var(--border-med)", borderRadius: 8,
              padding: "6px 10px", fontSize: "0.8rem", color: "var(--text-primary)",
              background: "var(--surface)", outline: "none", cursor: "pointer"
            }}
          >
            <option value="">Any topic</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {/* Document selector */}
          <select
            value={selectedDocId}
            onChange={e => setSelectedDocId(e.target.value)}
            style={{
              border: "1px solid var(--border-med)", borderRadius: 8,
              padding: "6px 10px", fontSize: "0.8rem", color: "var(--text-primary)",
              background: "var(--surface)", outline: "none", cursor: "pointer", maxWidth: 180
            }}
          >
            <option value="">No document</option>
            {documents.map(d => <option key={d.document_id} value={d.document_id}>{d.filename}</option>)}
          </select>

          {/* Upload button */}
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingDoc}
            className="btn-ghost"
            style={{ fontSize: "0.8rem", padding: "6px 12px" }}
          >
            {uploadingDoc ? "Uploading…" : "📎 Upload file"}
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: "flex", gap: 12, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>

              {m.role === "assistant" && (
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "var(--accent-light)",
                  color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 700, flexShrink: 0, marginTop: 2
                }}>AI</div>
              )}

              <div style={{
                maxWidth: "72%",
                background: m.role === "user" ? "var(--accent)" : "var(--bg)",
                color: m.role === "user" ? "#fff" : "var(--text-primary)",
                border: m.role === "user" ? "none" : "1px solid var(--border)",
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                padding: "12px 16px",
                fontSize: "0.875rem", lineHeight: 1.65,
              }}>
                {/* Message text */}
                <div className="prose-message" style={{ color: m.role === "user" ? "#fff" : undefined }}
                     dangerouslySetInnerHTML={{
                       __html: m.content
                         .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                         .replace(/\*(.*?)\*/g, "<em>$1</em>")
                         .replace(/\n/g, "<br />")
                     }} />

                {/* Document grounding note */}
                {m.sources && m.sources.length > 0 && (
                  <div style={{
                    marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)",
                    fontSize: "0.75rem"
                  }}>
                    <span style={{ color: "var(--success)", fontWeight: 600 }}>
                      ✓ From: {m.sources[0].filename}
                    </span>
                    <p style={{ color: "var(--text-muted)", marginTop: 4, fontStyle: "italic" }}>
                      "{m.sources[0].excerpt}"
                    </p>
                  </div>
                )}

                {/* Visualization */}
                {m.visualization && <EducationalVisualizer visualization={m.visualization} />}

                {/* Check understanding */}
                {m.learnedConcept && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Concept: <strong style={{ color: "var(--text-secondary)" }}>{m.learnedConcept.concept_name}</strong>
                    </span>
                    <button
                      onClick={() => handleTriggerCheck(
                        m.learnedConcept?.concept_name || "Core Concept",
                        m.learnedConcept?.topic_id || selectedTopicId || "topic_default"
                      )}
                      style={{
                        background: "var(--success-light)", color: "var(--success)",
                        border: "1px solid #BBF7D0", borderRadius: 8,
                        padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer"
                      }}
                    >
                      Quick check →
                    </button>
                  </div>
                )}

                {/* Animated Tutor Video (PyToon) */}
                {m.role === "assistant" && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                    {!activeAnimations[m.id] ? (
                      <button
                        onClick={() => handleWatchAnimation(m.id, m.content, m.learnedConcept?.concept_name)}
                        style={{
                          background: "var(--accent-light, #EEF2FF)",
                          color: "var(--accent, #4338CA)",
                          border: "1px solid rgba(67, 56, 202, 0.2)",
                          borderRadius: 8,
                          padding: "5px 12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          transition: "all 0.15s"
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = "#E0E7FF")}
                        onMouseOut={e => (e.currentTarget.style.background = "var(--accent-light, #EEF2FF)")}
                      >
                        <span>🎬</span> Watch Animated Explanation (PyToon)
                      </button>
                    ) : (
                      <AnimatedTutorPlayer
                        animation={activeAnimations[m.id]?.data}
                        isLoading={activeAnimations[m.id]?.isLoading}
                        conceptName={m.learnedConcept?.concept_name}
                        defaultText={m.content}
                        onClose={() => handleCloseAnimation(m.id)}
                        onRegenerate={() => handleWatchAnimation(m.id, m.content, m.learnedConcept?.concept_name)}
                      />
                    )}
                  </div>
                )}

                {/* Suggested follow-ups */}
                {m.suggestedFollowups && m.suggestedFollowups.length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {m.suggestedFollowups.map((sf, i) => (
                      <button key={i} onClick={() => handleSendMessage(sf)}
                        style={{
                          background: "var(--surface)", border: "1px solid var(--border-med)",
                          borderRadius: 99, padding: "4px 10px", fontSize: "0.74rem",
                          color: "var(--text-secondary)", cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = "var(--accent-light)")}
                        onMouseOut={e => (e.currentTarget.style.background = "var(--surface)")}
                      >
                        {sf}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "#E2E8F0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 700, flexShrink: 0, marginTop: 2,
                  color: "var(--text-secondary)"
                }}>You</div>
              )}
            </div>
          ))}

          {/* Quick-check inline panel */}
          {activeCheck && (
            <div className="card" style={{ border: "1px solid var(--border-med)", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                  Quick check: {activeCheck.conceptName}
                </span>
                <button onClick={() => setActiveCheck(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  ✕
                </button>
              </div>
              {activeCheck.isChecking ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Preparing question…</p>
              ) : activeCheck.question ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>
                    {activeCheck.question.question}
                  </p>
                  {activeCheck.question.options.map((opt, i) => (
                    <button key={i} disabled={Boolean(activeCheck.result)}
                      onClick={() => setActiveCheck(prev => prev ? { ...prev, selectedOption: opt } : null)}
                      style={{
                        textAlign: "left", padding: "10px 14px", borderRadius: 8, fontSize: "0.85rem",
                        fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                        background: activeCheck.selectedOption === opt ? "var(--accent-light)" : "var(--bg)",
                        border: `1px solid ${activeCheck.selectedOption === opt ? "var(--accent)" : "var(--border-med)"}`,
                        color: activeCheck.selectedOption === opt ? "var(--accent)" : "var(--text-primary)",
                      }}>
                      {opt}
                    </button>
                  ))}
                  {!activeCheck.result ? (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                      <button disabled={!activeCheck.selectedOption} onClick={handleSubmitCheckAnswer}
                        className="btn-primary" style={{ fontSize: "0.82rem", padding: "8px 16px" }}>
                        Submit
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      padding: 14, borderRadius: 8,
                      background: activeCheck.result.isCorrect ? "var(--success-light)" : "var(--warning-light)",
                      border: `1px solid ${activeCheck.result.isCorrect ? "#BBF7D0" : "#FDE68A"}`,
                      fontSize: "0.85rem", color: activeCheck.result.isCorrect ? "var(--success)" : "var(--warning)"
                    }}>
                      <strong>{activeCheck.result.isCorrect ? "✓ Correct!" : "Not quite —"}</strong>{" "}
                      {activeCheck.result.feedback}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {isLoading && (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: "var(--accent-light)",
                color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 700
              }}>AI</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Thinking…</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
          <form onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
                style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder={selectedDocId ? "Ask about your document…" : "Ask anything…"}
              className="field"
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={isLoading || !inputQuery.trim()} className="btn-primary">
              Send →
            </button>
          </form>
        </div>
      </div>

      {/* ── Sidebar: learning history ────────────────────────────────────────── */}
      <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 }}>
        <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
              Explored this session
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
              {learningHistory.length} concept{learningHistory.length !== 1 ? "s" : ""} so far
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {learningHistory.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", marginTop: 24 }}>
                Ask a question to start building your history.
              </p>
            ) : learningHistory.map(item => {
              const { text, cls } = statusLabel(item.status);
              return (
                <div key={item.id} style={{
                  padding: "10px 12px", borderRadius: 8,
                  background: "var(--bg)", border: "1px solid var(--border)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                      {item.concept_name}
                    </span>
                    <span className={`badge ${cls}`}>{text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next-step nudges */}
        <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>Up next</p>
          <Link href="/revise" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "10px 12px", borderRadius: 8,
              background: "var(--warning-light)", color: "var(--warning)",
              fontSize: "0.8rem", fontWeight: 500, cursor: "pointer"
            }}>
              🔁 Revise weak spots →
            </div>
          </Link>
          <Link href="/test" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "10px 12px", borderRadius: 8,
              background: "var(--accent-light)", color: "var(--accent)",
              fontSize: "0.8rem", fontWeight: 500, cursor: "pointer"
            }}>
              ✏️ Test for mastery →
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
