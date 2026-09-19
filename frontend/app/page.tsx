"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTopics, fetchDocuments, fetchStudentMemory, fetchLearningHistory } from "@/lib/api";
import { Topic, DocumentItem, MasteryRecord } from "@/lib/types";
import DocumentUpload from "@/components/DocumentUpload";

export default function HomePage() {
  const studentId = "student_demo";
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [memoryStats, setMemoryStats] = useState({
    total_mastered: 0,
    active_misconceptions_count: 0,
    deferred_count: 0,
    masteries: [] as MasteryRecord[],
  });
  const [learnedCount, setLearnedCount] = useState(0);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [dList, mStats, lHist] = await Promise.all([
        fetchDocuments(),
        fetchStudentMemory(studentId).catch(() => ({
          total_mastered: 0, active_misconceptions_count: 0,
          deferred_count: 0, masteries: []
        })),
        fetchLearningHistory(studentId).catch(() => ({ learned_concepts: [] })),
      ]);
      setDocuments(dList);
      setMemoryStats(mStats as any);
      setLearnedCount((lHist.learned_concepts || []).length);
    } catch (e) {
      console.error("Home load error:", e);
    }
  }

  const hasActivity = memoryStats.total_mastered > 0
    || memoryStats.active_misconceptions_count > 0
    || learnedCount > 0;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }} className="space-y-10">

      {/* ── Welcome ─────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h1 style={{
          fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em",
          color: "var(--text-primary)", lineHeight: 1.2
        }}>
          Good to have you back.
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6 }}>
          What would you like to do today?
        </p>
      </div>

      {/* ── Progress snapshot (only shown once there's something) ──────────── */}
      {hasActivity && (
        <div className="card" style={{ padding: "20px 24px" }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Your progress</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              {
                n: memoryStats.total_mastered,
                label: "Topics mastered",
                sub: "Confirmed with 2/2 test",
                color: "var(--success)"
              },
              {
                n: memoryStats.active_misconceptions_count,
                label: "Need attention",
                sub: memoryStats.active_misconceptions_count > 0 ? "Go to Revise →" : "Looking good!",
                color: memoryStats.active_misconceptions_count > 0 ? "var(--warning)" : "var(--text-muted)"
              },
              {
                n: learnedCount,
                label: "Concepts explored",
                sub: "In Learn sessions",
                color: "var(--accent)"
              },
            ].map(({ n, label, sub, color }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color }}>{n}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{label}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Three Mode Cards ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <p className="section-label">Choose a mode</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>

          {/* LEARN */}
          <Link href="/learn" style={{ textDecoration: "none" }}>
            <div className="card-interactive" style={{ padding: "22px 24px", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "var(--accent-light)", color: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.4rem", flexShrink: 0,
              }}>💬</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                  Learn
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.5 }}>
                  Ask questions and explore topics with your AI tutor. Upload study material to focus the conversation on your notes or textbook.
                </div>
              </div>
              <div style={{ fontSize: "1.1rem", color: "var(--text-muted)", flexShrink: 0 }}>→</div>
            </div>
          </Link>

          {/* REVISE */}
          <Link href="/revise" style={{ textDecoration: "none" }}>
            <div className="card-interactive" style={{ padding: "22px 24px", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "var(--warning-light)", color: "var(--warning)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.4rem", flexShrink: 0,
              }}>🔁</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                  Revise
                  {memoryStats.active_misconceptions_count > 0 && (
                    <span className="badge badge-warning" style={{ marginLeft: 10 }}>
                      {memoryStats.active_misconceptions_count} to review
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.5 }}>
                  Work through specific concepts you found difficult. Each revision session ends with a short check to confirm you've got it.
                </div>
              </div>
              <div style={{ fontSize: "1.1rem", color: "var(--text-muted)", flexShrink: 0 }}>→</div>
            </div>
          </Link>

          {/* TEST */}
          <Link href="/test" style={{ textDecoration: "none" }}>
            <div className="card-interactive" style={{ padding: "22px 24px", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "#F0FDF4", color: "#16A34A",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.4rem", flexShrink: 0,
              }}>✏️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                  Test
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.5 }}>
                  Take a short diagnostic quiz by topic, uploaded document, or your own questions. Weak areas are automatically flagged for revision.
                </div>
              </div>
              <div style={{ fontSize: "1.1rem", color: "var(--text-muted)", flexShrink: 0 }}>→</div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Upload study material ──────────────────────────────────────────── */}
      <div>
        <p className="section-label" style={{ marginBottom: 12 }}>Your study material</p>
        <div className="card" style={{ padding: "24px" }}>
          <DocumentUpload />
        </div>
      </div>

    </div>
  );
}
