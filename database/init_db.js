const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, './database/verses.db');
const bibleDir = path.join(__dirname, './database/world-english-bible');

if (!fs.existsSync('./database')) {
  fs.mkdirSync('./database');
}

const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL,
    version TEXT NOT NULL
  );
`).run();

db.prepare('DELETE FROM verses WHERE version = ?').run('WEB');

const insert = db.prepare(`
  INSERT INTO verses (book, chapter, verse, text, version)
  VALUES (@book, @chapter, @verse, @text, @version)
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) {
    insert.run(row);
  }
});

const files = fs.readdirSync(bibleDir).filter(f => f.endsWith('.json'));
let allVerses = [];

for (const file of files) {
  const filePath = path.join(bibleDir, file);
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!Array.isArray(jsonData)) {
    console.log(`Skipping invalid file: ${file}`);
    continue;
  }

  const bookName = path.basename(file, '.json');
  jsonData.forEach(entry => {
    if (
      entry.type &&
      (entry.type === 'paragraph text' || entry.type === 'line text') &&
      entry.chapterNumber &&
      entry.verseNumber &&
      entry.value
    ) {
      allVerses.push({
        book: bookName,
        chapter: entry.chapterNumber,
        verse: entry.verseNumber,
        text: entry.value.trim(),
        version: 'WEB'
      });
    }
  });
}

insertMany(allVerses);
console.log(`✅ Imported ${allVerses.length} WEB verses from ${files.length} files.`);
