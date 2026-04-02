"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const MAX_CHAT_LEN = 8000;
const MAX_FILE_LEN = 200_000;

const FILES: Record<string, string> = {
  "README.md": `# Mini Cursor (demo)

This page is a **UI prototype** — not the real Cursor product.
It shows a common layout: files, editor, AI chat.`,
  "src/main.ts": `export function main() {
  console.log("Ship small slices; validate each gate.");
}

main();
`,
  "plan.md": `## Build like Cursor (real program)

1. Fork VS Code OSS — do not rewrite the editor.
2. AI: provider abstraction, timeouts, offline degrade, no blocking UI.
3. Indexing: incremental, bounded memory, respect .gitignore.
4. Test: integration on open/save/completion; redact secrets in telemetry.
`,
};

type ChatMsg = { role: "user" | "assistant"; text: string };

function replyForPrompt(userText: string): string {
  const q = userText.toLowerCase();
  if (q.includes("mistake") || q.includes("risk"))
    return `Risks to burn down first: (1) API keys in logs, (2) unsandboxed tool execution, (3) blocking the UI thread on index/embed, (4) writing files without atomic save + backup. Add explicit gates before each milestone.`;
  if (q.includes("index") || q.includes("embed"))
    return `Indexing: chunk by AST/syntax where possible, cap chunk size, debounce file watcher, run behind a worker or process, expose cancellation tokens. Never block typing.`;
  if (q.includes("fork") || q.includes("vscode"))
    return `Fork Code-OSS: track upstream merges on a schedule, keep AI changes in extension boundaries where feasible, maintain a CI matrix (Win/macOS/Linux) from week one.`;
  return `Ground truth: **Cursor-class** products take a team and years; this demo is layout-only. Next real step: integrate Monaco or stay inside VS Code extension host, add LSP, then wire one provider with retries and user-visible errors.`;
}

export default function CursorDemoPage() {
  const [activePath, setActivePath] = useState<string>("src/main.ts");
  const [sources, setSources] = useState<Record<string, string>>(() => ({ ...FILES }));
  const [chat, setChat] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "I'm a **local demo** assistant (no network). Ask about fork vs greenfield, indexing, or risks.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const fileList = useMemo(() => Object.keys(sources).sort(), [sources]);

  const onEditorChange = useCallback(
    (value: string) => {
      if (value.length > MAX_FILE_LEN) return;
      setSources((prev) => ({ ...prev, [activePath]: value }));
    },
    [activePath],
  );

  const sendChat = useCallback(() => {
    const t = draft.trim();
    if (!t || busy) return;
    if (t.length > MAX_CHAT_LEN) {
      setChat((c) => [
        ...c,
        { role: "user", text: t.slice(0, 200) + "…" },
        {
          role: "assistant",
          text: `Message too long (>${MAX_CHAT_LEN} chars). Paste smaller chunks.`,
        },
      ]);
      setDraft("");
      return;
    }
    setDraft("");
    setChat((c) => [...c, { role: "user", text: t }]);
    setBusy(true);
    window.setTimeout(() => {
      setChat((c) => [...c, { role: "assistant", text: replyForPrompt(t) }]);
      setBusy(false);
    }, 420);
  }, [draft, busy]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#1e1e1e",
        color: "#d4d4d4",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <header
        style={{
          height: 38,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          borderBottom: "1px solid #333",
          background: "#252526",
          fontSize: 13,
          gap: 12,
        }}
      >
        <Link
          href="/"
          style={{ color: "#569cd6", textDecoration: "none", fontWeight: 600 }}
        >
          ← Council
        </Link>
        <span style={{ color: "#858585" }}>/</span>
        <span style={{ fontWeight: 600 }}>Mini Cursor (demo)</span>
        <span style={{ marginLeft: "auto", color: "#858585", fontSize: 12 }}>
          Layout only · no backend
      </span>
      </header>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <aside
          style={{
            width: 200,
            flexShrink: 0,
            borderRight: "1px solid #333",
            background: "#252526",
            overflow: "auto",
            padding: 8,
            fontSize: 12,
          }}
        >
          <div style={{ color: "#858585", marginBottom: 8 }}>EXPLORER</div>
          {fileList.map((path) => (
            <button
              key={path}
              type="button"
              onClick={() => setActivePath(path)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "6px 8px",
                marginBottom: 2,
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                background: path === activePath ? "#37373d" : "transparent",
                color: path === activePath ? "#fff" : "#ccc",
              }}
            >
              {path}
            </button>
          ))}
        </aside>
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div
            style={{
              height: 32,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              paddingLeft: 12,
              background: "#1e1e1e",
              borderBottom: "1px solid #333",
              fontSize: 12,
            }}
          >
            <span style={{ color: "#ccc" }}>{activePath}</span>
          </div>
          <textarea
            value={sources[activePath] ?? ""}
            onChange={(e) => onEditorChange(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              width: "100%",
              resize: "none",
              border: "none",
              outline: "none",
              padding: 12,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 13,
              lineHeight: 1.45,
              background: "#1e1e1e",
              color: "#d4d4d4",
              tabSize: 2,
            }}
          />
        </main>
        <aside
          style={{
            width: 340,
            flexShrink: 0,
            borderLeft: "1px solid #333",
            background: "#252526",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid #333",
              fontSize: 12,
              color: "#858585",
            }}
          >
            CHAT (local rules)
          </div>
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 13,
            }}
          >
            {chat.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: m.role === "user" ? "#094771" : "#333",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <div style={{ color: "#858585", fontSize: 12 }}>Thinking…</div>
            )}
          </div>
          <div style={{ padding: 10, borderTop: "1px solid #333", display: "flex", gap: 8 }}>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Ask about building an AI editor…"
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #3c3c3c",
                background: "#1e1e1e",
                color: "#ddd",
              }}
            />
            <button
              type="button"
              onClick={sendChat}
              disabled={busy || !draft.trim()}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                background: busy || !draft.trim() ? "#444" : "#0e639c",
                color: "#fff",
                cursor: busy || !draft.trim() ? "default" : "pointer",
              }}
            >
              Send
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
