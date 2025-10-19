import path from "path";
import Database from "better-sqlite3";

// Build an absolute path (so Vercel can find the DB)
const dbPath = path.join(process.cwd(), "database", "verses.db");
const db = new Database(dbPath);


export default function handler(req, res) {
  const rows = db.prepare('SELECT DISTINCT book FROM verses ORDER BY book').all();
  res.status(200).json(rows);
}
