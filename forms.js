(() => {
  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  };

  const selectFirst = (selectors) => {
    for (const selector of selectors) {
      const match = document.querySelector(selector);
      if (match) return match;
    }
    return null;
  };

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const showMessage = (message) => {
    window.alert(message);
  };

  const wireSignInForm = () => {
    const signInForm = selectFirst([
      '[data-testid="login-form"]',
      ".login-modal form",
      'form[action="#"][method="POST"]',
    ]);

    if (!signInForm) return;

    const emailInput = selectFirst([
      '[data-testid="login-email"]',
      '#email',
      '.login-modal input[type="email"]',
    ]);
    const passwordInput = selectFirst([
      '[data-testid="login-password"]',
      '#password',
      '.login-modal input[type="password"]',
    ]);
    const loginToggle = document.querySelector("#login-toggle");

    signInForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = (emailInput?.value || "").trim();
      const password = (passwordInput?.value || "").trim();

      if (!email || !password) {
        showMessage("Please enter both email and password.");
        return;
      }

      if (!isValidEmail(email)) {
        showMessage("Please enter a valid email address.");
        return;
      }

      showMessage(`Welcome back, ${email}!`);

      signInForm.reset();
      if (loginToggle) loginToggle.checked = false;
    });
  };

  const wireNewsletterForm = () => {
    const newsletterForm = selectFirst([
      '[data-testid="newsletter-form"]',
      ".newsletter-form",
      ".newsletter form",
    ]);

    if (!newsletterForm) return;

    const emailInput = selectFirst([
      '[data-testid="newsletter-email-input"]',
      ".newsletter-form input[type='email']",
      ".newsletter input[type='email']",
    ]);

    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = (emailInput?.value || "").trim();

      if (!email) {
        showMessage("Please enter your email address.");
        return;
      }

      if (!isValidEmail(email)) {
        showMessage("Please enter a valid email address.");
        return;
      }

      showMessage(`Thanks for subscribing, ${email}!`);
      newsletterForm.reset();
    });
  };

  onReady(() => {
    wireSignInForm();
    wireNewsletterForm();
  });
})();
