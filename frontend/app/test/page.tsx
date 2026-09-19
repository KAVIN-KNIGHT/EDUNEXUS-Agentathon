"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchTopics, fetchDocuments, uploadDocument, startTest,
  Topic, DocumentItem, CustomQuestionInput, TestStartResponse, Question
} from "../../lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function TestPage() {
  const router = useRouter();
  const studentId = "student_demo";
  const [topics, setTopics] = useState<Topic[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"topic" | "document" | "custom">("topic");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [customQuestions, setCustomQuestions] = useState<CustomQuestionInput[]>([
    {
      id: "cq_1",
      question: "What is the result of nums[1:3] for nums = [10, 20, 30, 40]?",
      options: ["[10, 20]", "[20, 30]", "[20, 30, 40]", "[10, 30]"],
      correct_answer: "[20, 30]",
      subconcept: "Slicing"
    },
    {
      id: "cq_2",
      question: "Which of the following slicing parameters is non-inclusive?",
      options: ["start", "stop", "step", "none of the above"],
      correct_answer: "stop",
      subconcept: "Bounds"
    }
  ]);
  const [customError, setCustomError] = useState<string | null>(null);

  const [activeTest, setActiveTest] = useState<TestStartResponse | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, [studentId]);

  async function loadData() {
    try {
      const [tList, dList] = await Promise.all([fetchTopics(), fetchDocuments()]);
      setTopics(tList);
      setDocuments(dList);
      if (tList.length > 0 && !selectedTopicId) setSelectedTopicId(tList[0].id);
      if (dList.length > 0 && !selectedDocId) setSelectedDocId(dList[0].document_id);
    } catch (err) {
      console.error("Failed to load topics/documents", err);
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
      setActiveTab("document");
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleStartAssessment() {
    setIsLoading(true);
    setTestResult(null);
    setSelectedAnswers({});
    setCustomError(null);
    try {
      let res: TestStartResponse;
      if (activeTab === "custom") {
        for (let i = 0; i < customQuestions.length; i++) {
          const q = customQuestions[i];
          if (!q.question.trim()) throw new Error(`Question #${i + 1} has an empty prompt.`);
          if (q.options.length < 2) throw new Error(`Question #${i + 1} needs at least 2 options.`);
          if (!q.correct_answer.trim()) throw new Error(`Question #${i + 1} must specify a correct answer.`);
          const normOpts = q.options.map(o => o.trim().toLowerCase());
          if (!normOpts.includes(q.correct_answer.trim().toLowerCase())) {
            throw new Error(`Question #${i + 1}: correct answer "${q.correct_answer}" doesn't match any option.`);
          }
        }
        res = await startTest({ studentId, testType: "custom", customQuestions });
      } else if (activeTab === "document") {
        if (!selectedDocId) throw new Error("Please select or upload a document first.");
        res = await startTest({ studentId, testType: "document", documentId: selectedDocId });
      } else {
        const top = topics.find(t => t.id === selectedTopicId);
        res = await startTest({
          studentId, testType: "topic",
          topicId: selectedTopicId,
          topicName: top ? top.name : "Python Lists & Slicing"
        });
      }
      setActiveTest(res);
    } catch (err: any) {
      if (activeTab === "custom") setCustomError(err.message);
      else alert(`Failed to start test: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitDiagnostic() {
    if (!activeTest) return;
    if (Object.keys(selectedAnswers).length < activeTest.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/diagnostic/${activeTest.diagnostic_id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, answers: selectedAnswers })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || "Failed to submit.");
      setTestResult(data);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function addCustomQuestion() {
    setCustomQuestions(prev => [...prev, {
      id: `cq_${prev.length + 1}`,
      question: "",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct_answer: "Option A",
      subconcept: "General"
    }]);
  }

  function updateCustomQuestion(index: number, field: keyof CustomQuestionInput, value: any) {
    setCustomQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function removeCustomQuestion(index: number) {
    setCustomQuestions(prev => prev.filter((_, i) => i !== index));
  }

  // ── TAB BUTTON STYLE ────────────────────────────────────────────────────────
  function tabStyle(tab: typeof activeTab) {
    const active = activeTab === tab;
    return {
      padding: "10px 18px",
      fontSize: "0.875rem",
      fontWeight: active ? 600 : 500,
      color: active ? "var(--accent)" : "var(--text-muted)",
      background: "none",
      border: "none",
      borderBottom: `2px solid ${active ? "var(--accent)" : "transparent"}`,
      cursor: "pointer",
      transition: "all 0.15s",
    };
  }

  // ── SETUP VIEW ─────────────────────────────────────────────────────────────
  if (!activeTest) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto" }} className="space-y-8">
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text-primary)" }}>
            Test yourself
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.6 }}>
            Take a short quiz to find out what you know. Any gaps will be saved to your revision list automatically.
          </p>
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 8px" }}>
            <button style={tabStyle("topic")} onClick={() => setActiveTab("topic")}>By topic</button>
            <button style={tabStyle("document")} onClick={() => setActiveTab("document")}>From a document</button>
            <button style={tabStyle("custom")} onClick={() => setActiveTab("custom")}>My own questions</button>
          </div>

          <div style={{ padding: "24px 28px" }}>

            {/* Tab: Topic */}
            {activeTab === "topic" && (
              <div className="space-y-5">
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Choose a topic and we'll generate 5 questions that test your understanding of key concepts.
                </p>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Topic
                  </label>
                  <select value={selectedTopicId} onChange={e => setSelectedTopicId(e.target.value)} className="field">
                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <button disabled={isLoading} onClick={handleStartAssessment} className="btn-primary">
                  {isLoading ? "Generating questions…" : "Start test →"}
                </button>
              </div>
            )}

            {/* Tab: Document */}
            {activeTab === "document" && (
              <div className="space-y-5">
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Upload a PDF or text file and we'll write questions directly from it — great for exam prep using your own notes.
                </p>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt" className="hidden" />
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                      Your documents
                    </label>
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploadingDoc}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600 }}>
                      {uploadingDoc ? "Uploading…" : "+ Upload a file"}
                    </button>
                  </div>
                  {documents.length === 0 ? (
                    <div style={{
                      border: "2px dashed var(--border-med)", borderRadius: 10,
                      padding: "32px 20px", textAlign: "center",
                      fontSize: "0.875rem", color: "var(--text-muted)"
                    }}>
                      No documents yet. Upload a PDF or text file to get started.
                    </div>
                  ) : (
                    <select value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)} className="field">
                      {documents.map(d => <option key={d.document_id} value={d.document_id}>{d.filename}</option>)}
                    </select>
                  )}
                </div>
                <button disabled={isLoading || documents.length === 0} onClick={handleStartAssessment} className="btn-primary">
                  {isLoading ? "Generating questions…" : "Start document test →"}
                </button>
              </div>
            )}

            {/* Tab: Custom */}
            {activeTab === "custom" && (
              <div className="space-y-6">
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Write your own questions with the correct answer. This is useful for practising specific material with known answers.
                </p>

                {customError && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 8, fontSize: "0.83rem",
                    background: "var(--danger-light)", color: "var(--danger)",
                    border: "1px solid #FECACA"
                  }}>
                    ⚠️ {customError}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {customQuestions.map((cq, idx) => (
                    <div key={idx} style={{
                      padding: "18px 20px", borderRadius: 10,
                      background: "var(--bg)", border: "1px solid var(--border)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>
                          Question {idx + 1}
                        </span>
                        {customQuestions.length > 1 && (
                          <button onClick={() => removeCustomQuestion(idx)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: "var(--danger)" }}>
                            Remove
                          </button>
                        )}
                      </div>

                      <input type="text" value={cq.question}
                        onChange={e => updateCustomQuestion(idx, "question", e.target.value)}
                        placeholder="Type your question here…"
                        className="field" style={{ marginBottom: 10 }} />

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                        {cq.options.map((opt, oIdx) => (
                          <input key={oIdx} type="text" value={opt}
                            onChange={e => {
                              const newOpts = [...cq.options];
                              newOpts[oIdx] = e.target.value;
                              updateCustomQuestion(idx, "options", newOpts);
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            className="field" style={{ fontSize: "0.82rem" }} />
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                        <div>
                          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--warning)", display: "block", marginBottom: 4 }}>
                            Correct answer
                          </label>
                          <select value={cq.correct_answer}
                            onChange={e => updateCustomQuestion(idx, "correct_answer", e.target.value)}
                            className="field" style={{ width: "auto", fontSize: "0.82rem" }}>
                            {cq.options.map((opt, oIdx) => <option key={oIdx} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                            Topic area (optional)
                          </label>
                          <input type="text" value={cq.subconcept}
                            onChange={e => updateCustomQuestion(idx, "subconcept", e.target.value)}
                            placeholder="e.g. Slicing"
                            className="field" style={{ width: 140, fontSize: "0.82rem" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button onClick={addCustomQuestion} className="btn-ghost" style={{ fontSize: "0.82rem" }}>
                    + Add a question
                  </button>
                  <button disabled={isLoading} onClick={handleStartAssessment} className="btn-primary">
                    {isLoading ? "Starting…" : "Start test →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE TEST VIEW ───────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }} className="space-y-6">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.025em" }}>
            {activeTest.topic_name}
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
            {Object.keys(selectedAnswers).length} of {activeTest.questions.length} answered
          </p>
        </div>
        <button onClick={() => { setActiveTest(null); setTestResult(null); }} className="btn-ghost" style={{ fontSize: "0.82rem" }}>
          ✕ Exit test
        </button>
      </div>

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {activeTest.questions.map((q, idx) => (
          <div key={q.id} className="card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
              <span style={{
                width: 26, height: 26, borderRadius: "50%", background: "var(--accent-light)",
                color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "0.8rem", flexShrink: 0
              }}>{idx + 1}</span>
              {q.subconcept && (
                <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  {q.subconcept}
                </span>
              )}
            </div>
            <p style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: 14, lineHeight: 1.55 }}>
              {q.question}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {q.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[q.id] === opt;
                return (
                  <button key={oIdx}
                    disabled={Boolean(testResult)}
                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    style={{
                      textAlign: "left", padding: "10px 14px", borderRadius: 8,
                      fontSize: "0.83rem", fontWeight: 500, cursor: "pointer",
                      transition: "all 0.15s",
                      background: isSelected ? "var(--accent-light)" : "var(--bg)",
                      border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-med)"}`,
                      color: isSelected ? "var(--accent)" : "var(--text-primary)",
                    }}>
                    <span style={{ color: "var(--text-muted)", marginRight: 8, fontFamily: "monospace" }}>
                      {String.fromCharCode(65 + oIdx)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit / Result */}
      {!testResult ? (
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
          <button
            disabled={isSubmitting || Object.keys(selectedAnswers).length < activeTest.questions.length}
            onClick={handleSubmitDiagnostic}
            className="btn-primary"
          >
            {isSubmitting ? "Scoring…" : "Submit answers →"}
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: "24px 28px" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: 16 }}>
            Results
          </h2>

          {/* Score breakdown */}
          {Object.keys(testResult.sub_concept_scores || {}).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p className="section-label" style={{ marginBottom: 10 }}>Score by area</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 8 }}>
                {Object.entries(testResult.sub_concept_scores || {}).map(([sub, sc]: any) => (
                  <div key={sub} style={{
                    padding: "10px 12px", borderRadius: 8,
                    background: sc >= 0.8 ? "var(--success-light)" : "var(--warning-light)",
                    border: `1px solid ${sc >= 0.8 ? "#BBF7D0" : "#FDE68A"}`,
                  }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                      {sub}
                    </div>
                    <div style={{
                      fontSize: "1rem", fontWeight: 800,
                      color: sc >= 0.8 ? "var(--success)" : "var(--warning)"
                    }}>
                      {Math.round(sc * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback banner */}
          {testResult.weak_sub_concepts && testResult.weak_sub_concepts.length > 0 ? (
            <div style={{
              padding: "16px 18px", borderRadius: 10,
              background: "var(--warning-light)", border: "1px solid #FDE68A", marginBottom: 16
            }}>
              <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--warning)", marginBottom: 6 }}>
                A few things to review
              </p>
              <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                You struggled with: <strong>{testResult.weak_sub_concepts.join(", ")}</strong>.
                These have been added to your revision list.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={() => router.push(`/session/${activeTest.session_id}`)} className="btn-primary">
                  Review now →
                </button>
                <Link href="/revise">
                  <button className="btn-ghost">Go to Revise</button>
                </Link>
              </div>
            </div>
          ) : (
            <div style={{
              padding: "16px 18px", borderRadius: 10,
              background: "var(--success-light)", border: "1px solid #BBF7D0"
            }}>
              <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--success)", marginBottom: 6 }}>
                🎉 Great work!
              </p>
              <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                You scored well across all tested areas.
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => { setActiveTest(null); setTestResult(null); }} className="btn-ghost">
              Take another test
            </button>
            <Link href="/learn">
              <button className="btn-ghost">Back to Learn</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
