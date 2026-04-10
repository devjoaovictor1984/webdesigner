(function (window) {
  var INITIAL = JSON.parse(JSON.stringify(window.TCM_INITIAL_STATE || {}));
  var STORAGE_KEYS = {
    portfolio: "tcm.portfolio.items",
    leads: "tcm.leads.items",
    config: "tcm.site.config",
    session: "tcm.auth.session",
    version: "tcm.demo.version"
  };

  var DEMO_VERSION = "2026-04-10-logo-fix-v3";

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "projeto";
  }

  function buildSlug(title, ignoreId) {
    var base = normalizeText(title);
    var slug = base;
    var index = 2;
    var items = getPortfolio(false);

    while (items.some(function (item) {
      return item.slug === slug && item.id !== ignoreId;
    })) {
      slug = base + "-" + index;
      index += 1;
    }

    return slug;
  }

  function sortPortfolio(items) {
    return clone(items).sort(function (left, right) {
      var featuredDiff = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
      if (featuredDiff !== 0) return featuredDiff;

      var leftDate = new Date(left.publishedAt || 0).getTime();
      var rightDate = new Date(right.publishedAt || 0).getTime();
      if (leftDate !== rightDate) return rightDate - leftDate;

      return new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime();
    });
  }

  function getDefaultSiteConfig() {
    return clone(INITIAL.siteConfig || {
      logo: "assets/images/logo/agencia-jvv-header.png",
      heroBackground: "assets/images/common/expert-img-two.jpg",
      heroPanelBackground: "assets/images/technician/work/work-1.jpg"
    });
  }

  function seedIfNeeded() {
    var currentVersion = localStorage.getItem(STORAGE_KEYS.version);
    var shouldRefreshDemo = currentVersion !== DEMO_VERSION;

    var storedPortfolio = read(STORAGE_KEYS.portfolio, null);
    if (shouldRefreshDemo || !Array.isArray(storedPortfolio) || storedPortfolio.length === 0) {
      write(STORAGE_KEYS.portfolio, clone(INITIAL.portfolio || []));
    }

    if (!read(STORAGE_KEYS.leads, null)) {
      write(STORAGE_KEYS.leads, clone(INITIAL.leads || []));
    }

    var storedConfig = read(STORAGE_KEYS.config, null);
    var defaultConfig = getDefaultSiteConfig();
    if (shouldRefreshDemo || !storedConfig || typeof storedConfig !== "object") {
      write(STORAGE_KEYS.config, defaultConfig);
      localStorage.setItem(STORAGE_KEYS.version, DEMO_VERSION);
      return;
    }

    if (typeof storedConfig.logo === "string") {
      if (storedConfig.logo.indexOf("data:image/jpeg") === 0 ||
          storedConfig.logo.indexOf("assets/images/logo/agencia-jvv-icon.png") >= 0 ||
          storedConfig.logo.indexOf("assets/images/logo/jvv-icon.png") >= 0 ||
          storedConfig.logo.indexOf("assets/images/logo/agencia-jvv-icon-square.png") >= 0) {
        storedConfig.logo = defaultConfig.logo;
      }
    }

    write(STORAGE_KEYS.config, Object.assign({}, defaultConfig, storedConfig));
    localStorage.setItem(STORAGE_KEYS.version, DEMO_VERSION);
  }

  function getPortfolio(includeDrafts) {
    seedIfNeeded();
    var items = read(STORAGE_KEYS.portfolio, clone(INITIAL.portfolio || []));
    items = Array.isArray(items) ? items : [];

    if (!includeDrafts) {
      items = items.filter(function (item) {
        return Boolean(item.published);
      });
    }

    return sortPortfolio(items);
  }

  function savePortfolio(items) {
    write(STORAGE_KEYS.portfolio, sortPortfolio(items));
  }

  function getPortfolioById(id) {
    return getPortfolio(true).find(function (item) {
      return item.id === id;
    }) || null;
  }

  function getPortfolioBySlug(slug) {
    return getPortfolio(true).find(function (item) {
      return item.slug === slug && item.published;
    }) || null;
  }

  function upsertPortfolio(record) {
    var items = getPortfolio(true);
    var id = record.id || ("case-" + Date.now());
    var prepared = Object.assign({}, record, {
      id: id,
      slug: buildSlug(record.title, id),
      updatedAt: new Date().toISOString()
    });
    var index = items.findIndex(function (item) {
      return item.id === id;
    });

    if (index >= 0) {
      items[index] = prepared;
    } else {
      items.unshift(prepared);
    }

    savePortfolio(items);
    return prepared;
  }

  function deletePortfolio(id) {
    var items = getPortfolio(true).filter(function (item) {
      return item.id !== id;
    });
    savePortfolio(items);
  }

  function getLeads() {
    seedIfNeeded();
    var leads = read(STORAGE_KEYS.leads, clone(INITIAL.leads || []));
    return Array.isArray(leads) ? leads : [];
  }

  function saveLead(lead) {
    var leads = getLeads();
    leads.unshift(Object.assign({}, lead, {
      id: lead.id || ("lead-" + Date.now()),
      createdAt: lead.createdAt || new Date().toISOString()
    }));
    write(STORAGE_KEYS.leads, leads);
  }

  function getSiteConfig() {
    seedIfNeeded();
    var stored = read(STORAGE_KEYS.config, getDefaultSiteConfig()) || {};
    return Object.assign({}, getDefaultSiteConfig(), stored);
  }

  function saveSiteConfig(config) {
    var merged = Object.assign({}, getSiteConfig(), config || {});
    write(STORAGE_KEYS.config, merged);
    return merged;
  }

  function replaceState(payload) {
    if (payload && Array.isArray(payload.portfolio)) {
      write(STORAGE_KEYS.portfolio, payload.portfolio);
    }
    if (payload && Array.isArray(payload.leads)) {
      write(STORAGE_KEYS.leads, payload.leads);
    }
    if (payload && payload.siteConfig && typeof payload.siteConfig === 'object') {
      write(STORAGE_KEYS.config, Object.assign({}, getDefaultSiteConfig(), payload.siteConfig));
    }
  }

  function exportState() {
    return {
      exportedAt: new Date().toISOString(),
      siteConfig: getSiteConfig(),
      portfolio: getPortfolio(true),
      leads: getLeads()
    };
  }

  function resetDemoData() {
    localStorage.removeItem(STORAGE_KEYS.portfolio);
    localStorage.removeItem(STORAGE_KEYS.leads);
    localStorage.removeItem(STORAGE_KEYS.config);
    seedIfNeeded();
  }

  function validateLogin(username, password) {
    return username === INITIAL.credentials.username && password === INITIAL.credentials.password;
  }

  function setSession(username) {
    write(STORAGE_KEYS.session, {
      username: username,
      loggedAt: new Date().toISOString()
    });
  }

  function getSession() {
    return read(STORAGE_KEYS.session, null);
  }

  function isAuthenticated() {
    return Boolean(getSession());
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
  }

  window.TCMStore = {
    seedIfNeeded: seedIfNeeded,
    getPortfolio: getPortfolio,
    getPortfolioById: getPortfolioById,
    getPortfolioBySlug: getPortfolioBySlug,
    upsertPortfolio: upsertPortfolio,
    deletePortfolio: deletePortfolio,
    getLeads: getLeads,
    saveLead: saveLead,
    getSiteConfig: getSiteConfig,
    saveSiteConfig: saveSiteConfig,
    replaceState: replaceState,
    exportState: exportState,
    resetDemoData: resetDemoData,
    validateLogin: validateLogin,
    setSession: setSession,
    getSession: getSession,
    isAuthenticated: isAuthenticated,
    clearSession: clearSession
  };
})(window);
