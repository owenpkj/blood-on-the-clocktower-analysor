import { pool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

function toRole(type: string): "user" | "assistant" | null {
  if (type === "human" || type === "user") return "user";
  if (type === "ai" || type === "assistant") return "assistant";
  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) {
    return Response.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, message FROM n8n_chat_histories WHERE session_id = $1 ORDER BY id ASC",
      [sessionId],
    );

    const messages: HistoryMessage[] = [];
    for (const row of rows) {
      const raw = row.message;
      const type = raw?.type;
      const content = raw?.content ?? raw?.data?.content;
      const role = toRole(type);
      if (role && typeof content === "string") {
        messages.push({ role, content });
      }
    }

    return Response.json({ sessionId, messages });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('relation "n8n_chat_histories" does not exist')) {
      // Table created lazily by n8n on first chat. Empty history is valid.
      return Response.json({ sessionId, messages: [] });
    }
    return Response.json({ error: msg }, { status: 500 });
  }
}
