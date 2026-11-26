// SILENT SLIPPER online V01: play the same level with 2–4 friends. You see each other on the table (name, health, hits)
// and race for the most slipper hits. Room code over Supabase Realtime (anon key only).
(function () {
  var en = function () { try { return localStorage.getItem('aser_lang') === 'en'; } catch (e) { return false; } };
  var T = function (a, b) { return en() ? a : b; };
  var me = { id: Math.random().toString(36).slice(2, 10), n: '' }, room = null, ch = null, others = new Map(), board = null;
  try { var k = Object.keys(localStorage).find(function (x) { return /^sb-.*-auth-token$/.test(x); }); var j = k && JSON.parse(localStorage.getItem(k)); me.n = ((j && j.user) || {}).user_metadata && j.user.user_metadata.username || ''; } catch (e) {}
  me.n = (me.n || T('Player ', 'لاعب ') + me.id.slice(0, 2).toUpperCase()).slice(0, 12);
  var COLORS = [0x3b82f6, 0xef4444, 0x22c55e, 0xa855f7, 0xf59e0b];
  function css() {
    var st = document.createElement('style');
    st.textContent = '.sso{display:grid;gap:8px;margin-top:10px}.sso .r{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.sso input{width:96px;text-align:center;font:800 18px system-ui;letter-spacing:3px;border-radius:12px;border:2px solid rgba(100,116,139,.4);padding:8px;text-transform:uppercase}.sso small{opacity:.8}.ssb{position:fixed;top:auto;bottom:44px;left:50%;transform:translateX(-50%);z-index:30;background:rgba(15,23,42,.75);color:#fff;border-radius:14px;padding:6px 12px;font:700 13px system-ui;display:flex;gap:12px;pointer-events:none}.ssb b{color:#fde047}';
    document.head.appendChild(st);
  }
  function code() { var c = '', A = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; for (var i = 0; i < 4; i++) c += A[(Math.random() * A.length) | 0]; return c; }
  function join(c, msg) {
    if (!window.supabase || !window.ASER_KEY) { msg.textContent = T('Online needs the internet.', 'الأونلاين محتاج نت.'); return; }
    room = c.toUpperCase(); try { sessionStorage.setItem('ss_room', room); } catch (e) {}
    var sb = window.supabase.createClient('https://djpgranztcqxyfehynux.supabase.co', window.ASER_KEY, { auth: { persistSession: false } });
    ch = sb.channel('ss-' + room, { config: { broadcast: { self: false }, presence: { key: me.id } } });
    ch.on('broadcast', { event: 'p' }, function (e) { var d = e.payload; if (!d || d.id === me.id) return; var o = others.get(d.id) || { d: d, m: null }; o.d = d; o.seen = performance.now(); others.set(d.id, o); });
    ch.on('presence', { event: 'sync' }, function () { var n = Object.keys(ch.presenceState()).length; msg.textContent = T('Room ', 'الأوضة ') + room + ' · ' + n + T(' players — press Play together', ' لاعيبة — دوسوا العب مع بعض'); });
    ch.subscribe(function (st) { if (st === 'SUBSCRIBED') ch.track({ n: me.n }); if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') msg.textContent = T('Could not connect.', 'ما قدرتش أتصل.'); });
    msg.textContent = T('Room ', 'الأوضة ') + room + T(' — send the code to your friends', ' — ابعت الكود لصحابك');
  }
  function addUI(card) {
    if (card.querySelector('.sso')) return;
    var box = document.createElement('div'); box.className = 'sso';
    box.innerHTML = '<b>👥 ' + T('Play online with friends (2–4)', 'العب أونلاين مع صحابك (2–4)') + '</b><div class="r"><button type="button" class="btn">' + T('Make a room', 'اعمل أوضة') + '</button><input maxlength="4" placeholder="ABCD"><button type="button" class="btn">' + T('Join', 'ادخل') + '</button></div><small></small>';
    var b = box.querySelectorAll('button'), inp = box.querySelector('input'), msg = box.querySelector('small');
    b[0].onclick = function () { join(code(), msg); }; b[1].onclick = function () { if (/^[A-Za-z]{4}$/.test(inp.value)) join(inp.value, msg); else msg.textContent = T('Write the 4-letter code.', 'اكتب الكود (4 حروف).'); };
    var row = card.querySelector('.row'); card.insertBefore(box, row || null);
    if (room) { msg.textContent = T('Room ', 'الأوضة ') + room; }
  }
  // the room stays after the level reloads (the game reloads the page between levels)
  try { var r0 = sessionStorage.getItem('ss_room'); if (r0) setTimeout(function () { join(r0, { set textContent(v) {} }); }, 500); } catch (e) {}
  function tick() {
    requestAnimationFrame(tick);
    var S = window.SS_ME; if (!S || !ch) return;
    var now = performance.now();
    if (!tick.t || now - tick.t > 100) { tick.t = now; var g = S.G.position; ch.send({ type: 'broadcast', event: 'p', payload: { id: me.id, n: me.n, x: +g.x.toFixed(2), y: +g.y.toFixed(2), z: +g.z.toFixed(2), r: +S.G.rotation.y.toFixed(2), hp: Math.ceil(S.V.hp), h: S.V.hits, m: S.mode } }).catch(function () {}); }
    var i = 0;
    others.forEach(function (o, id) {
      if (now - o.seen > 5000) { if (o.m) S.scene.remove(o.m); others.delete(id); return; }
      if (!o.m) { o.m = S.t.person({ scale: 0.45, shirt: COLORS[(i + 1) % COLORS.length], pants: 0x1e293b, hair: 0x3b2314 }); var lb = S.t.label ? S.t.label(o.d.n || '?', '#fde047', 0.28) : null; if (lb) { lb.scale.multiplyScalar(0.5); lb.position.y = 3.4; o.m.add(lb); } S.scene.add(o.m); o.m.position.set(o.d.x, o.d.y, o.d.z); }
      var p = o.m.position, dx = o.d.x - p.x, dz = o.d.z - p.z; p.x += dx * 0.25; p.y += (o.d.y - p.y) * 0.25; p.z += dz * 0.25; o.m.rotation.y = o.d.r;
      if (S.t.animate) S.t.animate(o.m, Math.hypot(dx, dz) * 30, 1 / 60);
      i++;
    });
    if (!board) { board = document.createElement('div'); board.className = 'ssb'; document.body.appendChild(board); }
    var rows = [[me.n, Math.ceil(S.V.hp), S.V.hits]]; others.forEach(function (o) { rows.push([o.d.n, o.d.hp, o.d.h]); });
    rows.sort(function (a, b) { return b[2] - a[2]; });
    board.innerHTML = ''; rows.forEach(function (r, k) { var s = document.createElement('span'); s.textContent = (k ? '' : '🏆 ') + r[0] + ' ❤️' + r[1] + ' 🩴' + r[2]; board.appendChild(s); });
  }
  function watch() {
    css();
    new MutationObserver(function () { var go = document.getElementById('ssGo'); if (go) { var card = go.closest('.card'); if (card) addUI(card); } }).observe(document.body, { childList: true, subtree: true });
    tick();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
