(() => {
    "use strict";

    // Configurações do projeto

    const WHATS_NUMBER = "5565996335509";
    const PIZZA = { name: "Pizza Calabreza", price: 39.90 };
    const KEY = "pizza_min_cart_qty";

    // emojis
    const EMOJI_PIZZA = "\u{1F355}"; //🍕
    const EMOJI_OK = "\u2705"; //✅

    console.log("✅ app.js carregou!");
    console.log("Config: ", { WHATS_NUMBER, KEY });


    // 2 funções utilitarias

    // #menuQty
    const qs = (s) => document.querySelector(s);


    // 39.90 => R$ 39,90
    const money = (v) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });


    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));


    // Estado de variáveis que mudam

    let menuQty = 1;
    let cartQty = parseInt(localStorage.getItem(KEY) || "0", 10);


    //  if (isNaN(cartQty) || cartQty < 0) {
    //     cartQty = 0;
    //  }


    if (!Number.isFinite(cartQty) || cartQty < 0) cartQty = 0;

    console.log("Estado inicial:", { menuQty, cartQty });


    //  capturar todos elementos DOM

    const menuQtyEl = qs("#menuQty");
    const cartQtyEl = qs("#cartQty");
    const totalEl = qs("#totalPrice");

    const btnSendTop = qs("#btnSendTop");
    const btnSend = qs("#sendWhats");

    // IDs dos botões usados nos eventos
    const btnMenuMinus = qs("#menuMinus");
    const btnMenuPlus = qs("#menuPlus");
    const btnAddToCart = qs("#addToCart");

    // IDs dos botões usados nos eventos
    const btnCartMinus = qs("#cartMinus");
    const btnCartPlus = qs("#cartPlus");
    const btnClearCart = qs("#clearCart");



    console.log("DOM refs:", {
        menuQtyEl, cartQtyEl, totalEl,
        btnSendTop, btnSend,
        btnMenuMinus, btnMenuPlus, btnAddToCart,
        btnCartMinus, btnCartPlus, btnClearCart
    });

    //  setup dos textos fixos

    qs("#pizzaName").textContent = PIZZA.name;
    qs("#cartTitle").textContent = PIZZA.name;
    qs("#pizzaPrice").textContent = money(PIZZA.price);


    const render = () => {

        menuQtyEl.textContent = String(menuQty);
        cartQtyEl.textContent = String(cartQty);

        const total = PIZZA.price * cartQty;
        totalEl.textContent = money(total);


        const disabled = cartQty === 0;
        btnSend.disabled = disabled;
        btnSendTop.disabled = disabled;

        localStorage.setItem(KEY, String(cartQty));

        console.log("render()", { menuQty, cartQty, total });

    };

    const buildMessage = () => {
        const total = PIZZA.price * cartQty;

        const msg = [
            `${EMOJI_PIZZA} *PEDIDO*`,
            `${cartQty}x ${PIZZA.name} - ${money(total)}`,
            "",
            `${EMOJI_OK} Pode confirmar prazo e disponibilidade?`
        ].join("\n");
        console.log("buildMessage()", msg);
        return msg;
    };

    // enviar para o whats
    const sendWhats = () => {
        if (cartQty === 0) {
            console.log("Tentou enviar com carrinho vazio.");
            return;
        }

        const msg = buildMessage();

        const url =
            `https://api.whatsapp.com/send?phone=${WHATS_NUMBER}&text=${encodeURIComponent(msg)}`;

        console.log("Abrindo whatsapp com url: ", url);

        window.open(url, "_blank", "noopener, noreferrer");

    };


    // eventod do cardápio menuQty

    btnMenuMinus.addEventListener("click", () => {
        const before = menuQty;
        menuQty = clamp(menuQty - 1, 1, 99);
        console.log("menuQty", before, "->", menuQty);
        render();
    });

    btnMenuPlus.addEventListener("click", () => {
        const before = menuQty;
        menuQty = clamp(menuQty + 1, 1, 99);
        console.log("menuQty", before, "->", menuQty);
        render();
    });


    // adicionar ao carrinho
    btnAddToCart.addEventListener("click", () => {
        const before = cartQty;
        cartQty = clamp(cartQty + menuQty, 0, 999);
        console.log("addToCart", {
            cartQty_before: before,
            add: menuQty,
            cartQty_after: cartQty
        });

        menuQty = 1;

        render();
    });



    // eventos do carrinho

    btnCartMinus.addEventListener("click", () => {
        const before = cartQty;
        cartQty = clamp(cartQty - 1, 1, 99);
        console.log("cartQty", before, "->", cartQty);
        render();
    });

    btnCartPlus.addEventListener("click", () => {
        const before = cartQty;
        cartQty = clamp(cartQty + 1, 1, 99);
        console.log("cartQty", before, "->", cartQty);
        render();
    });


    // Limpar o carrinho

    btnClearCart.addEventListener("click", () => {
        if (cartQty === 0) {
            console.log("clearCart ignorado: já está vazio.");
            return;
        }

        console.log("clearCart: carrinho zerado!");
        cartQty = 0;

        render();
    });


    btnSend.addEventListener("click", () => {
        console.log("Clique: enviar (carrinho)");
        sendWhats();
    });

    btnSendTop.addEventListener("click", () => {
        console.log("Clique: enviar (topo)");
        sendWhats();
    });

    render();

})();