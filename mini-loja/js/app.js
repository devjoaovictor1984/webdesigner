// ===============================
// MINI LOJA - HAMBURGUERIA CURSODOLIVRO
//
// Projeto pensado para aula do canal CursoDoLivro.
// Conceitos principais que você pode explicar:
// - Array de OBJETOS para representar o cardápio (products)
// - Array de OBJETOS para representar o carrinho (cart)
// - Funções puras para cálculo (totais, cupom, etc.)
// - Manipulação do DOM (querySelector, innerHTML, textContent)
// - Eventos (addEventListener, delegação de eventos)
// - Envio de pedido formatado para o WhatsApp usando encodeURIComponent()
// - Estilo do livro do Jon Duckett: var + function (sem arrow function)
// ===============================


// ----------------------------------
// 1. DADOS DO CARDÁPIO (ARRAY DE OBJETOS)
// ----------------------------------
// Aqui simulamos um "banco de dados" de produtos apenas no front-end.
// Cada produto é um OBJETO com algumas propriedades.
// Todos os produtos juntos formam o ARRAY "products".

var products = [
  {
    id: 1, // identificador único do produto
    name: "Classic CursoDoLivro", // nome que aparece na tela
    description:
      "Pão brioche, carne 150g, queijo prato, alface, tomate e maionese da casa.", // descrição curta
    price: 24.9, // preço em número (sem formatação de moeda)
    category: "burger", // categoria (usada para filtrar no menu)
    emoji: "🍔", // emoji para ilustrar o produto
    calories: "720 kcal", // informação extra (opcional)
    tag: "Mais pedido" // "selo" que aparece no card
  },
  {
    id: 2,
    name: "Cheddar Bacon Smash",
    description:
      "Dois smash burgers 80g, cheddar cremoso, bacon crocante e cebola crispy.",
    price: 29.9,
    category: "burger",
    emoji: "🥓",
    calories: "890 kcal",
    tag: "Cheddar Lovers"
  },
  {
    id: 3,
    name: "Combo CursoDoLivro",
    description:
      "Classic CursoDoLivro + fritas média + refri lata. Perfeito para acompanhar as aulas.",
    price: 39.9,
    category: "combo",
    emoji: "📘",
    calories: "1100 kcal",
    tag: "Combo especial"
  },
  {
    id: 4,
    name: "Batata Trufada",
    description:
      "Fritas crocantes com maionese trufada e parmesão ralado na hora.",
    price: 18.9,
    category: "dessert", // aqui usamos "dessert" só para ter uma categoria diferente
    emoji: "🍟",
    calories: "540 kcal",
    tag: "Acompanhamento"
  },
  {
    id: 5,
    name: "Refrigerante Lata",
    description: "Coca, Guaraná ou Sprite — 350ml bem gelado.",
    price: 7.5,
    category: "drinks",
    emoji: "🥤",
    calories: "150 kcal",
    tag: "Bebida"
  },
  {
    id: 6,
    name: "Milkshake Caramelo",
    description: "Milkshake cremoso de caramelo com toque de flor de sal.",
    price: 19.9,
    category: "dessert",
    emoji: "🍨",
    calories: "620 kcal",
    tag: "Sobremesa"
  }
];


// ----------------------------------
// 2. ESTADO DO CARRINHO E DO CUPOM
// ----------------------------------
// O carrinho também é um array de objetos, mas com menos informações:
// - productId (id do produto)
// - name
// - price
// - quantity (quantidade escolhida pelo cliente)

var cart = [];

// Objeto simples para guardar o estado do cupom aplicado
var couponState = {
  code: null,         // código do cupom (ex: "JVV10")
  discountPercent: 0  // porcentagem de desconto (ex: 10)
};

// Número de WhatsApp para onde o pedido será enviado
// Formato: 55 + DDD + número (sem espaços, traços, etc.)
var WHATSAPP_NUMBER = "5565996335509";


// ----------------------------------
// 3. SELEÇÃO DE ELEMENTOS DA INTERFACE (DOM)
// ----------------------------------
// Aqui pegamos e guardamos em variáveis os elementos HTML que vamos
// manipular com o JavaScript ao longo do código.

