import Database from 'better-sqlite3';
const db = new Database('./database/verses.db');

export default function handler(req, res) {
  const rows = db.prepare('SELECT DISTINCT book FROM verses ORDER BY book').all();
  res.status(200).json(rows);
}
