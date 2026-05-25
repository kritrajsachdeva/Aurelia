(() => {
  const CART_KEY = "aurelia_cart_v1";
  const CART_INIT_KEY = "aurelia_cart_initialized_v1";

  const byText = (value) => (value || "").replace(/\s+/g, " ").trim();

  const parsePrice = (value) => {
    const numeric = Number.parseFloat((value || "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const money = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const slugify = (value) =>
    byText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const readCart = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  };

  const ensureCartInitialized = () => {
    // Start with an empty cart by default on first run.
    if (!localStorage.getItem(CART_INIT_KEY)) {
      writeCart([]);
      localStorage.setItem(CART_INIT_KEY, "true");
      return;
    }

    if (!localStorage.getItem(CART_KEY)) {
      writeCart([]);
    }
  };

  const getCartCount = (cart) =>
    cart.reduce((sum, item) => sum + (item.qty || 0), 0);

  const updateCartBadges = () => {
    const cart = readCart();
    const count = getCartCount(cart);

    document.querySelectorAll(".cart-count-badge").forEach((badge) => {
      badge.textContent = String(count);
      badge.classList.toggle("is-empty", count === 0);
    });
  };

  const showToast = (message) => {
    const existing = document.querySelector(".cart-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.innerHTML = `
      <span class="cart-toast-dot"></span>
      <span class="cart-toast-text">${message}</span>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 250);
    }, 2200);
  };

  const getProductFromCard = (card) => {
    if (!card) return null;
    const name = byText(
      card.querySelector(".product-name")?.textContent ||
        card.querySelector("h3")?.textContent
    );
    const priceText = byText(
      card.querySelector(".product-price")?.textContent || ""
    );
    const image = card.querySelector(".product-img")?.getAttribute("src") || "";
    const price = parsePrice(priceText);

    if (!name || !price || !image) return null;

    return {
      id: `${slugify(name)}-${price}`,
      name,
      price,
      image,
      qty: 1,
    };
  };

  const getProductFromDetail = () => {
    const section =
      document.querySelector('[data-testid="product-detail"]') ||
      document.querySelector(".product-detail");
    if (!section) return null;

    const name = byText(
      section.querySelector('[data-testid="product-name"]')?.textContent ||
        section.querySelector(".product-detail-name")?.textContent
    );
    const priceText = byText(
      section.querySelector('[data-testid="product-price"]')?.textContent ||
        section.querySelector(".product-detail-price")?.textContent
    );
    const image =
      section.querySelector(".product-main-img img")?.getAttribute("src") || "";
    const price = parsePrice(priceText);

    if (!name || !price || !image) return null;

    return {
      id: `${slugify(name)}-${price}`,
      name,
      price,
      image,
      qty: 1,
    };
  };

  const addToCart = (item) => {
    const cart = readCart();
    const existing = cart.find((cartItem) => cartItem.id === item.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push(item);
    }

    writeCart(cart);
    updateCartBadges();
    showToast(`${item.name} added to your bag`);
  };

  const getAddTrigger = (target) => {
    const trigger = target.closest("a, button");
    if (!trigger) return null;

    const testId = trigger.getAttribute("data-testid") || "";
    const text = byText(trigger.textContent).toLowerCase();
    const isMatch =
      /add-to-cart-btn|quick-add|w-add-cart|m-add-cart|related-add|upsell-add/i.test(
        testId
      ) ||
      text === "add to cart" ||
      text === "quick add";

    return isMatch ? trigger : null;
  };

  const bindAddToCart = () => {
    document.addEventListener("click", (event) => {
      const trigger = getAddTrigger(event.target);
      if (!trigger) return;

      const fromCard = getProductFromCard(trigger.closest(".product-card"));
      const product = fromCard || getProductFromDetail();
      if (!product) return;

      event.preventDefault();
      addToCart(product);
    });
  };

  const renderCartItems = () => {
    const cartItemsRoot =
      document.querySelector('[data-testid="cart-items"]') ||
      document.querySelector(".cart-layout > div:first-child");
    const summary =
      document.querySelector('[data-testid="order-summary"]') ||
      document.querySelector(".order-summary");
    if (!cartItemsRoot || !summary) return;

    const cart = readCart();
    const itemCount = getCartCount(cart);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const headerHtml = `
      <div class="cart-header">
        <h2 data-testid="cart-title">Your Bag</h2>
        <span class="cart-count" data-testid="cart-item-count">${itemCount} ${
      itemCount === 1 ? "Item" : "Items"
    }</span>
      </div>
    `;

    if (cart.length === 0) {
      cartItemsRoot.innerHTML = `
        ${headerHtml}
        <div class="cart-empty-state">
          <h2>Your cart is empty</h2>
          <p>Add pieces you love and they will appear here.</p>
          <a href="women.html" class="btn btn-dark">Start Shopping</a>
        </div>
      `;
    } else {
      const itemsHtml = cart
        .map(
          (item) => `
        <div class="cart-item">
          <div class="cart-item-img">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-right">
            <div class="cart-item-header">
              <div>
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-details">Qty: ${item.qty}</p>
              </div>
              <span class="cart-item-price">${money(item.price * item.qty)}</span>
            </div>
            <button type="button" class="cart-item-remove" data-remove-id="${item.id}">Remove</button>
          </div>
        </div>
      `
        )
        .join("");

      cartItemsRoot.innerHTML = `
        ${headerHtml}
        ${itemsHtml}
        <div style="padding:2rem 0;display:flex;align-items:center;gap:0.5rem">
          <a href="women.html" class="btn btn-outline" data-testid="continue-shopping-btn">
            <i class="fas fa-arrow-left" style="margin-right:0.5rem;font-size:0.75rem"></i> Continue Shopping
          </a>
        </div>
      `;
    }

    const subtotalEl =
      document.querySelector('[data-testid="subtotal"]') ||
      summary.querySelector(".summary-row strong");
    if (subtotalEl) subtotalEl.textContent = money(subtotal);

    const totalEl =
      document.querySelector('[data-testid="order-total"] span:last-child') ||
      summary.querySelector(".summary-total span:last-child");
    if (totalEl) totalEl.textContent = money(subtotal);

    const subtotalLabel = summary.querySelector(".summary-row span");
    if (subtotalLabel) {
      subtotalLabel.textContent = `Subtotal (${itemCount} ${
        itemCount === 1 ? "item" : "items"
      })`;
    }
  };

  const bindRemoveFromCart = () => {
    const cartItemsRoot =
      document.querySelector('[data-testid="cart-items"]') ||
      document.querySelector(".cart-layout > div:first-child");
    if (!cartItemsRoot) return;

    cartItemsRoot.addEventListener("click", (event) => {
      const removeBtn = event.target.closest("[data-remove-id]");
      if (!removeBtn) return;

      const removeId = removeBtn.getAttribute("data-remove-id");
      const nextCart = readCart().filter((item) => item.id !== removeId);
      writeCart(nextCart);
      updateCartBadges();
      renderCartItems();
    });
  };

  const boot = () => {
    ensureCartInitialized();
    updateCartBadges();
    bindAddToCart();
    renderCartItems();
    bindRemoveFromCart();

    window.addEventListener("storage", (event) => {
      if (event.key !== CART_KEY) return;
      updateCartBadges();
      renderCartItems();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
