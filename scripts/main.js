const themeButton = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let explicitTheme = false;
try { explicitTheme = ['light', 'dark'].includes(localStorage.getItem('innam-theme')); } catch {}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  updatePalette();
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


// Resolve semantic aliases through the browser so captions always match the theme.
function updatePalette() {
  const styles = getComputedStyle(document.documentElement);
  document.querySelectorAll('.swatch').forEach(button => {
    const raw = styles.getPropertyValue(button.dataset.token).trim();
    const hex = raw.slice(0, 7).toUpperCase();
    if (!/^#[0-9A-F]{6}$/.test(hex)) return;
    const rgb = `rgb(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
    button.dataset.hex = hex;
    button.dataset.rgb = rgb;
    button.querySelector('.swatch-hex').textContent = hex;
    button.querySelector('.swatch-rgb').textContent = rgb;
  });
}
let copyFormat = 'hex';
let toastTimer;
const toast = document.querySelector('.copy-toast');
document.querySelectorAll('[data-format]').forEach(button => {
  button.addEventListener('click', () => {
    copyFormat = button.dataset.format;
    document.querySelectorAll('[data-format]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('.swatch').forEach(item => item.setAttribute('aria-label', `Copy ${item.querySelector('strong').textContent} ${copyFormat.toUpperCase()} color`));
  });
});
async function copyColor(value) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(value);
  } catch {
    // Local file previews may not expose the modern clipboard API.
    const previous = document.activeElement;
    const field = document.createElement('textarea');
    field.value = value;
    field.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); }
    finally { field.remove(); previous?.focus({ preventScroll: true }); }
    if (!copied) throw new Error('Clipboard unavailable');
  }
}
document.querySelectorAll('.swatch').forEach(button => {
  button.addEventListener('click', async () => {
    const value = button.dataset[copyFormat];
    try {
      await copyColor(value);
      toast.textContent = `${value} copied to clipboard`;
    } catch {
      toast.textContent = `Clipboard unavailable. Copy this value: ${value}`;
    }
    clearTimeout(toastTimer);
    toast.classList.add('shown');
    toastTimer = setTimeout(() => toast.classList.remove('shown'), 4000);
  });
});
