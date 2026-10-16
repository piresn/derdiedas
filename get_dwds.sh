#!/usr/bin/env bash

for f in A1.csv A2.csv B1.csv; do
  stem="${f%.csv}"
  wget -qO- "https://www.dwds.de/api/lemma/goethe/$f" |
    tail -n +2 |
    awk -v stem="$stem" '
      {
        gsub(/","/, "\034")
        gsub(/"/, "")
        split($0, a, "\034")
        if (a[3] == "Substantiv") {
          gsub(/,/, "|", a[5])
          gsub(/[[:space:]]*\|[[:space:]]*/, "|", a[5])
          print a[1] "," a[5] "," stem
        }
      }
    '
done > out.csv
