// =====================================================
// Kai Krill — app logic
// =====================================================

// --- dynamic hero verb cycle
const HERO_VERBS = {
  fr: ["révèle", "accuse", "murmure", "cicatrise", "dénude", "convoque", "traverse", "insurge"],
  en: ["reveals", "accuses", "whispers", "scars", "strips bare", "summons", "pierces", "rises"]
};
function cycleHeroVerb(){
  const el = document.getElementById("hero-verb");
  if (!el) return;
  const list = HERO_VERBS[state?.lang] || HERO_VERBS.fr;
  let i = list.indexOf(el.textContent);
  if (i < 0) i = 0;
  const next = list[(i + 1) % list.length];
  el.classList.add("swapping");
  setTimeout(() => {
    el.textContent = next;
    el.classList.remove("swapping");
  }, 320);
}
setInterval(cycleHeroVerb, 2600);

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "fr",
  "theme": "light"
}/*EDITMODE-END*/;

const DATA = window.KK_DATA;
const I18N = window.KK_I18N;
const CV   = window.KK_CV;

// --- about image
const aboutImgEl = document.getElementById("about-image");
if (aboutImgEl) aboutImgEl.src = DATA.aboutImg;

// =====================================================
// SINGE — infinite carousel render
// =====================================================
const track = document.getElementById("singe-track");

function buildCarousel(){
  track.innerHTML = "";
  // duplicate the list so the -50% keyframe produces a seamless loop
  const list = [...DATA.works, ...DATA.works];
  list.forEach((w, i) => {
    const realIdx = i % DATA.works.length;
    const el = document.createElement("article");
    el.className = "singe-card";
    el.innerHTML = `
      <div class="singe-card-img">
        <img loading="lazy" src="${w.src}" alt="${w.title} — Kai Krill" />
      </div>
      <div class="singe-card-foot">
        <span>${w.title}</span>
        <span class="num">№ ${String(realIdx+1).padStart(2,"0")}</span>
      </div>
    `;
    el.addEventListener("click", () => openLightbox(realIdx));
    track.appendChild(el);
  });
  requestAnimationFrame(() => track.classList.add("animate"));
}
buildCarousel();

// prev/next nudge the animation
let nudge = 0;
function pauseNudge(){
  track.classList.remove("animate");
  track.style.transform = `translateX(${nudge}px)`;
}
document.getElementById("singe-prev").addEventListener("click", () => {
  pauseNudge(); nudge += 320; track.style.transform = `translateX(${nudge}px)`;
});
document.getElementById("singe-next").addEventListener("click", () => {
  pauseNudge(); nudge -= 320; track.style.transform = `translateX(${nudge}px)`;
});

// =====================================================
// marquee + cv
// =====================================================
function renderMarquee(){
  const t = currentI18n().marquee;
  document.getElementById("mq1").textContent = " " + t + " ";
  document.getElementById("mq2").textContent = " " + t + " ";
}

const cvEl = document.getElementById("cv");
CV.forEach(r => {
  const li = document.createElement("li");
  li.innerHTML = `<span class="year">${r.year}</span><span class="entry">${r.entry}</span><span class="place">${r.place}</span>`;
  cvEl.appendChild(li);
});

// =====================================================
// i18n
// =====================================================
function currentI18n(){ return I18N[state.lang] || I18N.fr; }

function applyLang(lang){
  state.lang = lang;
  const dict = currentI18n();
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.dataset.i18n;
    if (dict[k] != null) el.textContent = dict[k];
  });
  // reset hero verb to first in new language
  const hv = document.getElementById("hero-verb");
  if (hv) hv.textContent = (HERO_VERBS[lang] || HERO_VERBS.fr)[0];
  document.querySelectorAll(".lang-toggle button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  document.querySelectorAll('[data-tk="lang"] button').forEach(b => b.setAttribute("aria-pressed", b.dataset.v === lang));
  renderMarquee();
  persist();
}
function applyTheme(theme){
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll('[data-tk="theme"] button').forEach(b => b.setAttribute("aria-pressed", b.dataset.v === theme));
  persist();
}

