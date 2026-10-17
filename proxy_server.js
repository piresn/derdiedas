const UPSTREAM_BASE =
  "https://api.wortschatz-leipzig.de/ws/sentences/deu_wikipedia_2010_1M/sentences/";
  // "https://api.wortschatz-leipzig.de/ws/sentences/deu_news_2012_1M/sentences/";
const ALLOWED_ORIGINS = [
  "https://derdiedas.nunopires.net",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
];

function makeResponse(body, status, origin, allowedOrigins) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  });

  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Max-Age", "86400");
  }

  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return makeResponse({ error: "Origin not allowed." }, 403, origin, ALLOWED_ORIGINS);
    }

    if (request.method === "OPTIONS") {
      const headers = new Headers({
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
      });
      if (origin) headers.set("Access-Control-Allow-Origin", origin);
      return new Response(null, {
        status: 204,
        headers
      });
    }

    if (request.method !== "GET") {
      return makeResponse({ error: "Method not allowed." }, 405, origin, ALLOWED_ORIGINS);
    }

    if (url.pathname !== "/sentences") {
      return makeResponse({ error: "Not found." }, 404, origin, ALLOWED_ORIGINS);
    }

    const word = url.searchParams.get("word")?.trim();
    if (!word || word.length > 100 || /[\u0000-\u001f\u007f]/.test(word)) {
      return makeResponse({ error: "Provide a valid word (1-100 characters)." }, 400, origin, ALLOWED_ORIGINS);
    }

    const upstreamUrl = `${UPSTREAM_BASE}${encodeURIComponent(word)}?offset=0&limit=10`;

    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        signal: request.signal,
        cache: "no-store"
      });
      const body = await upstreamResponse.text();
      let responseBody = body;

      if (upstreamResponse.ok) {
        const data = JSON.parse(body);
        if (!Array.isArray(data.sentences)) {
          throw new Error("Sentence service returned an invalid response.");
        }

        const sentences = data.sentences.slice();
        const sampleSize = Math.min(3, sentences.length);
        for (let i = 0; i < sampleSize; i += 1) {
          const randomIndex = i + Math.floor(Math.random() * (sentences.length - i));
          [sentences[i], sentences[randomIndex]] = [sentences[randomIndex], sentences[i]];
        }
        data.sentences = sentences.slice(0, sampleSize);
        responseBody = JSON.stringify(data);
      }

      const response = new Response(responseBody, {
        status: upstreamResponse.status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          "Vary": "Origin"
        }
      });

      if (origin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
        response.headers.set("Access-Control-Max-Age", "86400");
      }
      return response;
    } catch (error) {
      return makeResponse(
        { error: `Sentence service request failed: ${error.message}` },
        502,
        origin,
        ALLOWED_ORIGINS
      );
    }
  }
};
