import { BODY_TYPES } from "./catalog.js";
import { seedIfNeeded, getVehicles, getCatalog, getSettings, getVehicleById, normalizeWhatsapp } from "./store.js";

seedIfNeeded();

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const kmFormatter = new Intl.NumberFormat("pt-BR");

const els = {
  brand: document.querySelector("#filter-brand"),
  model: document.querySelector("#filter-model"),
  search: document.querySelector("#filter-search"),
  minPrice: document.querySelector("#filter-min-price"),
  maxPrice: document.querySelector("#filter-max-price"),
  bodyType: document.querySelector("#filter-body-type"),
  results: document.querySelector("#vehicle-results"),
  count: document.querySelector("#vehicle-count"),
  clear: document.querySelector("#clear-filters"),
  featured: document.querySelector("#featured-grid"),
  detail: document.querySelector("#vehicle-detail"),
  detailTitle: document.querySelector("#detail-title"),
  detailSubtitle: document.querySelector("#detail-subtitle"),
  detailPrice: document.querySelector("#detail-price"),
  detailDescription: document.querySelector("#detail-description"),
  detailSpecs: document.querySelector("#detail-specs"),
  detailOptionals: document.querySelector("#detail-optionals"),
  detailImage: document.querySelector("#detail-image"),
  detailWhatsapp: document.querySelector("#detail-whatsapp"),
  detailClose: document.querySelector("#detail-close")
};

function formatPrice(value) {
  return priceFormatter.format(Number(value || 0));
}

function formatKm(value) {
  return `${kmFormatter.format(Number(value || 0))} km`;
}

function getActiveVehicles() {
  return getVehicles().filter((vehicle) => vehicle.status === "active");
}

function buildVehicleUrl(vehicleId) {
  const url = new URL(window.location.href);
  url.searchParams.set("car", vehicleId);
  return url.toString();
}

