const themeButton = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let explicitTheme = false;
try { explicitTheme = ['light', 'dark'].includes(localStorage.getItem('innam-theme')); } catch {}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  themeButton.title = themeButton.getAttribute('aria-label');
  document.querySelector('#theme-label').textContent = dark ? 'Vietnam after dark' : 'Vietnam in daylight';
}
applyTheme(document.documentElement.dataset.theme);
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  explicitTheme = true;
  applyTheme(theme);
  try { localStorage.setItem('innam-theme', theme); } catch {}
});
systemTheme.addEventListener('change', event => {
  if (!explicitTheme) applyTheme(event.matches ? 'dark' : 'light');
});
document.querySelector('#year').textContent = new Date().getFullYear();

// Keep native details semantics and keyboard support; animate both directions.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.faq-list details').forEach(details => {
  const summary = details.querySelector('summary');
  const answer = details.querySelector('.faq-answer');
  let animation;
  let expanded = details.open;
  summary.addEventListener('click', event => {
    if (reducedMotion.matches || typeof details.animate !== 'function') return;
    event.preventDefault();
    const from = details.getBoundingClientRect().height;
    expanded = animation ? !expanded : !details.open;
    if (animation) animation.cancel();
    details.open = true;
    details.style.overflow = 'hidden';
    const border = parseFloat(getComputedStyle(details).borderTopWidth) + parseFloat(getComputedStyle(details).borderBottomWidth);
    const to = summary.getBoundingClientRect().height + border + (expanded ? answer.getBoundingClientRect().height : 0);
    animation = details.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
    animation.onfinish = () => {
      details.open = expanded;
      details.style.overflow = '';
      animation = null;
    };
  });
  reducedMotion.addEventListener('change', () => {
    if (animation) {
      animation.cancel();
      animation = null;
      details.open = expanded;
      details.style.overflow = '';
    }
  });
});

// This is a visual demo, including when Enter is pressed in an input.
document.querySelector('.demo-form').addEventListener('submit', event => event.preventDefault());

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('motion-ready');
}
