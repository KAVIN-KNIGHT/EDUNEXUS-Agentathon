"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchRevisionTopics, startRevision, submitRevisionMiniTest, generateAnimation,
  RevisionTopic, ReviseStartResponse, ReviseSubmitResponse, Question, AnimationData
} from "../../lib/api";
import AnimatedTutorPlayer from "../../components/AnimatedTutorPlayer";

// Human-readable status labels (replacing internal codes like ACTIVE_MISCONCEPTION)
function friendlyStatus(status: string): { label: string; cls: string } {
  if (status === "ACTIVE" || status === "ACTIVE_MISCONCEPTION")
    return { label: "Needs attention", cls: "badge-warning" };
  if (status === "UNRESOLVED")
    return { label: "Needs attention", cls: "badge-warning" };
  if (status === "DEFERRED")
    return { label: "Deferred", cls: "badge-neutral" };
  return { label: "To review", cls: "badge-neutral" };
}

export default function RevisePage() {
  const studentId = "student_demo";
  const [revisionTopics, setRevisionTopics] = useState<RevisionTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeSession, setActiveSession] = useState<ReviseStartResponse | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<ReviseSubmitResponse | null>(null);

  const [animationData, setAnimationData] = useState<AnimationData | null>(null);
  const [isAnimationLoading, setIsAnimationLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);


  useEffect(() => { loadTopics(); }, [studentId]);

  async function loadTopics() {
    setIsLoading(true);
    try {
      const data = await fetchRevisionTopics(studentId);
      setRevisionTopics(data.revision_topics || []);
    } catch (err) {
      console.error("Failed to fetch revision topics", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStartRevision(item: RevisionTopic) {
    setIsLoading(true);
    setSubmitResult(null);
    setSelectedAnswers({});
    setAnimationData(null);
    setShowAnimation(false);
    try {
      const res = await startRevision({
        studentId, topicId: item.topic_id,
        misconception: item.misconception, subconcept: item.subconcept,
      });
      setActiveSession(res);
    } catch (err: any) {
      alert(`Failed to start revision: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleWatchAnimation(text: string, title?: string, bullets?: string[]) {
    setShowAnimation(true);
    if (animationData) return;
    setIsAnimationLoading(true);
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
        concept_name: title || "Revision Lesson",
        title: title || "Interactive Revision Lesson",
        bullet_points: bullets
      });
      setAnimationData(anim);
    } catch (err: any) {
      alert(`Animation error: ${err.message || "Failed to generate video"}`);
      setShowAnimation(false);
    } finally {
      setIsAnimationLoading(false);
    }
  }

  async function handleSubmitMiniTest() {
    if (!activeSession) return;
    const questions = activeSession.verification_questions;
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert("Please answer both questions before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitRevisionMiniTest({
        sessionId: activeSession.session_id,
        verificationId: activeSession.verification_id,
        answers: selectedAnswers,
      });
      setSubmitResult(res);

      if (res.status === "CYCLE_2_REMEDIATION" && res.next_remediation && res.next_verification_questions) {
        setActiveSession({
          ...activeSession,
          remediation: res.next_remediation,
          verification_id: res.next_verification_id || activeSession.verification_id,
          verification_questions: res.next_verification_questions,
          cycle: 2,
        });
        setSelectedAnswers({});
      }
      loadTopics();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── TOPIC LIST VIEW ────────────────────────────────────────────────────────
  if (!activeSession) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto" }} className="space-y-8">
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text-primary)" }}>
            Revise
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.6 }}>
            These are concepts you found difficult in previous tests. Work through each one to clear it from your list.
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Loading your revision list…
          </div>
        ) : revisionTopics.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 8 }}>
              Nothing to revise right now!
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, maxWidth: 360, margin: "0 auto 24px" }}>
              You don't have any concepts flagged for revision. Take a test to find areas to improve, or keep learning new material.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/test">
                <button className="btn-primary">Take a test →</button>
              </Link>
              <Link href="/learn">
                <button className="btn-ghost">Back to Learn</button>
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="section-label">{revisionTopics.length} concept{revisionTopics.length !== 1 ? "s" : ""} to review</p>
              <button onClick={loadTopics} className="btn-ghost" style={{ fontSize: "0.78rem", padding: "4px 10px" }}>
                ↻ Refresh
              </button>
            </div>

            {revisionTopics.map((item, idx) => {
              const { label, cls } = friendlyStatus(item.status);
              return (
                <div key={idx} className="card" style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                          {item.topic_name}
                        </span>
                        <span className={`badge ${cls}`}>{label}</span>
                      </div>
                      {item.subconcept && (
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 8 }}>
                          Area: {item.subconcept}
                        </p>
                      )}
                      <div style={{
                        background: "var(--warning-light)", border: "1px solid #FDE68A",
                        borderRadius: 8, padding: "10px 14px", fontSize: "0.83rem",
                        color: "var(--warning)", lineHeight: 1.55
                      }}>
                        <strong>What to work on:</strong> {item.misconception}
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartRevision(item)}
                      className="btn-primary"
                      style={{ flexShrink: 0, padding: "9px 16px", fontSize: "0.82rem" }}
                    >
                      Start →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── ACTIVE REVISION SESSION VIEW ───────────────────────────────────────────
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }} className="space-y-6">

      {/* Back + cycle badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => { setActiveSession(null); loadTopics(); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Back to revision list
        </button>
        {activeSession.cycle === 2 && (
          <span className="badge badge-warning">Second attempt</span>
        )}
      </div>

      {/* STEP 1: Explanation */}
      <div className="card" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: "var(--warning-light)",
            color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "0.85rem", flexShrink: 0
          }}>1</div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
              Explanation
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Read this before attempting the check below
            </div>
          </div>
        </div>

        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: 10 }}>
          {activeSession.remediation.title}
        </h3>

        <div style={{
          fontSize: "0.875rem", lineHeight: 1.75, color: "var(--text-secondary)",
          whiteSpace: "pre-wrap"
        }}>
          {activeSession.remediation.explanation}
        </div>

        {activeSession.remediation.examples && activeSession.remediation.examples.length > 0 && (
          <div style={{
            marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)"
          }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 10 }}>
              Examples
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activeSession.remediation.examples.map((ex, i) => (
                <li key={i} style={{
                  fontSize: "0.83rem", padding: "8px 12px", borderRadius: 8,
                  background: "#F8F7F4", border: "1px solid var(--border)",
                  color: "var(--text-primary)", fontFamily: "monospace"
                }}>
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Animated Tutor Lesson (PyToon) */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          {!showAnimation ? (
            <button
              onClick={() => handleWatchAnimation(
                activeSession.remediation.explanation,
                activeSession.remediation.title,
                activeSession.remediation.examples
              )}
              style={{
                background: "var(--accent-light, #EEF2FF)",
                color: "var(--accent, #4338CA)",
                border: "1px solid rgba(67, 56, 202, 0.2)",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: "0.8rem",
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
              <span>🎬</span> Watch Animated Lesson (PyToon)
            </button>
          ) : (
            <AnimatedTutorPlayer
              animation={animationData}
              isLoading={isAnimationLoading}
              conceptName={activeSession.remediation.title}
              defaultText={activeSession.remediation.explanation}
              onClose={() => setShowAnimation(false)}
              onRegenerate={() => {
                setAnimationData(null);
                handleWatchAnimation(
                  activeSession.remediation.explanation,
                  activeSession.remediation.title,
                  activeSession.remediation.examples
                );
              }}
            />
          )}
        </div>
      </div>

      {/* STEP 2: Mini-test */}
      <div className="card" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: "var(--accent-light)",
            color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "0.85rem", flexShrink: 0
          }}>2</div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
              Quick check — 2 questions
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Answer both correctly to mark this concept as understood
            </div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {Object.keys(selectedAnswers).length} / 2 answered
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {activeSession.verification_questions.map((q, qIdx) => (
            <div key={q.id} style={{
              padding: "16px 18px", borderRadius: 12,
              background: "var(--bg)", border: "1px solid var(--border)"
            }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
                Question {qIdx + 1}
              </p>
              <p style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: 12 }}>
                {q.question}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[q.id] === opt;
                  return (
                    <button key={oIdx}
                      disabled={isSubmitting || Boolean(submitResult?.mastery_achieved)}
                      onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      style={{
                        textAlign: "left", padding: "10px 14px", borderRadius: 8,
                        fontSize: "0.83rem", fontWeight: 500, cursor: "pointer",
                        transition: "all 0.15s",
                        background: isSelected ? "var(--accent-light)" : "var(--surface)",
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

        {/* Submit + result */}
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
          {!submitResult ? (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                disabled={isSubmitting || Object.keys(selectedAnswers).length < activeSession.verification_questions.length}
                onClick={handleSubmitMiniTest}
                className="btn-primary"
              >
                {isSubmitting ? "Checking…" : "Submit answers →"}
              </button>
            </div>
          ) : (
            <div style={{
              padding: "18px 20px", borderRadius: 12,
              background: submitResult.mastery_achieved ? "var(--success-light)" : "var(--warning-light)",
              border: `1px solid ${submitResult.mastery_achieved ? "#BBF7D0" : "#FDE68A"}`,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 10
              }}>
                <span style={{
                  fontWeight: 700, fontSize: "1rem",
                  color: submitResult.mastery_achieved ? "var(--success)" : "var(--warning)"
                }}>
                  {submitResult.mastery_achieved ? "🎉 Well done!" : "🔄 Keep going"}
                </span>
                <span style={{
                  fontWeight: 700, fontSize: "0.85rem",
                  color: submitResult.mastery_achieved ? "var(--success)" : "var(--warning)"
                }}>
                  {submitResult.score} / {submitResult.total}
                </span>
              </div>
              <p style={{
                fontSize: "0.875rem", lineHeight: 1.6,
                color: submitResult.mastery_achieved ? "var(--success)" : "var(--warning)"
              }}>
                {submitResult.mastery_achieved
                  ? "You answered both questions correctly. This concept has been marked as understood in your profile."
                  : submitResult.status === "CYCLE_2_REMEDIATION"
                    ? "Not quite — here's a deeper explanation above. Try the questions again."
                    : "This topic has been saved for another time. You can try it again later."}
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                {submitResult.mastery_achieved && (
                  <button onClick={() => { setActiveSession(null); loadTopics(); }} className="btn-primary">
                    Next concept →
                  </button>
                )}
                {submitResult.status === "UNRESOLVED_AFTER_LIMIT" && (
                  <button onClick={() => { setActiveSession(null); loadTopics(); }} className="btn-ghost">
                    Back to list
                  </button>
                )}
                <Link href="/test">
                  <button className="btn-ghost">Take a full test</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
