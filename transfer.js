// transfer.js - handles the "Transfer Funds" form submission
const express = require('express');
const db = require('../db/db');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  next();
}

// POST /api/transfer
// body: { recipient: string, amount: number, description?: string }
router.post('/', requireAuth, (req, res) => {
  const { recipient, amount, description } = req.body;
  const numericAmount = Number(amount);

  if (!recipient || typeof recipient !== 'string' || !recipient.trim()) {
    return res.status(400).json({ error: 'Recipient name/account is required.' });
  }
  if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Enter a valid transfer amount greater than $0.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);

  if (numericAmount > user.balance) {
    return res.status(400).json({ error: 'Insufficient funds for this transfer.' });
  }

  const doTransfer = db.transaction(() => {
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?')
      .run(numericAmount, user.id);

    db.prepare(`
      INSERT INTO transactions (user_id, type, amount, recipient, description)
      VALUES (?, 'debit', ?, ?, ?)
    `).run(user.id, numericAmount, recipient.trim(), description || 'Funds transfer');
  });

  doTransfer();

  const updatedUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(user.id);

  res.json({
    message: `Transfer of $${numericAmount.toFixed(2)} to ${recipient.trim()} was successful.`,
    newBalance: updatedUser.balance
  });
});

module.exports = router;
