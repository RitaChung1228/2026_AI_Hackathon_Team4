import { useState, useEffect } from "react";

interface PlanningStep {
  text: string;
  delay: number;
  pending?: boolean;
}

interface AIPlanningProps {
  steps: PlanningStep[];
  title: string;
  onComplete: () => void;
}

export default function AIPlanning({ steps, title, onComplete }: AIPlanningProps) {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    steps.forEach((step, i) => {
      setTimeout(() => {
        setVisibleSteps((prev) => [...prev, i]);
        setProgress(Math.min(((i + 1) / steps.length) * 100, 90));
      }, step.delay);
    });

    const totalTime = steps[steps.length - 1].delay + 1400;
    setTimeout(() => {
      setProgress(100);
      setDone(true);
      setTimeout(onComplete, 500);
    }, totalTime);
  }, []);

  return (
    <div
      style={{
        height: "100%",
        background: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 32px",
      }}
    >
      {/* AI orb */}
      <div style={{ position: "relative", marginBottom: 48 }}>
        <div
          className="animate-pulse-ring"
          style={{
            position: "absolute",
            inset: -16,
            borderRadius: "50%",
            background: "rgba(76,110,145,0.12)",
          }}
        />
        <div
          className="animate-pulse-ring"
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            background: "rgba(76,110,145,0.2)",
            animationDelay: "0.5s",
          }}
        />
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4C6E91, #6E92B4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: "0 8px 32px rgba(76,110,145,0.4)",
          }}
        >
          <svg
            className="animate-spin-slow"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            style={{ position: "absolute" }}
          >
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <path d="M12 2C6.48 2 2 6.48 2 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 28, zIndex: 1 }}>✦</span>
        </div>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 20,
          color: "#16232E",
          textAlign: "center",
          margin: 0,
          marginBottom: 8,
          letterSpacing: "-0.3px",
        }}
      >
        {title}
      </h2>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: 4,
          background: "#F1F5F9",
          borderRadius: 2,
          marginBottom: 32,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #4C6E91, #6E92B4)",
            borderRadius: 2,
            width: `${progress}%`,
            transition: "width 0.5s ease",
          }}
        />
      </div>

      {/* Steps */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        {steps.map((step, i) => {
          const visible = visibleSteps.includes(i);
          const isPending = step.pending && visible && !done;
          const isDone = visible && (!step.pending || done);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: visible ? 1 : 0.25,
                transition: "opacity 0.4s ease",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: isDone ? "#4C6E91" : isPending ? "transparent" : "#E2E8F0",
                  border: isPending ? "2px solid #4C6E91" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.3s ease",
                }}
              >
                {isDone && (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {isPending && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#4C6E91",
                    }}
                    className="animate-pulse-ring"
                  />
                )}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: isDone ? 600 : 500,
                  fontSize: 15,
                  color: isDone ? "#16232E" : isPending ? "#4C6E91" : "#64748B",
                }}
              >
                {step.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
