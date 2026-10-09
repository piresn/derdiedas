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

#### first 10000 words
```bash
head -10000 nouns.csv > nouns_small.csv
```


####

## Further resources
https://corpora.wortschatz-leipzig.de/en?corpusId=deu_news_2025 - lots of resources, NLP, semantic connections, frequencies, but RESTful not working

[https://www.reader-dict.com/de/download/de](https://www.reader-dict.com/de/download/de)
