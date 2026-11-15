(() => {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.slide')];
  const dots = [...carousel.querySelectorAll('.carousel-dots button')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let pointerInside = false;
  let focusInside = false;
  let timer;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== index; slide.classList.toggle('is-active', i === index); });
    dots.forEach((dot, i) => i === index ? dot.setAttribute('aria-current', 'true') : dot.removeAttribute('aria-current'));
  }
  function schedule() {
    clearTimeout(timer);
    if (!reducedMotion.matches && !pointerInside && !focusInside && !document.hidden) {
      timer = setTimeout(() => { show(index + 1); schedule(); }, 3500);
    }
  }
  function navigate(next) { show(next); schedule(); }
  schedule();
  carousel.querySelector('[data-prev]').addEventListener('click', () => navigate(index - 1));
  carousel.querySelector('[data-next]').addEventListener('click', () => navigate(index + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => navigate(i)));
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); navigate(index + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  carousel.addEventListener('mouseenter', () => { pointerInside = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { pointerInside = false; schedule(); });
  carousel.addEventListener('focusin', () => { focusInside = true; schedule(); });
  carousel.addEventListener('focusout', event => { if (!carousel.contains(event.relatedTarget)) { focusInside = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', schedule);
  let startX = null;
  carousel.addEventListener('touchstart', event => { startX = event.touches[0].clientX; }, {passive:true});
  carousel.addEventListener('touchend', event => { if (startX === null) return; const distance = event.changedTouches[0].clientX - startX; if (Math.abs(distance) > 50) navigate(index + (distance < 0 ? 1 : -1)); startX = null; }, {passive:true});
})();
