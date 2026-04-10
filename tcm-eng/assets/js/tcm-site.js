(function (window, document) {
  var store = window.TCMStore;

  function formatDate(value) {
    if (!value) return "Sem data";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function renderYear() {
    var year = document.querySelector("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function resolveSiteAsset(value) {
    if (!value) return "";
    var normalized = String(value);
    if (normalized.indexOf("data:") === 0 || normalized.indexOf("http") === 0) return normalized;
    return normalized;
  }

  function sanitizeWhatsAppNumber(value) {
    return String(value || "").replace(/\D+/g, "");
  }

  function buildWhatsAppUrl(number) {
    var digits = sanitizeWhatsAppNumber(number);
    if (!digits) return "";
    return "https://wa.me/" + digits;
  }

  function applySiteAppearance() {
    var config = typeof store.getSiteConfig === "function" ? store.getSiteConfig() : null;
    if (!config) return;

    var defaultLogo = "assets/images/logo/agencia-jvv-header.png";
    var logoAsset = resolveSiteAsset(config.logo || defaultLogo);
    if (logoAsset.indexOf("data:image/jpeg") === 0) {
      logoAsset = defaultLogo;
    }

    document.querySelectorAll("[data-site-logo]").forEach(function (image) {
      image.src = logoAsset;
      image.onerror = function () {
        image.src = defaultLogo;
      };
    });

    var hero = document.querySelector("[data-hero-background]");
    if (hero && config.heroBackground) {
      hero.style.setProperty("--tcm-hero-bg-image", 'url("' + resolveSiteAsset(config.heroBackground) + '")');
    }

    var panel = document.querySelector("[data-hero-panel-background]");
    if (panel && config.heroPanelBackground) {
      panel.style.setProperty("--tcm-hero-panel-bg-image", 'url("' + resolveSiteAsset(config.heroPanelBackground) + '")');
    }

    var whatsappUrl = buildWhatsAppUrl(config.whatsappNumber);
    document.querySelectorAll("[data-whatsapp-link]").forEach(function (link) {
      if (!whatsappUrl) {
        link.setAttribute("href", "#contact");
        link.setAttribute("aria-disabled", "true");
        link.classList.add("is-disabled");
        return;
      }
      link.setAttribute("href", whatsappUrl);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
      link.removeAttribute("aria-disabled");
      link.classList.remove("is-disabled");
    });
  }

  function renderHomePortfolio() {
    var container = document.querySelector("#portfolio-grid");
    if (!container) return;

    var items = store.getPortfolio(false).slice(0, 6);
    var countEl = document.querySelector("[data-portfolio-count]");
    var categoryEl = document.querySelector("[data-category-count]");

    if (countEl) countEl.textContent = String(items.length || 0);
    if (categoryEl) {
      var categories = {};
      store.getPortfolio(false).forEach(function (item) {
        categories[item.category] = true;
      });
      categoryEl.textContent = String(Object.keys(categories).length || 0);
    }

    if (!items.length) {
      container.innerHTML = '<div class="col-12"><div class="tcm-portfolio-empty">Solicite o portfólio técnico completo para receber escopos, referências e linhas de atuação da TCM Engenharia Elétrica.</div></div>';
      return;
    }

    container.innerHTML = items.map(function (item, index) {
      return '' +
        '<div class="col-lg-6 col-md-6 tmp-scroll-trigger tmp-fade-in animation-order-' + ((index % 4) + 1) + '">' +
        '  <div class="portfolio-style-3 tcm-portfolio-card">' +
        '    <div class="thumbnail mb-30">' +
        '      <a href="portfolio.html?slug=' + encodeURIComponent(item.slug) + '">' +
        '        <img src="' + item.image + '" alt="' + item.title + '">' +
        '      </a>' +
        '    </div>' +
        '    <div class="content">' +
        '      <div class="tcm-card-meta">' +
        '        <span class="tmp-card-cat">' + item.category + '</span>' +
        (item.location ? '<span class="tmp-card-cat tcm-card-cat-muted">' + item.location + '</span>' : '') +
        '      </div>' +
        '      <h3 class="h4 tmp-card-title mb-3">' +
        '        <a class="invers-hover-link" href="portfolio.html?slug=' + encodeURIComponent(item.slug) + '">' + item.title + ' <i class="fa-light fa-arrow-up-right"></i></a>' +
        '      </h3>' +
        '      <p class="tcm-card-summary">' + item.summary + '</p>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    }).join("");
  }

  function renderPortfolioPage() {
    var listWrap = document.querySelector("#portfolio-list-view");
    if (!listWrap) return;

    var slug = getQueryParam("slug");
    var allItems = store.getPortfolio(false);
    var listGrid = document.querySelector("#portfolio-list-grid");
    var detailWrap = document.querySelector("#portfolio-detail-view");

    if (!slug) {
      listWrap.hidden = false;
      if (detailWrap) detailWrap.hidden = true;

      if (!allItems.length) {
        listGrid.innerHTML = '<div class="col-12"><div class="tcm-portfolio-empty">Nenhum projeto publicado ainda.</div></div>';
        return;
      }

      listGrid.innerHTML = allItems.map(function (item, index) {
        return '' +
          '<div class="col-lg-6 col-md-6 tmp-scroll-trigger tmp-fade-in animation-order-' + ((index % 4) + 1) + '">' +
          '  <div class="portfolio-style-3 tcm-portfolio-card">' +
          '    <div class="thumbnail mb-30">' +
          '      <a href="portfolio.html?slug=' + encodeURIComponent(item.slug) + '">' +
          '        <img src="' + item.image + '" alt="' + item.title + '">' +
          '      </a>' +
          '    </div>' +
          '    <div class="content">' +
          '      <div class="tcm-card-meta">' +
          '        <span class="tmp-card-cat">' + item.category + '</span>' +
          (item.location ? '<span class="tmp-card-cat tcm-card-cat-muted">' + item.location + '</span>' : '') +
          '      </div>' +
          '      <h3 class="h4 tmp-card-title mb-3"><a class="invers-hover-link" href="portfolio.html?slug=' + encodeURIComponent(item.slug) + '">' + item.title + ' <i class="fa-light fa-arrow-up-right"></i></a></h3>' +
          '      <p class="tcm-card-summary">' + item.summary + '</p>' +
          '    </div>' +
          '  </div>' +
          '</div>';
      }).join("");
      return;
    }

    var item = store.getPortfolioBySlug(slug);
    listWrap.hidden = true;
    if (detailWrap) detailWrap.hidden = false;

    if (!item) {
      if (detailWrap) {
        detailWrap.innerHTML = '<div class="container"><div class="tcm-static-detail"><h2>Projeto não encontrado</h2><p>O case solicitado não está publicado ou o link não existe mais.</p><a class="tmp-btn btn-border radius-round" href="portfolio.html"><span class="btn-text">Voltar ao portfólio</span></a></div></div>';
      }
      return;
    }

    document.title = item.title + " | TCM Engenharia Elétrica";
    var meta = document.querySelector("#portfolio-detail-meta");
    var title = document.querySelector("#portfolio-detail-title");
    var summary = document.querySelector("#portfolio-detail-summary");
    var image = document.querySelector("#portfolio-detail-image");
    var body = document.querySelector("#portfolio-detail-body");
    var related = document.querySelector("#portfolio-related-grid");

    if (meta) {
      meta.innerHTML = '<span class="tmp-card-cat">' + item.category + '</span>' +
        (item.location ? '<span class="tmp-card-cat tcm-card-cat-muted">' + item.location + '</span>' : '') +
        '<span class="tmp-card-cat tcm-card-cat-muted">' + formatDate(item.publishedAt) + '</span>';
    }
    if (title) title.textContent = item.title;
    if (summary) summary.textContent = item.summary;
    if (image) image.src = item.image;
    if (body) {
      body.innerHTML = item.description.split(/\n\n+/).map(function (paragraph) {
        return '<p>' + paragraph.replace(/\n/g, "<br>") + '</p>';
      }).join("");
    }

    if (related) {
      var relatedItems = allItems.filter(function (entry) {
        return entry.slug !== item.slug;
      }).slice(0, 3);

      related.innerHTML = relatedItems.map(function (entry, index) {
        return '' +
          '<div class="col-lg-4 col-md-6 tmp-scroll-trigger tmp-fade-in animation-order-' + ((index % 3) + 1) + '">' +
          '  <div class="portfolio-style-3 tcm-portfolio-card">' +
          '    <div class="thumbnail mb-30"><a href="portfolio.html?slug=' + encodeURIComponent(entry.slug) + '"><img src="' + entry.image + '" alt="' + entry.title + '"></a></div>' +
          '    <div class="content">' +
          '      <span class="tmp-card-cat">' + entry.category + '</span>' +
          '      <h3 class="h5 tmp-card-title mb-3"><a class="invers-hover-link" href="portfolio.html?slug=' + encodeURIComponent(entry.slug) + '">' + entry.title + ' <i class="fa-light fa-arrow-up-right"></i></a></h3>' +
          '    </div>' +
          '  </div>' +
          '</div>';
      }).join("");
    }
  }



  function initMobileSectionScroll() {
    var mobileQuery = window.matchMedia("(max-width: 1199px)");
    var links = document.querySelectorAll(".tmp-popup-mobile-menu a[href*='#']");
    if (!links.length) return;

    function normalizePage(value) {
      if (!value || value === "/") return "";
      var clean = value.split("?")[0].split("#")[0];
      return clean.substring(clean.lastIndexOf("/") + 1).toLowerCase();
    }

    function closeMobileMenu() {
      var popup = document.querySelector(".tmp-popup-mobile-menu");
      if (popup) popup.classList.remove("active");
      document.documentElement.style.overflow = "";
    }

    function scrollToSection(hash) {
      var header = document.querySelector(".tmp-header");
      var headerHeight = header ? header.offsetHeight : 0;
      if (hash === "#top" || hash === "#home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        return;
      }
      var target = document.querySelector(hash);
      if (!target) return;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", hash);
      }
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (!mobileQuery.matches) return;

        var href = link.getAttribute("href") || "";
        var hashIndex = href.indexOf("#");
        if (hashIndex === -1) return;

        var hash = href.substring(hashIndex);
        if (!hash || hash === "#") return;

        var page = normalizePage(href.substring(0, hashIndex));
        var current = normalizePage(window.location.pathname);
        var sameTechnicianPage = (!page && (["", "index.html", "technician.html"].indexOf(current) !== -1)) || ((["technician.html", "index.html"].indexOf(page) !== -1) && (["", "index.html", "technician.html"].indexOf(current) !== -1));
        if (!sameTechnicianPage) return;

        var target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();
        closeMobileMenu();
        window.setTimeout(function () {
          scrollToSection(hash);
        }, 80);
      });
    });
  }


  function initSamePageAnchorScroll() {
    var links = document.querySelectorAll("a[href^='#']");
    if (!links.length) return;

    function scrollToHash(hash) {
      if (!hash || hash === "#") return;
      if (hash === "#top" || hash === "#home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        return;
      }
      var target = document.querySelector(hash);
      if (!target) return;
      var header = document.querySelector(".tmp-header");
      var headerHeight = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 18;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", hash);
      }
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var href = link.getAttribute("href") || "";
        if (!href || href === "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        scrollToHash(href);
      });
    });

    if (window.location.hash && document.querySelector(window.location.hash)) {
      window.setTimeout(function () {
        scrollToHash(window.location.hash);
      }, 80);
    }
  }

  function initHeaderMotion() {
    var header = document.querySelector(".tmp-header--technician");
    if (!header) return;

    function updateHeader() {
      var y = window.scrollY || window.pageYOffset || 0;
      if (y > 10) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);
  }

  function initFloatingActions() {
    var scrollButton = document.querySelector("[data-scroll-top]");
    var whatsappLink = document.querySelector("[data-whatsapp-link]");
    if (!scrollButton && !whatsappLink) return;

    function updateProgress() {
      var scrollTop = window.scrollY || window.pageYOffset || 0;
      var total = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      var progress = Math.min(Math.max((scrollTop / total) * 100, 0), 100);
      document.documentElement.style.setProperty("--tcm-scroll-progress", progress.toFixed(2) + "%");
      if (scrollButton) {
        scrollButton.classList.toggle("is-visible", scrollTop > 80);
      }
    }

    if (scrollButton) {
      scrollButton.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  function renderContactForm() {
    var form = document.querySelector("#contact-form");
    var feedback = document.querySelector("#contact-feedback");
    if (!form || !feedback) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var payload = {
        name: form.querySelector("[name='name']").value.trim(),
        company: form.querySelector("[name='company']").value.trim(),
        email: form.querySelector("[name='email']").value.trim(),
        phone: form.querySelector("[name='phone']").value.trim(),
        message: form.querySelector("[name='message']").value.trim()
      };

      if (payload.name.length < 3 || !payload.email || payload.message.length < 20) {
        feedback.className = "tcm-form-feedback tcm-form-feedback--error";
        feedback.textContent = "Preencha nome, e-mail e um escopo com pelo menos 20 caracteres.";
        return;
      }

      store.saveLead(payload);
      feedback.className = "tcm-form-feedback tcm-form-feedback--success";
      feedback.textContent = "Solicitação enviada com sucesso. Nossa equipe entrará em contato para alinhar o escopo do atendimento.";
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    store.seedIfNeeded();
    applySiteAppearance();
    renderYear();
    renderHomePortfolio();
    renderPortfolioPage();
    renderContactForm();
    initMobileSectionScroll();
    initSamePageAnchorScroll();
    initHeaderMotion();
    initFloatingActions();
  });
})(window, document);
