import { BASE_CATALOG, DEMO_VEHICLES } from "./catalog.js";

const STORAGE_KEYS = {
  catalog: "autovitrine.catalog",
  vehicles: "autovitrine.vehicles",
  settings: "autovitrine.settings"
};

const DEFAULT_SETTINGS = {
  storeName: "AutoVitrine",
  whatsapp: "5565999999999",
  city: "Cuiabá - MT"
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function seedIfNeeded() {
  const currentCatalog = read(STORAGE_KEYS.catalog, null);
  const currentVehicles = read(STORAGE_KEYS.vehicles, null);
  const currentSettings = read(STORAGE_KEYS.settings, null);

  if (!currentCatalog) write(STORAGE_KEYS.catalog, BASE_CATALOG);
  if (!currentVehicles) write(STORAGE_KEYS.vehicles, DEMO_VEHICLES);
  if (!currentSettings) write(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export function getCatalog() {
  return read(STORAGE_KEYS.catalog, BASE_CATALOG);
}

export function saveCatalog(catalog) {
  write(STORAGE_KEYS.catalog, catalog);
}

export function getVehicles() {
  return read(STORAGE_KEYS.vehicles, []);
}

export function saveVehicles(vehicles) {
  write(STORAGE_KEYS.vehicles, vehicles);
}

export function getSettings() {
  return read(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings) {
  write(STORAGE_KEYS.settings, settings);
}

export function getVehicleById(id) {
  return getVehicles().find((vehicle) => vehicle.id === id) || null;
}

export function upsertVehicle(vehicle) {
  const vehicles = getVehicles();
  const index = vehicles.findIndex((item) => item.id === vehicle.id);

  if (index >= 0) {
    vehicles[index] = vehicle;
  } else {
    vehicles.unshift(vehicle);
  }

  saveVehicles(vehicles);
}

export function deleteVehicle(id) {
  const vehicles = getVehicles().filter((vehicle) => vehicle.id !== id);
  saveVehicles(vehicles);
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEYS.catalog);
  localStorage.removeItem(STORAGE_KEYS.vehicles);
  localStorage.removeItem(STORAGE_KEYS.settings);
  seedIfNeeded();
}

export function normalizeWhatsapp(value) {
  return String(value || "").replace(/\D/g, "");
}
