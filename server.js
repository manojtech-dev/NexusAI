const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'mysecretkey';
let db;

(async () => {
  db = await open({
    filename: './college.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT);
    CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, message TEXT, reply TEXT);
    CREATE TABLE IF NOT EXISTS college_info (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT, question TEXT, answer TEXT);
  `);

  await db.run(`
    INSERT OR IGNORE INTO college_info (id, category, question, answer) VALUES 
    (1, 'admission', 'admission date', 'College admissions for ECE and CSE start on June 1st and close by June 30th.'),
    (2, 'exam', 'exam dates', 'Internal exams start next month 15th, and semester exams begin in November.'),
    (3, 'hostel', 'hostel facility', 'Separate hostel facilities are available for boys and girls with mess and Wi-Fi.');
  `);
})();

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Username already exists" });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, SECRET_KEY);
  res.json({ token, username });
});

app.post('/api/chat', async (req, res) => {
  const { message, username } = req.body;
  try {
    const match = await db.get('SELECT answer FROM college_info WHERE question LIKE ?', [`%${message}%`]);
    const reply = match ? match.answer : "Sorry, I don't have information about that. Please contact the college office.";

    if (username) {
      await db.run('INSERT INTO history (username, message, reply) VALUES (?, ?, ?)', [username, message, reply]);
    }
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error connecting to server." });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
