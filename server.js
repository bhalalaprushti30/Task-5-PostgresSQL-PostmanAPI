const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const client = new Client({
  host: 'localhost',
  user: 'postgres',
  password: 'prushti',
  database: 'usersdb',
  port: 5432
});

client.connect(err => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
    return;
  }
  console.log('Connected to PostgreSQL.');
});

app.get('/users', (req, res) => {
  client.query('SELECT * FROM users', (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result.rows);
  });
});

app.post('/users', (req, res) => {
  const { name, email, age } = req.body;

  const query = 'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING id';
  client.query(query, [name, email, age], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'User created successfully',
      userId: result.rows[0].id
    });
  });
});

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  client.query('SELECT * FROM users WHERE id = $1', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
