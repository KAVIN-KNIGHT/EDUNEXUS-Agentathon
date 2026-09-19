"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimationData } from "../lib/types";
import { getAnimationVideoUrl } from "../lib/api";

interface AnimatedTutorPlayerProps {
  animation?: AnimationData | null;
  isLoading?: boolean;
  onClose?: () => void;
  onRegenerate?: () => void;
  conceptName?: string;
  defaultText?: string;
}

export default function AnimatedTutorPlayer({
  animation,
  isLoading = false,
  onClose,
  onRegenerate,
  conceptName,
  defaultText,
}: AnimatedTutorPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (videoRef.current && animation?.video_url) {
      setHasError(false);
      videoRef.current.load();
    }
  }, [animation?.video_url]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleRateChange = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const videoUrl = animation?.video_url ? getAnimationVideoUrl(animation.video_url) : "";

  return (
    <div
      style={{
        marginTop: 12,
        marginBottom: 12,
        background: "var(--surface)",
        border: "1px solid var(--border-med)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease"
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: "10px 16px",
          background: "var(--bg-subtle, #F7F5F0)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "2px 8px",
              borderRadius: 6,
              background: "var(--accent-light, #EEF2FF)",
              color: "var(--accent, #4338CA)",
              border: "1px solid rgba(67, 56, 202, 0.15)",
              flexShrink: 0
            }}
          >
            🎬 PyToon Animated Tutor
          </span>
          <h4
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {animation?.title || conceptName || "Interactive Video Lesson"}
          </h4>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {onRegenerate && !isLoading && (
            <button
              onClick={onRegenerate}
              title="Regenerate animation"
              style={{
                background: "none",
                border: "none",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 4
              }}
            >
              ↻ Replay
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              title="Close video"
              style={{
                background: "none",
                border: "none",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 4
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Body: Loading or Video */}
      {isLoading ? (
        <div
          style={{
            padding: "36px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            background: "#fff"
          }}
        >
          {/* Animated pulsing avatar icon */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "var(--accent-light, #EEF2FF)",
              color: "var(--accent, #4338CA)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
              animation: "pulse 1.4s infinite ease-in-out"
            }}
          >
            🎭
          </div>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
              Animating Tutor with PyToon…
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", maxWidth: 380 }}>
              Analyzing speech phonemes, aligning mouth visemes, and rendering character expressions.
            </div>
          </div>
        </div>
      ) : hasError ? (
        <div style={{ padding: "24px 20px", textAlign: "center", color: "var(--danger)" }}>
          <p style={{ fontSize: "0.85rem", margin: 0 }}>
            Unable to load video. Please try again.
          </p>
        </div>
      ) : videoUrl ? (
        <div style={{ background: "#000", position: "relative" }}>
          {/* 16:9 Video Player */}
          <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              playsInline
              preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setHasError(true)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                outline: "none"
              }}
            />
          </div>

          {/* Quick playback toolbar */}
          <div
            style={{
              background: "var(--surface)",
              padding: "10px 16px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap"
            }}
          >
            {/* Speed selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span>Speed:</span>
              {[1, 1.25, 1.5].map(rate => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  style={{
                    background: playbackRate === rate ? "var(--accent)" : "var(--bg)",
                    color: playbackRate === rate ? "#fff" : "var(--text-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    fontWeight: playbackRate === rate ? 600 : 400
                  }}
                >
                  {rate}x
                </button>
              ))}
              <button
                onClick={handleRestart}
                style={{
                  background: "var(--bg)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  marginLeft: 4
                }}
              >
                ↺ Replay
              </button>
            </div>

            {/* Duration / Cache badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {animation?.duration && (
                <span>⏱ {animation.duration}s</span>
              )}
              {animation?.cached && (
                <span style={{ color: "var(--success)", fontWeight: 500 }}>✓ Cached</span>
              )}
            </div>
          </div>

          {/* Spoken transcript box */}
          {(animation?.transcript || defaultText) && (
            <div
              style={{
                background: "var(--bg-subtle, #FAF9F6)",
                padding: "12px 16px",
                borderTop: "1px solid var(--border)",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                lineHeight: 1.55
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Spoken Narration
              </div>
              <p style={{ margin: 0, fontStyle: "italic" }}>
                "{animation?.transcript || defaultText}"
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
