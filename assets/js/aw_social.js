// ASER WORLD social V01: see everyone who is in ASER WORLD right now (phone, iPhone, Android, laptop, the app or the site — all the same room),
// talk to them in a chat, and jump next to a friend. Uses the same Supabase Realtime room as the game (anon key only).
(function () {
  var en = function () { try { return localStorage.getItem('aser_lang') === 'en'; } catch (e) { return false; } };
  var T = function (a, b) { return en() ? a : b; };
  var ua = navigator.userAgent, app = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  window.AW_PF = (/iPhone|iPod/.test(ua) ? '🍎📱 iPhone' : /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? '🍎 iPad' : /Android/.test(ua) ? '🤖📱 Android' : /Mac/.test(ua) ? '💻 Mac' : /Windows/.test(ua) ? '💻 Windows' : '💻 PC') + (app ? ' · App' : ' · Web');
  var BAD = ['fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'porn', 'sex', 'nude', 'rape', 'whore', 'slut', 'كس', 'كسمك', 'شرموط', 'شرموطة', 'متناك', 'منيوك', 'خول', 'عرص', 'معرص', 'زب', 'طيز', 'نيك', 'سكس'];
  function clean(t) { t = String(t || '').replace(/[<>]/g, '').slice(0, 160); BAD.forEach(function (w) { t = t.replace(new RegExp(w, 'gi'), '***'); }); return t; }
  var ui = null, list = [], log = [];
  function css() {
    var st = document.createElement('style');
    st.textContent = '#awS{position:fixed;z-index:60;top:calc(env(safe-area-inset-top) + 64px);inset-inline-start:10px;font:700 14px system-ui;color:#fff}#awS .tg{border:0;border-radius:999px;padding:8px 14px;background:rgba(15,23,42,.8);color:#fff;font:800 14px system-ui;box-shadow:0 6px 16px rgba(0,0,0,.3)}#awS .pn{margin-top:8px;width:min(320px,86vw);max-height:62vh;display:flex;flex-direction:column;background:rgba(15,23,42,.92);border-radius:18px;padding:10px;gap:8px}#awS .pl{display:grid;gap:6px;max-height:24vh;overflow:auto}#awS .pr{display:flex;justify-content:space-between;align-items:center;gap:6px;background:rgba(255,255,255,.08);border-radius:12px;padding:6px 8px}#awS .pr small{opacity:.7;font-weight:600}#awS .pr button,#awS form button{border:0;border-radius:10px;padding:6px 10px;background:#22c55e;color:#06210f;font:800 12px system-ui}#awS .lg{overflow:auto;min-height:80px;max-height:24vh;display:grid;gap:4px;font-weight:600;font-size:13px}#awS .lg b{color:#fde047}#awS form{display:flex;gap:6px}#awS input{flex:1;min-width:0;border:0;border-radius:10px;padding:8px;font:600 14px system-ui}';
    document.head.appendChild(st);
  }
  function build() {
    if (ui) return; css();
    ui = document.createElement('div'); ui.id = 'awS';
    ui.innerHTML = '<button type="button" class="tg"></button><div class="pn" hidden><b class="h"></b><div class="pl"></div><b class="h2"></b><div class="lg"></div><form><input maxlength="160"><button type="submit"></button></form></div>';
    document.body.appendChild(ui);
    var tg = ui.querySelector('.tg'), pn = ui.querySelector('.pn');
    tg.onclick = function () { pn.hidden = !pn.hidden; draw(); };
    ui.querySelector('.h2').textContent = T('💬 Chat with everyone here', '💬 كلّم كل اللي هنا');
    ui.querySelector('form button').textContent = T('Send', 'ابعت');
    ui.querySelector('input').placeholder = T('Write a message…', 'اكتب رسالة…');
    ui.querySelector('input').addEventListener('keydown', function (e) { e.stopPropagation(); });
    ui.querySelector('form').onsubmit = function (e) {
      e.preventDefault(); var inp = ui.querySelector('input'), v = clean(inp.value).trim(); if (!v || !window.AW) return; inp.value = '';
      var A = window.AW; A.ch.send({ type: 'broadcast', event: 'm', payload: { i: A.r.id, n: A.r.n, t: v } }); add(A.r.n, v, A.me);
    };
  }
  function bubble(mesh, text) {
    var A = window.AW; if (!A || !A.t.label || !mesh) return;
    var b = A.t.label(text.slice(0, 40), '#ffffff', 0.32); b.position.y = 2.9; mesh.add(b);
    setTimeout(function () { mesh.remove(b); }, 5000);
  }
  function add(n, t, mesh) { log.push([n, t]); if (log.length > 40) log.shift(); bubble(mesh, t); draw(); }
  function draw() {
    if (!ui) return;
    ui.querySelector('.tg').textContent = '👥 ' + list.length + ' ' + T('online', 'أونلاين');
    if (ui.querySelector('.pn').hidden) return;
    ui.querySelector('.h').textContent = T('👥 In ASER WORLD now (any phone, PC or app)', '👥 موجودين في ASER WORLD دلوقتي (أي موبايل أو كمبيوتر أو البرنامج)');
    var pl = ui.querySelector('.pl'); pl.innerHTML = '';
    list.forEach(function (p) {
      var row = document.createElement('div'); row.className = 'pr';
      var who = document.createElement('div'); var nb = document.createElement('div'); nb.textContent = p.n + (p.me ? T(' (you)', ' (انت)') : ''); var sm = document.createElement('small'); sm.textContent = p.pf || ''; who.appendChild(nb); who.appendChild(sm); row.appendChild(who);
      if (!p.me) { var go = document.createElement('button'); go.type = 'button'; go.textContent = T('📍 Go to', '📍 روح له'); go.onclick = function () { var A = window.AW, o = A && A.others.get(p.id); if (!o) return; A.me.position.set(o.m.position.x + 1.2, o.m.position.y, o.m.position.z); }; row.appendChild(go); }
      pl.appendChild(row);
    });
    var lg = ui.querySelector('.lg'); lg.innerHTML = '';
    if (!log.length) { var e = document.createElement('div'); e.style.opacity = '.7'; e.textContent = T('No messages yet — say hi 👋', 'لسه مفيش رسايل — قول أهلاً 👋'); lg.appendChild(e); }
    log.forEach(function (m) { var d = document.createElement('div'); var b = document.createElement('b'); b.textContent = m[0] + ': '; d.appendChild(b); d.appendChild(document.createTextNode(m[1])); d.dir = 'auto'; lg.appendChild(d); });
    lg.scrollTop = lg.scrollHeight;
  }
  window.AW_hook = function (ch) {
    build();
    ch.on('broadcast', { event: 'm' }, function (e) { var d = e.payload; if (!d || typeof d.t !== 'string') return; var o = window.AW && window.AW.others.get(d.i); add(String(d.n || '?').slice(0, 16), clean(d.t), o && o.m); });
    ch.on('presence', { event: 'sync' }, function () {
      var st = ch.presenceState(), me = window.AW && window.AW.r.id; list = [];
      Object.keys(st).forEach(function (k) { var x = st[k][0] || {}; list.push({ id: k, n: String(x.n || 'PLAYER').slice(0, 16), pf: String(x.pf || ''), me: k === me }); });
      list.sort(function (a, b) { return a.me ? -1 : b.me ? 1 : 0; }); draw();
    });
  };
  // keep showing up for friends while the phone screen is on another app for a moment
  document.addEventListener('visibilitychange', function () { var A = window.AW; if (!A || !A.ch) return; if (!document.hidden) try { A.ch.track({ n: A.r.n, pf: window.AW_PF }); } catch (e) {} });
})();
