import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClockLogo } from "@/components/ClockLogo";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export function MessageBubble({ role, content }: Props) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-full flex items-center justify-center border",
          isUser
            ? "bg-[#2a110d] border-[#5e1c1c]"
            : "bg-[#15100d] border-[#3a2520]",
        )}
      >
        {isUser ? (
          <User size={18} className="text-[#ebdcbd]/80" />
        ) : (
          <ClockLogo size={28} />
        )}
      </div>
      <div
        className={cn(
          "max-w-[78%] rounded-lg px-4 py-3 text-[15px] leading-relaxed break-words",
          isUser ? "bubble-user" : "bubble-assistant",
          "prose prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-li:my-0",
        )}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{content}</span>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
