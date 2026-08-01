import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function App() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!input.trim() || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          systemPrompt: systemPrompt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "請求失敗");

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知錯誤");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col p-4">
      <h1 className="mb-2 text-xl font-bold">Bedrock Chat 測試</h1>

      <input
        className="mb-3 rounded border px-3 py-2 text-sm"
        placeholder="System prompt（選填）"
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
      />

      <div className="flex-1 space-y-3 overflow-y-auto rounded border p-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={
                "inline-block max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm " +
                (m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900")
              }
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-sm text-gray-400">思考中…</div>}
      </div>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="輸入訊息…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={send}
          disabled={loading}
        >
          送出
        </button>
      </div>
    </div>
  );
}
