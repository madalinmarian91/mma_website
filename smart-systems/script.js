(() => {
  const mobileNav = document.querySelector('.mobile-nav');
  if (!mobileNav) return;

  const closeMenu = () => mobileNav.removeAttribute('open');

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (mobileNav.hasAttribute('open') && !mobileNav.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav.hasAttribute('open')) {
      closeMenu();
      mobileNav.querySelector('summary')?.focus();
    }
  });
})();

(() => {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const error = form.querySelector('.form-error');
    error.textContent = '';
    if (!form.checkValidity()) {
      form.reportValidity();
      error.textContent = 'Verifică toate câmpurile obligatorii.';
      return;
    }
    const data = new FormData(form);
    const message = [
      'Bună ziua! Trimit o cerere Smart Systems.',
      '',
      `Nume: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Telefon: ${data.get('phone')}`,
      '',
      'Mesaj:',
      String(data.get('message'))
    ].join('\n');
    window.open(`https://wa.me/40775681508?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
})();
