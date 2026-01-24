// ===============================
// SCRIPT PRINCIPAL DO SITE
// - Menu mobile (abre/fecha)
// - Scroll suave para seções
// - Envio de formulário para WhatsApp
// - Ano atual no rodapé
// ===============================

$(document).ready(function () {
  // ----------------------------------
  // 1. MENU MOBILE (BOTÃO HAMBÚRGUER)
  // ----------------------------------

  // Seleciona o botão do menu (hambúrguer)
  var $toggle = $('.navbar__toggle');
  // Seleciona a lista de links do menu
  var $navLinks = $('.navbar__links');

  // Abre/fecha menu mobile
  $toggle.on('click', function () {
    $navLinks.toggleClass('navbar__links--open');
  });

  // Fecha menu ao clicar em um link
  $navLinks.on('click', 'a', function () {
    $navLinks.removeClass('navbar__links--open');
  });

  // ----------------------------------
  // 2. SCROLL SUAVE ATÉ AS SEÇÕES
  // ----------------------------------

  $('.navbar__links a, .hero__cta a[href^="#"]').on('click', function (e) {
    var targetId = $(this).attr('href'); // ex: "#servicos"

    if (targetId && targetId.indexOf('#') === 0 && targetId.length > 1) {
      e.preventDefault();

      var $target = $(targetId);

      if ($target.length) {
        var offsetTop = $target.offset().top;

        $('html, body').animate(
          {
            scrollTop: offsetTop - 70 // compensa o menu fixo
          },
          600
        );
      }
    }
  });

  // ----------------------------------
  // 3. FORMULÁRIO -> WHATSAPP
  // ----------------------------------

  var $form = $('#whatsappForm');

  $form.on('submit', function (e) {
    e.preventDefault();

    var nome = $('#nome').val().trim();
    var telefone = $('#telefone').val().trim();
    var tipo = $('#tipo').val();
    var endereco = $('#endereco').val().trim();
    var mensagemExtra = $('#mensagem').val().trim();

    // Validação simples
    if (!nome || !telefone || !tipo || !endereco) {
      alert('⚠️ Por favor, preencha todos os campos obrigatórios (*) antes de enviar.');
      return;
    }

    // Texto com EMOJIS
    var mensagem =
      '🚨 *EMERGÊNCIA - CHAVEIRO 24H* 🚨\n\n' +
      '👤 *Nome:* ' + nome + '\n' +
      '📞 *Telefone:* ' + telefone + '\n' +
      '🔧 *Tipo de emergência:* ' + tipo + '\n' +
      '📍 *Localização:* ' + endereco + '\n';

    if (mensagemExtra) {
      mensagem += '\n📝 *Detalhes adicionais:*\n' + mensagemExtra + '\n';
    }

    mensagem +=
      '\n⏱️ _Cliente com urgência no atendimento._\n' +
      'Mensagem enviada pelo site *Chaveiro Raiz 24h*.';

    // Número do WhatsApp (55 + DDD + número)
    var numeroWhatsApp = '5565996335509';

    // Pode usar wa.me ou api.whatsapp.com (ambos funcionam)
    var url =
      'https://api.whatsapp.com/send?phone=' +
      numeroWhatsApp +
      '&text=' +
      encodeURIComponent(mensagem);

    window.open(url, '_blank');

    $form[0].reset();
  });

  // ----------------------------------
  // 4. ANO ATUAL NO RODAPÉ
  // ----------------------------------

  var anoAtual = new Date().getFullYear();
  $('#anoAtual').text(anoAtual);
});
