const nav = document.querySelector<HTMLElement>('[data-nav]');
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');

if (nav) {
  for (const link of nav.querySelectorAll('a')) {
    if (link.pathname === window.location.pathname) {
      link.setAttribute('aria-current', 'page');
    }
  }
}

toggle?.addEventListener('click', () => {
  if (!nav) return;
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
});
