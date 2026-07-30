// account.js - balance + transaction history routes
const express = require('express');
const db = require('../db/db');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  next();
}

// GET /api/account/balance
router.get('/balance', requireAuth, (req, res) => {
  const user = db.prepare('SELECT balance, account_number, full_name FROM users WHERE id = ?')
    .get(req.session.userId);
  res.json({
    balance: user.balance,
    accountNumber: user.account_number,
    fullName: user.full_name
  });
});

// GET /api/account/transactions
router.get('/transactions', requireAuth, (req, res) => {
  const transactions = db.prepare(`
    SELECT id, type, amount, recipient, description, created_at
    FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT 25
  `).all(req.session.userId);

  res.json({ transactions });
});

module.exports = router;
