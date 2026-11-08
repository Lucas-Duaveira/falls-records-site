const tracks = {
  "soft-sparks": { title: "Soft Sparks", artist: "Duaveira" },
  "you-should-care-less": { title: "You Should Care Less", artist: "Rise Rise, Forks" },
  "hurt-only": { title: "Hurt Only", artist: "Rebecca Silveiras" },
};

const jsonResponse = (body, status, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const corsHeaders =
      origin === env.ALLOWED_ORIGIN
        ? {
            "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
            Vary: "Origin",
          }
        : {};

    if (origin !== env.ALLOWED_ORIGIN) {
      return jsonResponse({ error: "Origin not allowed." }, 403);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405, corsHeaders);
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse({ error: "AI host is not configured." }, 503, corsHeaders);
    }

    const ipAddress = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success } = await env.RADIO_LIMITER.limit({ key: ipAddress });
    if (!success) {
      return jsonResponse({ error: "Too many requests." }, 429, corsHeaders);
    }

    const contentLength = Number(request.headers.get("Content-Length") ?? 0);
    if (contentLength > 1024) {
      return jsonResponse({ error: "Request body is too large." }, 413, corsHeaders);
    }

    let body;
    try {
      const text = await request.text();
      if (text.length > 1024) {
        return jsonResponse({ error: "Request body is too large." }, 413, corsHeaders);
      }
      body = JSON.parse(text);
    } catch {
      return jsonResponse({ error: "Invalid JSON body." }, 400, corsHeaders);
    }

    if (
      typeof body !== "object" ||
      body === null ||
      typeof body.trackId !== "string" ||
      !Object.hasOwn(tracks, body.trackId)
    ) {
      return jsonResponse({ error: "Unknown track." }, 400, corsHeaders);
    }

    const track = tracks[body.trackId];
    let result;
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          instructions:
            "Você é a pessoa apresentadora da Rádio Falls Records, em português brasileiro. " +
            "Crie uma única chamada curta, calorosa e natural para anunciar a próxima música. " +
            "Fale apenas o nome do artista e o título da faixa informados. Não invente fatos, " +
            "não faça perguntas, não inclua instruções nem use aspas. Máximo de 25 palavras.",
          input: `Próxima faixa: ${track.title}, de ${track.artist}.`,
          max_output_tokens: 80,
        }),
      });

      if (!response.ok) {
        return jsonResponse({ error: "AI provider request failed." }, 502, corsHeaders);
      }

      result = await response.json();
    } catch {
      return jsonResponse({ error: "AI provider request failed." }, 502, corsHeaders);
    }

    if (!result || typeof result !== "object") {
      return jsonResponse({ error: "AI provider request failed." }, 502, corsHeaders);
    }
    const line = result.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text")?.text
      ?.trim();

    if (typeof line !== "string" || line.length === 0 || line.length > 240) {
      return jsonResponse({ error: "AI provider returned an invalid announcement." }, 502, corsHeaders);
    }

    return jsonResponse({ line }, 200, corsHeaders);
  },
};
