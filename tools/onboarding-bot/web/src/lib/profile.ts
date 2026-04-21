const KEY = "botc-profile";

export type Profile = {
  script: string | null; // "暗流涌动" | "暗月初升" | "梦陨春宵" | null
  role: string | null; // 用户确认的自己的角色中文名
};

export const DEFAULT_PROFILE: Profile = { script: null, role: null };

export const OFFICIAL_SCRIPTS = ["暗流涌动", "暗月初升", "梦陨春宵"] as const;

export function getProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const p = JSON.parse(raw);
    return {
      script: typeof p.script === "string" ? p.script : null,
      role: typeof p.role === "string" ? p.role : null,
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function setProfile(patch: Partial<Profile>): Profile {
  const current = getProfile();
  const next: Profile = { ...current, ...patch };
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  return next;
}

export function clearProfile() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
  }
}

/** Parse "<!--profile: {...}-->" HTML comment directives inside an assistant message. */
export function extractProfileUpdate(text: string): Partial<Profile> | null {
  const m = text.match(/<!--\s*profile\s*:\s*(\{[\s\S]*?\})\s*-->/i);
  if (!m) return null;
  try {
    const parsed = JSON.parse(m[1]);
    const out: Partial<Profile> = {};
    if (typeof parsed.script === "string") out.script = parsed.script;
    if (typeof parsed.role === "string") out.role = parsed.role;
    return Object.keys(out).length > 0 ? out : null;
  } catch {
    return null;
  }
}
