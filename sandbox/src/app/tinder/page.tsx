"use client";

import Link from "next/link";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useCallback, useState } from "react";

type Profile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  gradient: string;
};

const INITIAL_DECK: Profile[] = [
  {
    id: "1",
    name: "Jordan",
    age: 27,
    bio: "Weekend climber · contributes to open source · coffee over tea.",
    gradient: "linear-gradient(145deg, #667eea, #764ba2)",
  },
  {
    id: "2",
    name: "Sam",
    age: 31,
    bio: "Product designer · dogs · learning Rust for no good reason.",
    gradient: "linear-gradient(145deg, #f093fb, #f5576c)",
  },
  {
    id: "3",
    name: "Riley",
    age: 29,
    bio: "Chef turned dev · match = we debate tabs vs spaces.",
    gradient: "linear-gradient(145deg, #4facfe, #00f2fe)",
  },
  {
    id: "4",
    name: "Casey",
    age: 26,
    bio: "Film cameras · running · builds silly apps with friends.",
    gradient: "linear-gradient(145deg, #43e97b, #38f9d7)",
  },
];

const SWIPE_OUT = 420;
const COMMIT = 96;

function SwipeCard({
  profile,
  onCommit,
  disabled,
}: {
  profile: Profile;
  onCommit: (dir: "left" | "right") => void;
  disabled: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-18, 18]);
  const likeOpacity = useTransform(x, [40, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -40], [1, 0]);

  const finishSwipe = useCallback(
    async (dir: "left" | "right") => {
      const target = dir === "right" ? SWIPE_OUT : -SWIPE_OUT;
      await animate(x, target, { type: "spring", stiffness: 260, damping: 28 });
      onCommit(dir);
      x.set(0);
    },
    [onCommit, x],
  );

  return (
    <motion.div
      style={{
        x,
        rotate,
        position: "absolute",
        width: "100%",
        maxWidth: 360,
        height: 480,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
        cursor: disabled ? "default" : "grab",
        touchAction: "none",
      }}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > COMMIT) void finishSwipe("right");
        else if (info.offset.x < -COMMIT) void finishSwipe("left");
        else void animate(x, 0, { type: "spring", stiffness: 400, damping: 32 });
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: profile.gradient,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 20,
          position: "relative",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: 28,
            left: 24,
            opacity: likeOpacity,
            fontSize: 28,
            fontWeight: 800,
            color: "#42d392",
            letterSpacing: 2,
            border: "4px solid #42d392",
            padding: "4px 12px",
            borderRadius: 8,
            rotate: -12,
          }}
        >
          LIKE
        </motion.div>
        <motion.div
          style={{
            position: "absolute",
            top: 28,
            right: 24,
            opacity: nopeOpacity,
            fontSize: 28,
            fontWeight: 800,
            color: "#ff4458",
            letterSpacing: 2,
            border: "4px solid #ff4458",
            padding: "4px 12px",
            borderRadius: 8,
            rotate: 12,
          }}
        >
          NOPE
        </motion.div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "#fff",
            textShadow: "0 2px 12px rgba(0,0,0,0.35)",
          }}
        >
          {profile.name}, {profile.age}
        </div>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 16,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.95)",
            textShadow: "0 1px 8px rgba(0,0,0,0.3)",
          }}
        >
          {profile.bio}
        </p>
      </div>
    </motion.div>
  );
}

export default function TinderDemoPage() {
  const [deck, setDeck] = useState<Profile[]>(() => [...INITIAL_DECK]);
  const [matches, setMatches] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const top = deck[0];
  const next = deck[1];

  const onCommit = useCallback((dir: "left" | "right") => {
    let removed: Profile | undefined;
    setDeck((d) => {
      if (!d.length) return d;
      removed = d[0];
      return d.slice(1);
    });
    if (dir === "right" && removed && Math.random() < 0.35) {
      setMatches((m) => m + 1);
      setToast(`It's a match with ${removed.name}! (demo rng)`);
      window.setTimeout(() => setToast(null), 2400);
    }
  }, []);

  const pass = () => top && onCommit("left");
  const like = () => top && onCommit("right");

  const reset = () => {
    setDeck([...INITIAL_DECK]);
    setMatches(0);
    setToast(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a0a12 0%, #2d1020 50%, #1a0a12 100%)",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 16px 32px",
      }}
    >
      <header
        style={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Link href="/" style={{ color: "#ff6b9d", textDecoration: "none", fontWeight: 700 }}>
          ← Council
        </Link>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: "#f8a" }}>Matches · {matches}</span>
      </header>

      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", letterSpacing: -0.5 }}>
        Demo deck
      </h1>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "rgba(255,255,255,0.55)", maxWidth: 340, textAlign: "center" }}>
        UI-only prototype — no accounts, no backend. Fictional profiles for interaction design.
      </p>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(90deg, #ff6b9d, #ff8e53)",
            padding: "12px 20px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            zIndex: 50,
          }}
        >
          {toast}
        </div>
      )}

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 360,
          height: 500,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {next && (
          <div
            style={{
              position: "absolute",
              width: "100%",
              maxWidth: 360,
              height: 480,
              borderRadius: 18,
              transform: "scale(0.94) translateY(14px)",
              opacity: 0.5,
              background: next.gradient,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          />
        )}
        {top ? (
          <SwipeCard key={top.id} profile={top} onCommit={onCommit} disabled={false} />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 480,
              textAlign: "center",
              gap: 16,
            }}
          >
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.75)" }}>No more profiles nearby (demo).</p>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "12px 24px",
                borderRadius: 999,
                border: "none",
                fontWeight: 700,
                fontSize: 15,
                background: "linear-gradient(90deg, #ff6b9d, #ff4458)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Reset deck
            </button>
          </div>
        )}
      </div>

      {top && (
        <div style={{ display: "flex", gap: 28, marginTop: 24 }}>
          <button
            type="button"
            aria-label="Pass"
            onClick={pass}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "3px solid #ff4458",
              background: "#fff",
              color: "#ff4458",
              fontSize: 28,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            }}
          >
            ✕
          </button>
          <button
            type="button"
            aria-label="Like"
            onClick={like}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "3px solid #42d392",
              background: "#fff",
              color: "#42d392",
              fontSize: 28,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            }}
          >
            ♥
          </button>
        </div>
      )}

      <p style={{ marginTop: 32, fontSize: 11, color: "rgba(255,255,255,0.35)", maxWidth: 320, textAlign: "center" }}>
        For a real product, follow the council plan: auth, moderation, chat SDK, Stripe, and legal review in your market.
      </p>
    </div>
  );
}
