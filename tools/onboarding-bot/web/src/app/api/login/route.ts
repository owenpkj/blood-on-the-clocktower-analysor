export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "invite_ok";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getValidCodes(): Set<string> {
  const raw = process.env.VALID_INVITE_CODES ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body.inviteCode === "string" ? body.inviteCode.trim() : "";
  if (!code) {
    return Response.json({ ok: false, error: "invite_code_required" }, { status: 400 });
  }

  const valid = getValidCodes();
  if (!valid.has(code)) {
    return Response.json({ ok: false, error: "invalid_invite" }, { status: 403 });
  }

  const isProd = process.env.NODE_ENV === "production";
  const cookie = [
    `${COOKIE_NAME}=1`,
    "Path=/",
    `Max-Age=${MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
    isProd ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
  });
}

export async function DELETE() {
  const cookie = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ].join("; ");
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
  });
}