// MENU
var productsListEl = document.querySelector("#products-list");      // container onde os cards de produtos serão inseridos
var filterButtons = document.querySelectorAll(".filter-button");   // botões de filtro por categoria

// ADMIN (modo professor)
var adminToggleButton = document.querySelector("#toggle-admin");        // botão que mostra/esconde o formulário de novo produto
var adminForm = document.querySelector("#admin-form");                 // formulário de novo produto
var adminNameInput = document.querySelector("#admin-name");            // campo: nome do produto
var adminDescriptionInput = document.querySelector("#admin-description"); // campo: descrição
var adminPriceInput = document.querySelector("#admin-price");          // campo: preço
var adminCategorySelect = document.querySelector("#admin-category");   // campo: categoria

// CARRINHO
var cartItemsEl = document.querySelector("#cart-items");               // lista de itens do carrinho
var cartEmptyMessageEl = document.querySelector("#cart-empty");        // mensagem quando o carrinho estiver vazio
var cartSubtotalEl = document.querySelector("#cart-subtotal");         // span do subtotal
var cartDiscountEl = document.querySelector("#cart-discount");         // span do desconto
var cartTotalEl = document.querySelector("#cart-total");               // span do total
var couponInputEl = document.querySelector("#coupon-input");           // input do cupom
var applyCouponButton = document.querySelector("#apply-coupon");       // botão de aplicar cupom
var couponMessageEl = document.querySelector("#coupon-message");       // texto de feedback do cupom
var couponLabelEl = document.querySelector("#cart-coupon-label");      // texto que mostra o cupom aplicado no resumo
var orderNotesEl = document.querySelector("#order-notes");             // textarea de observações
var clearCartButton = document.querySelector("#clear-cart");           // botão de limpar carrinho
var checkoutWhatsappButton = document.querySelector("#checkout-whatsapp"); // botão de finalizar no WhatsApp


// ----------------------------------
// 4. FUNÇÕES DE FORMATAÇÃO E UTILITÁRIAS
// ----------------------------------

// Função para formatar um número em formato de moeda (Real - BRL)
// Exemplo: 24.9 -> "R$ 24,90"
function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency", // diz que o formato será de moeda
    currency: "BRL"    // define a moeda como Real brasileiro
  });
}

// Gera o próximo ID para um novo produto.
// Ele percorre o array "products" e encontra o maior id atual.
// Em seguida, retorna esse valor + 1.
function getNextProductId() {
  var maxId = 0; // começa assumindo que o maior id é 0
  var i;

  // percorre todos os produtos
  for (i = 0; i < products.length; i++) {
    // se o id do produto atual for maior que maxId, atualiza maxId
    if (products[i].id > maxId) {
      maxId = products[i].id;
    }
  }

  // o próximo id disponível é o maior id encontrado + 1
  return maxId + 1;
}

// Procura um produto pelo ID dentro do array "products".
// Se encontrar, retorna o objeto produto. Se não, retorna undefined.
function findProductById(id) {
  var i;

  for (i = 0; i < products.length; i++) {
    if (products[i].id === id) {
      return products[i];
    }
  }

  return undefined;
}


// ----------------------------------
// 5. RENDERIZAÇÃO DO CARDÁPIO
// ----------------------------------
// Esta função é responsável por desenhar (renderizar) os produtos na tela.
// Ela recebe uma categoria (ou "all") e monta o HTML dos cards.

