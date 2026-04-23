const DATA = window.KK_DATA;
const I18N = window.KK_I18N;
const CV   = window.KK_CV;

// --- images
document.getElementById("hero-image").src   = DATA.heroImg;
document.getElementById("about-image").src  = DATA.aboutImg;
document.getElementById("humain-image").src = DATA.humainImg;

// --- catalog render
const catalog = document.getElementById("catalog");
DATA.works.forEach((w, i) => {
  const el = document.createElement("article");
  el.className = "work";
  el.dataset.idx = i;
  el.innerHTML = `
    <div class="work-img">
      <span class="work-num">№ ${String(i + 1).padStart(2, "0")}</span>
      <img loading="lazy" src="${w.src}" alt="${w.title} — Kai Krill" />
    </div>
    <div class="work-title">
      <span>${w.title}</span>
      <span class="status" data-status>${I18N.fr.sold}</span>
    </div>
    <div class="work-caption" data-caption>${I18N.fr.worksCaption}</div>
  `;
  el.addEventListener("click", () => openLightbox(i));
  catalog.appendChild(el);
});

// --- cv render
const cvEl = document.getElementById("cv");
CV.forEach(r => {
  const li = document.createElement("li");
  li.innerHTML = `<span class="year">${r.year}</span><span class="entry">${r.entry}</span><span class="place">${r.place}</span>`;
  cvEl.appendChild(li);
});

// --- marquee
function renderMarquee() {
  const t = currentI18n().marquee;
  const dot = `<span class="dot"></span>`;
  const html = " " + t + " " + dot + " " + t + " " + dot;
  document.getElementById("mq1").innerHTML = html;
  document.getElementById("mq2").innerHTML = html;
}

// ── i18n ──────────────────────────────────────────────────
const state = { lang: "fr", theme: "light", ...readLocal() };

function currentI18n() { return I18N[state.lang] || I18N.fr; }

function applyLang(lang) {
  state.lang = lang;
  const dict = currentI18n();
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.dataset.i18n;
    if (dict[k] != null) el.textContent = dict[k];
  });
  document.querySelectorAll("[data-status]").forEach(e => e.textContent = dict.sold);
  document.querySelectorAll("[data-caption]").forEach(e => e.textContent = dict.worksCaption);
  document.querySelectorAll(".lang-toggle button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  document.querySelectorAll('[data-tk="lang"] button').forEach(b => b.setAttribute("aria-pressed", b.dataset.v === lang));
  renderMarquee();
  persist();
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll('[data-tk="theme"] button').forEach(b => b.setAttribute("aria-pressed", b.dataset.v === theme));
  persist();
}

function readLocal() {
  try { return JSON.parse(localStorage.getItem("kk_state") || "{}"); } catch { return {}; }
}
function persist() {
  localStorage.setItem("kk_state", JSON.stringify({ lang: state.lang, theme: state.theme }));
  try { window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { lang: state.lang, theme: state.theme } }, "*"); } catch {}
}

document.querySelectorAll(".lang-toggle button").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));
document.querySelectorAll('[data-tk="lang"] button').forEach(b => b.addEventListener("click", () => applyLang(b.dataset.v)));
document.querySelectorAll('[data-tk="theme"] button').forEach(b => b.addEventListener("click", () => applyTheme(b.dataset.v)));

// ── lightbox ──────────────────────────────────────────────
const lb = document.getElementById("lightbox");
let lbIdx = 0;

function openLightbox(i) {
  lbIdx = i;
  updateLightbox();
  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function updateLightbox() {
  const w = DATA.works[lbIdx];
  const dict = currentI18n();
  document.getElementById("lb-img").src = w.src;
  document.getElementById("lb-img").alt = w.title;
  document.getElementById("lb-title").textContent = w.title;
  document.getElementById("lb-collection").textContent = dict.collectionEyebrow + " · " + dict.collectionTitle;
  document.getElementById("lb-medium").textContent = dict.heroStat3Val;
  document.getElementById("lb-type").textContent = "Original";
  document.getElementById("lb-year").textContent = "2024";
  document.getElementById("lb-status").textContent = dict.sold;
  document.getElementById("lb-counter").textContent = String(lbIdx + 1).padStart(2, "0") + " / " + String(DATA.works.length).padStart(2, "0");
}
function step(d) { lbIdx = (lbIdx + d + DATA.works.length) % DATA.works.length; updateLightbox(); }

document.getElementById("lb-close").addEventListener("click", closeLightbox);
document.getElementById("lb-prev").addEventListener("click", () => step(-1));
document.getElementById("lb-next").addEventListener("click", () => step(1));
document.getElementById("lb-contact").addEventListener("click", closeLightbox);
document.getElementById("lb-enquire").addEventListener("click", () => { closeLightbox(); document.getElementById("contact").scrollIntoView({ behavior: "smooth" }); });
lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
window.addEventListener("keydown", e => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

// ── image protection ──────────────────────────────────────
document.addEventListener("contextmenu", e => { if (e.target.tagName === "IMG") e.preventDefault(); });
document.addEventListener("dragstart",   e => { if (e.target.tagName === "IMG") e.preventDefault(); });

// ── scroll reveal ─────────────────────────────────────────
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
}, { threshold: 0.08 });
document.querySelectorAll(".section-head, .about-grid, .humain, .impact, .manifesto-body, .press, .form, .hero-meta")
  .forEach(el => { el.classList.add("reveal"); io.observe(el); });

// ── tweaks / edit-mode ────────────────────────────────────
window.addEventListener("message", e => {
  if (!e.data) return;
  if (e.data.type === "__activate_edit_mode")   document.getElementById("tweaks").classList.add("on");
  if (e.data.type === "__deactivate_edit_mode") document.getElementById("tweaks").classList.remove("on");
});
try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch {}

// ── init ──────────────────────────────────────────────────
applyLang(state.lang);
applyTheme(state.theme);
