"use strict";

// ===============================
// DIVISÃO VEÍCULOS - Vitrine front-end
// - HTML5 + CSS3 + Bootstrap 5 + JS puro
// - Pronto para ligar em um back-end (API / banco de dados)
// ===============================

// Caminho da imagem local usada em todos os carros
const DEFAULT_CAR_IMAGE = "images/car.jpeg";

// 1. "Banco de dados" fake (substitua por API / back-end futuramente)
const cars = [
  {
    id: 1,
    brand: "BMW",
    model: "320i Sport GP",
    year: 2022,
    price: 239900,
    km: 22000,
    transmission: "Automático",
    fuel: "Gasolina",
    color: "Branco",
    segment: "Sedan",
    image: DEFAULT_CAR_IMAGE,
    highlight: true,
    tag: "Mais vendido",
    description:
      "BMW 320i Sport GP com pacote esportivo, ótimo equilíbrio entre conforto e performance. Revisões em dia na concessionária."
  },
  {
    id: 2,
    brand: "Audi",
    model: "Q3 Prestige",
    year: 2021,
    price: 219900,
    km: 19500,
    transmission: "Automático",
    fuel: "Gasolina",
    color: "Preto",
    segment: "SUV",
    image: DEFAULT_CAR_IMAGE,
    highlight: true,
    tag: "Blindado",
    description:
      "Audi Q3 Prestige com pacote de conforto completo. Versão moderna, acabamento premium e posição de dirigir elevada."
  },
  {
    id: 3,
    brand: "Toyota",
    model: "Corolla Altis Hybrid",
    year: 2023,
    price: 189900,
    km: 10800,
    transmission: "Automático",
    fuel: "Híbrido",
    color: "Prata",
    segment: "Sedan",
    image: DEFAULT_CAR_IMAGE,
    highlight: true,
    tag: "Híbrido",
    description:
      "Altis Hybrid com consumo impressionante, perfeito para quem roda muito. Tecnologia híbrida Toyota com extrema confiabilidade."
  },
  {
    id: 4,
    brand: "Volvo",
    model: "XC60 R-Design",
    year: 2020,
    price: 259900,
    km: 35000,
    transmission: "Automático",
    fuel: "Gasolina",
    color: "Cinza",
    segment: "SUV",
    image: DEFAULT_CAR_IMAGE,
    highlight: true,
    tag: "Top de linha",
    description:
      "Volvo XC60 R-Design com pacote de segurança completo, piloto automático adaptativo e acabamento escandinavo refinado."
  },
  {
    id: 5,
    brand: "Jeep",
    model: "Compass Longitude T270",
    year: 2022,
    price: 154900,
    km: 18000,
    transmission: "Automático",
    fuel: "Flex",
    color: "Branco",
    segment: "SUV",
    image: DEFAULT_CAR_IMAGE,
    highlight: false,
    tag: "Oportunidade",
    description:
      "Compass Longitude T270, motor turbo, central multimídia completa e conjunto muito equilibrado para uso urbano e rodoviário."
  },
  {
    id: 6,
    brand: "Honda",
    model: "Civic Touring",
    year: 2019,
    price: 129900,
    km: 48000,
    transmission: "Automático",
    fuel: "Gasolina",
    color: "Prata",
    segment: "Sedan",
    image: DEFAULT_CAR_IMAGE,
    highlight: false,
    tag: "Turbo",
    description:
      "Civic Touring turbo, acabamento interno superior, excelente dirigibilidade e manutenção acessível na rede Honda."
  },
  {
    id: 7,
    brand: "Chevrolet",
    model: "Onix Premier 1.0 Turbo",
    year: 2022,
    price: 89900,
    km: 15000,
    transmission: "Automático",
    fuel: "Flex",
    color: "Vermelho",
    segment: "Hatch",
    image: DEFAULT_CAR_IMAGE,
    highlight: false,
    tag: "Custo-benefício",
    description:
      "Onix Premier completaço com câmera de ré, MyLink, 6 airbags e economia de combustível excelente."
  },
  {
    id: 8,
    brand: "Fiat",
    model: "Toro Volcano 2.0 4x4",
    year: 2021,
    price: 164900,
    km: 32000,
    transmission: "Automático",
    fuel: "Diesel",
    color: "Preto",
    segment: "Picape",
    image: DEFAULT_CAR_IMAGE,
    highlight: false,
    tag: "Diesel 4x4",
    description:
      "Toro Volcano 4x4 diesel com ótimo torque para estrada e uso misto, cabine confortável e caçamba versátil."
  },
  {
    id: 9,
    brand: "Porsche",
    model: "911 Carrera",
    year: 2018,
    price: 649900,
    km: 27000,
    transmission: "Automático",
    fuel: "Gasolina",
    color: "Branco",
    segment: "Esportivo",
    image: DEFAULT_CAR_IMAGE,
    highlight: true,
    tag: "Exclusivo",
    description:
      "Porsche 911 Carrera, ícone mundial dos esportivos. Desempenho absurdo, som maravilhoso e presença única."
  },
  {
    id: 10,
    brand: "Volkswagen",
    model: "Nivus Highline",
    year: 2023,
    price: 119900,
    km: 5000,
    transmission: "Automático",
    fuel: "Flex",
    color: "Azul",
    segment: "SUV",
    image: DEFAULT_CAR_IMAGE,
    highlight: false,
    tag: "Quase zero",
    description:
      "Nivus Highline, design moderno, painel digital, conectividade total e excelente consumo no dia a dia."
  }
];

