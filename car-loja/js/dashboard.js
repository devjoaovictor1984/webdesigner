import { OPTIONALS, FUELS, TRANSMISSIONS, COLORS, BODY_TYPES } from "./catalog.js";
import {
  seedIfNeeded,
  getCatalog,
  saveCatalog,
  getVehicles,
  upsertVehicle,
  deleteVehicle,
  getSettings,
  saveSettings,
  resetDemoData
} from "./store.js";

seedIfNeeded();

const PAGE_SIZE = 6;
let currentPage = 1;
let editingId = null;

const els = {
  form: document.querySelector("#vehicle-form"),
  formTitle: document.querySelector("#form-title"),
  vehicleId: document.querySelector("#vehicle-id"),
  brand: document.querySelector("#brand"),
  model: document.querySelector("#model"),
  version: document.querySelector("#version"),
  yearModel: document.querySelector("#year-model"),
  yearFabrication: document.querySelector("#year-fabrication"),
  price: document.querySelector("#price"),
  priceDiscount: document.querySelector("#price-discount"),
  km: document.querySelector("#km"),
  fuel: document.querySelector("#fuel"),
  transmission: document.querySelector("#transmission"),
  color: document.querySelector("#color"),
  bodyType: document.querySelector("#body-type"),
  doors: document.querySelector("#doors"),
  plateFinal: document.querySelector("#plate-final"),
  city: document.querySelector("#city"),
  status: document.querySelector("#status"),
  featured: document.querySelector("#featured"),
  description: document.querySelector("#description"),
  image: document.querySelector("#image"),
  preview: document.querySelector("#cover-preview"),
  optionalsWrap: document.querySelector("#optionals-wrap"),
  search: document.querySelector("#dashboard-search"),
  filterStatus: document.querySelector("#dashboard-status"),
  vehicleList: document.querySelector("#dashboard-vehicle-list"),
  pagination: document.querySelector("#dashboard-pagination"),
  addBrandForm: document.querySelector("#add-brand-form"),
  addBrandName: document.querySelector("#new-brand"),
  addModelForm: document.querySelector("#add-model-form"),
  addModelBrand: document.querySelector("#catalog-brand"),
  addModelName: document.querySelector("#new-model"),
  settingsForm: document.querySelector("#settings-form"),
  storeName: document.querySelector("#store-name"),
  whatsapp: document.querySelector("#store-whatsapp"),
  settingsCity: document.querySelector("#store-city"),
  resetDemo: document.querySelector("#reset-demo")
};

function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatKm(value) {
  return `${new Intl.NumberFormat("pt-BR").format(Number(value || 0))} km`;
}

function getSortedBrands() {
  return Object.keys(getCatalog()).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function populateBrandSelects() {
  const brands = getSortedBrands();
  const brandOptions = `<option value="">Selecione</option>` + brands.map((brand) => `<option value="${brand}">${brand}</option>`).join("");
  els.brand.innerHTML = brandOptions;
  els.addModelBrand.innerHTML = `<option value="">Escolha a marca</option>` + brands.map((brand) => `<option value="${brand}">${brand}</option>`).join("");
}

function populateModelSelect(brand, target = els.model, selected = "") {
  const catalog = getCatalog();
  const models = brand ? (catalog[brand] || []) : [];
  target.innerHTML = `<option value="">Selecione</option>` + models.map((model) => `<option value="${model}" ${model === selected ? "selected" : ""}>${model}</option>`).join("");
}

function populateStaticSelects() {
  els.fuel.innerHTML = FUELS.map((item) => `<option value="${item}">${item}</option>`).join("");
  els.transmission.innerHTML = TRANSMISSIONS.map((item) => `<option value="${item}">${item}</option>`).join("");
  els.color.innerHTML = COLORS.map((item) => `<option value="${item}">${item}</option>`).join("");
  els.bodyType.innerHTML = BODY_TYPES.map((item) => `<option value="${item}">${item}</option>`).join("");
}

function renderOptionalCheckboxes(selected = []) {
  els.optionalsWrap.innerHTML = OPTIONALS.map((item) => `
    <label class="check-pill">
      <input type="checkbox" name="optionals" value="${item}" ${selected.includes(item) ? "checked" : ""} />
      <span>${item}</span>
    </label>
  `).join("");
}

function collectOptionals() {
  return [...document.querySelectorAll('input[name="optionals"]:checked')].map((input) => input.value);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file, maxWidth = 1280, quality = 0.82) {
  const dataUrl = await readFileAsDataURL(file);
  const image = new Image();
  image.src = dataUrl;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxWidth / image.width);
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", quality);
}