function renderProducts(category) {
  // Se nenhuma categoria for passada, usamos "all"
  if (!category) {
    category = "all";
  }

  var filteredProducts;
  var i;
  var product;
  var html = ""; // string que vai acumular o HTML dos produtos

  // Se a categoria for "all", usamos todos os produtos.
  // Caso contrário, filtramos pela categoria.
  if (category === "all") {
    filteredProducts = products;
  } else {
    // Usamos o método filter para criar um novo array com apenas os produtos da categoria desejada.
    filteredProducts = products.filter(function (p) {
      return p.category === category;
    });
  }

  // Se após o filtro não sobrar nenhum produto, mostramos uma mensagem.
  if (filteredProducts.length === 0) {
    productsListEl.innerHTML =
      '<p style="font-size: 13px; color: #a0a0b2;">Nenhum item disponível nesta categoria.</p>';
    return;
  }

  // Aqui montamos o HTML dos cards, um por um, em um loop.
  for (i = 0; i < filteredProducts.length; i++) {
    product = filteredProducts[i];

    html +=
      '<article class="product-card">' +
      '  <div class="product-card__top">' +
      '    <div class="product-card__info">' +
      // nome do produto
      '      <h3 class="product-card__name">' + product.name + "</h3>" +
      // descrição
      '      <p class="product-card__description">' +
      (product.description || "") +
      "</p>";

    // se o produto tiver uma tag (como "Mais pedido"), adicionamos o selo
    if (product.tag) {
      html +=
        '      <span class="product-card__tag">🔥 ' +
        product.tag +
        "</span>";
    }

    // preço formatado como moeda
    html +=
      '      <p class="product-card__price">' +
      formatCurrency(product.price) +
      "</p>" +
      "    </div>" +
      // área do emoji/imagem do produto
      '    <div class="product-card__image">' +
      "      <span>" +
      (product.emoji || "🍔") +
      "</span>" +
      "    </div>" +
      "  </div>" +
      // parte de baixo do card (calorias + botão de adicionar)
      '  <div class="product-card__actions">' +
      '    <span class="product-card__calories">' +
      (product.calories || "") +
      "</span>" +
      // botão de adicionar ao carrinho, com data-id para saber qual produto foi clicado
      '    <button class="btn btn--primary btn-add-to-cart" data-id="' +
      product.id +
      '">' +
      "      Adicionar" +
      "    </button>" +
      "  </div>" +
      "</article>";
  }

  // Depois de montar a string inteira, jogamos no HTML.
  productsListEl.innerHTML = html;
}


// ----------------------------------
// 6. FUNÇÕES DO CARRINHO
// ----------------------------------
// Toda a lógica para adicionar, atualizar, remover e exibir itens do carrinho.

