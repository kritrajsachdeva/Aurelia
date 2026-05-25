/**
 * filter.js — Aurelia category filter + product page enhancements
 */
(() => {
  const onReady = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };

  // ── CATEGORY FILTER ────────────────────────────────────────────
  const initFilter = () => {
    const filterBtns = document.querySelectorAll(".filter-btn[data-filter]");
    if (!filterBtns.length) return;

    // Map filter names to categories that should match
    const filterMap = {
      "dresses": ["dresses", "eveningwear", "modest collection"],
      "tops": ["tops", "knitwear"],
      "outerwear": ["outerwear"],
      "trousers": ["trousers"],
      "blazers": ["blazers"],
      "shirts": ["shirts"],
      "accessories": ["accessories"],
      "all": [],
    };

    filterBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const filter = btn.dataset.filter.toLowerCase();

        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const cards = document.querySelectorAll(".product-card");
        cards.forEach(card => {
          const cat = (card.querySelector(".product-category")?.textContent?.trim() || "").toLowerCase();
          let show = filter === "all";
          if (!show) {
            const targets = filterMap[filter] || [filter];
            show = targets.some(t => cat.includes(t));
          }
          card.style.display = show ? "" : "none";
        });
      });
    });
  };

  // ── PRODUCT IMAGE GALLERY ───────────────────────────────────────
  const initGallery = () => {
    const mainImg = document.querySelector(".product-main-img img");
    const thumbs = document.querySelectorAll(".product-thumb");
    if (!mainImg || !thumbs.length) return;

    thumbs.forEach(thumb => {
      thumb.style.cursor = "pointer";
      thumb.addEventListener("click", () => {
        const src = thumb.querySelector("img")?.src;
        if (src) mainImg.src = src;
        thumbs.forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
      });
    });
  };

  // ── ACCORDION (product features) ───────────────────────────────
  const initAccordion = () => {
    const rows = document.querySelectorAll(".feature-row");
    rows.forEach(row => {
      row.style.cursor = "pointer";
      row.addEventListener("click", () => {
        const icon = row.querySelector("i");
        if (!icon) return;
        const isOpen = icon.classList.contains("fa-chevron-up");
        icon.className = isOpen ? "fas fa-chevron-down" : "fas fa-chevron-up";
      });
    });
  };

  onReady(() => {
    initFilter();
    initGallery();
    initAccordion();
  });
})();

// ── WISHLIST TOGGLE (heart button) ─────────────────────────────
document.addEventListener("click", (e) => {
  const wishBtn = e.target.closest(".product-wishlist");
  if (!wishBtn) return;
  e.preventDefault();
  const icon = wishBtn.querySelector("i");
  if (!icon) return;
  const isWished = icon.classList.contains("fas");
  icon.className = isWished ? "far fa-heart" : "fas fa-heart";
  icon.style.color = isWished ? "" : "var(--gold, #b89a6a)";
});