const state = { ...TWEAK_DEFAULTS, ...readLocal() };
function readLocal(){ try{ return JSON.parse(localStorage.getItem("kk_state") || "{}"); }catch{ return {}; } }
function persist(){
  localStorage.setItem("kk_state", JSON.stringify({ lang: state.lang, theme: state.theme }));
  try{ window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { lang: state.lang, theme: state.theme } }, "*"); }catch{}
}

document.querySelectorAll(".lang-toggle button").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));
document.querySelectorAll('[data-tk="lang"] button').forEach(b => b.addEventListener("click", () => applyLang(b.dataset.v)));
document.querySelectorAll('[data-tk="theme"] button').forEach(b => b.addEventListener("click", () => applyTheme(b.dataset.v)));

// =====================================================
// Mobile nav toggle
// =====================================================
const navToggle = document.getElementById("nav-toggle");
const mobileDrawer = document.getElementById("mobile-drawer");
if (navToggle && mobileDrawer) {
  navToggle.addEventListener("click", () => {
    const open = mobileDrawer.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open);
    mobileDrawer.setAttribute("aria-hidden", !open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  mobileDrawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    mobileDrawer.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    mobileDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }));
}

// =====================================================
// lightbox (Singe) + Humain preview
// =====================================================
const lb = document.getElementById("lightbox");
let lbIdx = 0;
let lbMode = "singe"; // or "humain"

function openLightbox(i){ lbMode="singe"; lbIdx = i; updateLightbox(); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
function openHumain(){
  lbMode="humain"; lb.classList.add("open"); document.body.style.overflow = "hidden";
  const dict = currentI18n();
  document.getElementById("lb-img").src = "img/HUMAIN/Human 1.webp";
  document.getElementById("lb-title").textContent = "Humain I";
  document.getElementById("lb-collection").textContent = "Collection II · Humain";
  document.getElementById("lb-medium").textContent = "Encre & graphite";
  document.getElementById("lb-type").textContent = "Original encadré";
  document.getElementById("lb-year").textContent = "2026";
  document.getElementById("lb-status").textContent = dict.statusAvailable || "Disponible";
  document.getElementById("lb-counter").textContent = "01 / 01";
}
window.openHumain = openHumain;

function closeLightbox(){ lb.classList.remove("open"); document.body.style.overflow = ""; }
function updateLightbox(){
  const w = DATA.works[lbIdx];
  const dict = currentI18n();
  document.getElementById("lb-img").src = w.src;
  document.getElementById("lb-img").alt = w.title;
  document.getElementById("lb-title").textContent = w.title;
  document.getElementById("lb-collection").textContent = "Collection I · Singe";
  document.getElementById("lb-medium").textContent = "Encre de Chine";
  document.getElementById("lb-type").textContent = "Original";
  document.getElementById("lb-year").textContent = "2024";
  document.getElementById("lb-status").textContent = dict.sold || "Vendu";
  document.getElementById("lb-counter").textContent = String(lbIdx+1).padStart(2,"0") + " / " + String(DATA.works.length).padStart(2,"0");
}
function step(d){ if(lbMode!=="singe")return; lbIdx = (lbIdx + d + DATA.works.length) % DATA.works.length; updateLightbox(); }

document.getElementById("lb-close").addEventListener("click", closeLightbox);
document.getElementById("lb-prev").addEventListener("click", () => step(-1));
document.getElementById("lb-next").addEventListener("click", () => step(1));
document.getElementById("lb-contact").addEventListener("click", closeLightbox);
document.getElementById("lb-enquire").addEventListener("click", () => { closeLightbox(); document.getElementById("contact").scrollIntoView({behavior:"smooth"}); });
lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
window.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

// reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
}, { threshold: 0.08 });
document.querySelectorAll(".section-head, .about-grid, .humain-feature, .impact, .manifesto-body, .form, .hero-meta, .singe-carousel")
  .forEach(el => { el.classList.add("reveal"); io.observe(el); });

// tweaks
window.addEventListener("message", (e) => {
  if (!e.data) return;
  if (e.data.type === "__activate_edit_mode") document.getElementById("tweaks").classList.add("on");
  if (e.data.type === "__deactivate_edit_mode") document.getElementById("tweaks").classList.remove("on");
});
try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch {}

applyLang(state.lang);
applyTheme(state.theme);
