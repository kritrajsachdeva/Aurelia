/**
 * auth.js — AURELIA Local Authentication (localStorage-based)
 * No Firebase, no Google. Simple email + password + name sign up/in.
 */

const USERS_KEY = "aurelia_users_v1";
const SESSION_KEY = "aurelia_session_v1";

const readUsers = () => {
  try {
    const data = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch { return []; }
};

const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const readSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
};

const writeSession = (user) => localStorage.setItem(SESSION_KEY, JSON.stringify(user));
const clearSession = () => localStorage.removeItem(SESSION_KEY);

const statusEl = document.querySelector("[data-auth-status]");
const signInForm = document.querySelector("[data-signin-form]");
const signUpForm = document.querySelector("[data-signup-form]");
const signOutBtn = document.querySelector("[data-signout]");
const signedInBlock = document.querySelector("[data-signed-in]");
const userEmailEl = document.querySelector("[data-user-email]");
const userNameEl = document.querySelector("[data-user-name]");
const tabs = document.querySelectorAll("[data-auth-tab]");
const panels = document.querySelectorAll("[data-auth-panel]");

const setStatus = (message, isError = false) => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = "auth-status" + (message ? (isError ? " is-error" : " is-success") : "");
};

const setTab = (name) => {
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.authTab === name));
  panels.forEach(panel => { panel.hidden = panel.dataset.authPanel !== name; });
  setStatus("");
};

tabs.forEach(tab => tab.addEventListener("click", () => setTab(tab.dataset.authTab)));

const applySession = (user) => {
  const isLoggedIn = Boolean(user);
  if (signedInBlock) {
    signedInBlock.hidden = !isLoggedIn;
    panels.forEach(p => { if (isLoggedIn) p.hidden = true; });
    if (!isLoggedIn) setTab(window.location.hash === "#signup" ? "signup" : "signin");
  }
  if (userEmailEl) userEmailEl.textContent = user?.email || "";
  if (userNameEl) userNameEl.textContent = user?.name || "";
};

const session = readSession();
applySession(session);

signUpForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = signUpForm.querySelector('[name="name"]').value.trim();
  const email = signUpForm.querySelector('[name="email"]').value.trim().toLowerCase();
  const password = signUpForm.querySelector('[name="password"]').value;
  const confirm = signUpForm.querySelector('[name="confirmPassword"]').value;

  if (!name || !email || !password || !confirm) { setStatus("Please fill in all fields.", true); return; }
  if (!/\S+@\S+\.\S+/.test(email)) { setStatus("Please enter a valid email address.", true); return; }
  if (password.length < 6) { setStatus("Password must be at least 6 characters.", true); return; }
  if (password !== confirm) { setStatus("Passwords do not match.", true); return; }

  const users = readUsers();
  if (users.find(u => u.email === email)) { setStatus("An account with this email already exists.", true); return; }

  const newUser = { name, email, password, createdAt: Date.now() };
  users.push(newUser);
  writeUsers(users);
  writeSession({ name, email });
  setStatus("Account created! Welcome to AURELIA.");
  setTimeout(() => { window.location.href = "index.html"; }, 900);
});

signInForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signInForm.querySelector('[name="email"]').value.trim().toLowerCase();
  const password = signInForm.querySelector('[name="password"]').value;

  if (!email || !password) { setStatus("Please fill in all fields.", true); return; }

  const users = readUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) { setStatus("Incorrect email or password.", true); return; }

  writeSession({ name: user.name, email: user.email });
  setStatus("Welcome back, " + user.name + "!");
  setTimeout(() => { window.location.href = "index.html"; }, 800);
});

signOutBtn?.addEventListener("click", () => {
  clearSession();
  window.location.reload();
});

if (window.location.hash === "#signup") setTab("signup");
