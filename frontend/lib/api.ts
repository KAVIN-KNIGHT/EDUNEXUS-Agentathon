export * from "./types";
import {
  DocumentUploadResponse,
  Topic,
  DocumentItem,
  SessionResponse,
  VerificationSubmitResponse,
  LearnerMemoryRecord,
  MasteryRecord,
  AgentEvent,
  Question,
  RemediationContent
} from "./types";

export interface QuestionClientView {
  id: string;
  question: string;
  options: string[];
  subconcept: string;
}

export interface DiagnosticGenerateResponse {
  diagnostic_id: string;
  topic: string;
  questions: QuestionClientView[];
  created_at?: string;
}

export interface DiagnosticSubmitResponse {
  status: string;
  message: string;
  attempt_id: string;
  diagnostic_id: string;
  student_id: string;
  questions_answered: number;
  feedback_notice: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function uploadDocument(file: File, title?: string): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (title && title.trim()) {
    formData.append("title", title.trim());
  }
  const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.detail || data.message || "Failed to upload and index document.";
    throw new Error(errorMsg);
  }
  return data;
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchDocuments error:", err);
    return [];
  }
}

export async function generateDiagnostic(topic: string): Promise<DiagnosticGenerateResponse> {
  const res = await fetch(`${API_BASE_URL}/api/diagnostic/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.message || data.detail || data.error || "Failed to generate diagnostic.";
    throw new Error(errorMsg);
  }
  return data;
}

export async function fetchTopics(): Promise<Topic[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/topics`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchTopics error:", err);
    return [
      {
        id: "topic_sample",
        name: "Python Lists — Indexing and Slicing",
        subconcepts: ["Indexing", "Negative Indexing", "Slicing", "Mutability"],
        chunk_count: 40
      }
    ];
  }
}

export async function createSession(
  studentId: string,
  topicName: string,
  documentId?: string
): Promise<SessionResponse> {
  const payload: Record<string, any> = { student_id: studentId, topic_name: topicName };
  if (documentId) {
    payload.document_id = documentId;
  }
  const res = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create session (status ${res.status})`);
  return await res.json();
}

export async function getSession(sessionId: string): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch session (status ${res.status})`);
  return await res.json();
}

export async function startSession(sessionId: string): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error(`Failed to start session (status ${res.status})`);
  return await res.json();
}

export async function submitDiagnostic(
  diagnosticId: string,
  studentId: string,
  answers: Record<string, string>
) {
  const res = await fetch(`${API_BASE_URL}/api/diagnostic/${diagnosticId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: studentId, answers })
  });
  if (!res.ok) throw new Error(`Failed to submit diagnostic (status ${res.status})`);
  return await res.json();
}

export async function sendLearnerDecision(sessionId: string, decision: "revise" | "skip"): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision })
  });
  if (!res.ok) throw new Error(`Failed to record decision (status ${res.status})`);
  return await res.json();
}

export async function submitVerification(
  verificationId: string,
  studentId: string,
  sessionId: string,
  answers: Record<string, string>
): Promise<VerificationSubmitResponse> {
  const res = await fetch(`${API_BASE_URL}/api/verification/${verificationId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: studentId,
      session_id: sessionId,
      answers
    })
  });
  if (!res.ok) throw new Error(`Failed to submit verification (status ${res.status})`);
  return await res.json();
}

export async function fetchStudentMemory(studentId: string): Promise<{
  student_id: string;
  memories: LearnerMemoryRecord[];
  masteries: MasteryRecord[];
  misconceptions: any[];
  total_mastered: number;
  active_misconceptions_count: number;
  deferred_count: number;
}> {
  const res = await fetch(`${API_BASE_URL}/api/students/${studentId}/memory`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch student memory (status ${res.status})`);
  return await res.json();
}

export async function fetchStudentProgress(studentId: string) {
  const res = await fetch(`${API_BASE_URL}/api/students/${studentId}/progress`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch student progress (status ${res.status})`);
  return await res.json();
}

