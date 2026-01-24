console.log("✅app.js carregou!");

//  1) Dados do cardápio

var products = [
  { id: 1, name: "Classic CursoDoLivro", description: "Pão brioche, carne 150g, queijo prato, alface, tomate e maionese da casa.", price: 24.9, category: "burger", emoji: "🍔", calories: "720 kcal", tag: "Mais pedido" },
  { id: 2, name: "Cheddar Banco Smash", description: "Dois smash burgers 80g, cheddar cremoso, bacon crocante e cebola crispy", price: 29.9, category: "burger", emoji: "🥓", calories: "890 kcal", tag: "Cheddar lovers" },
  { id: 3, name: "Combo CursoDoLivro", description: "Classic CursoDoLivro + fritas média + refri lata. Perfeito para acompanhar as aulas.", price: 39.9, category: "combo", emoji: "📘", calories: "1100 kcal", tag: "Combo especial" },
  { id: 4, name: "Batata Trufada", description: "Fritas crocantes com maionese trufada e parmesão ralado na hora.", price: 18.9, category: "dessert", emoji: "🍟", calories: "540 kcal", tag: "Acompanhamento" },
  { id: 5, name: "Refrigerante Lata", description: "Coca, Guaraná ou Sprite - 350ml bem gelado.", price: 7.5, category: "drinks", emoji: "🥤", calories: "150 kcal", tag: "Bebida" },
  { id: 6, name: "Milkshake Caramelo", description: "Milkshake cremoso de caramelo com toque de flor de sal.", price: 19.9, category: "dessert", emoji: "🍨", calories: "620 kcal", tag: "sobremesa" }

];


// 2) ESTADO DO CARRINHO E CUPOM

var cart = [];

var couponState = {
  code: null,
  discountPercent: 0
};

// whatsapp que vai receber os pedidos

var WHATSAPP_NUMBER = "";



// TESTE
console.table(products);
console.log("cart:", cart);
console.log("couponState:", couponState);
console.log("whatsapp:", WHATSAPP_NUMBER);


// 3) SELEÇÃO DE ELEMENTOS DOM

var productsListEl = document.querySelector('#products-list');
var filterButtons = document.querySelectorAll('.filter-button');

var adminToggleButton = document.querySelector('#toggle-admin');
var adminForm = document.querySelector('#admin-form');
var adminNameInput = document.querySelector('#admin-name');
var adminDescriptionInput = document.querySelector('#admin-description');
var adminPriceInput = document.querySelector('#admin-price');
var adminCategorySelect = document.querySelector('#admin-category');

var cartItemsEl = document.querySelector("#cart-items");
var cartEmptyMessageEl = document.querySelector("#cart-empty");
var cartSubtotalEl = document.querySelector("#cart-subtotal");
var cartDiscountEl = document.querySelector("#cart-discount");
var cartTotalEl = document.querySelector("#cart-total");
var couponInputEl = document.querySelector("#coupon-input");
var applyCouponButton = document.querySelector("#apply-coupon");
var couponMessageEl = document.querySelector("#coupon-message");
var couponLabelEl = document.querySelector("#cart-coupon-label");
var orderNotesEl = document.querySelector("#order-notes");
var clearCartButton = document.querySelector("#clear-cart");
var checkoutWhatsappButton = document.querySelector("#checkout-whatsapp"); //aqui erro


//  teste dio dom

console.log("productListEl:", productsListEl);
console.log("cartItemsEl:", cartItemsEl);
console.log("checkoutWhatsappButton", checkoutWhatsappButton);


// 4) FUNÇÕES UTILITÁRIAS

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getNextProductId() {
  var maxId = 0;
  for (var i = 0; i < products.length; i++) {
    if (products[i].id > maxId) maxId = products[i].id;
  }
  return maxId + 1;
}

function findProductById(id) {
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === id) return products[i];
  }
  return undefined;
}

// testes

console.log(formatCurrency(24.9));
console.log("Next id:", getNextProductId());
console.log("Product 1:", findProductById(1));

//  5) RENDERIZAÇÃO DO CARDÁPIO

