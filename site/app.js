import { ARTWORKS, CATEGORIES, SITE_CONFIG } from "./data.js";

const els = {
  year: document.getElementById("year"),
  filters: document.getElementById("filters"),
  grid: document.getElementById("gallery-grid"),
  featuredStrip: document.getElementById("featured-strip"),
  categoryCount: document.getElementById("category-count"),
  artworkCount: document.getElementById("artwork-count"),
  instagramLink: document.getElementById("instagram-link"),
  whatsappLink: document.getElementById("whatsapp-link"),
  whatsappNumber: document.getElementById("whatsapp-number"),
  backToTop: document.getElementById("back-to-top"),
  lightbox: document.getElementById("lightbox"),
  lightboxImg: document.getElementById("lightbox-img"),
  lightboxTitle: document.getElementById("lightbox-title"),
  lightboxCategory: document.getElementById("lightbox-category"),
  lightboxDesc: document.getElementById("lightbox-desc"),
  lightboxPrev: document.getElementById("lightbox-prev"),
  lightboxNext: document.getElementById("lightbox-next"),
  lightboxClose: document.getElementById("lightbox-close"),
};

const state = {
  category: "All",
  filtered: [],
  activeId: null,
};

function getCategoryFromUrl() {
  const url = new URL(window.location.href);
  const raw = url.searchParams.get("category");
  if (!raw) return null;
  const decoded = decodeURIComponent(raw);
  return CATEGORIES.includes(decoded) ? decoded : null;
}

function setCategoryInUrl(category) {
  const url = new URL(window.location.href);
  if (category === "All") {
    url.searchParams.delete("category");
  } else {
    url.searchParams.set("category", category);
  }
  window.history.replaceState({}, "", url.toString());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createArtworkImg({ src, alt }) {
  const img = document.createElement("img");
  img.loading = "lazy";
  img.decoding = "async";
  img.src = src;
  img.alt = alt;
  return img;
}

function renderCounts() {
  const categories = new Set(ARTWORKS.map((a) => a.category));
  els.categoryCount.textContent = String(categories.size);
  els.artworkCount.textContent = String(ARTWORKS.length);
}

function renderFilters() {
  els.filters.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-chip";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(cat === state.category));
    btn.textContent = cat;
    btn.addEventListener("click", () => setCategory(cat));
    els.filters.appendChild(btn);
  });
}

function renderGrid() {
  els.grid.innerHTML = "";
  state.filtered.forEach((artwork) => {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open artwork: ${artwork.title}`);

    const media = document.createElement("div");
    media.className = "card__media";

    const img = createArtworkImg(artwork);
    img.addEventListener("error", () => {
      img.remove();
    });
    media.appendChild(img);

    const body = document.createElement("div");
    body.className = "card__body";

    const title = document.createElement("h3");
    title.className = "card__title";
    title.textContent = artwork.title;

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = artwork.category;

    body.appendChild(title);
    body.appendChild(badge);

    card.appendChild(media);
    card.appendChild(body);

    const open = () => openLightbox(artwork.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });

    els.grid.appendChild(card);
  });
}

function renderFeaturedStrip() {
  const featured = ARTWORKS.filter((a) => a.featured).slice(0, 4);
  els.featuredStrip.innerHTML = "";

  featured.forEach((artwork) => {
    const card = document.createElement("div");
    card.className = "featured-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open featured artwork: ${artwork.title}`);

    const thumb = document.createElement("div");
    thumb.className = "featured-card__thumb";
    const img = createArtworkImg(artwork);
    img.addEventListener("error", () => {
      img.remove();
    });
    thumb.appendChild(img);

    const text = document.createElement("div");
    const t = document.createElement("p");
    t.className = "featured-card__title";
    t.textContent = artwork.title;
    const s = document.createElement("p");
    s.className = "featured-card__sub";
    s.textContent = artwork.category;
    text.appendChild(t);
    text.appendChild(s);

    card.appendChild(thumb);
    card.appendChild(text);

    const open = () => {
      setCategory("All");
      openLightbox(artwork.id);
      document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });

    els.featuredStrip.appendChild(card);
  });
}

