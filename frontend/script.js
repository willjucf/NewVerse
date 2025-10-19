// -------- DOM ----------
const verseBox = document.getElementById('verse-box');
const bookList = document.getElementById('book-list');
const passageDisplay = document.getElementById('passage-display');
const sortButton = document.getElementById('sort-button');

// -------- State ----------
let selectedBooks = new Set();
let currentVerse = null;
let apiBooks = [];
let canonicalOrder = [];
let alphabeticalOrder = [];
let sortAlphabetical = false;

// Canonical Protestant order
const CANONICAL_IDS = [
  'genesis','exodus','leviticus','numbers','deuteronomy',
  'joshua','judges','ruth','1samuel','2samuel','1kings','2kings',
  '1chronicles','2chronicles','ezra','nehemiah','esther','job',
  'psalms','proverbs','ecclesiastes','songofsolomon','isaiah','jeremiah',
  'lamentations','ezekiel','daniel','hosea','joel','amos','obadiah',
  'jonah','micah','nahum','habakkuk','zephaniah','haggai','zechariah','malachi',
  'matthew','mark','luke','john','acts','romans','1corinthians','2corinthians',
  'galatians','ephesians','philippians','colossians','1thessalonians','2thessalonians',
  '1timothy','2timothy','titus','philemon','hebrews','james','1peter','2peter',
  '1john','2john','3john','jude','revelation'
];

// ---------- Init ----------
init();

async function init() {
  await fetchBooks();
  fetchVerse();
  setInterval(fetchVerse, 5 * 60 * 1000);
}

// ---------- Books ----------
async function fetchBooks() {
  const res = await fetch('/api/books');
  const rows = await res.json();
  apiBooks = rows.map(r => r.book);

  const apiSet = new Set(apiBooks);
  canonicalOrder = CANONICAL_IDS.filter(id => apiSet.has(id));

  alphabeticalOrder = [...apiBooks].sort((a, b) =>
    prettifyName(a).toLowerCase().localeCompare(prettifyName(b).toLowerCase())
  );

  updateSortButtonText();
  renderBooks();
}

function renderBooks() {
  bookList.innerHTML = '';
  const listToRender = sortAlphabetical ? alphabeticalOrder : canonicalOrder;

  listToRender.forEach(bookId => {
    const btn = document.createElement('button');
    btn.className = 'book-item';
    btn.dataset.book = bookId;

    const dot = document.createElement('span');
    dot.className = 'dot';
    btn.appendChild(dot);

    const label = document.createElement('span');
    label.textContent = prettifyName(bookId);
    btn.appendChild(label);

    btn.addEventListener('click', () => toggleBook(bookId, btn));
    if (selectedBooks.has(bookId)) btn.classList.add('selected');

    bookList.appendChild(btn);
  });
}

function toggleBook(bookId, btn) {
  if (selectedBooks.has(bookId)) {
    selectedBooks.delete(bookId);
    btn.classList.remove('selected');
  } else {
    selectedBooks.add(bookId);
    btn.classList.add('selected');
  }
}

function selectAllBooks() {
  selectedBooks.clear();
  const currentList = sortAlphabetical ? alphabeticalOrder : canonicalOrder;
  currentList.forEach(id => selectedBooks.add(id));
  renderBooks();
}

function clearBooks() {
  selectedBooks.clear();
  renderBooks();
}

function toggleSort() {
  sortAlphabetical = !sortAlphabetical;
  updateSortButtonText();

  const container = document.querySelector('.sidebar');
  const y = container.scrollTop;
  renderBooks();
  container.scrollTop = y;
}

function updateSortButtonText() {
  sortButton.textContent = sortAlphabetical ? 'Sort: Alphabetical' : 'Sort: Original';
}

// ---------- Name formatting ----------
function prettifyName(id) {
  let pretty = id.replace(/^(\d)([a-z])/, '$1 $2');
  pretty = pretty.replace(/songofsolomon/i, 'Song of Solomon');
  return pretty
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------- Verse fetching ----------
async function fetchVerse() {
  const selectedArray = Array.from(selectedBooks);
  const query = selectedArray.length ? `?book=${selectedArray.join(',')}` : '';

  const res = await fetch(`/api/verse${query}`);
  const data = await res.json();

if (data && data.text) {
  verseBox.innerHTML = `${prettifyName(data.book)} ${data.chapter}:${data.verse} — ${data.text}`;
  currentVerse = data;
  passageDisplay.style.display = 'none';
} else {
  verseBox.textContent = 'Verse not found.';
  currentVerse = null;
}

}

// ---------- Passage view ----------
async function openPassage() {
  if (!currentVerse) return;

  const { book, chapter, verse } = currentVerse;
  const res = await fetch(`/api/passage?book=${book}&chapter=${chapter}&verse=${verse}`);
  const passage = await res.json();

  if (passage.error) {
    passageDisplay.textContent = 'Passage not found.';
    passageDisplay.style.display = 'block';
    return;
  }

  let html = `<h2>${prettifyName(passage.book)} ${passage.chapter}</h2><p>`;
  const grouped = {};
  passage.verses.forEach(v => {
    if (!grouped[v.verse]) grouped[v.verse] = [];
    grouped[v.verse].push(v.text);
  });

  Object.keys(grouped).forEach(vNum => {
    const text = grouped[vNum].join(' ').trim();
    const line =
      parseInt(vNum, 10) === passage.highlight
        ? `<span class="highlight" id="highlighted-verse"><sup>${vNum}</sup> ${text}</span>`
        : `<sup>${vNum}</sup> ${text}`;
    html += `${line} `;
  });

  html += '</p>';
  passageDisplay.innerHTML = html;
  passageDisplay.style.display = 'block';

  const highlighted = document.getElementById('highlighted-verse');
  if (highlighted) {
    highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    passageDisplay.scrollTop = 0;
  }
}

// ---------- Sidebar toggle ----------
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
}
