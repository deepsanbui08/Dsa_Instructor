import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are an elite Data Structures & Algorithms (DSA) instructor with deep expertise in computer science fundamentals. Your sole purpose is to teach and explain DSA concepts.

You ONLY answer questions related to:
- Data Structures: arrays, linked lists, stacks, queues, trees (BST, AVL, heap, trie, segment tree), graphs, hash tables, sets, deques, etc.
- Algorithms: sorting (bubble, merge, quick, heap, counting, radix), searching (binary search, DFS, BFS), dynamic programming, greedy algorithms, divide and conquer, backtracking, two-pointer, sliding window, recursion, memoization.
- Algorithm Analysis: Big-O notation, time complexity, space complexity, best/worst/average cases.
- Problem-Solving Patterns: common coding interview patterns, LeetCode-style problems, optimization techniques.
- Implementation: writing DSA code in any programming language (Java, C++, Python, JavaScript, etc.).
- DSA Interview Prep: explaining trade-offs, when to use which data structure, system design from a DSA perspective.

If someone asks something OUTSIDE DSA, politely decline by saying:
"🚫 I'm your DSA Instructor — I only cover Data Structures & Algorithms topics. Please ask me something related to DSA, such as sorting algorithms, tree traversals, dynamic programming, Big-O analysis, etc."
Also you can add up by yourself for replying.

Always structure your answers clearly:
- Use headings and bullet points where appropriate.
- Include code examples when explaining algorithms or data structures.
- Explain time and space complexity for any algorithm you discuss.
- Be encouraging and pedagogical — break down complex concepts step by step.
Keep responses concise and to the point. Match the answer length to the complexity of the question — simple questions (e.g. "what is an array") get short, clear answers (3-5 lines max). Complex questions (e.g. "explain dynamic programming with examples") get detailed answers. 
Never over-explain. Never pad with unnecessary text.`;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.5-flash";

async function askDSAInstructor(conversationHistory) {
  const contents = conversationHistory.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.7 },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Gemini API Error (${response.status})`);
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "No response received.";
}

