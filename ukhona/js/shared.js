/* Ukubona shared.js - Bulletproof Version (2026-02-13) */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  const doc = document;
  const html = doc.documentElement;

  // 1. Determine how many levels deep we are to fix relative paths
  // If we are in ukhona/html/file.html, we need to go up two levels (../..)
  const pathDepth = window.location.pathname.includes('/ukhona/html/') ? '../../' : './';

  // 2. Define exactly where your files actually are based on your tree
  const PARTIALS = [
    { id: 'header', path: 'ukhona/html/header.html' },
    { id: 'footer-placeholder', path: 'ukhona/html/footer.html' }
  ];

  // 3. The Injector Function
  async function inject(id, relativePath) {
    const host = doc.getElementById(id);
    if (!host) return;

    // Construct the correct URL based on where the current page is located
    const finalUrl = pathDepth + relativePath;

    try {
      const res = await fetch(finalUrl, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status} at ${finalUrl}`);
      
      const content = await res.text();
      host.innerHTML = content;
      
      // Re-trigger feather icons if they exist in the loaded HTML
      if (window.feather) window.feather.replace();
      
      console.log(`✅ Loaded ${id} from ${finalUrl}`);
    } catch (e) {
      console.error(`❌ Failed to load ${id}:`, e);
    }
  }

  // 4. Run the injections
  await Promise.all(PARTIALS.map(p => inject(p.id, p.path)));

  /* ======================================================
     Theme Toggle Logic
  ====================================================== */
  const logo = doc.getElementById('logo');
  const btn = doc.getElementById('toggle-theme');
  const LIGHT = 'https://abikesa.github.io/logos/assets/ukubona-light.png';
  const DARK = 'https://abikesa.github.io/logos/assets/ukubona-dark.png';

  function setTheme(t) {
    html.dataset.theme = t;
    localStorage.setItem('theme', t);
    if (logo) logo.src = (t === 'dark') ? DARK : LIGHT;
    if (btn) btn.textContent = (t === 'dark') ? '🌙' : '🌞';
  }

  setTheme(localStorage.getItem('theme') || 'dark');

  if (btn) {
    btn.addEventListener('click', () => {
      setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  /* ======================================================
     Grid Menu Logic
  ====================================================== */
  const menu = doc.getElementById('gridMenu');
  const menuBtn = doc.getElementById('menuIcon');

  if (menu && menuBtn) {
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      menu.classList.toggle('active');
    };
    doc.onclick = (e) => {
      if (!menu.contains(e.target)) menu.classList.remove('active');
    };
  }

/* ======================================================
     Footer Rotation Logic (The Chorus)
  ====================================================== */
  const rotateChorus = () => {
    // 1. Find the container in the newly injected footer
    const box = doc.querySelector('.footer-chorus') || doc.querySelector('.rotating-chorus');
    if (!box) return;

    // 2. Identify the chips/phrases
    const chips = Array.from(box.querySelectorAll('.chip'));
    if (chips.length < 2) return;

    // 3. Initial state: hide everything except the first one
    chips.forEach((c, i) => {
      c.style.display = i === 0 ? 'inline' : 'none';
    });

    let currentIndex = 0;

    // 4. The Loop: Change every 5 seconds (adjust 5000 as needed)
    setInterval(() => {
      chips[currentIndex].style.display = 'none';
      currentIndex = (currentIndex + 1) % chips.length;
      chips[currentIndex].style.display = 'inline';
    }, 5000); 
  };

  // Because the footer is loaded via fetch (async), we need to wait 
  // a tiny bit for the DOM to catch up before starting the rotation.
  setTimeout(rotateChorus, 500);
});