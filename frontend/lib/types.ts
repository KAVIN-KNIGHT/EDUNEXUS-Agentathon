export interface Topic {
  id: string;
  name: string;
  subconcepts: string[];
  created_at?: string;
  chunk_count: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  subconcept: string;
  correct_answer?: string;
  explanation?: string;
  source_reference?: string;
}

export interface RemediationContent {
  strategy: string;
  title: string;
  explanation: string;
  examples: string[];
  misconception_addressed: string;
  source_chunk_ids: string[];
  cycle: number;
}

export interface AgentEvent {
  id?: string;
  event_type: string;
  payload: Record<string, any>;
  timestamp?: string;
}

export interface EduNexusSessionState {
  session_id: string;
  student_id: string;
  topic_id: string;
  topic_name: string;
  document_id?: string;
  document_name?: string;
  sub_concepts: string[];
  diagnostic_id?: string;
  diagnostic_questions: Question[];
  diagnostic_answers: Record<string, string>;
  diagnostic_scores: Record<string, boolean>;
  sub_concept_scores: Record<string, number>;
  weak_sub_concepts: string[];
  misconception?: string;
  misconception_hypothesis?: string;
  misconception_evidence: string[];
  diagnosis_status: string;
  learner_decision?: string;
  remediation_cycle: number;
  remediation_strategy?: string;
  remediation_content?: RemediationContent;
  verification_id?: string;
  verification_questions: Question[];
  verification_answers: Record<string, string>;
  verification_score: number;
  verification_passed: boolean;
  current_state: string;
  final_status: string;
  agent_events: AgentEvent[];
}

export interface SessionResponse {
  session_id: string;
  student_id: string;
  topic_id: string;
  topic_name: string;
  document_id?: string;
  current_state: string;
  remediation_cycle: number;
  final_status: string;
  model_calls: number;
  created_at?: string;
  state?: EduNexusSessionState;
}

export interface VerificationSubmitResponse {
  status: string;
  verification_id: string;
  student_id: string;
  score: number;
  total: number;
  passed: boolean;
  scores_by_qid: Record<string, boolean>;
  current_cycle: number;
  max_cycles: number;
  next_action: string;
  message: string;
}

export interface LearnerMemoryRecord {
  id: string;
  student_id: string;
  topic_id: string;
  misconception: string;
  status: "ACTIVE" | "MASTERED" | "DEFERRED" | "UNRESOLVED";
  first_seen?: string;
  last_updated?: string;
  notes?: Record<string, any>;
}

export interface DocumentItem {
  document_id: string;
  filename: string;
  title: string;
  status: string;
  chunk_count: number;
  file_size: number;
  source_type: string;
  topic_id: string;
  topic_name: string;
  created_at?: string;
}

export interface DocumentUploadResponse {
  status: string;
  document_id: string;
  filename: string;
  title: string;
  chunk_count: number;
  topic_id: string;
  topic_name: string;
  subconcepts: string[];
  created_at?: string;
}

export interface MasteryRecord {
  id: string;
  student_id: string;
  topic_id: string;
  subconcept: string;
  verification_score: number;
  mastered_at?: string;
}

export interface VisualizationData {
  type: "array_indexing" | "binary_search" | "stack_queue" | "concept_hierarchy";
  title?: string;
  data: Record<string, any>;
}

export interface LearnChatResponse {
  response: string;
  sources: Array<{ chunk_id: string; filename: string; page_number: number; excerpt: string }>;
  visualization?: VisualizationData | null;
  learned_concept?: { concept_name: string; status: string; confidence_score: number; topic_id: string };
  suggested_followups: string[];
}

export interface CheckUnderstandingResponse {
  question?: Question;
  is_correct?: boolean;
  feedback?: string;
  concept_name?: string;
  status?: string;
  confidence_score?: number;
}

export interface LearnedConceptRecord {
  id: string;
  student_id: string;
  topic_id: string;
  concept_name: string;
  status: string;
  source: string;
  confidence_score: number;
  first_learned_at?: string;
  last_studied_at?: string;
  notes?: Record<string, any>;
}

export interface RevisionTopic {
  topic_id: string;
  topic_name: string;
  misconception: string;
  subconcept: string;
  status: string;
  source: string;
}

export interface ReviseStartResponse {
  session_id: string;
  topic_id: string;
  topic_name: string;
  misconception: string;
  subconcept: string;
  remediation: RemediationContent;
  verification_id: string;
  verification_questions: Question[];
  cycle: number;
}

export interface ReviseSubmitResponse {
  session_id: string;
  score: number;
  total: number;
  mastery_achieved: boolean;
  status: string;
  cycle: number;
  details: Array<{ question_id: string; selected: string; correct_answer: string; is_correct: boolean; explanation?: string }>;
  message: string;
  next_remediation?: RemediationContent;
  next_verification_id?: string;
  next_verification_questions?: Question[];
}

export interface CustomQuestionInput {
  id?: string;
  question: string;
  options: string[];
  correct_answer: string;
  subconcept?: string;
  explanation?: string;
}

export interface TestStartResponse {
  session_id: string;
  diagnostic_id: string;
  topic_id: string;
  topic_name: string;
  test_type: "topic" | "document" | "custom";
  questions: Question[];
  document_id?: string;
  document_filename?: string;
}

export interface AnimationData {
  video_id: string;
  video_url: string;
  concept_name: string;
  title: string;
  transcript: string;
  duration: number;
  cached?: boolean;
}