function renderProducts(category) {
  if (!category) category = "all";

  var filteredProducts;
  if (category === "all") {
    filteredProducts = products;
  } else {
    filteredProducts = products.filter(function (p) {
      return p.category === category;
    });
  }

  if (filteredProducts.length === 0) {
    productsListEl.innerHTML =
      '<p style="font-size:13px;color:#a0a0b2;">Nenhum item disponível nesta categoria.</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < filteredProducts.length; i++) {
    var product = filteredProducts[i];

    html +=
      '<article class="product-card">' +
      '   <div class="product-card__top">' +
      '     <div class="product-card__info">' +
      '       <h3 class="product-card__name">' + product.name + '</h3>' +
      '       <p class="product-card__description">' + (product.description || "") + '</p>';

    if (product.tag) {
      html += ' <span class="product-card__tag">🔥 ' + product.tag + '</span>';
    }

    html +=
      '       <p class="product-card__price">' + formatCurrency(product.price) + '</p>' +
      '     </div>' +
      '     <div class="product-card__image"><span>' + (product.emoji || "🍔") + '</span></div>' +
      '     </div>' +
      '   <div class="product-card__actions">' +
      '             <span class="product-card__calories">' + (product.calories || "") + '</span>' +
      '         <button class="btn btn--primary btn-add-to-cart" data-id="' + product.id + '">Adicionar</button>' +
      '  </div>' +
      '</article>';

  }

  productsListEl.innerHTML = html;

}

// teste renderizar tudo

renderProducts("all");

// evento dos filtros

for (var i = 0; i < filterButtons.length; i++) {
  filterButtons[i].addEventListener("click", function () {
    var category = this.getAttribute("data-category");

    for (var j = 0; j < filterButtons.length; j++) {
      filterButtons[j].classList.remove("filter-button--active");
    }
    this.classList.add("filter-button--active");
    renderProducts(category);
  })
}



//  6) TOTAIS + RENDER DO CARRINHO

function calculateCartTotals() {
  var subtotal = 0;
  for (var i = 0; i < cart.length; i++) {
    subtotal += cart[i].price * cart[i].quantity;
  }

  var discount = subtotal * (couponState.discountPercent / 100);
  var total = subtotal - discount;
  if (total < 0) total = 0;

  return { subtotal: subtotal, discount: discount, total: total };

}

function renderCart() {
  var totals = calculateCartTotals();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = "";
    cartEmptyMessageEl.style.display = "block";
  } else {
    cartEmptyMessageEl.style.display = "none";
    var html = "";

    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      var lineTotal = item.price * item.quantity;

      html +=
        '<div class="cart-item">' +
        '<div>' +
        '<p class="cart-item__name">' + item.name + '</p>' +
        '<p class="cart-item__price">' + item.quantity + ' x ' + formatCurrency(item.price) + '</p>' +
        " </div>" +
        '<div class="cart-item__controls">' +
        '<button class="cart-item__btn" data-action="decrease" data-id="' + item.productId + '">-</button>' +
        '<span class="cart-item__total">' + formatCurrency(lineTotal) + "</span>" +
        '<button class="cart-item__btn" data-action="increase" data-id="' + item.productId + '">+</button>' +
        '<button class="cart-item__btn" data-action="remove" data-id="' + item.productId + '" title="Remover item">🗑</button>' +
        '</div>' +
        "</div>";
    }

    cartItemsEl.innerHTML = html;

  }

  cartSubtotalEl.textContent = formatCurrency(totals.subtotal);
  cartDiscountEl.textContent = "- " + formatCurrency(totals.discount);
  cartTotalEl.textContent = formatCurrency(totals.total);

  if (couponState.code) {
    couponLabelEl.textContent = couponState.code + " (" + couponState.discountPercent + "%)";
  } else {
    couponLabelEl.textContent = "Nenhum cupom";
  }


}

// teste carrinho

renderCart();


function addToCart(productId) {
  var product = findProductById(productId);
  if (!product) return;

  var existingItem = null;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].productId === productId) {
      existingItem = cart[i];
      break;
    }
  }

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  console.table(cart); //debugar ao vivo
  renderCart(); //aqui erro


}


productsListEl.addEventListener("click", function (event) {
  var button = event.target.closest(".btn-add-to-cart");
  if (!button) return;

  var productId = Number(button.getAttribute("data-id"));
  addToCart(productId);
});



function updateCartItemQuantity(productId, newQuantity) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].productId === productId) {
      if (newQuantity <= 0) cart.splice(i, 1);
      else cart[i].quantity = newQuantity;
      break;
    }
  }

  renderCart();

}

function removeCartItem(productId) {
  for (var i = cart.length - 1; i >= 0; i--) {
    if (cart[i].productId === productId) cart.splice(i, 1);
  }
  renderCart();
}


function clearCart() {
  cart = [];
  renderCart();
}


// deleração dos botões do carrinho

