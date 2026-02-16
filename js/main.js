document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.background = `
      radial-gradient(
        circle at ${x}px ${y}px,
        rgba(255,122,24,0.18),
        #151518 60%
      )
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.background = '#151518';
  });
});