function getFilteredVehicles() {
  const term = els.search.value.trim().toLowerCase();
  const status = els.filterStatus.value;

  return getVehicles()
    .filter((vehicle) => {
      const haystack = `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.city}`.toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (status && vehicle.status !== status) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function paginate(items, page) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    items: items.slice(start, start + PAGE_SIZE),
    totalPages,
    page: safePage
  };
}

function renderVehicleList() {
  const filtered = getFilteredVehicles();
  const { items, totalPages, page } = paginate(filtered, currentPage);
  currentPage = page;

  if (!items.length) {
    els.vehicleList.innerHTML = `<div class="empty-state">Nenhum veículo encontrado no dashboard.</div>`;
  } else {
    els.vehicleList.innerHTML = items.map((vehicle) => `
      <article class="dash-card">
        <img src="${vehicle.image || "images/car.jpeg"}" alt="${vehicle.brand} ${vehicle.model}" />
        <div class="dash-card__body">
          <div class="dash-card__header">
            <div>
              <h3>${vehicle.brand} ${vehicle.model}</h3>
              <p>${vehicle.version || "Versão não informada"}</p>
            </div>
            <span class="status-chip ${vehicle.status === "active" ? "status-chip--active" : "status-chip--inactive"}">
              ${vehicle.status === "active" ? "Ativo" : "Inativo"}
            </span>
          </div>

          <div class="dash-card__meta">
            <span>${vehicle.yearModel}</span>
            <span>${formatKm(vehicle.km)}</span>
            <span>${vehicle.transmission}</span>
            <span>${vehicle.city}</span>
          </div>

          <div class="dash-card__price">
            <strong>${formatPrice(vehicle.priceDiscount || vehicle.price)}</strong>
            ${vehicle.priceDiscount ? `<small>${formatPrice(vehicle.price)}</small>` : ""}
          </div>

          <div class="dash-card__actions">
            <button class="btn btn-outline js-edit" data-id="${vehicle.id}">Editar</button>
            <button class="btn btn-outline js-toggle-status" data-id="${vehicle.id}">
              ${vehicle.status === "active" ? "Inativar" : "Ativar"}
            </button>
            <button class="btn btn-danger js-delete" data-id="${vehicle.id}">Excluir</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  els.pagination.innerHTML = Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1;
    return `<button class="page-btn ${pageNumber === currentPage ? "is-active" : ""}" data-page="${pageNumber}">${pageNumber}</button>`;
  }).join("");
}

function resetForm() {
  editingId = null;
  els.form.reset();
  els.formTitle.textContent = "Cadastrar veículo";
  els.preview.src = "images/car.jpeg";
  els.vehicleId.value = "";
  populateModelSelect("");
  renderOptionalCheckboxes([]);
}

function fillForm(vehicle) {
  editingId = vehicle.id;
  els.formTitle.textContent = "Editar veículo";
  els.vehicleId.value = vehicle.id;
  els.brand.value = vehicle.brand;
  populateModelSelect(vehicle.brand, els.model, vehicle.model);
  els.version.value = vehicle.version || "";
  els.yearModel.value = vehicle.yearModel || "";
  els.yearFabrication.value = vehicle.yearFabrication || "";
  els.price.value = vehicle.price || "";
  els.priceDiscount.value = vehicle.priceDiscount || "";
  els.km.value = vehicle.km || "";
  els.fuel.value = vehicle.fuel || FUELS[0];
  els.transmission.value = vehicle.transmission || TRANSMISSIONS[0];
  els.color.value = vehicle.color || COLORS[0];
  els.bodyType.value = vehicle.bodyType || BODY_TYPES[0];
  els.doors.value = vehicle.doors || 4;
  els.plateFinal.value = vehicle.plateFinal || "";
  els.city.value = vehicle.city || "";
  els.status.value = vehicle.status || "active";
  els.featured.checked = Boolean(vehicle.featured);
  els.description.value = vehicle.description || "";
  els.preview.src = vehicle.image || "images/car.jpeg";
  renderOptionalCheckboxes(vehicle.optionals || []);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function handleSubmit(event) {
  event.preventDefault();

  const imageFile = els.image.files[0];
  let image = els.preview.src;

  if (imageFile) {
    image = await compressImage(imageFile);
  }

  const vehicle = {
    id: editingId || crypto.randomUUID(),
    status: els.status.value,
    featured: els.featured.checked,
    brand: els.brand.value,
    model: els.model.value,
    version: els.version.value.trim(),
    yearModel: Number(els.yearModel.value),
    yearFabrication: Number(els.yearFabrication.value),
    price: Number(els.price.value),
    priceDiscount: els.priceDiscount.value ? Number(els.priceDiscount.value) : null,
    km: Number(els.km.value),
    fuel: els.fuel.value,
    transmission: els.transmission.value,
    color: els.color.value,
    bodyType: els.bodyType.value,
    doors: Number(els.doors.value || 4),
    plateFinal: els.plateFinal.value,
    city: els.city.value.trim(),
    description: els.description.value.trim(),
    optionals: collectOptionals(),
    image,
    createdAt: editingId ? getVehicles().find((item) => item.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
  };

  upsertVehicle(vehicle);
  resetForm();
  renderVehicleList();
}

function handleDashboardClick(event) {
  const editButton = event.target.closest(".js-edit");
  if (editButton) {
    const vehicle = getVehicles().find((item) => item.id === editButton.dataset.id);
    if (vehicle) fillForm(vehicle);
  }

  const deleteButton = event.target.closest(".js-delete");
  if (deleteButton) {
    const ok = confirm("Excluir este veículo? Essa ação apaga o registro local.");
    if (ok) {
      deleteVehicle(deleteButton.dataset.id);
      renderVehicleList();
      if (editingId === deleteButton.dataset.id) resetForm();
    }
  }

  const toggleButton = event.target.closest(".js-toggle-status");
  if (toggleButton) {
    const vehicle = getVehicles().find((item) => item.id === toggleButton.dataset.id);
    if (vehicle) {
      vehicle.status = vehicle.status === "active" ? "inactive" : "active";
      upsertVehicle(vehicle);
      renderVehicleList();
    }
  }

  const pageButton = event.target.closest(".page-btn");
  if (pageButton) {
    currentPage = Number(pageButton.dataset.page);
    renderVehicleList();
  }
}

function handleBrandChange() {
  populateModelSelect(els.brand.value);
}

function handlePreviewChange() {
  const file = els.image.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    els.preview.src = String(reader.result);
  };
  reader.readAsDataURL(file);
}

function handleAddBrand(event) {
  event.preventDefault();
  const name = els.addBrandName.value.trim();
  if (!name) return;

  const catalog = getCatalog();
  if (!catalog[name]) {
    catalog[name] = [];
    saveCatalog(catalog);
    populateBrandSelects();
    els.addBrandName.value = "";
  }
}

function handleAddModel(event) {
  event.preventDefault();
  const brand = els.addModelBrand.value;
  const model = els.addModelName.value.trim();
  if (!brand || !model) return;

  const catalog = getCatalog();
  const list = catalog[brand] || [];
  if (!list.includes(model)) {
    list.push(model);
    list.sort((a, b) => a.localeCompare(b, "pt-BR"));
    catalog[brand] = list;
    saveCatalog(catalog);
    populateBrandSelects();
    populateModelSelect(els.brand.value || brand);
    els.addModelName.value = "";
  }
}

function loadSettings() {
  const settings = getSettings();
  els.storeName.value = settings.storeName || "";
  els.whatsapp.value = settings.whatsapp || "";
  els.settingsCity.value = settings.city || "";
}

function handleSettingsSubmit(event) {
  event.preventDefault();
  saveSettings({
    storeName: els.storeName.value.trim(),
    whatsapp: els.whatsapp.value.trim(),
    city: els.settingsCity.value.trim()
  });
  alert("Configurações da loja salvas localmente.");
}

function bindEvents() {
  els.form.addEventListener("submit", handleSubmit);
  els.brand.addEventListener("change", handleBrandChange);
  els.image.addEventListener("change", handlePreviewChange);
  els.search.addEventListener("input", () => {
    currentPage = 1;
    renderVehicleList();
  });
  els.filterStatus.addEventListener("change", () => {
    currentPage = 1;
    renderVehicleList();
  });
  els.vehicleList.addEventListener("click", handleDashboardClick);
  els.pagination.addEventListener("click", handleDashboardClick);
  document.querySelector("#reset-form").addEventListener("click", resetForm);
  els.addBrandForm.addEventListener("submit", handleAddBrand);
  els.addModelForm.addEventListener("submit", handleAddModel);
  els.settingsForm.addEventListener("submit", handleSettingsSubmit);
  els.resetDemo.addEventListener("click", () => {
    const ok = confirm("Restaurar dados de demonstração e apagar as alterações locais?");
    if (!ok) return;
    resetDemoData();
    populateBrandSelects();
    populateModelSelect("");
    loadSettings();
    resetForm();
    renderVehicleList();
  });
}

function init() {
  populateBrandSelects();
  populateStaticSelects();
  populateModelSelect("");
  renderOptionalCheckboxes([]);
  loadSettings();
  bindEvents();
  renderVehicleList();
}

init();
