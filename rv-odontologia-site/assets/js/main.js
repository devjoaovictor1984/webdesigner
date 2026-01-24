/* =========================================================
   RV Odontologia — JS leve
   - Envia formulário para WhatsApp com mensagem pronta
   - Slider circular Antes/Depois
   - Navegação das avaliações (scroll-snap)
========================================================= */

/** IMPORTANTE:
 * Troque pelo número real da clínica (com DDI 55 e DDD).
 * Exemplo: 5565999999999
 */
const WHATSAPP_NUMBER = "5565999443434";

function onlyDigits(str) {
  return (str || "").replace(/\D+/g, "");
}

function normalizeBRPhone(raw) {
  // Aceita: 10 ou 11 dígitos (DDD + número), ou 12/13 com 55.
  const d = onlyDigits(raw);

  if (d.length === 10 || d.length === 11) {
    return "55" + d;
  }
  if (d.length === 12 || d.length === 13) {
    // assume já contém DDI
    return d;
  }
  return null;
}

function openWhatsApp(message) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  const url = `${base}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* Bootstrap validation + WhatsApp redirect */
(function initWhatsAppForm(){
  const form = document.getElementById("waForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nome = document.getElementById("nome")?.value?.trim();
    const whatsapp = document.getElementById("whatsapp")?.value?.trim();
    const assunto = document.getElementById("assunto")?.value;

    // validação simples + Bootstrap states
    let ok = true;

    if (!nome || nome.length < 2) ok = false;
    const phone = normalizeBRPhone(whatsapp);
    if (!phone) ok = false;
    if (!assunto) ok = false;

    if (!ok) {
      form.classList.add("was-validated");
      return;
    }

    // mensagem enxuta (objetiva)
    const msg =
`Olá, tudo bem?
Meu nome é ${nome}.
Meu WhatsApp: ${whatsapp}.
Assunto: ${assunto}.
Quero agendar uma avaliação.`;

    openWhatsApp(msg);
  });
})();

/* Ano no rodapé */
(function setYear(){
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
})();

/* Antes/Depois circular */
function initBeforeAfter(el){
  const afterLayer = el.querySelector(".ba-after-layer");
  const handle = el.querySelector(".ba-handle");
  const range = el.querySelector(".ba-range");

  if (!afterLayer || !handle || !range) return;

  const set = (v) => {
    const p = Math.min(100, Math.max(0, v));
    afterLayer.style.width = p + "%";
    handle.style.left = p + "%";
    range.value = String(p);
  };

  // default
  set(Number(range.value || 50));

  const pointerToPercent = (evt) => {
    const rect = el.getBoundingClientRect();
    const x = (evt.clientX - rect.left);
    return (x / rect.width) * 100;
  };

  // Range input (acessibilidade)
  range.addEventListener("input", () => set(Number(range.value)));

  // Drag inside the circle
  let dragging = false;

  const onDown = (evt) => {
    dragging = true;
    el.setPointerCapture?.(evt.pointerId);
    set(pointerToPercent(evt));
  };
  const onMove = (evt) => {
    if (!dragging) return;
    set(pointerToPercent(evt));
  };
  const onUp = () => { dragging = false; };

  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
}

(function bootBeforeAfter(){
  document.querySelectorAll("[data-ba]").forEach(initBeforeAfter);
})();

/* Reviews navigation (scroll) */
(function reviewsNav(){
  const track = document.getElementById("reviewsTrack");
  if (!track) return;

  const prev = document.getElementById("revPrev");
  const next = document.getElementById("revNext");

  const step = () => {
    // Um card por clique (aprox.)
    const card = track.querySelector(".review-card");
    return card ? card.getBoundingClientRect().width + 16 : 340;
  };

  prev?.addEventListener("click", () => {
    track.scrollBy({ left: -step(), behavior: "smooth" });
  });
  next?.addEventListener("click", () => {
    track.scrollBy({ left: step(), behavior: "smooth" });
  });
})();

/* =========================================================
   OFFCANVAS → SCROLL (hash links)
   - Fecha o menu e depois faz scroll suave para a dobra
   - Compensa header sticky (offset)
========================================================= */
(function navScroll(){
  const header = document.querySelector(".site-header");
  const getOffset = () => (header ? header.getBoundingClientRect().height : 0) + 12;

  function scrollToHash(hash){
    if (!hash || hash === "#") return;
    const target = document.querySelector(hash);
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    try { history.replaceState(null, "", hash); } catch(e) {}
  }

  // Links dentro do offcanvas: fecha e só depois faz o scroll
  const offcanvasEl = document.getElementById("menu");
  let pendingHash = null;

  if (offcanvasEl){
    offcanvasEl.addEventListener("hidden.bs.offcanvas", () => {
      if (pendingHash){
        const h = pendingHash;
        pendingHash = null;
        // pequeno delay para o body liberar scroll (iOS/Android)
        setTimeout(() => scrollToHash(h), 50);
      }
    });

    offcanvasEl.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const h = a.getAttribute("href");
        if (!h || h === "#") return;
        e.preventDefault();
        pendingHash = h;

        // fecha o offcanvas via instância do Bootstrap
        const inst = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
        inst.hide();
      });
    });
  }

  // Links do menu desktop: scroll suave com offset
  document.querySelectorAll('.navbar a.nav-link[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const h = a.getAttribute("href");
      if (!h || h === "#") return;
      e.preventDefault();
      scrollToHash(h);
    });
  });

  // Se abrir o site já com hash na URL, aplica offset
  if (location.hash){
    setTimeout(() => scrollToHash(location.hash), 150);
  }
})();

