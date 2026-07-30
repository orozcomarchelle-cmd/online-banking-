// auth.js - login / logout / session / password change routes
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/db');
const { validatePassword } = require('../utils/passwordValidator');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const passwordMatches = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  req.session.userId = user.id;
  res.json({
    message: 'Login successful.',
    user: {
      fullName: user.full_name,
      username: user.username,
      accountNumber: user.account_number
    }
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out.' });
  });
});

// GET /api/auth/session - check if logged in
router.get('/session', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ loggedIn: false });
  }
  const user = db.prepare('SELECT full_name, username, account_number FROM users WHERE id = ?')
    .get(req.session.userId);
  res.json({ loggedIn: true, user: {
    fullName: user.full_name,
    username: user.username,
    accountNumber: user.account_number
  }});
});

// POST /api/auth/change-password - example of using the password validator
router.post('/change-password', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  const { currentPassword, newPassword } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);

  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const { valid, errors } = validatePassword(newPassword);
  if (!valid) {
    return res.status(400).json({ error: 'Password does not meet requirements.', details: errors });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id);

  res.json({ message: 'Password updated successfully.' });
});

module.exports = router;
