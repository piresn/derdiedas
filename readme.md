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
head -5000 nouns.csv > nouns_small.csv
```

## Sentence lookup Worker

The Leipzig sentence API does not enable browser CORS. This Cloudflare Worker
fetches only sentence lookups from the fixed Leipzig endpoint and adds the CORS
headers needed by the static site.

1. In the Cloudflare dashboard, go to **Workers & Pages** and choose **Create
   application**, then create a **Worker** from the **Hello World** starter.
   Do not use the Pages static-asset uploader or upload `sentences.js` as a
   Pages project; that uploader expects built site assets, not Worker source.
2. Open the Worker’s code editor / **Quick edit**, replace the starter code with
   the entire contents of [`workers/sentences.js`](./workers/sentences.js), and
   choose **Deploy**.
3. Copy the Worker URL shown in the dashboard and append `/sentences`.
4. Set `SENTENCE_API_URL` near the top of `index.html` to that URL, for example:
   `https://derdiedas-sentences.example.com/sentences`.
5. Publish the updated `index.html` to GitHub Pages.

The Worker allows remote and local development origins by
default. If you use a custom domain, add its origin (scheme and hostname,
without a path) to the `ALLOWED_ORIGINS` array near the top of
[`workers/sentences.js`](./workers/sentences.js), then save and deploy again.

The Worker Free plan currently includes 100,000 requests per day. See
[Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).

####

## Further resources
https://corpora.wortschatz-leipzig.de/en?corpusId=deu_news_2025 - lots of resources, NLP, semantic connections, frequencies, but RESTful not working

[https://www.reader-dict.com/de/download/de](https://www.reader-dict.com/de/download/de)
