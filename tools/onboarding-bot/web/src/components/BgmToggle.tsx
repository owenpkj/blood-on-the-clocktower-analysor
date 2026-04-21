"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/** Background music toggle button.
 *  - Default: muted (browsers block autoplay sound)
 *  - User taps button to unmute / remute
 *  - Remembers preference via localStorage */
export function BgmToggle({ src = "/bgm.mp3" }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("botc-bgm") : null;
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = "auto";
    audioRef.current = audio;

    if (saved === "on") {
      // Autoplay may be blocked; user must click; but we try anyway
      audio.play().then(() => setOn(true)).catch(() => setOn(false));
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  async function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (on) {
      a.pause();
      setOn(false);
      localStorage.setItem("botc-bgm", "off");
    } else {
      try {
        await a.play();
        setOn(true);
        localStorage.setItem("botc-bgm", "on");
      } catch {
        // Ignore; user can retry
      }
    }
  }

  return (
    <button
      onClick={toggle}
      className="text-[#a38f72] hover:text-[#ebdcbd] p-2"
      aria-label={on ? "关闭背景音乐" : "开启背景音乐"}
      title={on ? "关闭背景音乐" : "开启背景音乐"}
    >
      {on ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
