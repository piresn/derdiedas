const SENTENCE_API_URL = "https://green-fire-c072.orange-king-f185.workers.dev/sentences";

let words = [];
let currentWord = null;
let showingGender = false;
let sentenceRequestId = 0;

const card = document.getElementById("card");
const info = document.getElementById("info");
const mainBtn = document.getElementById("mainBtn");
const themeToggle = document.getElementById("themeToggle");
const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
const levelFilter = document.getElementById("levelFilter");
const sentences = document.getElementById("sentences");
const sentenceStatus = document.getElementById("sentenceStatus");
const sentenceList = document.getElementById("sentenceList");
let themeOverridden = false;

function updateThemeToggle() {
  const isDark = document.documentElement.dataset.theme === "dark";
  themeToggle.textContent = isDark ? "☼" : "☾";
  themeToggle.setAttribute("aria-label", isDark ? "Helles Design aktivieren" : "Dunkles Design aktivieren");
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

themeToggle.addEventListener("click", () => {
  themeOverridden = true;
  document.documentElement.dataset.theme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  updateThemeToggle();
});
colorScheme.addEventListener("change", event => {
  if (themeOverridden) return;
  document.documentElement.dataset.theme = event.matches ? "dark" : "light";
  updateThemeToggle();
});
updateThemeToggle();

function parseCSV(csv) {
  const lines = csv.trim().split(/\r?\n/);
  return lines.map(line => {
    const parts = line.split(",").map(p => p.trim());
    return {
      word: parts[0] || "",
      gender: parts[1] || "",
      level: parts[2] || ""
    };
  }).filter(w => w.word).map((word, index, allWords) => ({
    ...word,
    rank: ((index + 1) / allWords.length) * 100
  }));
}

function formatWordRank(rank) {
  if (rank < 1) return "<1%";
  if (rank > 90) return ">90%";
  return `${rank.toFixed(0)}%`;
}

function getLevelGroup(level) {
  if (level === "A1" || level === "A2") return "A1/A2";
  if (level === "B1" || level === "B2") return "B1/B2";
  if (level === "C1" || level === "C2") return "C1/C2";
  return level;
}

function populateLevelFilter() {
  const levels = [...new Set(words.map(w => getLevelGroup(w.level)).filter(Boolean))].sort();
  levelFilter.innerHTML = `<option value="all">Alle</option>`;
  levels.forEach(level => {
    const opt = document.createElement("option");
    opt.value = level;
    opt.textContent = level;
    levelFilter.appendChild(opt);
  });
  levelFilter.value = levels.includes("A1/A2") ? "A1/A2" : "all";
}

function getFilteredWords() {
  const level = levelFilter.value;
  return level === "all" ? words : words.filter(w => getLevelGroup(w.level) === level);
}

function pickRandomWord() {
  const pool = getFilteredWords();
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function clearSentences(message, hide = true) {
  sentenceRequestId += 1;
  sentenceList.replaceChildren();
  sentenceStatus.textContent = message;
  sentences.hidden = hide;
}

function highlightWord(sentence, word) {
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])${escapedWord}(?![\\p{L}\\p{N}_])`, "giu");
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  for (const match of sentence.matchAll(pattern)) {
    fragment.appendChild(document.createTextNode(sentence.slice(lastIndex, match.index)));
    const emphasis = document.createElement("span");
    emphasis.className = "sentence-word";
    emphasis.textContent = match[0];
    fragment.appendChild(emphasis);
    lastIndex = match.index + match[0].length;
  }
  fragment.appendChild(document.createTextNode(sentence.slice(lastIndex)));
  return fragment;
}

async function loadSentences(word) {
  const requestId = ++sentenceRequestId;
  sentenceStatus.textContent = "Beispielsätze werden geladen …";
  if (!SENTENCE_API_URL) {
    sentenceStatus.textContent = "Die Beispielsätze sind derzeit nicht verfügbar.";
    return;
  }

  const url = new URL(SENTENCE_API_URL);
  url.searchParams.set("word", word);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Sentence request failed (${response.status}).`);
    }
    const data = await response.json();
    if (sentenceRequestId !== requestId) return;

    const results = Array.isArray(data.sentences) ? data.sentences : [];
    if (results.length === 0) {
      sentenceStatus.textContent = "Keine Beispielsätze gefunden.";
      return;
    }

    sentenceStatus.textContent = "";
    results.forEach(result => {
      const item = document.createElement("li");
      item.className = "sentence-item";
      item.appendChild(highlightWord(result.sentence, word));
      sentenceList.appendChild(item);
    });
  } catch (err) {
    if (sentenceRequestId !== requestId) return;
    console.error("Beispielsätze konnten nicht geladen werden.", err);
    sentenceStatus.textContent = "Beispielsätze konnten nicht geladen werden.";
  }
}

function showNewWord() {
  currentWord = pickRandomWord();
  showingGender = false;

  if (!currentWord) {
    card.textContent = "Keine Wörter entsprechen diesem Filter.";
    info.textContent = "";
    mainBtn.textContent = "Weiter";
    clearSentences("Zeige den Artikel an, um Beispielsätze zu sehen.");
    return;
  }

  const gender = document.createElement("span");
  gender.className = "word-gender";
  const wordDisplay = document.createElement("span");
  wordDisplay.className = "word-display";
  const noun = document.createElement("span");
  noun.textContent = currentWord.word.charAt(0).toLocaleUpperCase("de-DE") + currentWord.word.slice(1);
  wordDisplay.append(gender, noun);
  card.replaceChildren(wordDisplay);
  info.textContent = `Niveau: ${currentWord.level} | Wort-Rang: ${formatWordRank(currentWord.rank)}`;
  mainBtn.textContent = "Artikel anzeigen";
  clearSentences("Zeige den Artikel an, um Beispielsätze zu sehen.");
  loadSentences(currentWord.word.charAt(0).toLocaleUpperCase("de-DE") + currentWord.word.slice(1));
}

function revealGender() {
  card.querySelector(".word-gender").textContent = currentWord.gender;
  mainBtn.textContent = "Nächstes Wort";
  showingGender = true;
  sentences.hidden = false;
}

fetch("data/nouns_small.csv")
  .then(res => res.text())
  .then(text => {
    words = parseCSV(text);
    populateLevelFilter();
    card.textContent = "Klicke auf „Starten“.";
    mainBtn.disabled = false;
  })
  .catch(err => {
    console.error("Die Wortliste konnte nicht geladen werden.", err);
    card.textContent = "Die Wortliste konnte nicht geladen werden.";
    info.textContent = "";
  });

mainBtn.addEventListener("click", () => {
  if (!currentWord || showingGender) {
    showNewWord();
  } else {
    revealGender();
  }
});

levelFilter.addEventListener("change", () => {
  currentWord = null;
  showingGender = false;
  if (words.length) {
    card.textContent = "Filter geändert. Klicke auf „Starten“.";
    info.textContent = "";
    mainBtn.textContent = "Starten";
    clearSentences("Zeige den Artikel an, um Beispielsätze zu sehen.");
  }
});
