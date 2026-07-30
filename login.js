// login.js - handles login form submission
const loginForm = document.getElementById('loginForm');
const errorBox = document.getElementById('errorBox');

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function hideError() {
  errorBox.classList.add('hidden');
}

// Redirect to dashboard if already logged in
(async function checkSession() {
  try {
    const res = await fetch('/api/auth/session');
    if (res.ok) {
      window.location.href = 'dashboard.html';
    }
  } catch (e) {
    // ignore - stay on login page
  }
})();

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showError('Please enter both username and password.');
    return;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Login failed.');
      return;
    }

    window.location.href = 'dashboard.html';
  } catch (err) {
    showError('Could not reach the server. Please try again.');
  }
});