function buildWhatsappLink(vehicle) {
  const settings = getSettings();
  const number = normalizeWhatsapp(settings.whatsapp);
  const link = buildVehicleUrl(vehicle.id);
  const text = [
    `Olá, tenho interesse no veículo ${vehicle.brand} ${vehicle.model} ${vehicle.version || ""}.`,
    `Valor: ${formatPrice(vehicle.priceDiscount || vehicle.price)}.`,
    `Link: ${link}`
  ].join(" ");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function getFilteredVehicles() {
  const vehicles = getActiveVehicles();
  const term = els.search.value.trim().toLowerCase();
  const brand = els.brand.value;
  const model = els.model.value;
  const bodyType = els.bodyType.value;
  const minPrice = Number(els.minPrice.value || 0);
  const maxPrice = Number(els.maxPrice.value || 0);

  return vehicles.filter((vehicle) => {
    const haystack = `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.color}`.toLowerCase();
    const vehiclePrice = Number(vehicle.priceDiscount || vehicle.price || 0);

    if (term && !haystack.includes(term)) return false;
    if (brand && vehicle.brand !== brand) return false;
    if (model && vehicle.model !== model) return false;
    if (bodyType && vehicle.bodyType !== bodyType) return false;
    if (minPrice && vehiclePrice < minPrice) return false;
    if (maxPrice && vehiclePrice > maxPrice) return false;

    return true;
  });
}

function createCard(vehicle) {
  const hasDiscount = Number(vehicle.priceDiscount) > 0 && Number(vehicle.priceDiscount) < Number(vehicle.price);
  return `
    <article class="vehicle-card">
      <div class="vehicle-card__media">
        <img src="${vehicle.image || "images/car.jpeg"}" alt="${vehicle.brand} ${vehicle.model}" loading="lazy" />
        ${vehicle.featured ? `<span class="badge badge--featured">Destaque</span>` : ""}
        ${hasDiscount ? `<span class="badge badge--discount">Oferta</span>` : ""}
      </div>

      <div class="vehicle-card__body">
        <div class="vehicle-card__top">
          <div>
            <h3>${vehicle.brand} ${vehicle.model}</h3>
            <p>${vehicle.version || "Versão não informada"}</p>
          </div>
        </div>

        <div class="vehicle-price">
          ${hasDiscount ? `<span class="vehicle-price__old">${formatPrice(vehicle.price)}</span>` : ""}
          <strong>${formatPrice(vehicle.priceDiscount || vehicle.price)}</strong>
        </div>

        <div class="vehicle-specs">
          <span>${vehicle.yearModel}</span>
          <span>${formatKm(vehicle.km)}</span>
          <span>${vehicle.transmission}</span>
          <span>${vehicle.fuel}</span>
        </div>

        <div class="vehicle-actions">
          <button class="btn btn-outline js-open-detail" data-id="${vehicle.id}">Ver detalhes</button>
          <a class="btn btn-whatsapp" href="${buildWhatsappLink(vehicle)}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </article>
  `;
}

function renderResults() {
  const filtered = getFilteredVehicles();
  els.count.textContent = `${filtered.length} veículo(s) encontrado(s)`;
  els.results.innerHTML = filtered.length
    ? filtered.map(createCard).join("")
    : `<div class="empty-state">Nenhum carro encontrado com esse filtro.</div>`;
}

function renderFeatured() {
  const featured = getActiveVehicles().filter((vehicle) => vehicle.featured).slice(0, 3);
  els.featured.innerHTML = featured.map(createCard).join("");
}

function populateBrands() {
  const catalog = getCatalog();
  const brands = Object.keys(catalog).sort((a, b) => a.localeCompare(b, "pt-BR"));
  els.brand.innerHTML = `<option value="">Todas as marcas</option>` + brands.map((brand) => `<option value="${brand}">${brand}</option>`).join("");
}

function populateModels() {
  const catalog = getCatalog();
  const brand = els.brand.value;
  const models = brand ? (catalog[brand] || []) : [];
  els.model.innerHTML = `<option value="">Todos os modelos</option>` + models.map((model) => `<option value="${model}">${model}</option>`).join("");
}

function populateBodyTypes() {
  els.bodyType.innerHTML = `<option value="">Todos os tipos</option>` + BODY_TYPES.map((item) => `<option value="${item}">${item}</option>`).join("");
}

function openDetail(id) {
  const vehicle = getVehicleById(id);
  if (!vehicle || vehicle.status !== "active") return;

  const specs = [
    ["Marca", vehicle.brand],
    ["Modelo", vehicle.model],
    ["Versão", vehicle.version || "—"],
    ["Ano modelo", vehicle.yearModel],
    ["Ano fabricação", vehicle.yearFabrication || "—"],
    ["Quilometragem", formatKm(vehicle.km)],
    ["Combustível", vehicle.fuel],
    ["Câmbio", vehicle.transmission],
    ["Cor", vehicle.color],
    ["Tipo", vehicle.bodyType],
    ["Portas", vehicle.doors],
    ["Cidade", vehicle.city]
  ];

  els.detailTitle.textContent = `${vehicle.brand} ${vehicle.model}`;
  els.detailSubtitle.textContent = vehicle.version || "Versão não informada";
  els.detailPrice.textContent = formatPrice(vehicle.priceDiscount || vehicle.price);
  els.detailDescription.textContent = vehicle.description || "Sem descrição detalhada.";
  els.detailImage.src = vehicle.image || "images/car.jpeg";
  els.detailImage.alt = `${vehicle.brand} ${vehicle.model}`;
  els.detailSpecs.innerHTML = specs.map(([label, value]) => `<li><span>${label}</span><strong>${value}</strong></li>`).join("");
  els.detailOptionals.innerHTML = (vehicle.optionals || []).length
    ? vehicle.optionals.map((item) => `<li>${item}</li>`).join("")
    : "<li>Sem opcionais informados.</li>";
  els.detailWhatsapp.href = buildWhatsappLink(vehicle);
  els.detail.classList.add("is-open");
  document.body.classList.add("no-scroll");

  const url = new URL(window.location.href);
  url.searchParams.set("car", vehicle.id);
  history.replaceState({}, "", url);
}

function closeDetail() {
  els.detail.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
  const url = new URL(window.location.href);
  url.searchParams.delete("car");
  history.replaceState({}, "", url);
}

function bindEvents() {
  [els.search, els.minPrice, els.maxPrice].forEach((input) => {
    input.addEventListener("input", renderResults);
  });

  [els.brand, els.bodyType].forEach((input) => {
    input.addEventListener("change", () => {
      if (input === els.brand) populateModels();
      renderResults();
    });
  });

  els.model.addEventListener("change", renderResults);

  els.clear.addEventListener("click", () => {
    els.search.value = "";
    els.brand.value = "";
    populateModels();
    els.model.value = "";
    els.bodyType.value = "";
    els.minPrice.value = "";
    els.maxPrice.value = "";
    renderResults();
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".js-open-detail");
    if (button) openDetail(button.dataset.id);
    if (event.target.matches("#detail-close") || event.target.matches(".vehicle-detail__backdrop")) closeDetail();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDetail();
  });
}

function openFromQueryString() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("car");
  if (id) openDetail(id);
}

function init() {
  populateBrands();
  populateModels();
  populateBodyTypes();
  renderFeatured();
  renderResults();
  bindEvents();
  openFromQueryString();
}

init();
