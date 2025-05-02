const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg'); // PostgreSQL database

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
const pool = new Pool({
  user: 'your_user',
  host: 'localhost',
  database: 'gestao_diarias',
  password: 'your_password',
  port: 5432,
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).send('Access Denied');

  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
};

// Endpoint: Get Reports with Filters
app.get('/reports', authenticateToken, async (req, res) => {
  const { startDate, endDate, status } = req.query;

  let query = 'SELECT * FROM reports WHERE user_id = $1';
  const queryParams = [req.user.id];

  if (startDate) {
    query += ' AND date >= $2';
    queryParams.push(startDate);
  }

  if (endDate) {
    query += ' AND date <= $3';
    queryParams.push(endDate);
  }

  if (status) {
    query += ' AND status = $4';
    queryParams.push(status);
  }

  try {
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Endpoint: User Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows.length === 0) return res.status(400).send('Invalid Credentials');

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});