"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument, createSession } from "@/lib/api";
import { DocumentUploadResponse } from "@/lib/types";

interface DocumentUploadProps {
  onUploadSuccess?: (doc: DocumentUploadResponse) => void;
  studentId?: string;
}

type UploadStep = "idle" | "uploading" | "processing" | "ready" | "error";

export default function DocumentUpload({
  onUploadSuccess,
  studentId = "student_demo"
}: DocumentUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [step, setStep] = useState<UploadStep>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<DocumentUploadResponse | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".txt"].includes(ext)) {
      setErrorMessage("Only PDF and text (.txt) files are supported.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("File is too large. Maximum size is 15 MB.");
      return;
    }
    setSelectedFile(file);
    if (!customTitle) {
      const defaultTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setCustomTitle(defaultTitle.charAt(0).toUpperCase() + defaultTitle.slice(1));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setErrorMessage(null);
    setStep("uploading");

    try {
      const parseTimer = setTimeout(() => setStep("processing"), 700);
      const result = await uploadDocument(selectedFile, customTitle);
      clearTimeout(parseTimer);
      setUploadedDoc(result);
      setStep("ready");
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (err: any) {
      setStep("error");
      setErrorMessage(err.message || "Upload failed. Please try again.");
    }
  };

  const handleStartLearning = async () => {
    if (!uploadedDoc) return;
    try {
      setIsStartingSession(true);
      const res = await createSession(studentId, uploadedDoc.topic_name, uploadedDoc.document_id);
      router.push(`/session/${res.session_id}`);
    } catch (err: any) {
      alert(err.message || "Failed to start session.");
      setIsStartingSession(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCustomTitle("");
    setStep("idle");
    setErrorMessage(null);
    setUploadedDoc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── IDLE: drop zone ──────────────────────────────────────────────────────
  if (step === "idle") {
    return (
      <div>
        <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: 4 }}>
          Upload study material
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
          Upload a PDF or text file and I'll read it. You can then ask questions about it in Learn mode, or take a test based on it.
        </p>

        {errorMessage && (
          <div style={{
            marginBottom: 12, padding: "10px 14px", borderRadius: 8,
            background: "var(--danger-light)", color: "var(--danger)",
            fontSize: "0.83rem", border: "1px solid #FECACA"
          }}>
            {errorMessage}
            <button onClick={() => setErrorMessage(null)}
              style={{ marginLeft: 12, background: "none", border: "none", cursor: "pointer", color: "var(--danger)", textDecoration: "underline", fontSize: "0.78rem" }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border-med)"}`,
            borderRadius: 12, padding: "32px 20px", textAlign: "center",
            cursor: "pointer", transition: "all 0.15s",
            background: isDragging ? "var(--accent-light)" : "var(--bg)",
          }}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileChange} />
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>📄</div>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
            {selectedFile ? selectedFile.name : "Click or drag a file here"}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
            PDF or TXT, up to 15 MB
          </p>
        </div>

        {/* Selected file panel */}
        {selectedFile && (
          <div style={{
            marginTop: 14, padding: "16px 18px", borderRadius: 10,
            border: "1px solid var(--border-med)", background: "var(--surface)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                📎 {selectedFile.name} &nbsp;·&nbsp; {(selectedFile.size / 1024).toFixed(0)} KB
              </span>
              <button onClick={handleReset}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: "var(--text-muted)", textDecoration: "underline" }}>
                Change
              </button>
            </div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
              Title (optional)
            </label>
            <input type="text" value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              placeholder="e.g. Chapter 5 – Machine Learning Basics"
              className="field" style={{ marginBottom: 12 }} />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleUpload} className="btn-primary">
                Save to my materials →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── PROCESSING ──────────────────────────────────────────────────────────
  if (step === "uploading" || step === "processing") {
    return (
      <div style={{ padding: "32px 0", textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "3px solid var(--border-med)", borderTopColor: "var(--accent)",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
          {step === "uploading" ? "Uploading…" : "Reading your document…"}
        </p>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
          {step === "processing" ? "Extracting text and preparing it for study sessions." : "Sending file to server…"}
        </p>
        {/* Progress bar */}
        <div style={{
          maxWidth: 260, margin: "18px auto 0",
          height: 4, borderRadius: 2, background: "var(--border-med)", overflow: "hidden"
        }}>
          <div style={{
            height: "100%", background: "var(--accent)", borderRadius: 2,
            width: step === "uploading" ? "40%" : "80%",
            transition: "width 0.5s ease"
          }} />
        </div>
      </div>
    );
  }

  // ── READY ──────────────────────────────────────────────────────────────
  if (step === "ready" && uploadedDoc) {
    return (
      <div>
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 14,
          padding: "16px 18px", borderRadius: 10,
          background: "var(--success-light)", border: "1px solid #BBF7D0", marginBottom: 16
        }}>
          <span style={{ fontSize: "1.4rem" }}>✓</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--success)" }}>
              {uploadedDoc.title || uploadedDoc.filename}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
              Ready to use &nbsp;·&nbsp; {uploadedDoc.chunk_count} sections indexed
            </div>
          </div>
          <button onClick={handleReset}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: "var(--text-muted)", textDecoration: "underline" }}>
            Upload another
          </button>
        </div>

        {uploadedDoc.subconcepts && uploadedDoc.subconcepts.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
              Topics found in this document
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {uploadedDoc.subconcepts.map((sub, i) => (
                <span key={i} style={{
                  padding: "4px 10px", borderRadius: 99,
                  background: "var(--accent-light)", color: "var(--accent)",
                  fontSize: "0.75rem", fontWeight: 500
                }}>{sub}</span>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleStartLearning} disabled={isStartingSession} className="btn-primary">
          {isStartingSession ? "Starting…" : "Start a learning session →"}
        </button>
      </div>
    );
  }

  // ── ERROR ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      padding: "16px 18px", borderRadius: 10,
      background: "var(--danger-light)", border: "1px solid #FECACA",
      fontSize: "0.875rem", color: "var(--danger)"
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>Upload failed</p>
      <p style={{ color: "var(--text-secondary)" }}>{errorMessage || "Something went wrong. Please try again."}</p>
      <button onClick={handleReset} className="btn-ghost" style={{ marginTop: 12, fontSize: "0.82rem" }}>
        Try again
      </button>
    </div>
  );
}
