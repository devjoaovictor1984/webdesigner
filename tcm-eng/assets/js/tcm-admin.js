(function (window, document) {
  var store = window.TCMStore;

  function formatDate(value) {
    if (!value) return "Sem data";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
  }

  function showFeedback(element, type, message) {
    if (!element) return;
    element.className = "alert-inline " + type;
    element.textContent = message;
    element.hidden = false;
  }

  function resolveAdminImage(image) {
    if (!image) return "../assets/images/tcm/placeholder-project.svg";
    if (String(image).indexOf("data:") === 0 || String(image).indexOf("http") === 0) {
      return image;
    }
    return "../" + image.replace(/^\.\//, "");
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function requireAuth() {
    if (!store.isAuthenticated()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  function readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result)); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function compressImage(file, maxWidth, quality) {
    maxWidth = maxWidth || 1280;
    quality = quality || 0.82;

    return readFileAsDataURL(file).then(function (dataUrl) {
      return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onload = function () {
          var scale = Math.min(1, maxWidth / image.width);
          var canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        image.onerror = reject;
        image.src = dataUrl;
      });
    });
  }

  function readImageAsset(file, maxWidth, quality) {
    if (!file) return Promise.resolve("");
    var isSvg = file.type === "image/svg+xml" || /\.svg$/i.test(file.name || "");
    if (isSvg) {
      return readFileAsDataURL(file);
    }
    return compressImage(file, maxWidth, quality);
  }

  function applyAdminBranding() {
    var config = typeof store.getSiteConfig === "function" ? store.getSiteConfig() : null;
    if (!config) return;
    document.querySelectorAll("[data-admin-logo]").forEach(function (image) {
      image.src = resolveAdminImage(config.logo);
    });
  }

  function renderLogin() {
    var form = document.querySelector("#login-form");
    if (!form) return;

    if (store.isAuthenticated()) {
      window.location.href = "dashboard.html";
      return;
    }

    var feedback = document.querySelector("#login-feedback");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var username = form.querySelector("[name='username']").value.trim();
      var password = form.querySelector("[name='password']").value;

      if (!store.validateLogin(username, password)) {
        showFeedback(feedback, "error", "Usuário ou senha inválidos.");
        return;
      }

      store.setSession(username);
      window.location.href = "dashboard.html";
    });
  }

  function bindLogout() {
    var buttons = document.querySelectorAll("[data-action='logout']");
    buttons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        store.clearSession();
        window.location.href = "login.html?logout=1";
      });
    });
  }

  function renderAppearanceSettings(feedback) {
    var form = document.querySelector("#appearance-form");
    if (!form) return;

    var config = store.getSiteConfig();
    var logoPreview = document.querySelector("#site-logo-preview");
    var heroBgPreview = document.querySelector("#hero-bg-preview");
    var heroPanelBgPreview = document.querySelector("#hero-panel-bg-preview");
    var logoInput = document.querySelector("#site-logo-file");
    var heroBgInput = document.querySelector("#hero-bg-file");
    var heroPanelBgInput = document.querySelector("#hero-panel-bg-file");
    var whatsappInput = document.querySelector("#site-whatsapp-number");
    var resetAppearance = document.querySelector("#reset-appearance");

    var current = {
      logo: config.logo,
      heroBackground: config.heroBackground,
      heroPanelBackground: config.heroPanelBackground,
      whatsappNumber: config.whatsappNumber || ""
    };

    function syncPreviews() {
      if (logoPreview) logoPreview.src = resolveAdminImage(current.logo);
      if (heroBgPreview) heroBgPreview.src = resolveAdminImage(current.heroBackground);
      if (heroPanelBgPreview) heroPanelBgPreview.src = resolveAdminImage(current.heroPanelBackground);
      if (whatsappInput) whatsappInput.value = current.whatsappNumber || "";
      applyAdminBranding();
    }

    syncPreviews();

    if (logoInput) {
      logoInput.addEventListener("change", function () {
        var file = logoInput.files[0];
        if (!file) return;
        readImageAsset(file, 900, 0.92).then(function (image) {
          current.logo = image;
          syncPreviews();
        }).catch(function () {
          showFeedback(feedback, "error", "Não foi possível ler a logo selecionada.");
        });
      });
    }

    if (heroBgInput) {
      heroBgInput.addEventListener("change", function () {
        var file = heroBgInput.files[0];
        if (!file) return;
        readImageAsset(file, 1600, 0.84).then(function (image) {
          current.heroBackground = image;
          syncPreviews();
        }).catch(function () {
          showFeedback(feedback, "error", "Não foi possível ler a imagem de fundo da hero.");
        });
      });
    }

    if (heroPanelBgInput) {
      heroPanelBgInput.addEventListener("change", function () {
        var file = heroPanelBgInput.files[0];
        if (!file) return;
        readImageAsset(file, 1400, 0.84).then(function (image) {
          current.heroPanelBackground = image;
          syncPreviews();
        }).catch(function () {
          showFeedback(feedback, "error", "Não foi possível ler a imagem do painel da hero.");
        });
      });
    }

    if (whatsappInput) {
      whatsappInput.addEventListener("input", function () {
        current.whatsappNumber = whatsappInput.value.trim();
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      store.saveSiteConfig(current);
      applyAdminBranding();
      showFeedback(feedback, "success", "Aparência salva. A home e o portfólio já passam a usar a nova configuração neste navegador.");
    });

    if (resetAppearance) {
      resetAppearance.addEventListener("click", function () {
        if (!window.confirm("Restaurar a aparência padrão do site?")) return;
        current = Object.assign({}, window.TCM_INITIAL_STATE.siteConfig || {});
        store.saveSiteConfig(current);
        if (logoInput) logoInput.value = "";
        if (heroBgInput) heroBgInput.value = "";
        if (heroPanelBgInput) heroPanelBgInput.value = "";
        if (whatsappInput) whatsappInput.value = "";
        syncPreviews();
        showFeedback(feedback, "success", "Aparência padrão restaurada.");
      });
    }
  }

  function renderDashboard() {
    var projectsContainer = document.querySelector("#dashboard-projects");
    if (!projectsContainer) return;
    if (!requireAuth()) return;

    bindLogout();
    applyAdminBranding();

    var feedback = document.querySelector("#dashboard-feedback");
    var stats = document.querySelector("#dashboard-stats");
    var leadsContainer = document.querySelector("#dashboard-leads");
    var items = store.getPortfolio(true);
    var leads = store.getLeads();
    var publishedItems = items.filter(function (item) { return Boolean(item.published); });
    var featuredItems = items.filter(function (item) { return Boolean(item.featured); });

    if (stats) {
      stats.innerHTML = '' +
        '<article class="admin-stat"><strong>' + items.length + '</strong><span>Projetos cadastrados</span></article>' +
        '<article class="admin-stat"><strong>' + publishedItems.length + '</strong><span>Projetos publicados</span></article>' +
        '<article class="admin-stat"><strong>' + featuredItems.length + '</strong><span>Destaques ativos</span></article>' +
        '<article class="admin-stat"><strong>' + leads.length + '</strong><span>Leads recebidos</span></article>';
    }

    if (!items.length) {
      projectsContainer.innerHTML = '<div class="empty-state"><p>Nenhum projeto cadastrado ainda.</p><a class="btn-site" href="portfolio-form.html">Cadastrar projeto</a></div>';
    } else {
      projectsContainer.innerHTML = items.map(function (item) {
        return '' +
          '<article class="project-row">' +
          '  <div class="project-thumb"><img src="' + resolveAdminImage(item.image) + '" alt="' + item.title + '"></div>' +
          '  <div class="project-copy">' +
          '    <h3>' + item.title + '</h3>' +
          '    <p>' + item.summary + '</p>' +
          '    <small class="meta-muted">' + item.category + (item.location ? ' • ' + item.location : '') + ' • ' + formatDate(item.publishedAt) + '</small>' +
          '  </div>' +
          '  <div class="project-meta">' +
          '    <div class="status-stack">' +
          '      <span class="status-pill ' + (item.published ? 'published' : 'draft') + '">' + (item.published ? 'Publicado' : 'Rascunho') + '</span>' +
          (item.featured ? '<span class="status-pill featured">Destaque</span>' : '') +
          '    </div>' +
          '    <a class="btn-text-link" href="../portfolio.html?slug=' + encodeURIComponent(item.slug) + '" target="_blank" rel="noopener">Ver no site <i class="fa-light fa-arrow-right"></i></a>' +
          '  </div>' +
          '  <div class="project-actions">' +
          '    <a class="btn-action" href="portfolio-form.html?id=' + encodeURIComponent(item.id) + '">Editar</a>' +
          '    <button class="btn-action danger" data-delete-id="' + item.id + '">Excluir</button>' +
          '  </div>' +
          '</article>';
      }).join("");
    }

    if (!leads.length) {
      leadsContainer.innerHTML = '<div class="empty-state"><p>Ainda não há solicitações registradas.</p></div>';
    } else {
      leadsContainer.innerHTML = leads.slice(0, 6).map(function (lead) {
        return '' +
          '<article class="lead-item">' +
          '  <strong>' + lead.name + '</strong>' +
          '  <small>' + (lead.company || 'Sem empresa') + ' • ' + formatDate(lead.createdAt) + '</small>' +
          '  <p style="margin: 0 0 0.6rem;">' + lead.message + '</p>' +
          '  <small>' + lead.email + (lead.phone ? ' • ' + lead.phone : '') + '</small>' +
          '</article>';
      }).join("");
    }

    projectsContainer.onclick = function (event) {
      var deleteId = event.target.getAttribute("data-delete-id");
      if (!deleteId) return;
      if (!window.confirm("Excluir este projeto?")) return;
      store.deletePortfolio(deleteId);
      showFeedback(feedback, "success", "Projeto excluído com sucesso.");
      renderDashboard();
    };

    var exportButton = document.querySelector("#export-data");
    var importInput = document.querySelector("#import-data");
    var resetButton = document.querySelector("#reset-demo");

    if (exportButton) {
      exportButton.onclick = function () {
        var blob = new Blob([JSON.stringify(store.exportState(), null, 2)], { type: "application/json" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "tcm-dados.json";
        link.click();
        URL.revokeObjectURL(link.href);
      };
    }

    if (importInput) {
      importInput.onchange = function () {
        var file = importInput.files[0];
        if (!file) return;
        file.text().then(function (content) {
          var parsed = JSON.parse(content);
          store.replaceState(parsed);
          showFeedback(feedback, "success", "Dados importados com sucesso.");
          window.setTimeout(function () { window.location.reload(); }, 400);
        }).catch(function () {
          showFeedback(feedback, "error", "Não foi possível importar o arquivo informado.");
        });
      };
    }

    if (resetButton) {
      resetButton.onclick = function () {
        if (!window.confirm("Restaurar os dados de demonstração?")) return;
        store.resetDemoData();
        showFeedback(feedback, "success", "Dados demo restaurados.");
        window.setTimeout(function () { window.location.reload(); }, 400);
      };
    }

    renderAppearanceSettings(feedback);
  }

  function renderForm() {
    var form = document.querySelector("#portfolio-form");
    if (!form) return;
    if (!requireAuth()) return;

    bindLogout();
    applyAdminBranding();

    var id = getQueryParam("id");
    var editingItem = id ? store.getPortfolioById(id) : null;
    var title = document.querySelector("#form-page-title");
    var subtitle = document.querySelector("#form-page-subtitle");
    var preview = document.querySelector("#project-preview");
    var feedback = document.querySelector("#form-feedback");
    var submitButton = document.querySelector("#form-submit");
    var currentImage = editingItem ? editingItem.image : "assets/images/tcm/placeholder-project.svg";

    if (editingItem) {
      title.textContent = "Editar projeto";
      subtitle.textContent = "Atualize o case e publique a nova versão na landing page.";
      submitButton.textContent = "Salvar alterações";
      form.querySelector("[name='id']").value = editingItem.id;
      form.querySelector("[name='title']").value = editingItem.title;
      form.querySelector("[name='category']").value = editingItem.category;
      form.querySelector("[name='location']").value = editingItem.location || "";
      form.querySelector("[name='summary']").value = editingItem.summary;
      form.querySelector("[name='description']").value = editingItem.description;
      form.querySelector("[name='publishedAt']").value = editingItem.publishedAt;
      form.querySelector("[name='published']").checked = Boolean(editingItem.published);
      form.querySelector("[name='featured']").checked = Boolean(editingItem.featured);
      preview.src = resolveAdminImage(editingItem.image);
    } else {
      preview.src = "../assets/images/tcm/placeholder-project.svg";
      form.querySelector("[name='publishedAt']").value = new Date().toISOString().slice(0, 10);
    }

    var fileInput = document.querySelector("#image-file");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var file = fileInput.files[0];
        if (!file) return;
        readImageAsset(file).then(function (image) {
          preview.src = image;
          currentImage = image;
          syncJsonFromForm();
        });
      });
    }

    var jsonTextarea = document.querySelector("#project-json");
    var jsonFileInput = document.querySelector("#project-json-file");
    var applyJsonButton = document.querySelector("#apply-project-json");
    var exportJsonButton = document.querySelector("#export-project-json");

    function buildPayloadFromForm() {
      return {
        id: form.querySelector("[name='id']").value.trim(),
        title: form.querySelector("[name='title']").value.trim(),
        category: form.querySelector("[name='category']").value.trim(),
        location: form.querySelector("[name='location']").value.trim(),
        summary: form.querySelector("[name='summary']").value.trim(),
        description: form.querySelector("[name='description']").value.trim(),
        publishedAt: form.querySelector("[name='publishedAt']").value,
        published: form.querySelector("[name='published']").checked,
        featured: form.querySelector("[name='featured']").checked,
        image: currentImage || "assets/images/tcm/placeholder-project.svg"
      };
    }

    function syncJsonFromForm() {
      if (!jsonTextarea) return;
      jsonTextarea.value = JSON.stringify(buildPayloadFromForm(), null, 2);
    }

    function applyJsonPayload(payload) {
      if (!payload || typeof payload !== "object") {
        throw new Error("JSON inválido");
      }
      form.querySelector("[name='id']").value = String(payload.id || form.querySelector("[name='id']").value || "");
      form.querySelector("[name='title']").value = String(payload.title || "");
      form.querySelector("[name='category']").value = String(payload.category || "");
      form.querySelector("[name='location']").value = String(payload.location || "");
      form.querySelector("[name='summary']").value = String(payload.summary || "");
      form.querySelector("[name='description']").value = String(payload.description || "");
      form.querySelector("[name='publishedAt']").value = String(payload.publishedAt || new Date().toISOString().slice(0, 10));
      form.querySelector("[name='published']").checked = Boolean(payload.published);
      form.querySelector("[name='featured']").checked = Boolean(payload.featured);
      currentImage = String(payload.image || currentImage || "assets/images/tcm/placeholder-project.svg");
      preview.src = resolveAdminImage(currentImage);
      syncJsonFromForm();
    }

    if (jsonFileInput) {
      jsonFileInput.addEventListener("change", function () {
        var file = jsonFileInput.files[0];
        if (!file) return;
        file.text().then(function (content) {
          if (jsonTextarea) jsonTextarea.value = content;
          var parsed = JSON.parse(content);
          applyJsonPayload(parsed);
          showFeedback(feedback, "success", "JSON carregado e aplicado ao formulário.");
        }).catch(function () {
          showFeedback(feedback, "error", "Não foi possível ler o JSON informado.");
        });
      });
    }

    if (applyJsonButton) {
      applyJsonButton.addEventListener("click", function () {
        try {
          var parsed = JSON.parse((jsonTextarea && jsonTextarea.value) || "{}");
          applyJsonPayload(parsed);
          showFeedback(feedback, "success", "JSON aplicado ao formulário.");
        } catch (error) {
          showFeedback(feedback, "error", "JSON inválido. Revise a estrutura antes de aplicar.");
        }
      });
    }

    if (exportJsonButton) {
      exportJsonButton.addEventListener("click", function () {
        syncJsonFromForm();
        showFeedback(feedback, "success", "JSON do projeto gerado no campo abaixo.");
      });
    }

    form.addEventListener("input", syncJsonFromForm);
    form.addEventListener("change", syncJsonFromForm);
    syncJsonFromForm();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var payload = {
        id: form.querySelector("[name='id']").value.trim(),
        title: form.querySelector("[name='title']").value.trim(),
        category: form.querySelector("[name='category']").value.trim(),
        location: form.querySelector("[name='location']").value.trim(),
        summary: form.querySelector("[name='summary']").value.trim(),
        description: form.querySelector("[name='description']").value.trim(),
        publishedAt: form.querySelector("[name='publishedAt']").value,
        published: form.querySelector("[name='published']").checked,
        featured: form.querySelector("[name='featured']").checked,
        image: currentImage
      };

      if (payload.title.length < 4 || payload.category.length < 2 || payload.summary.length < 20 || payload.description.length < 40) {
        showFeedback(feedback, "error", "Revise título, categoria, resumo e descrição antes de salvar.");
        return;
      }

      if (!payload.image) {
        payload.image = "assets/images/tcm/placeholder-project.svg";
      }

      store.upsertPortfolio(payload);
      showFeedback(feedback, "success", "Projeto salvo com sucesso.");
      window.setTimeout(function () {
        window.location.href = "dashboard.html";
      }, 500);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    store.seedIfNeeded();
    applyAdminBranding();
    renderLogin();
    renderDashboard();
    renderForm();

    var params = new URLSearchParams(window.location.search);
    if (params.get("logout") === "1") {
      var loginFeedback = document.querySelector("#login-feedback");
      showFeedback(loginFeedback, "success", "Sessão encerrada com sucesso.");
    }
  });
})(window, document);
