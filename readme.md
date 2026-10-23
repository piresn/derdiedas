# DerDieDas

A small browser app for practicing German noun genders. Filter nouns by CEFR level, reveal each article, and explore example sentences, frequency information, and DWDS dictionary entries.

## Deploy to GitHub Pages

The `Deploy to GitHub Pages` workflow publishes the `public/` directory whenever
changes are pushed to `main`. It also includes the repository's root `CNAME`
file in the published artifact to keep the custom domain configured.

To enable deployment, open the repository's **Settings → Pages** and select
**GitHub Actions** as the build and deployment source. You can also start a
deployment manually from the **Actions** tab.

## Sentence lookup Worker

The Leipzig sentence API does not enable browser CORS. This separately deployed
Cloudflare Worker fetches sentence lookups from the fixed Leipzig endpoint and
adds the CORS headers needed by the static site.
The Worker source is [`proxy_server.js`](./proxy_server.js) in the repository
root.

1. In the Cloudflare dashboard, create a Worker and open its code editor /
   **Quick edit**.
2. Replace the starter code with the full contents of
   [`proxy_server.js`](./proxy_server.js), then deploy the Worker.
3. The Worker serves requests at `/sentences`. Copy the Worker URL and append
   that path, for example:
   `https://derdiedas-sentences.example.com/sentences`.
4. Set `SENTENCE_API_URL` near the top of [`public/app.js`](./public/app.js) to
   the deployed URL, then publish the updated site.

Before deploying, check `ALLOWED_ORIGINS` near the top of
[`proxy_server.js`](./proxy_server.js). It currently allows
`https://derdiedas.nunopires.net` and local development at
`http://localhost:8000` and `http://127.0.0.1:8000`. Add or replace entries to
match the site's origin(s), using the scheme and hostname only, then deploy the
updated Worker.

The Worker Free plan currently includes 100,000 requests per day. See
[Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).

## Resources
https://corpora.wortschatz-leipzig.de/en?corpusId=deu_news_2025 - lots of resources, NLP, semantic connections, frequencies

[https://www.reader-dict.com/de/download/de](https://www.reader-dict.com/de/download/de)

https://www.dwds.de/d/api
