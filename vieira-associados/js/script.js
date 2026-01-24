document.addEventListener('DOMContentLoaded', function () {
  // ===== NAVBAR ESCURA AO ROLAR =====
  var navbar = document.querySelector('.custom-navbar');

  function handleScroll() {
    if (!navbar) return;
    if (window.pageYOffset > 50) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // já verifica no carregamento

  // ===== SCROLL SUAVE PARA LINKS DO MENU =====
  var links = document.querySelectorAll('a.nav-link[href^="#"]');
  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = target.getBoundingClientRect().top + window.pageYOffset - 80; // compensar navbar
        window.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===== FORMULÁRIO -> WHATSAPP =====
  var form = document.getElementById('contatoForm');
  
  if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nome = form.nome.value.trim();
    var email = form.email.value.trim();
    var telefone = form.telefone.value.trim();
    var assuntoSelect = form.assunto;
    var assuntoText = assuntoSelect.options[assuntoSelect.selectedIndex].text;
    var mensagem = form.mensagem.value.trim();

    // Mensagem personalizada com emojis e espaçamento
    var texto =
      '🔔 *Novo contato pelo site — Atendimento Jurídico* 🔔\n\n' +
      '👤 *Nome:* ' + nome + '\n' +
      '📞 *Telefone:* ' + telefone + '\n' +
      '📧 *E-mail:* ' + email + '\n' +
      '🗂️ *Assunto:* ' + assuntoText + '\n\n' +
      '💬 *Mensagem enviada:*\n' + mensagem + '\n\n' +
      '⚖️ _Mensagem gerada automaticamente pelo site de advocacia._';

    // Número no formato internacional 55 + DDD + NUMERO
    var numeroWhatsApp = '5565996335509';

    var url =
      'https://api.whatsapp.com/send?phone=' +
      numeroWhatsApp +
      '&text=' +
      encodeURIComponent(texto);

    window.open(url, '_blank');
  });
}


});
