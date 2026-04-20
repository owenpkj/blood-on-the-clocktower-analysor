export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { sessionId, chatInput, nickname } = await req.json();

  const url = process.env.N8N_CHAT_WEBHOOK_URL;
  if (!url) {
    return Response.json(
      { error: "N8N_CHAT_WEBHOOK_URL not configured" },
      { status: 500 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendMessage",
        sessionId,
        chatInput,
        nickname,
      }),
    });
  } catch (err) {
    return Response.json(
      { error: `n8n fetch failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    return Response.json(
      { error: `n8n webhook error: ${upstream.status}` },
      { status: 502 },
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
