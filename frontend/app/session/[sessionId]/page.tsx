"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  startSession,
  submitDiagnostic,
  sendLearnerDecision,
  submitVerification,
  fetchSessionEvents
} from "@/lib/api";
import { SessionResponse, Question, AgentEvent } from "@/lib/types";
import ProgressIndicator from "@/components/ProgressIndicator";
import DiagnosticQuestion from "@/components/DiagnosticQuestion";
import DiagnosisCard from "@/components/DiagnosisCard";
import RemediationCard from "@/components/RemediationCard";
import VerificationQuestion from "@/components/VerificationQuestion";
import SessionStatus from "@/components/SessionStatus";
import AgentTrace from "@/components/AgentTrace";
import { ArrowRight, Play, Loader2, Sparkles, RefreshCw } from "lucide-react";

export default function SessionRunnerPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;
  const router = useRouter();

  const [session, setSession] = useState<SessionResponse | null>(null);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, string>>({});
  const [verificationAnswers, setVerificationAnswers] = useState<Record<string, string>>({});
  const [verificationSubmittedResult, setVerificationSubmittedResult] = useState<Record<string, boolean> | null>(null);
  const [showVerificationQuestions, setShowVerificationQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const sess = await getSession(sessionId);
      setSession(sess);
      const evts = await fetchSessionEvents(sessionId);
      setEvents(evts);
    } catch (err) {
      console.error("Error loading session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      fetchSessionEvents(sessionId).then(setEvents).catch(console.error);
    }, 4000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleStartDiagnostic = async () => {
    try {
      setIsSubmitting(true);
      const updated = await startSession(sessionId);
      setSession(updated);
      const evts = await fetchSessionEvents(sessionId);
      setEvents(evts);
    } catch (err) {
      console.error(err);
      alert("Failed to start diagnostic assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDiagnostic = async () => {
    if (!session || !session.state?.diagnostic_questions) return;
    const questions = session.state.diagnostic_questions;
    const answeredCount = Object.keys(diagnosticAnswers).length;

    if (answeredCount < questions.length) {
      alert(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const diagId = session.state.diagnostic_id || "";
      await submitDiagnostic(diagId, session.student_id, diagnosticAnswers);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Error submitting diagnostic answers.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecision = async (decision: "revise" | "skip") => {
    try {
      setIsSubmitting(true);
      const updated = await sendLearnerDecision(sessionId, decision);
      setSession(updated);
      setShowVerificationQuestions(false);
      setVerificationAnswers({});
      setVerificationSubmittedResult(null);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Error recording decision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!session || !session.state?.verification_questions) return;
    const questions = session.state.verification_questions;
    const answeredCount = Object.keys(verificationAnswers).length;

    if (answeredCount < questions.length) {
      alert(`Please answer both verification questions.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const verId = session.state.verification_id || "";
      const res = await submitVerification(verId, session.student_id, sessionId, verificationAnswers);
      setVerificationSubmittedResult(res.scores_by_qid);

      // Brief pause to view submitted indicators
      setTimeout(async () => {
        await loadData();
        setShowVerificationQuestions(false);
        setVerificationAnswers({});
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Error submitting verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        <p className="text-sm font-medium">Loading adaptive session...</p>
      </div>
    );
  }

  const currentState = session.current_state;
  const stateData = session.state;
  const cycle = session.remediation_cycle || stateData?.remediation_cycle || 0;
  const finalStatus = session.final_status;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Current Topic
            </span>
            {session.document_id && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                Uploaded Document Grounded
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {session.topic_name}
          </h1>
          {session.state?.document_name && (
            <p className="text-xs text-slate-400 mt-0.5">
              Source file: {session.state.document_name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {session.document_id && (
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-teal-300 border border-slate-700 font-mono">
              Doc ID: {session.document_id}
            </span>
          )}
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Session: {session.session_id.slice(0, 12)}
          </span>
        </div>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator
        currentState={currentState}
        cycle={cycle}
        finalStatus={finalStatus}
      />

      {/* Main Adaptive Stage Cards */}
      <div className="space-y-8">
        {/* STAGE: TOPIC_SELECTED */}
        {currentState === "TOPIC_SELECTED" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Diagnostic Phase Ready</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              The Diagnostic Agent will generate exactly 5 grounded questions testing each valid sub-concept of <strong>{session.topic_name}</strong>.
            </p>
            <button
              onClick={handleStartDiagnostic}
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Start 5-Question Diagnostic
                </>
              )}
            </button>
          </div>
        )}

        {/* STAGE: AWAITING_ANSWERS (5 Diagnostic Questions) */}
        {currentState === "AWAITING_ANSWERS" && stateData?.diagnostic_questions && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Diagnostic Assessment</h3>
                <p className="text-xs text-slate-400">
                  Select your answers. EDUNEXUS analyzes error patterns across sub-concepts.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                {Object.keys(diagnosticAnswers).length} of {stateData.diagnostic_questions.length} answered
              </span>
            </div>

            <div className="space-y-5">
              {stateData.diagnostic_questions.map((q, idx) => (
                <DiagnosticQuestion
                  key={q.id}
                  question={q}
                  index={idx}
                  total={stateData.diagnostic_questions.length}
                  selectedAnswer={diagnosticAnswers[q.id] || ""}
                  onSelectAnswer={(ans) =>
                    setDiagnosticAnswers((prev) => ({ ...prev, [q.id]: ans }))
                  }
                  disabled={isSubmitting}
                />
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSubmitDiagnostic}
                disabled={isSubmitting || Object.keys(diagnosticAnswers).length < stateData.diagnostic_questions.length}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Responses...
                  </>
                ) : (
                  <>
                    Submit Diagnostic Assessment
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STAGE: AWAITING_LEARNER_DECISION (Diagnosis Card) */}
        {currentState === "AWAITING_LEARNER_DECISION" && (
          <DiagnosisCard
            hypothesis={stateData?.misconception_hypothesis || "Targeted misconception identified."}
            evidence={stateData?.misconception_evidence || []}
            weakSubconcepts={stateData?.weak_sub_concepts || []}
            onRevise={() => handleDecision("revise")}
            onSkip={() => handleDecision("skip")}
            isLoading={isSubmitting}
          />
        )}

        {/* STAGE: VERIFY / INTERVENE */}
        {(currentState === "VERIFY" || currentState === "AWAITING_VERIFICATION_ANSWERS") && stateData && (
          <div className="space-y-6">
            {/* Show Remediation Card */}
            {stateData.remediation_content && (
              <RemediationCard
                remediation={stateData.remediation_content}
                onProceedToVerification={() => setShowVerificationQuestions(true)}
                isLoading={isSubmitting}
              />
            )}

            {/* Verification Questions Area */}
            {(showVerificationQuestions || currentState === "AWAITING_VERIFICATION_ANSWERS") &&
              stateData.verification_questions &&
              stateData.verification_questions.length > 0 && (
                <div className="bg-slate-900/80 border border-teal-500/30 rounded-3xl p-8 shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        Transfer Verification (2 Questions)
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        Demonstrate Conceptual Mastery
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Mastery rule: <strong>2/2 correct answers required</strong>. 1/2 or 0/2 routes back to remediation.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {stateData.verification_questions.map((vq, idx) => (
                      <VerificationQuestion
                        key={vq.id}
                        question={vq}
                        index={idx}
                        total={stateData.verification_questions.length}
                        selectedAnswer={verificationAnswers[vq.id] || ""}
                        onSelectAnswer={(ans) =>
                          setVerificationAnswers((prev) => ({ ...prev, [vq.id]: ans }))
                        }
                        resultStatus={
                          verificationSubmittedResult
                            ? {
                                isSubmitted: true,
                                isCorrect: verificationSubmittedResult[vq.id] || false,
                              }
                            : undefined
                        }
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={handleSubmitVerification}
                      disabled={
                        isSubmitting ||
                        Object.keys(verificationAnswers).length < stateData.verification_questions.length
                      }
                      className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Evaluating Verification...
                        </>
                      ) : (
                        <>
                          Submit Verification
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* STAGE: MASTERED / DEFERRED / UNRESOLVED */}
        {(finalStatus === "MASTERED" ||
          finalStatus === "DEFERRED" ||
          finalStatus === "UNRESOLVED_AFTER_LIMIT" ||
          currentState === "MASTERED" ||
          currentState === "DEFERRED" ||
          currentState === "UNRESOLVED_AFTER_LIMIT") && (
          <SessionStatus
            status={finalStatus || currentState}
            score={stateData?.verification_score || 0}
            cycle={cycle}
            onRestartTopic={() => router.push("/topics")}
          />
        )}
      </div>

      {/* Real-time Multi-Agent Activity Feed */}
      <div className="pt-6">
        <AgentTrace events={events} />
      </div>
    </div>
  );
}