// Estado atual dos filtros e da comparação
let filteredCars = [...cars];
let compareSelection = [];

// Helpers de formatação
function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatKm(value) {
  return `${new Intl.NumberFormat("pt-BR").format(value)} km`;
}

// 2. Renderização de cards

const carListEl = document.getElementById("car-list");
const noResultsEl = document.getElementById("no-results");

function renderCars(list) {
  carListEl.innerHTML = "";

  if (!list.length) {
    noResultsEl.classList.remove("d-none");
    return;
  }

  noResultsEl.classList.add("d-none");

  list.forEach((car) => {
    const isSelected = compareSelection.some((c) => c.id === car.id);
    const compareBtnClass = isSelected ? "btn-compare-active" : "";
    const compareBtnLabel = isSelected
      ? "Remover da comparação"
      : "Adicionar à comparação";

    const whatsMessage = encodeURIComponent(
      `Olá, tenho interesse neste ${car.brand} ${car.model} ${car.year} anunciado na Divisão Veículos. Poderia me enviar mais detalhes?`
    );
    const whatsLink = `https://wa.me/?text=${whatsMessage}`;

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    col.innerHTML = `
      <article class="car-card h-100" data-id="${car.id}">
        <div class="car-card__image-wrapper">
          <img
            src="${car.image || DEFAULT_CAR_IMAGE}"
            alt="${car.brand} ${car.model}"
            class="car-card__image"
          />
          <span class="car-card__badge ${
            car.highlight ? "car-card__badge--premium" : ""
          }">
            ${car.highlight ? "Destaque Divisão" : "Seminovo seleto"}
          </span>
          ${
            car.tag
              ? `<span class="car-card__tag">
                    <i class="fa-solid fa-bolt me-1"></i>${car.tag}
                 </span>`
              : ""
          }
        </div>
        <div class="car-card__body">
          <div>
            <h3 class="car-card__title">
              ${car.brand} ${car.model}
            </h3>
            <p class="car-card__subtitle">
              ${car.year} · ${formatKm(car.km)} · ${car.fuel}
            </p>
            <div class="car-card__chips">
              <span class="car-chip">
                <i class="fa-solid fa-gauge-high me-1"></i>${car.segment}
              </span>
              <span class="car-chip">
                <i class="fa-solid fa-gear me-1"></i>${car.transmission}
              </span>
              <span class="car-chip">
                <i class="fa-solid fa-droplet me-1"></i>${car.fuel}
              </span>
            </div>
          </div>

          <div class="car-card__price-row">
            <div>
              <div class="car-card__price">${formatPrice(car.price)}</div>
              <div class="car-card__price-label">Avaliação na loja</div>
            </div>
            <div class="text-end">
              <span class="car-card__price-label">Cor</span>
              <div class="small">${car.color}</div>
            </div>
          </div>

          <div class="car-card__actions">
            <button
              type="button"
              class="btn btn-outline-light btn-sm w-100 js-see-details"
              data-id="${car.id}"
            >
              Ver detalhes
            </button>
            <button
              type="button"
              class="btn btn-outline-warning btn-sm w-100 js-toggle-compare ${compareBtnClass}"
              data-id="${car.id}"
            >
              <i class="fa-solid fa-scale-balanced me-1"></i>${compareBtnLabel}
            </button>
            <a
              href="${whatsLink}"
              target="_blank"
              class="btn btn-success btn-sm w-100"
            >
              <i class="fa-brands fa-whatsapp me-1"></i>Compartilhar no WhatsApp
            </a>
          </div>
        </div>
      </article>
    `;

    carListEl.appendChild(col);
  });
}

// 3. Filtros

