/**
 * index.js — Express server entry point
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const encryptRoute = require('./routes/encrypt');
const decryptRoute = require('./routes/decrypt');
const usersRoute  = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve the frontend from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/encrypt', encryptRoute);
app.use('/api/decrypt', decryptRoute);
app.use('/api/users',   usersRoute);

// Fallback: serve index.html for any unknown route (Express v5 wildcard syntax)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
