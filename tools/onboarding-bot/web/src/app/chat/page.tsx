"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ClockLogo } from "@/components/ClockLogo";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal, LogOut } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

function getSessionId() {
  let id = localStorage.getItem("botc-onboarding-session");
  if (!id) {
    id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("botc-onboarding-session", id);
  }
  return id;
}

async function streamChat(
  url: string,
  body: object,
  onChunk: (text: string) => void,
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const s = line.trim();
      if (!s) continue;
      try {
        const evt = JSON.parse(s);
        if (evt.type === "item" && typeof evt.content === "string") {
          onChunk(evt.content);
        }
      } catch {
        // ignore malformed line
      }
    }
  }
  if (buffer.trim()) {
    try {
      const evt = JSON.parse(buffer);
      if (evt.type === "item" && typeof evt.content === "string") {
        onChunk(evt.content);
      }
    } catch {}
  }
}

export default function ChatPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initTriggered = useRef(false);

  useEffect(() => {
    const nick = localStorage.getItem("botc-nickname");
    if (!nick) {
      router.replace("/");
      return;
    }
    // Guard against React Strict Mode double-invocation wiping out
    // the in-flight streaming state.
    if (initTriggered.current) return;
    initTriggered.current = true;

    setNickname(nick);
    const sid = getSessionId();
    setSessionId(sid);

    (async () => {
      try {
        const res = await fetch(`/api/history?sessionId=${encodeURIComponent(sid)}`);
        const data = await res.json();
        const history: Msg[] = Array.isArray(data.messages) ? data.messages : [];

        if (history.length === 0) {
          setLoadingHistory(false);
          await sendMessage(sid, nick, "__INIT__", []);
        } else {
          setMessages(history);
          setLoadingHistory(false);
        }
      } catch (err) {
        setLoadingHistory(false);
        setMessages([
          {
            role: "assistant",
            content: `加载历史失败：${err instanceof Error ? err.message : String(err)}`,
          },
        ]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function sendMessage(sid: string, nick: string, chatInput: string, prior: Msg[]) {
    setSending(true);
    setStreaming(false);

    const userPlusPrior = chatInput === "__INIT__" ? prior : [...prior, { role: "user" as const, content: chatInput }];
    setMessages(userPlusPrior);

    // Placeholder assistant message that will be filled by stream
    setMessages([...userPlusPrior, { role: "assistant", content: "" }]);

    try {
      let first = true;
      await streamChat(
        "/api/chat",
        { sessionId: sid, chatInput, nickname: nick },
        (chunk) => {
          if (first) {
            setStreaming(true);
            setSending(false);
            first = false;
          }
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === "assistant") {
              next[next.length - 1] = { ...last, content: last.content + chunk };
            }
            return next;
          });
        },
      );
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") {
          next[next.length - 1] = {
            ...last,
            content: `连接失败：${err instanceof Error ? err.message : String(err)}`,
          };
        }
        return next;
      });
    } finally {
      setSending(false);
      setStreaming(false);
    }
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending || streaming) return;
    setInput("");
    await sendMessage(sessionId, nickname ?? "", content, messages);
  }

  async function exit() {
    try {
      await fetch("/api/login", { method: "DELETE" });
    } catch {}
    localStorage.removeItem("botc-nickname");
    localStorage.removeItem("botc-invite");
    localStorage.removeItem("botc-onboarding-session");
    router.replace("/");
  }

  if (!nickname) return null;

  const busy = sending || streaming;

  return (
    <div className="flex flex-col h-dvh max-w-3xl w-full mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-3.5 border-b border-[#2a1c16] bg-[#0c0807]/90 backdrop-blur">
        <ClockLogo size={36} />
        <div className="flex-1 min-w-0">
          <h1 className="text-[#ebdcbd] text-base font-[var(--font-heading)] tracking-wider truncate">
            血染钟楼助手
          </h1>
          <p className="text-[#a38f72] text-xs truncate">访客 · {nickname}</p>
        </div>
        <button
          onClick={exit}
          className="text-[#a38f72] hover:text-[#ebdcbd] p-2 -mr-2"
          aria-label="退出"
        >
          <LogOut size={18} />
        </button>
      </header>
      <div className="ornament" />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {loadingHistory && (
          <div className="text-center text-[#a38f72] text-sm py-8">加载对话中…</div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}
        {sending && !streaming && <TypingIndicator />}
      </div>

      <div className="ornament" />

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 p-3 bg-[#0c0807]"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="向助手发问……"
          rows={1}
          disabled={loadingHistory}
          className="flex-1 resize-none bg-[#1e1612] border-[#3a2520] text-[#ebdcbd] placeholder:text-[#a38f72]/60 min-h-[44px] max-h-36"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || busy || loadingHistory}
          className="bg-[#8b0000] hover:bg-[#a42d2d] text-[#ebdcbd] h-11 w-11 shrink-0 border border-[#5e1c1c]"
        >
          <SendHorizonal size={18} />
        </Button>
      </form>
    </div>
  );
}
