"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClockLogo } from "@/components/ClockLogo";
import { GothicBackground } from "@/components/GothicBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NICKNAME_MAX = 6;

export default function LandingPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedNick = localStorage.getItem("botc-nickname");
    const savedCode = localStorage.getItem("botc-invite");
    if (savedNick) setNickname(savedNick.slice(0, NICKNAME_MAX));
    if (savedCode) setInviteCode(savedCode);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const code = inviteCode.trim();
    const nick = nickname.trim();
    if (!code) return setError("请填写邀请码");
    if (!nick) return setError("请填写昵称");
    if (nick.length > NICKNAME_MAX) return setError(`昵称不超过 ${NICKNAME_MAX} 字`);

    setSubmitting(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "invalid_invite") {
          setError("邀请码无效");
        } else {
          setError("登录失败，请稍后重试");
        }
        setSubmitting(false);
        return;
      }
      localStorage.setItem("botc-invite", code);
      localStorage.setItem("botc-nickname", nick);
      router.push("/chat");
    } catch {
      setError("网络异常，请稍后重试");
      setSubmitting(false);
    }
  }

  return (
    <>
      <GothicBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-dvh px-6">
        <div className="w-full max-w-sm flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <ClockLogo size={88} />
            <div className="text-center">
              <h1 className="text-[#ebdcbd] text-2xl tracking-[0.15em] font-[var(--font-heading)]">
                血染钟楼助手
              </h1>
              <p className="text-[#a38f72] text-sm mt-1 tracking-wide">
                规则 · 角色 · 玩法
              </p>
            </div>
          </div>

          <div className="ornament w-full" />

          <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#a38f72] text-xs tracking-wider uppercase">
                邀请码
              </label>
              <Input
                value={inviteCode}
                onChange={(e) => {
                  setError(null);
                  setInviteCode(e.target.value);
                }}
                placeholder="请输入邀请码"
                className="bg-[#1e1612]/80 border-[#3a2520] text-[#ebdcbd] placeholder:text-[#a38f72]/60 h-11 backdrop-blur"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#a38f72] text-xs tracking-wider uppercase">
                昵称（最多 {NICKNAME_MAX} 字）
              </label>
              <Input
                value={nickname}
                onChange={(e) => {
                  setError(null);
                  setNickname(e.target.value.slice(0, NICKNAME_MAX));
                }}
                placeholder="你在鸦木布拉夫的名字"
                className="bg-[#1e1612]/80 border-[#3a2520] text-[#ebdcbd] placeholder:text-[#a38f72]/60 h-11 backdrop-blur"
                maxLength={NICKNAME_MAX}
              />
            </div>

            {error && (
              <p className="text-[#a42d2d] text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="mt-2 bg-[#8b0000] hover:bg-[#a42d2d] text-[#ebdcbd] border border-[#5e1c1c] h-11 tracking-wider disabled:opacity-60"
            >
              {submitting ? "正在打开..." : "推 门 而 入"}
            </Button>
          </form>

          <div className="ornament w-full" />
        </div>
      </div>
    </>
  );
}