const filterSearchEl = document.getElementById("filter-search");
const filterBrandEl = document.getElementById("filter-brand");
const filterYearEl = document.getElementById("filter-year");
const filterPriceMinEl = document.getElementById("filter-price-min");
const filterPriceMaxEl = document.getElementById("filter-price-max");
const btnApplyFilters = document.getElementById("btn-apply-filters");
const btnClearFilters = document.getElementById("btn-clear-filters");

function populateBrandFilter() {
  const brands = Array.from(new Set(cars.map((c) => c.brand))).sort();
  filterBrandEl.innerHTML = `<option value="">Todas</option>`;
  brands.forEach((brand) => {
    const opt = document.createElement("option");
    opt.value = brand;
    opt.textContent = brand;
    filterBrandEl.appendChild(opt);
  });
}

function applyFilters() {
  const term = filterSearchEl.value.trim().toLowerCase();
  const brand = filterBrandEl.value;
  const yearMin = parseInt(filterYearEl.value, 10) || 0;
  const priceMin = parseInt(filterPriceMinEl.value.replace(/\D/g, ""), 10) || 0;
  const priceMaxRaw = parseInt(
    filterPriceMaxEl.value.replace(/\D/g, ""),
    10
  );
  const priceMax = isNaN(priceMaxRaw) ? Infinity : priceMaxRaw;

  filteredCars = cars.filter((car) => {
    if (brand && car.brand !== brand) return false;
    if (yearMin && car.year < yearMin) return false;

    if (term) {
      const fullText = `${car.brand} ${car.model} ${car.segment}`.toLowerCase();
      if (!fullText.includes(term)) return false;
    }

    if (priceMin && car.price < priceMin) return false;
    if (priceMax !== Infinity && car.price > priceMax) return false;

    return true;
  });

  renderCars(filteredCars);
}

function clearFilters() {
  filterSearchEl.value = "";
  filterBrandEl.value = "";
  filterYearEl.value = "";
  filterPriceMinEl.value = "";
  filterPriceMaxEl.value = "";
  filteredCars = [...cars];
  renderCars(filteredCars);
}

// 4. Comparação de veículos

const compareBarEl = document.getElementById("compare-bar");
const compareCountEl = document.getElementById("compare-count");
const compareListEl = document.getElementById("compare-list");
const btnOpenCompare = document.getElementById("btn-open-compare");
const btnClearCompare = document.getElementById("btn-clear-compare");

function updateCompareBar() {
  if (!compareSelection.length) {
    compareBarEl.classList.add("d-none");
    compareListEl.innerHTML = "";
    compareCountEl.textContent = "0";
    return;
  }

  compareBarEl.classList.remove("d-none");
  compareCountEl.textContent = compareSelection.length.toString();
  compareListEl.innerHTML = compareSelection
    .map(
      (car) => `
      <span class="badge rounded-pill">
        ${car.brand} ${car.model}
      </span>
    `
    )
    .join("");
}

function toggleCompare(carId) {
  const existingIndex = compareSelection.findIndex((c) => c.id === carId);

  if (existingIndex >= 0) {
    compareSelection.splice(existingIndex, 1);
  } else {
    if (compareSelection.length >= 3) {
      alert("Você só pode comparar até 3 veículos por vez.");
      return false;
    }
    const car = cars.find((c) => c.id === carId);
    if (car) compareSelection.push(car);
  }

  updateCompareBar();
  // Re-render para atualizar o estado dos botões
  renderCars(filteredCars);
  return true;
}

function buildCompareTable() {
  const headRow = document.getElementById("compare-head-row");
  const bodyEl = document.getElementById("compare-body");

  if (!compareSelection.length) {
    headRow.innerHTML = "";
    bodyEl.innerHTML =
      '<tr><td colspan="4" class="text-center text-muted">Nenhum veículo selecionado.</td></tr>';
    return;
  }

  headRow.innerHTML =
    "<th>Especificação</th>" +
    compareSelection
      .map(
        (car) => `
      <th>
        ${car.brand}<br />
        <span class="small text-muted">${car.model}</span>
      </th>
    `
      )
      .join("");

  const rows = [
    { label: "Ano", key: "year" },
    { label: "Preço", key: "price", format: formatPrice },
    { label: "Quilometragem", key: "km", format: formatKm },
    { label: "Câmbio", key: "transmission" },
    { label: "Combustível", key: "fuel" },
    { label: "Cor", key: "color" },
    { label: "Segmento", key: "segment" }
  ];

  bodyEl.innerHTML = rows
    .map((row) => {
      const cells = compareSelection
        .map((car) => {
          const value = row.format
            ? row.format(car[row.key])
            : car[row.key];
          return `<td>${value}</td>`;
        })
        .join("");

      return `
        <tr>
          <th scope="row">${row.label}</th>
          ${cells}
        </tr>
      `;
    })
    .join("");
}