function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0, key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={key++} className="my-3 rounded-lg overflow-hidden border border-white/10">
          {lang && (
            <div className="bg-cyan-500/10 text-cyan-400 font-mono text-xs px-3 py-1.5 border-b border-white/10 uppercase tracking-widest">
              {lang}
            </div>
          )}
          <pre className="bg-[#0d1117] p-4 overflow-x-auto font-mono text-xs leading-relaxed text-slate-300 whitespace-pre">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(<h3 key={key++} className="text-sm font-semibold text-slate-200 mt-4 mb-1">{inlineMarkdown(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={key++} className="text-base font-bold text-cyan-400 mt-4 mb-1">{inlineMarkdown(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={key++} className="text-lg font-bold text-cyan-400 mt-4 mb-2">{inlineMarkdown(line.slice(2))}</h1>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={key++} className="flex gap-2 my-0.5">
          <span className="text-cyan-500 mt-1 flex-shrink-0">•</span>
          <span>{inlineMarkdown(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      elements.push(
        <div key={key++} className="flex gap-2 my-0.5">
          <span className="text-cyan-500 flex-shrink-0 font-mono text-xs mt-0.5">{num}.</span>
          <span>{inlineMarkdown(line.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(<p key={key++} className="my-0.5 leading-relaxed">{inlineMarkdown(line)}</p>);
    }
    i++;
  }
  return elements;
}

function inlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-cyan-300 font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="font-mono text-xs bg-cyan-500/15 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/20">
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

const SUGGESTIONS = [
  { icon: "🔍", text: "Explain Binary Search with code" },
  { icon: "📊", text: "What is Big-O notation?" },
  { icon: "🌳", text: "How does a Min-Heap work?" },
  { icon: "🗺️", text: "BFS vs DFS — when to use which?" },
  { icon: "🔑", text: "Solve two-sum using a hash map" },
  { icon: "⚡", text: "Dynamic programming with Fibonacci" },
];

export default function DSAInstructor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const userMsg = { role: "user", content: userText };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const reply = await askDSAInstructor(newHistory);
      setMessages([...newHistory, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e.message);
      setMessages(newHistory);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const isEmpty = messages.length === 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#0b0f1a",
        color: "#e2e8f0",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@300;400;600;700;800&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        code, pre { font-family: 'JetBrains Mono', monospace !important; }
        .msgs-container::-webkit-scrollbar { width: 4px; }
        .msgs-container::-webkit-scrollbar-track { background: transparent; }
        .msgs-container::-webkit-scrollbar-thumb { background: #1f2d47; border-radius: 4px; }
        pre::-webkit-scrollbar { height: 4px; }
        pre::-webkit-scrollbar-thumb { background: #1f2d47; border-radius: 4px; }
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .dot-1 { animation: bounce-dot 1.2s infinite ease-in-out; }
        .dot-2 { animation: bounce-dot 1.2s infinite ease-in-out 0.15s; }
        .dot-3 { animation: bounce-dot 1.2s infinite ease-in-out 0.3s; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.3s ease both; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse-dot { animation: pulse-dot 2s infinite; }
        .suggestion-btn:hover { border-color: #00d4ff !important; color: #67e8f9 !important; background: rgba(0,212,255,0.05) !important; }
        .clear-btn:hover { border-color: #00d4ff !important; color: #00d4ff !important; }
        .send-btn:hover:not(:disabled) { transform: scale(1.08); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        backgroundColor: "#111827",
        borderBottom: "1px solid #1f2d47",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
            background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
            boxShadow: "0 0 20px rgba(0,212,255,0.3)",
          }}>🧠</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>DSA Instructor AI</div>
            <div style={{ fontSize: 11, color: "#00d4ff", lineHeight: 1.2 }}>Data Structures & Algorithms Expert</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, color: "#10b981",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 20, padding: "4px 10px",
          }}>
            <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
            Online
          </div>
          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat} style={{
              background: "transparent", border: "1px solid #1f2d47",
              color: "#64748b", fontSize: 12, padding: "5px 12px",
              borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
            }}>Clear chat</button>
          )}
        </div>
      </header>

      {/* ── Messages — THIS IS THE KEY: minHeight:0 as inline style ── */}
      <div
        ref={messagesContainerRef}
        className="msgs-container"
        style={{
          flex: "1 1 0",
          minHeight: 0,          // ← THE FIX
          overflowY: "auto",
          overflowX: "hidden",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {isEmpty ? (
          <div className="fade-up" style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", flex: 1, textAlign: "center", padding: "40px 16px",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24, fontSize: 36,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
              background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
              border: "1px solid rgba(0,212,255,0.25)",
              boxShadow: "0 0 40px rgba(0,212,255,0.1)",
            }}>🌲</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
              Master <span style={{ color: "#00d4ff" }}>DSA</span> with AI
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 460, lineHeight: 1.6, marginBottom: 28 }}>
              Ask me anything about Data Structures & Algorithms. Follow up as much as you like!
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 560 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s.text} className="suggestion-btn" onClick={() => sendMessage(s.text)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#1a2236", border: "1px solid #1f2d47",
                  borderRadius: 12, padding: "10px 14px",
                  textAlign: "left", fontSize: 13, color: "#94a3b8",
                  cursor: "pointer", transition: "all 0.2s",
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className="fade-up" style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                flexShrink: 0,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, marginTop: 2,
                  ...(msg.role === "assistant"
                    ? { background: "linear-gradient(135deg, #00d4ff, #7c3aed)", boxShadow: "0 0 10px rgba(0,212,255,0.2)" }
                    : { background: "#1a2236", border: "1px solid #1f2d47" }),
                }}>
                  {msg.role === "assistant" ? "🧠" : "👤"}
                </div>
                <div style={{
                  borderRadius: 14, padding: "12px 16px", fontSize: 14,
                  lineHeight: 1.7, wordBreak: "break-word", overflowWrap: "break-word",
                  maxWidth: msg.role === "user" ? "75%" : "85%",
                  ...(msg.role === "user"
                    ? { background: "linear-gradient(135deg, #1e3a5f, #1a2a4a)", border: "1px solid rgba(0,212,255,0.15)", borderTopRightRadius: 4 }
                    : { background: "#111827", border: "1px solid #1f2d47", borderTopLeftRadius: 4 }),
                }}>
                  {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="fade-up" style={{ display: "flex", gap: 12, alignItems: "flex-start", flexShrink: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                  background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
                }}>🧠</div>
                <div style={{
                  background: "#111827", border: "1px solid #1f2d47",
                  borderRadius: 14, borderTopLeftRadius: 4,
                  padding: "14px 16px", display: "flex", gap: 5, alignItems: "center",
                }}>
                  <div className="dot-1" style={{ width: 7, height: 7, borderRadius: "50%", background: "#00d4ff" }} />
                  <div className="dot-2" style={{ width: 7, height: 7, borderRadius: "50%", background: "#00d4ff" }} />
                  <div className="dot-3" style={{ width: 7, height: 7, borderRadius: "50%", background: "#00d4ff" }} />
                </div>
              </div>
            )}

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, padding: "10px 14px", color: "#fca5a5",
                fontSize: 12, textAlign: "center", flexShrink: 0,
              }}>⚠ {error}</div>
            )}
          </>
        )}
      </div>

      {/* ── Input ── */}
      <div style={{
        flexShrink: 0, padding: "12px 16px 16px",
        background: "#111827", borderTop: "1px solid #1f2d47", zIndex: 10,
      }}>
        <div style={{
          display: "flex", gap: 8, alignItems: "flex-end",
          background: "#1a2236", border: "1px solid #1f2d47",
          borderRadius: 16, padding: "8px 10px",
        }}>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask about algorithms, data structures, Big-O, interview problems…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#e2e8f0", fontSize: 14, resize: "none", lineHeight: 1.5,
              minHeight: 24, maxHeight: 140, overflowY: "auto",
              fontFamily: "'Outfit', sans-serif",
            }}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 36, height: 36, border: "none", borderRadius: 10, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
              boxShadow: "0 0 12px rgba(0,212,255,0.25)", transition: "all 0.2s",
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: "white" }}>
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p style={{ fontSize: 11, color: "#475569", marginTop: 6, paddingLeft: 2 }}>
          Enter to send · Shift+Enter for new line · Follow-up questions welcome
        </p>
      </div>
    </div>
  );
}