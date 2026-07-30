// dashboard.js - loads account data and handles the transfer form

const welcomeName = document.getElementById('welcomeName');
const balanceAmount = document.getElementById('balanceAmount');
const accountNumberEl = document.getElementById('accountNumber');
const txTableBody = document.getElementById('txTableBody');
const transferForm = document.getElementById('transferForm');
const transferMsg = document.getElementById('transferMsg');
const logoutBtn = document.getElementById('logoutBtn');

function formatCurrency(amount) {
  return '$' + Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'Z'); // stored as UTC via SQLite datetime('now')
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

async function requireSession() {
  const res = await fetch('/api/auth/session');
  if (!res.ok) {
    window.location.href = 'login.html';
    return null;
  }
  const data = await res.json();
  return data.user;
}

async function loadBalance() {
  const res = await fetch('/api/account/balance');
  const data = await res.json();
  balanceAmount.textContent = formatCurrency(data.balance);
  accountNumberEl.textContent = data.accountNumber;
}

async function loadTransactions() {
  const res = await fetch('/api/account/transactions');
  const data = await res.json();

  if (!data.transactions.length) {
    txTableBody.innerHTML = '<tr><td colspan="4">No transactions yet.</td></tr>';
    return;
  }

  txTableBody.innerHTML = data.transactions.map(tx => {
    const isDebit = tx.type === 'debit';
    const sign = isDebit ? '-' : '+';
    const cls = isDebit ? 'tx-amount-debit' : 'tx-amount-credit';
    const desc = tx.recipient ? `${tx.description} (${tx.recipient})` : tx.description;
    return `
      <tr>
        <td>${formatDate(tx.created_at)}</td>
        <td>${desc}</td>
        <td>${isDebit ? 'Debit' : 'Credit'}</td>
        <td class="${cls}">${sign}${formatCurrency(tx.amount)}</td>
      </tr>
    `;
  }).join('');
}

function showTransferMsg(message, isError) {
  transferMsg.textContent = message;
  transferMsg.classList.remove('hidden');
  transferMsg.style.color = isError ? '#b3261e' : '#14563a';
  transferMsg.style.borderColor = isError ? '#b3261e' : '#14563a';
  transferMsg.style.background = isError ? '#fdecea' : '#e9f7ef';
}

transferForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  transferMsg.classList.add('hidden');

  const recipient = document.getElementById('recipient').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value.trim();

  if (!recipient) {
    showTransferMsg('Please enter a recipient.', true);
    return;
  }
  if (!amount || amount <= 0) {
    showTransferMsg('Please enter a valid amount greater than $0.', true);
    return;
  }

  try {
    const res = await fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, amount, description })
    });
    const data = await res.json();

    if (!res.ok) {
      showTransferMsg(data.error || 'Transfer failed.', true);
      return;
    }

    showTransferMsg(data.message, false);
    transferForm.reset();
    balanceAmount.textContent = formatCurrency(data.newBalance);
    loadTransactions();
  } catch (err) {
    showTransferMsg('Could not reach the server. Please try again.', true);
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = 'login.html';
});

(async function init() {
  const user = await requireSession();
  if (!user) return;
  welcomeName.textContent = `Welcome, ${user.fullName}`;
  await loadBalance();
  await loadTransactions();
})();
