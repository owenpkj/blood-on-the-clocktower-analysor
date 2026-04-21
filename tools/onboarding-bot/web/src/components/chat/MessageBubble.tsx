import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DemonAvatar } from "@/components/DemonAvatar";
import { cn } from "@/lib/utils";

type Props = {
  role: "user" | "assistant";
  content: string;
  nickname?: string;
};

/** Display full nickname in Gothic font inside the avatar circle.
 *  Auto-scales font size based on character count so 1-6 chars all fit. */
function NicknameAvatar({ nickname }: { nickname: string }) {
  const n = nickname.length;
  const fontSize = n <= 2 ? 15 : n <= 3 ? 13 : n <= 4 ? 11 : 9;
  return (
    <div
      className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border bg-[#2a110d] border-[#5e1c1c]"
      aria-label={nickname}
    >
      <span
        className="gothic-nickname leading-none px-0.5 text-center"
        style={{ fontSize: `${fontSize}px` }}
      >
        {nickname}
      </span>
    </div>
  );
}

function AiAvatar() {
  return (
    <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border bg-[#0f0505] border-[#3a2520]">
      <DemonAvatar size={30} />
    </div>
  );
}

export function MessageBubble({ role, content, nickname }: Props) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {isUser ? <NicknameAvatar nickname={nickname || "?"} /> : <AiAvatar />}
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