function setCategory(category) {
  state.category = category;
  state.filtered =
    category === "All" ? [...ARTWORKS] : ARTWORKS.filter((a) => a.category === category);
  setCategoryInUrl(category);
  renderFilters();
  renderGrid();
  closeLightbox();
}

function getActiveIndex() {
  if (!state.activeId) return -1;
  return state.filtered.findIndex((a) => a.id === state.activeId);
}

function openLightbox(artworkId) {
  const idx = state.filtered.findIndex((a) => a.id === artworkId);
  if (idx < 0) return;
  state.activeId = artworkId;
  const artwork = state.filtered[idx];

  els.lightboxTitle.textContent = artwork.title;
  els.lightboxCategory.textContent = artwork.category;
  els.lightboxDesc.textContent = artwork.description || "";

  els.lightboxImg.alt = artwork.alt || artwork.title;
  els.lightboxImg.src = artwork.src;

  const onlyOne = state.filtered.length <= 1;
  els.lightboxPrev.disabled = onlyOne;
  els.lightboxNext.disabled = onlyOne;

  if (typeof els.lightbox.showModal === "function") {
    if (!els.lightbox.open) els.lightbox.showModal();
  } else {
    els.lightbox.setAttribute("open", "true");
  }

  requestAnimationFrame(() => els.lightboxClose.focus());
}

function closeLightbox() {
  state.activeId = null;
  if (els.lightbox.open && typeof els.lightbox.close === "function") {
    els.lightbox.close();
  } else {
    els.lightbox.removeAttribute("open");
  }
}

function gotoOffset(delta) {
  const idx = getActiveIndex();
  if (idx < 0) return;
  const next = (idx + delta + state.filtered.length) % state.filtered.length;
  openLightbox(state.filtered[next].id);
}

function getFocusable(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
}

function setupLightboxA11y() {
  els.lightbox.addEventListener("click", (e) => {
    if (e.target === els.lightbox) closeLightbox();
  });

  els.lightboxClose.addEventListener("click", closeLightbox);
  els.lightboxPrev.addEventListener("click", () => gotoOffset(-1));
  els.lightboxNext.addEventListener("click", () => gotoOffset(1));

  document.addEventListener("keydown", (e) => {
    if (!els.lightbox.open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      gotoOffset(-1);
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      gotoOffset(1);
      return;
    }

    if (e.key === "Tab") {
      const focusables = getFocusable(els.lightbox);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
        return;
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  els.lightbox.addEventListener("close", () => {
    state.activeId = null;
  });
}

function setupInstagram() {
  els.instagramLink.href = SITE_CONFIG.instagramUrl;
  els.instagramLink.setAttribute("aria-label", `Open Instagram: ${SITE_CONFIG.instagramUrl}`);
}

function setupWhatsApp() {
  if (!els.whatsappLink || !els.whatsappNumber) return;
  els.whatsappLink.href = SITE_CONFIG.whatsappUrl;
  els.whatsappNumber.textContent = SITE_CONFIG.whatsappNumber;
  els.whatsappLink.setAttribute("aria-label", `Message on WhatsApp: ${SITE_CONFIG.whatsappNumber}`);
}

function setupBackToTop() {
  if (!els.backToTop) return;
  els.backToTop.addEventListener("click", (e) => {
    e.preventDefault();
    closeLightbox();
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState({}, "", "#home");
  });
}

function boot() {
  els.year.textContent = String(new Date().getFullYear());
  renderCounts();
  renderFeaturedStrip();
  setupInstagram();
  setupWhatsApp();
  setupBackToTop();
  setupLightboxA11y();

  const initialCategory = getCategoryFromUrl() || "All";
  setCategory(initialCategory);
}

boot();
