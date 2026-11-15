(() => {
  const links = [...document.querySelectorAll('.site-header .desktop-nav a, .site-header .mobile-nav nav a')];
  const normalize = path => path.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';

  function update() {
    const current = new URL(window.location.href);
    const path = normalize(current.pathname);
    const destinations = links.map(link => ({ link, url: new URL(link.href, current.href) }));
    const hasSection = current.hash && destinations.some(({url}) =>
      url.origin === current.origin && normalize(url.pathname) === path && url.hash === current.hash
    );
    destinations.forEach(({link, url}) => {
      const samePage = url.origin === current.origin && normalize(url.pathname) === path;
      const active = samePage && (hasSection ? url.hash === current.hash : !url.hash);
      if (active) link.setAttribute('aria-current', hasSection ? 'location' : 'page');
      else link.removeAttribute('aria-current');
    });
  }

  window.addEventListener('hashchange', update);
  update();
})();
