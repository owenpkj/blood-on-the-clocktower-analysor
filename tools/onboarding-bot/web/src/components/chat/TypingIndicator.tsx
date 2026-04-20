import { ClockLogo } from "@/components/ClockLogo";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 w-full">
      <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border bg-[#15100d] border-[#3a2520]">
        <ClockLogo size={28} />
      </div>
      <div className="bubble-assistant rounded-lg px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot inline-block w-2 h-2 rounded-full bg-[#a38f72]" />
        <span className="typing-dot inline-block w-2 h-2 rounded-full bg-[#a38f72]" />
        <span className="typing-dot inline-block w-2 h-2 rounded-full bg-[#a38f72]" />
      </div>
    </div>
  );
}
