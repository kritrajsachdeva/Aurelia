/**
 * user.js — AURELIA Navbar Auth State + Account Dropdown
 * Shows user name in navbar when logged in, with dropdown for
 * Account Settings, Orders, Wallet, Refunds, Wishlist, Sign Out
 */

(() => {
  const SESSION_KEY = "aurelia_session_v1";
  const ORDERS_KEY  = "aurelia_orders_v1";
  const WALLET_KEY  = "aurelia_wallet_v1";

  const readSession = () => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
    catch { return null; }
  };

  const readOrders = () => {
    try {
      const d = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
      return Array.isArray(d) ? d : [];
    } catch { return []; }
  };

  const readWallet = () => {
    try { return parseFloat(localStorage.getItem(WALLET_KEY) || "0"); }
    catch { return 0; }
  };

  const money = (n) => `₹${n.toLocaleString("en-IN")}`;

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  /* ── Build & inject the user dropdown button into every navbar ── */
  const initNavbar = () => {
    const session = readSession();

    // Find the login button (works on all pages)
    const loginBtn = document.querySelector('[data-testid="nav-login-btn"]');
    if (!loginBtn) return;

    if (!session) {
      // Not logged in — make sure it shows "Login" normally
      loginBtn.style.display = "";
      return;
    }

    // Logged in — replace the Login link with a user dropdown
    const firstName = (session.name || session.email || "Account").split(" ")[0];
    const walletBal = readWallet();
    const orders    = readOrders();

    // Build dropdown HTML
    const wrapper = document.createElement("div");
    wrapper.className = "user-dropdown-wrap";
    wrapper.innerHTML = `
      <button class="nav-action-btn user-dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false">
        <i class="fas fa-user-circle"></i>
        <span class="hide-mobile">${firstName}</span>
        <i class="fas fa-chevron-down user-caret hide-mobile"></i>
      </button>
      <div class="user-dropdown" role="menu">
        <div class="user-dropdown-header">
          <div class="user-dd-name">${session.name || "Account"}</div>
          <div class="user-dd-email">${session.email || ""}</div>
        </div>
        <div class="user-dropdown-wallet">
          <i class="fas fa-wallet"></i>
          <span>Aurelia Wallet</span>
          <strong>${money(walletBal)}</strong>
        </div>
        <div class="user-dropdown-menu">
          <a href="orders.html" class="user-dd-item" role="menuitem">
            <i class="fas fa-box"></i> My Orders
            ${orders.length ? `<span class="dd-badge">${orders.length}</span>` : ""}
          </a>
          <a href="wishlist.html" class="user-dd-item" role="menuitem">
            <i class="far fa-heart"></i> Wishlist
          </a>
          <a href="account.html" class="user-dd-item" role="menuitem">
            <i class="fas fa-cog"></i> Account Settings
          </a>
          <a href="account.html#refunds" class="user-dd-item" role="menuitem">
            <i class="fas fa-undo-alt"></i> Refunds & Returns
          </a>
          <a href="account.html#addresses" class="user-dd-item" role="menuitem">
            <i class="fas fa-map-marker-alt"></i> Saved Addresses
          </a>
        </div>
        <div class="user-dropdown-footer">
          <button type="button" class="user-dd-signout" id="navSignOutBtn">
            <i class="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </div>
      </div>
    `;

    // Replace login button with dropdown
    loginBtn.replaceWith(wrapper);

    // Toggle dropdown
    const trigger  = wrapper.querySelector(".user-dropdown-trigger");
    const dropdown = wrapper.querySelector(".user-dropdown");

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", isOpen);
    });

    document.addEventListener("click", () => {
      dropdown.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    });

    dropdown.addEventListener("click", (e) => e.stopPropagation());

    // Sign out
    wrapper.querySelector("#navSignOutBtn").addEventListener("click", () => {
      clearSession();
      window.location.href = "index.html";
    });
  };

  /* ── Inject CSS for dropdown (only once) ── */
  const injectStyles = () => {
    if (document.getElementById("aurelia-user-styles")) return;
    const style = document.createElement("style");
    style.id = "aurelia-user-styles";
    style.textContent = `
      /* ── User Dropdown Wrapper ── */
      .user-dropdown-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .user-dropdown-trigger {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        font-weight: 400;
        color: var(--text-muted);
        cursor: pointer;
        transition: color 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0;
        background: none;
        border: none;
        font-family: inherit;
      }
      .user-dropdown-trigger:hover { color: var(--text); }
      .user-dropdown-trigger i { font-size: 1rem; }
      .user-caret {
        font-size: 0.6rem !important;
        transition: transform 0.2s ease;
      }
      .user-dropdown.is-open ~ .user-dropdown-trigger .user-caret,
      .user-dropdown-wrap:has(.is-open) .user-caret {
        transform: rotate(180deg);
      }

      /* ── Dropdown Panel ── */
      .user-dropdown {
        display: none;
        position: absolute;
        top: calc(100% + 14px);
        right: 0;
        width: 260px;
        background: #fff;
        border: 1px solid var(--border);
        box-shadow: 0 16px 48px rgba(0,0,0,0.12);
        z-index: 500;
        animation: ddFadeIn 0.18s ease;
      }
      .user-dropdown.is-open { display: block; }
      @keyframes ddFadeIn {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* Header */
      .user-dropdown-header {
        padding: 1rem 1.1rem 0.75rem;
        border-bottom: 1px solid var(--border);
      }
      .user-dd-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text);
        margin-bottom: 0.15rem;
      }
      .user-dd-email {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      /* Wallet */
      .user-dropdown-wallet {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.7rem 1.1rem;
        background: #fdf9ef;
        border-bottom: 1px solid var(--border);
        font-size: 0.8rem;
      }
      .user-dropdown-wallet i {
        color: var(--gold);
        font-size: 0.9rem;
      }
      .user-dropdown-wallet span {
        flex: 1;
        color: var(--text-muted);
      }
      .user-dropdown-wallet strong {
        color: var(--text);
        font-weight: 600;
      }

      /* Menu Items */
      .user-dropdown-menu {
        padding: 0.4rem 0;
      }
      .user-dd-item {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.65rem 1.1rem;
        font-size: 0.82rem;
        color: var(--text);
        transition: background 0.15s ease, color 0.15s ease;
        text-decoration: none;
        letter-spacing: 0.01em;
      }
      .user-dd-item:hover {
        background: var(--bg-alt);
        color: var(--gold);
      }
      .user-dd-item i {
        width: 14px;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.8rem;
        flex-shrink: 0;
      }
      .user-dd-item:hover i { color: var(--gold); }
      .dd-badge {
        margin-left: auto;
        background: var(--gold);
        color: #fff;
        font-size: 0.6rem;
        font-weight: 700;
        padding: 0.15rem 0.45rem;
        border-radius: 99px;
        letter-spacing: 0.02em;
      }

      /* Footer / Sign Out */
      .user-dropdown-footer {
        border-top: 1px solid var(--border);
        padding: 0.5rem 0;
      }
      .user-dd-signout {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        width: 100%;
        padding: 0.65rem 1.1rem;
        font-size: 0.82rem;
        color: #c0392b;
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s ease;
        text-align: left;
      }
      .user-dd-signout:hover { background: #fef2f2; }
      .user-dd-signout i { font-size: 0.8rem; }

      /* Login page tab fix - make sure inactive tab text is always visible */
      .auth-tab:not(.active) {
        color: var(--text-muted) !important;
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
  };

  /* ── Boot ── */
  const boot = () => {
    injectStyles();
    initNavbar();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
