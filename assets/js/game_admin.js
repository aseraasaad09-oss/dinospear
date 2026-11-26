// DINOSPEAR game admin V01 — the admin (only an admin account, checked on the server) gets an ADMIN button inside every game.
// Each game tells this panel what it can do: window.DS_GAME = { name, cmds: [[id, en, ar], …], run(id) }.
(function () {
  'use strict';
  if (!window.supabase || !window.ASER_KEY) return;
  var sb = window.supabase.createClient('https://djpgranztcqxyfehynux.supabase.co', window.ASER_KEY, { auth: { persistSession: true } });
  var en = function () { try { return localStorage.getItem('aser_lang') === 'en'; } catch (e) { return false; } };
  var COMMON = [['powerful', 'POWERFUL mode (no damage)', 'وضع POWERFUL (مفيش ضرر)'], ['fast', 'Speed x2', 'سرعة ×2']];
  function build() {
    if (document.getElementById('dsAdm')) return;
    var b = document.createElement('button'); b.id = 'dsAdm'; b.type = 'button'; b.textContent = 'ADMIN';
    b.style.cssText = 'position:fixed;z-index:9000;top:max(64px,env(safe-area-inset-top));inset-inline-end:10px;border:2px solid #fde047;background:#7c2d12;color:#fde047;font:900 12px system-ui,sans-serif;border-radius:12px;padding:8px 10px;letter-spacing:1px;cursor:pointer';
    var p = document.createElement('div');
    p.style.cssText = 'position:fixed;z-index:9001;top:max(104px,env(safe-area-inset-top));inset-inline-end:10px;width:min(270px,88vw);max-height:70vh;overflow:auto;background:rgba(15,23,42,.96);border:2px solid #fde047;border-radius:16px;padding:10px;display:none;flex-direction:column;gap:6px;font:700 14px system-ui,sans-serif;color:#fff';
    function fill() {
      p.innerHTML = '';
      var g = window.DS_GAME || {}, h = document.createElement('b'); h.textContent = 'ADMIN · ' + (g.name || document.title.split('—')[0]); h.style.color = '#fde047'; p.appendChild(h);
      COMMON.concat(g.cmds || []).forEach(function (c) {
        var on = window.DS_ADM && window.DS_ADM[c[0]];
        var x = document.createElement('button'); x.type = 'button'; x.textContent = (en() ? c[1] : c[2]) + (on === true ? ' ✓' : '');
        x.style.cssText = 'text-align:start;border:0;border-radius:10px;padding:9px 10px;background:' + (on === true ? '#166534' : 'rgba(255,255,255,.1)') + ';color:#fff;font:700 14px system-ui,sans-serif;cursor:pointer';
        x.onclick = function () {
          window.DS_ADM = window.DS_ADM || {};
          if (c[0] === 'powerful' || c[0] === 'fast') window.DS_ADM[c[0]] = !window.DS_ADM[c[0]];
          var r = g.run ? g.run(c[0]) : null;
          var t = document.createElement('div'); t.textContent = (r || (en() ? 'Done ✓' : 'تمام ✓')); t.style.cssText = 'position:fixed;z-index:9002;left:50%;top:14%;transform:translateX(-50%);background:#7c2d12;color:#fde047;padding:8px 14px;border-radius:12px;font:800 14px system-ui'; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 1300);
          fill();
        };
        p.appendChild(x);
      });
    }
    b.onclick = function (e) { e.stopPropagation(); var open = p.style.display !== 'flex'; p.style.display = open ? 'flex' : 'none'; if (open) fill(); };
    document.body.appendChild(b); document.body.appendChild(p);
  }
  sb.auth.getSession().then(function (s) { if (s.data && s.data.session) sb.rpc('is_admin').then(function (r) { if (r.data === true) build(); }); });
})();
