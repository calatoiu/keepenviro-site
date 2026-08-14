// Meniu mobil
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
});

siteNav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && siteNav.classList.contains('open')) {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Anul curent în footer
document.getElementById('year').textContent = new Date().getFullYear();

// Apariție la scroll
const revealTargets = document.querySelectorAll('.card, .step, .perk, .contact-card, .law-panel, .company-panel');
revealTargets.forEach((el) => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('visible'));
}