cartItemsEl.addEventListener("click", function (event) {
  var button = event.target.closest(".cart-item__btn");
  if (!button) return;

  var productId = Number(button.getAttribute("data-id"));
  var action = button.getAttribute("data-action");

  var item = null;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].productId === productId) {
      item = cart[i];
      break;
    }
  }



  if (!item) return;

  if (action === "increase") updateCartItemQuantity(productId, item.quantity + 1);
  if (action === "decrease") updateCartItemQuantity(productId, item.quantity - 1);
  if (action === "remove") removeCartItem(productId);

});

clearCartButton.addEventListener("click", function () {
  if (cart.length === 0) return;

  var confirmClear = confirm("Tem certeza que deseja limpar o carrinho?");
  if (confirmClear) {
    clearCart();
    couponState.code = null;
    couponState.discountPercent = 0;
    couponInputEl.value = "";
    couponMessageEl.textContent = "";
  }
});


function applyCoupon() {
  var rawCode = couponInputEl.value.trim().toUpperCase();

  couponMessageEl.textContent = "";
  couponMessageEl.style.color = "#a0a0b2";

  if (!rawCode) {
    couponState.code = null;
    couponState.discountPercent = 0;
    couponMessageEl.textContent = "Cupom removido!";
    renderCart();
    return;
  }

  var validCoupons = { JVV10: 10, LIVRO15: 15, CURSODOLIVRO: 30 };

  if (validCoupons[rawCode]) {
    couponState.code = rawCode;
    couponState.discountPercent = validCoupons[rawCode];
    couponMessageEl.textContent = "Cupom " + rawCode + " aplicado: " + couponState.discountPercent + "% de desconto!";
    couponMessageEl.style.color = "#5ad68b";
  } else {
    couponState.code = null;
    couponState.discountPercent = 0;
    couponMessageEl.textContent = "Cupom inválido!";
    couponMessageEl.style.color = "#ff4b2b";
  }
  renderCart();
}


applyCouponButton.addEventListener("click", applyCoupon);



function checkoutWhatsapp() {

  if (cart.length === 0) {
    alert("Seu carrinho está vazio. Adicione algum item antes de finalizar.");
    return;
  }


  var totals = calculateCartTotals();
  var notes = orderNotesEl.value.trim();

  var mensagem = "🍔 *PEDIDO - HAMBURGUERIA CURSODOLIVRO* 🍔 \n\n📚 Curso do Livro\n\n";

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var lineTotal = item.price * item.quantity;
    mensagem += "• " + item.quantity + "x " + item.name + " - " + formatCurrency(lineTotal) + "\n";
  }

  mensagem += "\n";
  mensagem += "💰 *Subtotal:* " + formatCurrency(totals.subtotal) + "\n";
  
  if(couponState.discountPercent > 0) {
    mensagem += "💳 *Desconto (" + couponState.discountPercent + "%):* - " + formatCurrency(totals.discount) + "\n";

  }

  mensagem += " *🔻Total a pagar:* " + formatCurrency(totals.total) + "\n\n" ;

  if (notes) {
    mensagem += "📝 *Observações:*\n" + notes + "\n\n";
  }

  mensagem +=
  "📍 Mensagem enviada pelo site *Hamburgueria CursoDoLivro*. \n" +
  "⏱️ Por favor, informe-nos o valor final e o tempo estimado de entrega. \n";

  var url =
  "https://api.whatsapp.com/send?phone=" +
  WHATSAPP_NUMBER +
  "&text=" +
  encodeURIComponent(mensagem);

  window.open(url, "_blank");

}

checkoutWhatsappButton.addEventListener("click",checkoutWhatsapp );


adminToggleButton.addEventListener("click", function() {
  var isVisible = adminForm.style.display === "block";
  adminForm.style.display = isVisible ? "none" : "block";
});

adminForm.addEventListener("submit", function(event) {

  event.preventDefault();

  var name = adminNameInput.value.trim();
  var description = adminDescriptionInput.value.trim();
  var price = Number(adminPriceInput.value);
  var category = adminCategorySelect.value;

  if(!name || !price || price <= 0) {
    alert("Preencha ao menos o nome e um preço válido!");
    return;
  }

  var newProduct = {
    id: getNextProductId(),
    name: name,
    description: description,
    price: price,
    category: category,
    emoji: "✨",
    calories: "",
    tag: "novo"

  };


  products.push(newProduct);
  adminForm.reset();

  var activeFilter = document.querySelector(".filter-button--active");
  var activeCategory = activeFilter ? activeFilter.getAttribute("data-category") : "all";

  renderProducts(activeCategory);
  alert("Produto adicionado ao cardápio(APENAS NO FRONT-END E SEM SALVAR NO SERVIDOR)");


});

renderProducts("all");
renderCart();





