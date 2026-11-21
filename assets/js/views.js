// DINOSPEAR views V03 — every app opens full-screen in its own view (no scrolling the page up and down to use it)
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var ar = function () { return (document.documentElement.lang || 'ar') !== 'en'; };
  var css = document.createElement('style');
  css.textContent =
    'body.v-app{overflow:hidden;height:100dvh}' +
    'body.v-app footer{display:none}' +
    'body.v-app #site>section{display:none}' +
    'body.v-app #site>section.v-on{display:block;padding:8px 0 0}' +
    'body.v-app #site>section.v-on .wrap{max-width:none;padding:0 8px}' +
    'body.v-app #site>section.v-on .kicker,body.v-app #site>section.v-on h2,body.v-app #site>section.v-on .lead,body.v-app #site>section.v-on .cta{display:none}' +
    'body.v-app #site>section.v-on .frame{margin:0;border-radius:16px}' +
    'body.v-app #site>section.v-on .frame iframe{height:calc(100dvh - var(--hh,64px) - 16px)!important;min-height:0!important}' +
    'nav.main a.on{background:#2f6fe4;color:#fff}' +
    '#demoSec{display:none}';
  document.head.appendChild(css);

  // demo becomes a view inside the app too
  var site = $('#site');
  if (site && !$('#demoSec')) {
    var d = document.createElement('section'); d.id = 'demoSec';
    d.innerHTML = '<div class="wrap"><div class="frame"><iframe data-src="demo/" title="Demos" allow="fullscreen; autoplay"></iframe></div></div>';
    site.appendChild(d);
  }
  var MAP = { home: null, town3d: 'town3d', app: 'app', ideas: 'ideas', helper: 'helper', demo: 'demoSec' };
  var headerH = function () { var h = document.querySelector('header'); document.documentElement.style.setProperty('--hh', (h ? h.offsetHeight : 64) + 'px'); };

  function go(v, push) {
    if (!(v in MAP)) v = 'home';
    var id = MAP[v];
    document.body.classList.toggle('v-app', !!id);
    document.querySelectorAll('#site>section').forEach(function (s) { s.classList.toggle('v-on', s.id === id); });
    if (id) {
      var f = document.getElementById(id).querySelector('iframe');
      if (f && f.dataset.src && !f.src) f.src = f.dataset.src;
      if (f) f.loading = 'eager';
    }
    document.querySelectorAll('nav.main a').forEach(function (a) { a.classList.toggle('on', a.dataset.v === v); });
    headerH(); scrollTo(0, 0);
    if (push) try { history.replaceState(null, '', v === 'home' ? location.pathname : '#v=' + v); } catch (e) {}
  }
  // nav: one link per view
  var nav = $('nav.main');
  if (nav) {
    var items = [['home', 'الرئيسية', 'Home'], ['town3d', 'المدينة 3D', '3D Town'], ['app', 'الشات والشطرنج', 'Chat & Chess'], ['demo', 'جرّب الألعاب', 'Demos'], ['ideas', 'أفكاركم', 'Ideas'], ['helper', 'المساعد', 'Helper']];
    nav.innerHTML = '';
    items.forEach(function (it) {
      var a = document.createElement('a'); a.href = '#v=' + it[0]; a.dataset.v = it[0];
      a.dataset.ar = it[1]; a.dataset.en = it[2]; a.textContent = ar() ? it[1] : it[2];
      a.onclick = function (e) { e.preventDefault(); go(it[0], true); };
      nav.appendChild(a);
    });
    new MutationObserver(function () { nav.querySelectorAll('a').forEach(function (a) { var t = ar() ? a.dataset.ar : a.dataset.en; if (a.textContent !== t) a.textContent = t; }); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  // hero buttons open the views too
  document.querySelectorAll('a[href="#town3d"],a[href="town/"]').forEach(function (a) { if (!a.closest('nav')) a.onclick = function (e) { e.preventDefault(); go('town3d', true); }; });
  document.querySelectorAll('a[href="demo/"]').forEach(function (a) { if (!a.closest('nav')) a.onclick = function (e) { e.preventDefault(); go('demo', true); }; });
  addEventListener('resize', headerH);
  try { new ResizeObserver(headerH).observe(document.querySelector('header')); } catch (e) {}
  var m = /#v=(\w+)/.exec(location.hash); go(m ? m[1] : 'home', false);

  // ideas: show the most-liked idea clearly at the top with a badge
  function patchIdeas() {
    var f = document.querySelector('#ideas iframe'); var doc;
    try { doc = f && f.contentDocument; } catch (e) { return; }
    if (!doc || !doc.getElementById('list') || doc.getElementById('ds-top-css')) return;
    var st = doc.createElement('style'); st.id = 'ds-top-css';
    st.textContent = '.post.ds-top{border:2px solid #ffd040!important;box-shadow:0 0 0 3px rgba(255,208,64,.25)}.ds-badge{display:inline-block;background:#ffd040;color:#3a2a00;font-weight:800;font-size:12.5px;border-radius:999px;padding:2px 10px;margin-inline-start:6px}';
    doc.head.appendChild(st);
    var list = doc.getElementById('list');
    var mark = function () {
      var best = null, bl = 0;
      list.querySelectorAll('.post').forEach(function (p) {
        p.classList.remove('ds-top'); var b = p.querySelector('.ds-badge'); if (b) b.remove();
        var btn = p.querySelector('.like'); var n = btn ? parseInt((btn.textContent.match(/\d+/) || ['0'])[0], 10) : 0;
        if (n > bl) { bl = n; best = p; }
      });
      if (best) {
        best.classList.add('ds-top');
        var top = best.querySelector('.top'); var bd = doc.createElement('span'); bd.className = 'ds-badge';
        bd.textContent = ar() ? '🏆 الأكثر لايكات' : '🏆 Most liked'; if (top) top.appendChild(bd);
        if (list.firstElementChild !== best) list.insertBefore(best, list.firstElementChild);
      }
    };
    var busy = false;
    new MutationObserver(function () { if (busy) return; busy = true; setTimeout(function () { mark(); busy = false; }, 30); }).observe(list, { childList: true });
    mark();
  }
  // chat & chess: put the chat/chess tabs first on small screens, and jump to them when a tab is chosen
  function patchCity() {
    var f = document.querySelector('#app iframe'); var doc;
    try { doc = f && f.contentDocument; } catch (e) { return; }
    if (!doc || !doc.querySelector('.panel') || doc.getElementById('ds-city-css')) return;
    var st = doc.createElement('style'); st.id = 'ds-city-css';
    st.textContent = '@media (max-width:900px){.panel{order:-1}}';
    doc.head.appendChild(st);
    var p = doc.querySelector('.panel'); if (p && p.parentElement) { var cs = doc.defaultView.getComputedStyle(p.parentElement).display; if (!/flex|grid/.test(cs)) p.parentElement.insertBefore(p, p.parentElement.firstChild); }
    doc.querySelectorAll('.tabs3 button').forEach(function (b) { b.addEventListener('click', function () { setTimeout(function () { var t = doc.querySelector('.tabs3'); if (t) t.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 60); }); });
  }
  setInterval(function () { patchIdeas(); patchCity(); }, 1500);
})();