export async function fetchSessionEvents(sessionId: string): Promise<AgentEvent[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/events`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

// ----------------------------------------------------------------------
// LEARN API
// ----------------------------------------------------------------------
export async function sendLearnChat(params: {
  studentId: string;
  query: string;
  topicId?: string;
  documentId?: string;
  history?: Array<{ role: string; content: string }>;
}): Promise<import("./types").LearnChatResponse> {
  const res = await fetch(`${API_BASE_URL}/api/learn/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: params.studentId,
      query: params.query,
      topic_id: params.topicId,
      document_id: params.documentId,
      history: params.history
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || "Learn chat request failed");
  }
  return data;
}

export async function checkUnderstanding(params: {
  studentId: string;
  topicId: string;
  conceptName: string;
  answer?: string;
  questionId?: string;
}): Promise<import("./types").CheckUnderstandingResponse> {
  const res = await fetch(`${API_BASE_URL}/api/learn/check-understanding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: params.studentId,
      topic_id: params.topicId,
      concept_name: params.conceptName,
      answer: params.answer,
      question_id: params.questionId
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || "Failed to check understanding");
  }
  return data;
}

export async function fetchLearningHistory(studentId: string): Promise<{
  student_id: string;
  learned_concepts: import("./types").LearnedConceptRecord[];
}> {
  const res = await fetch(`${API_BASE_URL}/api/learn/history/${studentId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch learning history");
  return await res.json();
}

// ----------------------------------------------------------------------
// REVISE API
// ----------------------------------------------------------------------
export async function fetchRevisionTopics(studentId: string): Promise<{
  student_id: string;
  revision_topics: import("./types").RevisionTopic[];
}> {
  const res = await fetch(`${API_BASE_URL}/api/revise/topics?student_id=${encodeURIComponent(studentId)}`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to fetch revision topics");
  return await res.json();
}

export async function startRevision(params: {
  studentId: string;
  topicId: string;
  misconception?: string;
  subconcept?: string;
}): Promise<import("./types").ReviseStartResponse> {
  const res = await fetch(`${API_BASE_URL}/api/revise/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: params.studentId,
      topic_id: params.topicId,
      misconception: params.misconception,
      subconcept: params.subconcept
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || "Failed to start revision");
  }
  return data;
}

export async function submitRevisionMiniTest(params: {
  sessionId: string;
  verificationId: string;
  answers: Record<string, string>;
}): Promise<import("./types").ReviseSubmitResponse> {
  const res = await fetch(`${API_BASE_URL}/api/revise/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: params.sessionId,
      verification_id: params.verificationId,
      answers: params.answers
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || "Failed to submit revision mini-test");
  }
  return data;
}

// ----------------------------------------------------------------------
// TEST API
// ----------------------------------------------------------------------
export async function startTest(params: {
  studentId: string;
  testType: "topic" | "document" | "custom";
  topicName?: string;
  topicId?: string;
  documentId?: string;
  customQuestions?: import("./types").CustomQuestionInput[];
}): Promise<import("./types").TestStartResponse> {
  const res = await fetch(`${API_BASE_URL}/api/test/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: params.studentId,
      test_type: params.testType,
      topic_name: params.topicName,
      topic_id: params.topicId,
      document_id: params.documentId,
      custom_questions: params.customQuestions
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || "Failed to start test");
  }
  return data;
}

// ----------------------------------------------------------------------
// ANIMATION API (PyToon)
// ----------------------------------------------------------------------
export async function generateAnimation(params: {
  text: string;
  concept_name?: string;
  title?: string;
  bullet_points?: string[];
  force_regenerate?: boolean;
}): Promise<import("./types").AnimationData> {
  const res = await fetch(`${API_BASE_URL}/api/animation/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: params.text,
      concept_name: params.concept_name,
      title: params.title,
      bullet_points: params.bullet_points,
      force_regenerate: params.force_regenerate
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || "Failed to generate animation");
  }
  return data;
}

export async function fetchFeaturedAnimations(): Promise<import("./types").AnimationData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/animation/featured`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.animations || [];
  } catch {
    return [];
  }
}

export function getAnimationVideoUrl(videoPathOrId: string): string {
  if (videoPathOrId.startsWith("http")) return videoPathOrId;
  if (videoPathOrId.startsWith("/api/animation")) return `${API_BASE_URL}${videoPathOrId}`;
  return `${API_BASE_URL}/api/animation/video/${videoPathOrId}`;
}

