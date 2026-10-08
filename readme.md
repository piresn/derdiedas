# Dictionary

Data from https://github.com/natema/wordhoard

## Prepare csv
```bash
wget https://github.com/natema/wordhoard/releases/download/v0.1.0/wordhoard-csv-v0.1.0.zip
# extract wordhoard-de.csv
# ...
head -1 wordhoard-de.csv > nouns.csv
awk -F, '$2 == "NOUN"' wordhoard-de.csv >> nouns.csv
keep only cols 1,3,4,6
awk -F, '$2=="NOUN"{print $1","$3","$4","$6}' nouns.csv > nouns_clean.csv
head -15000 nouns_clean.csv > nouns_small.csv
```

## See also
https://corpora.wortschatz-leipzig.de/en?corpusId=deu_news_2025 - lots of resources, NLP, semantic connections, frequencies, but RESTful not working

[https://www.reader-dict.com/de/download/de](https://www.reader-dict.com/de/download/de) - At least DictFile okish
