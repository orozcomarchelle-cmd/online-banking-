// seed.js - creates the demo account: Mary Smith, $500,000.00 balance
// Run with: npm run seed  (from the /backend folder)
const bcrypt = require('bcryptjs');
const db = require('./db');

const USERNAME = 'mary.smith';
const PASSWORD = 'Banking@123'; // demo password - meets validation rules below
const FULL_NAME = 'Mary Smith';
const ACCOUNT_NUMBER = '1000200030';
const STARTING_BALANCE = 500000.00;

function seed() {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(USERNAME);
  if (existing) {
    console.log(`User "${USERNAME}" already exists (id ${existing.id}). Skipping seed.`);
    return;
  }

  const passwordHash = bcrypt.hashSync(PASSWORD, 10);

  const insertUser = db.prepare(`
    INSERT INTO users (username, password_hash, full_name, account_number, balance)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = insertUser.run(USERNAME, passwordHash, FULL_NAME, ACCOUNT_NUMBER, STARTING_BALANCE);
  const userId = result.lastInsertRowid;

  const insertTx = db.prepare(`
    INSERT INTO transactions (user_id, type, amount, recipient, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // A few sample recent transactions for the dashboard
  const sampleTx = [
    ['credit', 500000.00, null, 'Initial deposit', "datetime('now', '-10 day')"],
    ['debit', 1250.00, 'City Power & Light', 'Utility bill payment', "datetime('now', '-6 day')"],
    ['debit', 3200.50, 'John Carter', 'Transfer to savings partner', "datetime('now', '-3 day')"],
    ['credit', 4500.00, 'Acme Corp Payroll', 'Salary deposit', "datetime('now', '-1 day')"],
  ];

  for (const [type, amount, recipient, description] of sampleTx) {
    db.prepare(`
      INSERT INTO transactions (user_id, type, amount, recipient, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, type, amount, recipient, description);
  }

  console.log('Seed complete:');
  console.log(`  Username: ${USERNAME}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  Account Holder: ${FULL_NAME}`);
  console.log(`  Account Number: ${ACCOUNT_NUMBER}`);
  console.log(`  Balance: $${STARTING_BALANCE.toLocaleString()}`);
}

seed();
