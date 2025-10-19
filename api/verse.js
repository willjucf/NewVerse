import Database from 'better-sqlite3';
const db = new Database('./database/verses.db');

export default function handler(req, res) {
  const { book, chapter, verse, version } = req.query;
  let query = 'SELECT * FROM verses WHERE 1=1';
  const params = [];

  if (book) {
    const books = book.split(',').map(b => b.trim().toLowerCase());
    const placeholders = books.map(() => '?').join(',');
    query += ` AND book IN (${placeholders})`;
    params.push(...books);
  }
  if (chapter) { query += ' AND chapter = ?'; params.push(parseInt(chapter)); }
  if (verse) { query += ' AND verse = ?'; params.push(parseInt(verse)); }
  if (version) { query += ' AND version = ?'; params.push(version.toUpperCase()); }

  query += ' ORDER BY RANDOM() LIMIT 1';
  const result = db.prepare(query).get(...params);
  res.status(200).json(result || { error: 'Verse not found' });
}
