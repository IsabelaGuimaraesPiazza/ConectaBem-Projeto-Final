// js/app.js - SPA loader + menu + accessibility
(() => {
  const ROUTES = {
    '': 'pages/home.html',
    '#/': 'pages/home.html',
    '#/home': 'pages/home.html',
    '#/projetos': 'pages/projetos.html',
    '#/cadastro': 'pages/cadastro.html'
  };

  const main = document.getElementById('main');
  const hamburger = () => document.querySelector('.hamburger');
  const menuNav = () => document.querySelector('.menu-nav');

  function fetchAndRender(url, push = false) {
    if (!main) return console.warn('Main element not found');

    // show a tiny loading state
    main.innerHTML = '<div class="page-loading">Carregando…</div>';

    fetch(url, { cache: "no-store" })
      .then(resp => {
        if (!resp.ok) throw new Error('Erro ao carregar página: ' + resp.status);
        return resp.text();
      })
      .then(html => {
        // remove duplicate sections if any previously injected (defensive)
        while (main.firstChild) main.removeChild(main.firstChild);

        // insert fetched HTML
        main.innerHTML = html;

        // set focus to main for accessibility
        main.setAttribute('tabindex', '-1');
        main.focus();

        if (push) {
          // set proper hash for back/forward
          const routeKey = Object.keys(ROUTES).find(k => ROUTES[k] === url) || '#/home';
          history.pushState({}, '', routeKey);
        }

        // after load: re-init small UI behaviours inside page if needed
        attachInternalHandlers();
      })
      .catch(err => {
        console.error(err);
        main.innerHTML = `<section class="container"><h2>Erro</h2><p>Não foi possível carregar a página.</p></section>`;
      });
  }

  function routeToHash(hash, push = false) {
    const url = ROUTES[hash] || ROUTES['#/'];
    fetchAndRender(url, push);
  }

  // hamburger toggle + close on link click
  function initMenu() {
    const btn = hamburger();
    const nav = menuNav();
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      nav.classList.toggle('ativo');
      const expanded = nav.classList.contains('ativo');
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    // close when any menu link clicked
    nav.querySelectorAll('.menu a').forEach(a => {
      a.addEventListener('click', (e) => {
        nav.classList.remove('ativo');
        hamburger()?.setAttribute('aria-expanded','false');
      });
    });

    // close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('ativo')) return;
      if (!nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('ativo');
        btn.setAttribute('aria-expanded','false');
      }
    });

    // keyboard: ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        nav.classList.remove('ativo');
        btn.setAttribute('aria-expanded','false');
      }
    });
  }

  // Re-run any page-level handlers (for forms, masks, etc.)
  function attachInternalHandlers() {
    // Example: if page has newsletter form
    const newsletter = document.querySelector('.newsletter-form');
    if (newsletter) {
      newsletter.addEventListener('submit', function(e){
        e.preventDefault();
        showToast('Obrigado! Você foi inscrito.');
        newsletter.reset();
      });
    }

    // Input masks (minimal, safe)
    const cpf = document.getElementById('cpf');
    if (cpf) cpf.addEventListener('input', formatCPF);
    const telefone = document.getElementById('telefone');
    if (telefone) telefone.addEventListener('input', formatTel);
    const cep = document.getElementById('cep');
    if (cep) cep.addEventListener('input', formatCEP);

    // small showToast helper attach if not present globally
    window.showToast = window.showToast || function(msg, t=2200){
      let el = document.querySelector('.toast');
      if(!el){ el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
      el.textContent = msg; el.classList.add('show');
      setTimeout(()=> el.classList.remove('show'), t);
    };
  }

  // small format helpers
  function formatCPF(e){
    let v = e.target.value.replace(/\D/g,'').slice(0,11);
    v = v.replace(/(\d{3})(\d)/,'$1.$2');
    v = v.replace(/(\d{3})\.(\d{3})(\d)/,'$1.$2.$3');
    v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/,'$1.$2.$3-$4');
    e.target.value = v;
  }
  function formatTel(e){
    let v = e.target.value.replace(/\D/g,'').slice(0,11);
    v = v.replace(/^(\d{2})(\d)/,'($1) $2');
    v = v.replace(/(\d)(\d{4})$/,'$1-$2');
    e.target.value = v;
  }
  function formatCEP(e){
    let v = e.target.value.replace(/\D/g,'').slice(0,8);
    v = v.replace(/^(\d{5})(\d)/,'$1-$2');
    e.target.value = v;
  }

  // initial router on load
  function boot() {
    initMenu();

    // handle back/forward
    window.addEventListener('popstate', () => {
      routeToHash(location.hash || '#/home', false);
    });

    // delegate clicks on internal links with hashes to SPA router
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#/"]');
      if (a) {
        e.preventDefault();
        const h = a.getAttribute('href');
        routeToHash(h, true);
      }
    });

    // initial route: use hash or load home
    const startHash = location.hash || '#/home';
    routeToHash(startHash, false);
  }

  // Wait DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
