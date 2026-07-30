# SecureBank — Demo Online Banking Web App

A fictional, self-contained online banking demo built with **Node.js + Express + SQLite**.
This is for learning/demo purposes only — it is **not connected to any real bank or payment network**.

## Features

- Login page with session-based authentication
- Passwords hashed with bcrypt (never stored in plain text)
- Server-side + client-side password validation rules
- Dashboard showing account balance and recent transactions
- Working "Transfer Funds" form that debits the account and logs a transaction
- SQLite database (file-based, zero config)

## Demo Account

| Field | Value |
|---|---|
| Full Name | Mary Smith |
| Username | `mary.smith` |
| Password | `Banking@123` |
| Starting Balance | $500,000.00 |

> Change this password immediately if you deploy this anywhere beyond your own machine.

## Project Structure

```
online-banking-app/
├── backend/
│   ├── db/
│   │   ├── db.js          # SQLite connection + schema
│   │   └── seed.js        # creates the demo Mary Smith account
│   ├── routes/
│   │   ├── auth.js        # login / logout / session / change-password
│   │   ├── account.js     # balance + transaction history
│   │   └── transfer.js    # transfer funds endpoint
│   ├── utils/
│   │   └── passwordValidator.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── login.html
│   ├── dashboard.html
│   ├── css/style.css
│   └── js/
│       ├── login.js
│       └── dashboard.js
├── .gitignore
└── README.md
```

## Setup & Run Locally

```bash
cd backend
npm install
cp .env.example .env      # optional: customize session secret/port
npm run seed               # creates the SQLite DB + Mary Smith account
npm start                  # starts the server
```

Then open **http://localhost:3000** in your browser.

## Password Rules

New/changed passwords must have:
- At least 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

## Pushing to GitHub

```bash
cd online-banking-app
git init
git add .
git commit -m "Initial commit: SecureBank demo app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

The `.gitignore` already excludes `node_modules/`, the SQLite database file, and `.env`.

## Disclaimer

This project is a **learning/demo application only**. It simulates banking UI/UX and
basic transaction logic but is not PCI-compliant, not connected to any real financial
institution, and should not be used to handle real money or real personal financial data.
