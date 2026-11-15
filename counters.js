(() => {
  const section = document.querySelector('.highlights');
  if (!section) return;
  const counters = [...section.querySelectorAll('[data-count]')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;

  const duration = 1400;
  let started = false;
  function render(progress) {
    const eased = 1 - Math.pow(1 - progress, 3);
    counters.forEach(counter => {
      counter.textContent = `${Math.round(Number(counter.dataset.count) * eased)}+`;
    });
  }
  function start() {
    if (started) return;
    started = true;
    let startTime;
    function tick(time) {
      if (motion.matches) { render(1); return; }
      if (startTime === undefined) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      render(progress);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); start(); }
  }, {threshold: 0.25});
  observer.observe(section);
})();
