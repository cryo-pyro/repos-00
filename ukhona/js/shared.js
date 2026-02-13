/* Ukubona shared.js v4.1 (2026-02-13) */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  const doc = document, win = window, html = doc.documentElement;
  const $  = (s, r = doc) => r.querySelector(s);
  const $$ = (s, r = doc) => Array.from(r.querySelectorAll(s));

  /* ======================================================
     BASE (auto-detect repo root)
  ====================================================== */

  const BASE = location.hostname.includes('github.io')
  ? '/repos-00'
  : '';

  /* ======================================================
     Cache version
  ====================================================== */

  const V = 'v20260213.1';

  const withBase = (p) => {
    if (!p) return p;
    if (/^(https?:|mailto:|tel:|#)/i.test(p)) return p;

    if (p.startsWith('/')) return `${BASE}${p}`;
    return `${BASE}/${p}`;
  };

  const withV = (u) => u + (u.includes('?') ? '&' : '?') + V;


  /* ======================================================
     Partials
  ====================================================== */

  const PARTIALS = [
    ['header',            '/ukhona/html/header.html'],
    ['hero',              '/assets/html/hero.html'],
    ['services-section',  '/assets/html/services-section.html'],
    ['metrics-section',   '/assets/html/metrics-section.html'],
    ['modal-overlay',     '/assets/html/modal-overlay.html'],
    ['footer-placeholder','/ukhona/html/footer.html']
  ];


  async function inject(id, path){
    const host = doc.getElementById(id);
    if (!host) return null;

    const url = withV(withBase(path));

    try{
      const res = await fetch(url, { cache: 'no-cache' });
      if(!res.ok) throw new Error(res.status);

      host.innerHTML = await res.text();
      return host;

    }catch(e){
      console.error('❌ Partial load failed:', url, e);
      return null;
    }
  }


  await Promise.all(PARTIALS.map(([id,p]) => inject(id,p)));

  const headerHost = $('#header');


  /* ======================================================
     Rewrite links
  ====================================================== */

  function rewriteLinks(root){
    if(!root) return;

    root.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (!h) return;

      if (/^(https?:|mailto:|tel:|#)/i.test(h)) return;

      if (h === '/') {
        a.href = `${BASE}/`;
        return;
      }

      if (h.startsWith('/')) {
        a.href = `${BASE}${h}`;
      }
    });
  }

  rewriteLinks(headerHost);
  rewriteLinks($('#gridMenu'));


  /* ======================================================
     Theme
  ====================================================== */

  const LIGHT = 'https://abikesa.github.io/logos/assets/ukubona-light.png';
  const DARK  = 'https://abikesa.github.io/logos/assets/ukubona-dark.png';

  const logo  = $('#logo');
  const btn   = $('#toggle-theme') || $('[data-theme-toggle]');

  function setTheme(t){
    html.dataset.theme = t;

    try{ localStorage.setItem('theme', t); }catch{}

    if (logo) logo.src = (t === 'dark') ? DARK : LIGHT;
    if (btn)  btn.textContent = (t === 'dark') ? '🌙' : '🌞';
  }

  setTheme(localStorage.getItem('theme') || 'dark');

  btn?.addEventListener('click', () => {
    setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
  });


  /* ======================================================
     Header offset
  ====================================================== */

  function setHeaderVar(){
    const h = headerHost?.offsetHeight || 64;
    html.style.setProperty('--header-h', h + 'px');
  }

  setHeaderVar();
  win.addEventListener('resize', setHeaderVar, { passive:true });


  /* ======================================================
     Active nav
  ====================================================== */

  (function markActive(){

    let path = location.pathname.replace(/\/+$/,'');

    if (BASE && path.startsWith(BASE)){
      path = path.slice(BASE.length) || '/';
    }

    const file = path === '/' ? 'index.html' : path.split('/').pop();

    const map = {
      'index.html':'home',
      'mission.html':'mission',
      'models.html':'models',
      'team.html':'team',
      'contact.html':'contact',
      'pairs-jh.html':'education',
      'card.html':'card',
      'pitch.html':'pitch',
      'game.html':'game'
    };

    const key = map[file];

    if (key){
      $$('.nav-link[data-nav="'+key+'"]')
        .forEach(a => a.classList.add('active'));
    }

  })();


  /* ======================================================
     Grid menu
  ====================================================== */

  (function gridMenu(){

    const menu = $('#gridMenu');
    const btn  = $('#menuIcon');

    if(!menu || !btn) return;

    const open  = ()=>menu.classList.add('active');
    const close = ()=>menu.classList.remove('active');

    btn.onclick = e=>{
      e.stopPropagation();
      menu.classList.toggle('active');
    };

    doc.onclick = e=>{
      if(!menu.contains(e.target)) close();
    };

    doc.onkeydown = e=>{
      if(e.key==='Escape') close();
    };

  })();


  /* ======================================================
     Scroll bar
  ====================================================== */

  (function scrollBar(){

    const bar = $('.scroll-progress');
    if(!bar) return;

    function run(){
      const d = doc.documentElement;
      const max = d.scrollHeight - d.clientHeight;

      bar.style.width =
        max>0 ? (d.scrollTop/max)*100+'%' : '0%';
    }

    win.addEventListener('scroll', run, { passive:true });
    run();

  })();


  /* ======================================================
     Smooth anchors
  ====================================================== */

  (function anchors(){

    doc.body.addEventListener('click', e=>{

      const a = e.target.closest('a[href^="#"]');
      if(!a) return;

      const id = a.getAttribute('href');
      if(id==='#') return;

      const t = $(id);
      if(!t) return;

      e.preventDefault();

      const h =
        parseInt(getComputedStyle(html)
        .getPropertyValue('--header-h')) || 64;

      const y =
        t.getBoundingClientRect().top +
        win.scrollY - h - 12;

      win.scrollTo({ top:y, behavior:'smooth' });

      history.pushState(null,'',id);

    });

  })();


  /* ======================================================
     Feather
  ====================================================== */

  win.feather?.replace();


  /* ======================================================
     Footer rotation
  ====================================================== */

  (function footerRotate(){

    function init(){

      const box = $('.rotating-chorus');
      if(!box) return false;

      const chips = [...box.querySelectorAll('.chip')];
      if(chips.length<2) return false;

      chips.forEach((c,i)=>{
        c.style.display = i? 'none':'inline';
      });

      let i=0;

      setInterval(()=>{
        chips[i].style.display='none';
        i=(i+1)%chips.length;
        chips[i].style.display='inline';
      },60000);

      return true;
    }

    if(init()) return;

    const obs = new MutationObserver(()=>{
      if(init()) obs.disconnect();
    });

    obs.observe(doc.body,{subtree:true,childList:true});

    setTimeout(()=>obs.disconnect(),2000);

  })();


  /* ======================================================
     Footer variants
  ====================================================== */

  (function footerVariants(){

    const meta = doc.querySelector('meta[name="ukb-variant"]');
    if(!meta) return;

    const footer = $('.footer');
    if(!footer) return;

    const V = {
      game:[
        'Healthcare needs its flight simulator.',
        'Ukubona builds it —',
        'digital twins for safer,',
        'smarter decisions.'
      ],
      education:[
        'Practice over posturing.',
        'Reproducible over rhetorical.',
        'Iterate, don’t imitate.',
        'Open tools, shared insight.'
      ],
      research:[
        'IRB before interface.',
        'Protocols before product.',
        'Validation before velocity.',
        'Stewardship always.'
      ],
      investor:[
        'Durability over drama.',
        'Governed growth.',
        'Moats from merit.',
        'Real problems, real margins.'
      ]
    };

    const k = meta.content.toLowerCase();
    const lines = V[k];

    if(!lines) return;

    const bar =
      footer.querySelector('.footer-chorus:not(.rotating-chorus)');

    if(bar){
      bar.innerHTML = lines
        .map(l=>`<span class="chip">${l}</span>`)
        .join('');
    }

  })();

});
