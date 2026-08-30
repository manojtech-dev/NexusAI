const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: 'AIzaSyAJi_B5h769fX32hld3q0_YJ7wdoOYA9N0' });

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "mysecretkey";
let db;

(async () => {
  db = await open({
    filename: './college.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT);
    CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, message TEXT, reply TEXT);
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
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
    });
    
    const reply = response.text || "No response generated.";

    if (username) {
      await db.run('INSERT INTO history (username, message, reply) VALUES (?, ?, ?)', [username, message, reply]);
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error connecting to Gemini AI." });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));