// Adiciona um produto ao carrinho.
// Se o produto já existir no carrinho, apenas aumenta a quantidade.
// Se não existir, cria um novo item no array "cart".
function addToCart(productId) {
  var product = findProductById(productId); // busca o produto original
  var existingItem;
  var i;

  // se não encontrar o produto (id inválido), sai da função
  if (!product) {
    return;
  }

  // verifica se o produto já está no carrinho
  for (i = 0; i < cart.length; i++) {
    if (cart[i].productId === productId) {
      existingItem = cart[i];
      break;
    }
  }

  if (existingItem) {
    // se já existir, aumenta a quantidade
    existingItem.quantity += 1;
  } else {
    // se não existir, adiciona um novo objeto ao array cart
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  // depois de alterar o carrinho, atualiza a visualização
  renderCart();
}

// Atualiza a quantidade de um item no carrinho.
// Se a nova quantidade for menor ou igual a 0, remove o item.
function updateCartItemQuantity(productId, newQuantity) {
  var i;

  for (i = 0; i < cart.length; i++) {
    if (cart[i].productId === productId) {
      if (newQuantity <= 0) {
        // remove o item se a quantidade chegar a 0
        cart.splice(i, 1);
      } else {
        // só atualiza a quantidade
        cart[i].quantity = newQuantity;
      }
      break; // sai do loop assim que encontrar
    }
  }

  renderCart();
}

// Remove um item do carrinho independente da quantidade.
// Percorre de trás para frente para não dar problema ao usar splice.
function removeCartItem(productId) {
  var i;

  for (i = cart.length - 1; i >= 0; i--) {
    if (cart[i].productId === productId) {
      cart.splice(i, 1);
    }
  }

  renderCart();
}

// Limpa o carrinho inteiro.
function clearCart() {
  cart = [];
  renderCart();
}

// Calcula subtotal, desconto e total.
// Retorna um objeto com esses três valores.
function calculateCartTotals() {
  var subtotal = 0;
  var discount = 0;
  var total = 0;
  var i;

  // soma (preço * quantidade) de cada item do carrinho
  for (i = 0; i < cart.length; i++) {
    subtotal += cart[i].price * cart[i].quantity;
  }

  // calcula o valor do desconto com base na porcentagem
  discount = subtotal * (couponState.discountPercent / 100);
  total = subtotal - discount;

  // evita valor negativo
  if (total < 0) {
    total = 0;
  }

  // devolve tudo num objeto
  return {
    subtotal: subtotal,
    discount: discount,
    total: total
  };
}

// Desenha (renderiza) o carrinho na tela.
// Atualiza também os valores de subtotal, desconto e total.
function renderCart() {
  var html = "";
  var i;
  var item;
  var lineTotal;
  var totals = calculateCartTotals(); // pega subtotal, desconto e total calculados

  // Se o carrinho estiver vazio, mostra mensagem e limpa a lista visual.
  if (cart.length === 0) {
    cartItemsEl.innerHTML = "";
    cartEmptyMessageEl.style.display = "block";
  } else {
    cartEmptyMessageEl.style.display = "none";

    // monta HTML para cada item do carrinho
    for (i = 0; i < cart.length; i++) {
      item = cart[i];
      lineTotal = item.price * item.quantity; // total daquela linha (preço unitário * quantidade)

      html +=
        '<div class="cart-item">' +
        '  <div>' +
        '    <p class="cart-item__name">' +
        item.name +
        "</p>" +
        '    <p class="cart-item__price">' +
        item.quantity +
        "x " +
        formatCurrency(item.price) +
        "</p>" +
        "  </div>" +
        '  <div class="cart-item__controls">' +
        // botão de diminuir quantidade
        '    <button class="cart-item__btn" data-action="decrease" data-id="' +
        item.productId +
        '">-</button>' +
        // valor total daquela linha
        '    <span class="cart-item__total">' +
        formatCurrency(lineTotal) +
        "</span>" +
        // botão de aumentar quantidade
        '    <button class="cart-item__btn" data-action="increase" data-id="' +
        item.productId +
        '">+</button>' +
        // botão de remover item
        '    <button class="cart-item__btn" data-action="remove" data-id="' +
        item.productId +
        '" title="Remover item">🗑</button>' +
        "  </div>" +
        "</div>";
    }

    // insere os itens na div do carrinho
    cartItemsEl.innerHTML = html;
  }

  // Atualiza os valores de subtotal, desconto e total na interface
  cartSubtotalEl.textContent = formatCurrency(totals.subtotal);
  cartDiscountEl.textContent = "- " + formatCurrency(totals.discount);
  cartTotalEl.textContent = formatCurrency(totals.total);

  // Atualiza o rótulo do cupom na área de resumo
  if (couponState.code) {
    couponLabelEl.textContent =
      couponState.code + " (" + couponState.discountPercent + "%)";
  } else {
    couponLabelEl.textContent = "Nenhum cupom";
  }
}


// ----------------------------------
// 7. CUPOM DE DESCONTO
// ----------------------------------
// Lê o código digitado, verifica se é válido e aplica a porcentagem de desconto.

function applyCoupon() {
  var rawCode = couponInputEl.value.trim().toUpperCase(); // pega o texto, tira espaços e transforma em maiúsculas

  // limpa a mensagem anterior
  couponMessageEl.textContent = "";
  couponMessageEl.style.color = "#a0a0b2";

  // Se o usuário apagar o campo, removemos o cupom.
  if (!rawCode) {
    couponState.code = null;
    couponState.discountPercent = 0;
    couponMessageEl.textContent = "Cupom removido.";
    renderCart();
    return;
  }

  // Tabela simples de cupons válidos (poderia vir de um backend no futuro)
  var validCoupons = {
    JVV10: 10,
    LIVRO15: 15
  };

  // Se o cupom existir na tabela, aplicamos.
  if (validCoupons[rawCode]) {
    couponState.code = rawCode;
    couponState.discountPercent = validCoupons[rawCode];
    couponMessageEl.textContent =
      "Cupom " +
      rawCode +
      " aplicado: " +
      couponState.discountPercent +
      "% de desconto.";
    couponMessageEl.style.color = "#5ad68b"; // verde
  } else {
    // Caso contrário, consideramos cupom inválido.
    couponState.code = null;
    couponState.discountPercent = 0;
    couponMessageEl.textContent = "Cupom inválido ou expirado.";
    couponMessageEl.style.color = "#ff4b2b"; // vermelho
  }

  renderCart();
}


// ----------------------------------
// 8. FINALIZAR PEDIDO PELO WHATSAPP (COM EMOJIS)
// ----------------------------------
// Monta um texto com todos os itens do carrinho e abre o WhatsApp
// já com a mensagem pronta usando a URL da API do WhatsApp.

function checkoutWhatsapp() {
  // se o carrinho estiver vazio, não faz sentido finalizar
  if (cart.length === 0) {
    alert("Seu carrinho está vazio. Adicione algum item antes de finalizar.");
    return;
  }

  var totals = calculateCartTotals();
  var mensagem;
  var i;
  var item;
  var lineTotal;
  var notes = orderNotesEl.value.trim(); // observações do pedido

  // Cabeçalho da mensagem com emojis e formatação em negrito (*)
  mensagem =
    "🍔 *PEDIDO - HAMBURGUERIA CURSODOLIVRO* 🍔\n\n" +
    "📚 Curso do Livro\n\n";

  // Linha para cada item do carrinho
  for (i = 0; i < cart.length; i++) {
    item = cart[i];
    lineTotal = item.price * item.quantity;

    mensagem +=
      "• " +
      item.quantity +
      "x " +
      item.name +
      " - " +
      formatCurrency(lineTotal) +
      "\n";
  }

  mensagem += "\n";
  mensagem += "💰 *Subtotal:* " + formatCurrency(totals.subtotal) + "\n";

  // Se tiver cupom aplicado, mostramos o desconto
  if (couponState.discountPercent > 0) {
    mensagem +=
      "💳 *Desconto (" +
      couponState.discountPercent +
      "%):* - " +
      formatCurrency(totals.discount) +
      "\n";
  }

  mensagem += "🔻 *Total a pagar:* " + formatCurrency(totals.total) + "\n\n";

  // Se o cliente escreveu observações, incluímos no texto
  if (notes) {
    mensagem += "📝 *Observações:*\n" + notes + "\n\n";
  }

  mensagem +=
    "📍 Mensagem enviada pelo site *Hamburgueria CursoDoLivro*.\n" +
    "⏱️ Por favor, me informe o valor final e o tempo estimado de entrega.\n";

  // Monta a URL do WhatsApp.
  // encodeURIComponent() é fundamental para "escapar" espaços, quebras de linha e acentos.
  var url =
    "https://api.whatsapp.com/send?phone=" +
    WHATSAPP_NUMBER +
    "&text=" +
    encodeURIComponent(mensagem);

  // Abre o WhatsApp em uma nova aba/janela
  window.open(url, "_blank");
}


// ----------------------------------
// 9. EVENTOS DA INTERFACE
// ----------------------------------
// Conectam o HTML (cliques, submit de formulário, etc.) com as funções acima.

// 9.1 - Filtros de categoria (botões de "Tudo", "Burgers", "Combos", etc.)
for (var i = 0; i < filterButtons.length; i++) {
  filterButtons[i].addEventListener("click", function () {
    // pega o valor do atributo data-category do botão clicado
    var category = this.getAttribute("data-category");
    var j;

    // remove a classe "ativa" de todos os botões
    for (j = 0; j < filterButtons.length; j++) {
      filterButtons[j].classList.remove("filter-button--active");
    }

    // adiciona a classe "ativa" no botão que foi clicado
    this.classList.add("filter-button--active");

    // renderiza os produtos da categoria escolhida
    renderProducts(category);
  });
}

// 9.2 - Clique em "Adicionar" nos produtos (delegação de eventos)
// Em vez de adicionar um evento em cada botão, colocamos um único evento
// no container "productsListEl" e verificamos onde o clique aconteceu.
productsListEl.addEventListener("click", function (event) {
  // procura o elemento mais próximo com a classe ".btn-add-to-cart"
  var button = event.target.closest(".btn-add-to-cart");
  var productId;

  // se não foi em um botão de adicionar, não faz nada
  if (!button) {
    return;
  }

  // pega o id do produto do atributo data-id
  productId = Number(button.getAttribute("data-id"));
  addToCart(productId);
});

// 9.3 - Controles do carrinho (+, -, remover)
// Também usamos delegação de eventos: um único listener no container
// do carrinho para tratar todos os botões internos.
cartItemsEl.addEventListener("click", function (event) {
  var button = event.target.closest(".cart-item__btn");
  var productId;
  var action;
  var item;
  var i;

  if (!button) {
    return;
  }

  productId = Number(button.getAttribute("data-id"));
  action = button.getAttribute("data-action");

  // Aumentar quantidade
  if (action === "increase") {
    for (i = 0; i < cart.length; i++) {
      if (cart[i].productId === productId) {
        item = cart[i];
        break;
      }
    }
    if (item) {
      updateCartItemQuantity(productId, item.quantity + 1);
    }
  }

  // Diminuir quantidade
  if (action === "decrease") {
    for (i = 0; i < cart.length; i++) {
      if (cart[i].productId === productId) {
        item = cart[i];
        break;
      }
    }
    if (item) {
      updateCartItemQuantity(productId, item.quantity - 1);
    }
  }

  // Remover completamente o item
  if (action === "remove") {
    removeCartItem(productId);
  }
});

// 9.4 - Aplicar cupom quando o botão é clicado
applyCouponButton.addEventListener("click", applyCoupon);

// 9.5 - Limpar carrinho
clearCartButton.addEventListener("click", function () {
  if (cart.length === 0) {
    return;
  }

  var confirmClear = confirm("Tem certeza que deseja limpar o carrinho?");
  if (confirmClear) {
    clearCart();
    // também resetamos o cupom e mensagens relacionadas
    couponState.code = null;
    couponState.discountPercent = 0;
    couponInputEl.value = "";
    couponMessageEl.textContent = "";
  }
});

// 9.6 - Finalizar via WhatsApp
checkoutWhatsappButton.addEventListener("click", checkoutWhatsapp);

// 9.7 - Mostrar/esconder Modo Professor (formulário de novo produto)
adminToggleButton.addEventListener("click", function () {
  // se o formulário já está visível, escondemos; senão, mostramos
  var isVisible = adminForm.style.display === "block";
  adminForm.style.display = isVisible ? "none" : "block";
});

// 9.8 - Formulário de novo produto (Modo Professor)
// Quando o formulário é enviado, criamos um novo objeto de produto e
// adicionamos ao array "products".
adminForm.addEventListener("submit", function (event) {
  event.preventDefault(); // evita que a página recarregue

  // coleta os valores dos campos
  var name = adminNameInput.value.trim();
  var description = adminDescriptionInput.value.trim();
  var price = Number(adminPriceInput.value);
  var category = adminCategorySelect.value;

  // validação simples
  if (!name || !price || price <= 0) {
    alert("Preencha ao menos o nome e um preço válido.");
    return;
  }

  // cria um novo objeto de produto
  var newProduct = {
    id: getNextProductId(),
    name: name,
    description: description,
    price: price,
    category: category,
    emoji: "✨",  // emoji padrão para novos produtos
    calories: "",
    tag: "Novo"
  };

  // adiciona no array principal de produtos
  products.push(newProduct);

  // limpa o formulário
  adminForm.reset();

  // pega a categoria que está ativa no momento para re-renderizar certinho
  var activeFilter = document.querySelector(".filter-button--active");
  var activeCategory = activeFilter
    ? activeFilter.getAttribute("data-category")
    : "all";

  // redesenha os produtos na tela
  renderProducts(activeCategory);

  alert(
    "Produto adicionado ao cardápio (apenas front-end, sem salvar no servidor)."
  );
});


// ----------------------------------
// 10. INICIALIZAÇÃO
// ----------------------------------
// Quando o arquivo JS é carregado, chamamos essas funções
// para desenhar o cardápio e o carrinho (vazio) na tela.

renderProducts("all"); // mostra todos os produtos ao iniciar
renderCart();          // garante que o carrinho comece exibindo "vazio"
