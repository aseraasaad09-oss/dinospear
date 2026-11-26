// What came out V01: a list of every version and what it added (from changes.json), opened from the menu «اللي نزل»
(function () {
  var en = function () { try { return localStorage.getItem('aser_lang') === 'en'; } catch (e) { return false; } };
  function open() {
    var o = document.createElement('div'); o.className = 'chg-ov';
    o.innerHTML = '<div class="chg"><div class="chg-h"><b></b><button type="button" aria-label="close">✕</button></div><div class="chg-l"></div></div>';
    o.querySelector('b').textContent = en() ? '🆕 Everything that came out' : '🆕 كل اللي نزل';
    o.querySelector('button').onclick = function () { o.remove(); }; o.onclick = function (e) { if (e.target === o) o.remove(); };
    document.body.appendChild(o);
    var l = o.querySelector('.chg-l'); l.textContent = '…';
    fetch('changes.json?x=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (a) {
      l.textContent = '';
      a.forEach(function (x, i) {
        var d = document.createElement('div'); d.className = 'chg-i' + (i ? '' : ' new');
        var h = document.createElement('div'); h.className = 'chg-v'; h.textContent = x.v + (i ? '' : (en() ? ' · latest' : ' · الأحدث')) + ' · ' + (x.date || ''); d.appendChild(h);
        var u = document.createElement('ul'); (en() ? x.en : x.ar).forEach(function (t) { var li = document.createElement('li'); li.textContent = t; u.appendChild(li); }); d.appendChild(u);
        l.appendChild(d);
      });
    }).catch(function () { l.textContent = en() ? 'No internet.' : 'مفيش نت.'; });
  }
  window.DS_CHANGES = open;
  var st = document.createElement('style');
  st.textContent = '.chg-ov{position:fixed;inset:0;z-index:200;background:rgba(2,6,23,.6);display:grid;place-items:center;padding:12px}.chg{background:var(--card,#fff);color:var(--ink,#0f172a);width:min(560px,100%);max-height:84dvh;border-radius:22px;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden}.chg-h{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid rgba(100,116,139,.2)}.chg-h button{border:0;background:rgba(100,116,139,.15);border-radius:50%;width:34px;height:34px;font-size:16px;cursor:pointer;color:inherit}.chg-l{overflow:auto;padding:10px 14px 16px}.chg-i{border-radius:14px;padding:10px 12px;margin:8px 0;background:rgba(100,116,139,.08)}.chg-i.new{background:rgba(37,99,235,.12);outline:2px solid rgba(37,99,235,.4)}.chg-v{font-weight:800;color:var(--blue,#2563eb)}.chg-i ul{margin:6px 0 0;padding-inline-start:20px;line-height:1.6}';
  document.head.appendChild(st);
  function hook() {
    var nav = document.querySelector('nav.main'); if (!nav || nav.querySelector('.chg-link')) return;
    var a = document.createElement('a'); a.href = '#'; a.className = 'chg-link'; a.textContent = en() ? '🆕 What came out' : '🆕 اللي نزل';
    a.onclick = function (e) { e.preventDefault(); open(); }; nav.appendChild(a);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook();
})();
