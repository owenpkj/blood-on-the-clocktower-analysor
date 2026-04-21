"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/** Background music toggle.
 *  - Defaults ON; tries autoplay on mount.
 *  - Browsers often block autoplay of audio without a user gesture — in that case
 *    we listen for the first click/tap/keydown and try play() again.
 *  - User can always mute with the button; preference persists in localStorage. */
export function BgmToggle({ src = "/bgm.mp3" }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("botc-bgm") : null;
    // Default ON unless user explicitly turned it off before.
    const wantOn = saved !== "off";

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";
    audioRef.current = audio;
    setOn(wantOn);

    if (!wantOn) return;

    let unlockHandler: (() => void) | null = null;
    const tryPlay = () => {
      audio
        .play()
        .then(() => setOn(true))
        .catch(() => {
          // Autoplay blocked — hook first user gesture to retry once.
          setOn(false);
          if (!unlockHandler) {
            unlockHandler = () => {
              audio.play().then(() => {
                setOn(true);
                localStorage.setItem("botc-bgm", "on");
              }).catch(() => {});
              document.removeEventListener("click", unlockHandler!);
              document.removeEventListener("touchstart", unlockHandler!);
              document.removeEventListener("keydown", unlockHandler!);
              unlockHandler = null;
            };
            document.addEventListener("click", unlockHandler, { once: true });
            document.addEventListener("touchstart", unlockHandler, { once: true });
            document.addEventListener("keydown", unlockHandler, { once: true });
          }
        });
    };
    tryPlay();

    return () => {
      if (unlockHandler) {
        document.removeEventListener("click", unlockHandler);
        document.removeEventListener("touchstart", unlockHandler);
        document.removeEventListener("keydown", unlockHandler);
      }
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
        // ignore
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
