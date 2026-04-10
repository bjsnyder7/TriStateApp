"use client";

import { useState, useRef, useEffect } from "react";
import { chatStream } from "@/lib/api";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  agentCalls?: string[];
}

interface AgentStatus {
  agent: string;
  status: "thinking" | "done";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const streamingRef = useRef<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentStatuses]);

  const sendMessage = () => {
    if (!input.trim() || streaming) return;
    const userMsg = input.trim();
    setInput("");
    setStreaming(true);
    streamingRef.current = "";
    setAgentStatuses([]);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
      { role: "assistant", content: "" },
    ]);

    cancelRef.current = chatStream(userMsg, conversationId, undefined, (event) => {
      if (event.type === "conversation") {
        setConversationId(event.conversation_id as string);
      } else if (event.type === "token") {
        streamingRef.current += event.text as string;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: streamingRef.current };
          return next;
        });
      } else if (event.type === "agent_call") {
        setAgentStatuses((prev) => [
          ...prev.filter((s) => s.agent !== event.agent),
          { agent: event.agent as string, status: "thinking" },
        ]);
      } else if (event.type === "agent_done") {
        setAgentStatuses((prev) =>
          prev.map((s) => (s.agent === event.agent ? { ...s, status: "done" } : s))
        );
      } else if (event.type === "done") {
        setStreaming(false);
        setAgentStatuses([]);
      }
    });
  };

  const agentLabel: Record<string, string> = {
    call_project_agent: "Projects",
    call_github_agent: "GitHub",
    call_calendar_agent: "Calendar",
    call_research_agent: "Research",
    call_notes_agent: "Notes",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-2xl mb-2">Hi, I&apos;m your assistant.</p>
            <p className="text-sm">Ask me about your projects, get a briefing, or research a topic.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-100"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content || (streaming && i === messages.length - 1 ? "..." : "")}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {/* Agent status indicators */}
        {agentStatuses.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {agentStatuses.map((s) => (
              <span
                key={s.agent}
                className={`text-xs px-2 py-1 rounded-full ${
                  s.status === "thinking"
                    ? "bg-indigo-900/50 text-indigo-300 animate-pulse"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {agentLabel[s.agent] || s.agent} {s.status === "thinking" ? "thinking..." : "done"}
              </span>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={streaming}
          />
          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            className="btn-primary px-5"
          >
            Send
          </button>
        </div>
        {conversationId && (
          <div className="text-xs text-gray-600 text-center mt-1">
            Conversation saved
          </div>
        )}
      </div>
    </div>
  );
}