// 5. Modal de detalhes

const modalCarTitleEl = document.getElementById("modalCarTitle");
const modalCarSubtitleEl = document.getElementById("modalCarSubtitle");
const modalCarPriceEl = document.getElementById("modalCarPrice");
const modalCarImageEl = document.getElementById("modalCarImage");
const modalCarBadgeEl = document.getElementById("modalCarBadge");
const modalCarSpecsEl = document.getElementById("modalCarSpecs");
const modalCarDescriptionEl = document.getElementById("modalCarDescription");
const modalCarShareEl = document.getElementById("modalCarShare");

function openCarDetails(carId) {
  const car = cars.find((c) => c.id === carId);
  if (!car) return;

  modalCarTitleEl.textContent = `${car.brand} ${car.model}`;
  modalCarSubtitleEl.textContent = `${car.year} · ${formatKm(
    car.km
  )} · ${car.fuel}`;
  modalCarPriceEl.textContent = formatPrice(car.price);
  modalCarImageEl.src = car.image || DEFAULT_CAR_IMAGE;
  modalCarImageEl.alt = `${car.brand} ${car.model}`;
  modalCarBadgeEl.textContent = car.highlight
    ? "Destaque Divisão"
    : "Seminovo selecionado";

  modalCarSpecsEl.innerHTML = `
    <li>
      <span>Marca</span><span>${car.brand}</span>
    </li>
    <li>
      <span>Modelo</span><span>${car.model}</span>
    </li>
    <li>
      <span>Ano</span><span>${car.year}</span>
    </li>
    <li>
      <span>Quilometragem</span><span>${formatKm(car.km)}</span>
    </li>
    <li>
      <span>Câmbio</span><span>${car.transmission}</span>
    </li>
    <li>
      <span>Combustível</span><span>${car.fuel}</span>
    </li>
    <li>
      <span>Cor</span><span>${car.color}</span>
    </li>
    <li>
      <span>Segmento</span><span>${car.segment}</span>
    </li>
  `;

  modalCarDescriptionEl.textContent =
    car.description ||
    "Veículo com procedência garantida e laudo cautelar aprovado pela Divisão Veículos.";

  const msg = encodeURIComponent(
    `Olá, tenho interesse neste ${car.brand} ${car.model} ${car.year} anunciado na Divisão Veículos. Poderia me enviar mais detalhes?`
  );
  modalCarShareEl.href = `https://wa.me/?text=${msg}`;

  const modal = new bootstrap.Modal(
    document.getElementById("carDetailsModal")
  );
  modal.show();
}

// 6. Eventos globais

// Delegação de eventos nos cards
carListEl.addEventListener("click", (event) => {
  const detailsBtn = event.target.closest(".js-see-details");
  if (detailsBtn) {
    const id = Number(detailsBtn.dataset.id);
    openCarDetails(id);
    return;
  }

  const compareBtn = event.target.closest(".js-toggle-compare");
  if (compareBtn) {
    const id = Number(compareBtn.dataset.id);
    const ok = toggleCompare(id);
    if (!ok) return;
  }
});

// Botões de filtros
btnApplyFilters.addEventListener("click", applyFilters);
btnClearFilters.addEventListener("click", clearFilters);

// Busca em tempo real
filterSearchEl.addEventListener("input", () => {
  applyFilters();
});

filterBrandEl.addEventListener("change", applyFilters);
filterYearEl.addEventListener("change", applyFilters);
filterPriceMinEl.addEventListener("change", applyFilters);
filterPriceMaxEl.addEventListener("change", applyFilters);

// Barra de comparação
btnOpenCompare.addEventListener("click", () => {
  if (!compareSelection.length) return;
  buildCompareTable();
  const modal = new bootstrap.Modal(
    document.getElementById("compareModal")
  );
  modal.show();
});

btnClearCompare.addEventListener("click", () => {
  compareSelection = [];
  updateCompareBar();
  renderCars(filteredCars);
});

// Ano no rodapé
const footerYearEl = document.getElementById("footer-year");
if (footerYearEl) {
  footerYearEl.textContent = new Date().getFullYear().toString();
}

// 7. Inicialização

function init() {
  populateBrandFilter();
  renderCars(filteredCars);
  updateCompareBar();
}

document.addEventListener("DOMContentLoaded", init);
