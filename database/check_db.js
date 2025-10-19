const Database = require('better-sqlite3');
const db = new Database('./database/verses.db');

// List tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables:", tables.map(t => t.name));

// Count verses
const count = db.prepare("SELECT COUNT(*) as total FROM verses").get();
console.log(`Total verses: ${count.total}`);

// List distinct books
const books = db.prepare("SELECT DISTINCT book FROM verses ORDER BY book").all();
console.log(`Books (${books.length}):`, books.map(b => b.book).join(', '));
