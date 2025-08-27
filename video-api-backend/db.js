// db.js
const Database = require('better-sqlite3');
const path = require('path');

// Create or open the database file
const db = new Database(path.join(__dirname, 'emotion_inputs.db'));

// Create the EmotionInputs table (unchanged)
db.exec(`
  CREATE TABLE IF NOT EXISTS EmotionInputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userID TEXT,
    valence INTEGER,
    arousal INTEGER,
    timestamp TEXT,
    submittype TEXT
  );
`);

// Create the updated UserData table (matching form inputs)
db.exec(`
  CREATE TABLE IF NOT EXISTS UserData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    gender TEXT,
    age INTEGER,
    watchesEnglishMovies TEXT,
    timestamp TEXT
  );
`);

module.exports = db;
