# Dictionary

Data from https://github.com/natema/wordhoard

## Prepare csv
```bash
wget https://github.com/natema/wordhoard/releases/download/v0.1.0/wordhoard-csv-v0.1.0.zip
# extract wordhoard-de.csv
# ...
#keep NOUN (2nd col) lines and only cols 1,3,6

awk -F, '$2 == "NOUN"{print $1","$3","$6}' wordhoard-de.csv > nouns.csv

# remove empty col2 lines
awk -F',' '$2 != ""' nouns.csv > tmp && mv tmp nouns.csv
```

#### remove incorrect words
```bash
words="im,IG"

awk -F',' -v list="$words" '
BEGIN {
  n = split(list, a, ",")
  for (i = 1; i <= n; i++) bad[a[i]] = 1
}
!($1 in bad)
' nouns.csv > tmp && mv tmp nouns.csv
```

#### first 5000 words
```bash
mkdir -p public/data
head -5000 nouns.csv > public/data/nouns_small.csv
```

#### Manually fix issues with word file
can run QC to check against a small model assessment
Running list of gender replaced / word removed: `fixes.txt`
(use `git diff --unified=0 --no-prefix | grep -E '^[+-][^+-]' >> fixes.txt` for recording for now)


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

## Further resources
https://corpora.wortschatz-leipzig.de/en?corpusId=deu_news_2025 - lots of resources, NLP, semantic connections, frequencies, but RESTful not working

[https://www.reader-dict.com/de/download/de](https://www.reader-dict.com/de/download/de)

https://www.dwds.de/d/api
