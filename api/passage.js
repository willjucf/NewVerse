import path from "path";
import Database from "better-sqlite3";

// Build an absolute path (so Vercel can find the DB)
const dbPath = path.join(process.cwd(), "database", "verses.db");
const db = new Database(dbPath);


export default function handler(req, res) {
  const { book, chapter, verse } = req.query;
  if (!book || !chapter)
    return res.status(400).json({ error: 'Book and chapter required' });

  const rows = db.prepare(
    'SELECT * FROM verses WHERE book = ? AND chapter = ? ORDER BY verse ASC'
  ).all(book.toLowerCase(), parseInt(chapter));

  if (!rows.length)
    return res.status(404).json({ error: 'Passage not found' });

  res.status(200).json({
    book: rows[0].book,
    chapter: rows[0].chapter,
    highlight: verse ? parseInt(verse) : null,
    verses: rows
  });
}
