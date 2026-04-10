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
      container.innerHTML = '<div class="col-12"><div class="tcm-portfolio-empty">Nenhum case publicado ainda. Acesse o dashboard estático e publique os primeiros projetos.</div></div>';
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
      feedback.textContent = "Solicitação registrada. Ela já aparece no dashboard deste navegador.";
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    store.seedIfNeeded();
    renderYear();
    renderHomePortfolio();
    renderPortfolioPage();
    renderContactForm();
  });
})(window, document);
