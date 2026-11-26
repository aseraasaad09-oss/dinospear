// DINOSPEAR events V01 — weekly / monthly events: a banner for players, a form for the admin
(function () {
  'use strict';
  if (!window.supabase || !window.ASER_KEY) return;
  var sb = window.supabase.createClient('https://djpgranztcqxyfehynux.supabase.co', window.ASER_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  var en = function () { return (document.documentElement.lang || 'ar').indexOf('en') === 0; };
  var T = function (e, a) { return en() ? e : a; };
  var GAMES = [['', 'Whole app', 'البرنامج كله'], ['ss', 'SILENT SLIPPER', 'SILENT SLIPPER'], ['killer', 'THE KILLER WINNER', 'THE KILLER WINNER'], ['zombie', 'ZOMBIE MARS', 'ZOMBIE MARS'], ['hide', 'Hide & Seek', 'الاستغماية'], ['moto', 'MOTOR BIKE', 'MOTOR BIKE'], ['text', 'THE TEXT', 'THE TEXT'], ['town', '3D Town', 'المدينة 3D'], ['world', 'ASER WORLD', 'ASER WORLD']];
  // the current window of an event (repeats move the window forward)
  function windowOf(ev, now) {
    var s = new Date(ev.starts_at), e = new Date(ev.ends_at), len = e - s;
    if (ev.repeat === 'weekly') { var wk = 7 * 864e5; while (s.getTime() + len < now) s = new Date(s.getTime() + wk); }
    if (ev.repeat === 'monthly') { while (s.getTime() + len < now) { s = new Date(s); s.setMonth(s.getMonth() + 1); } }
    return { s: s.getTime(), e: s.getTime() + len };
  }
  function fmt(t) { try { return new Date(t).toLocaleString(en() ? 'en-GB' : 'ar-EG', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return new Date(t).toISOString(); } }
  function banner(list) {
    var old = document.getElementById('evBanner'); if (old) old.remove();
    var now = Date.now(), live = [], next = [];
    list.forEach(function (ev) { var w = windowOf(ev, now); if (w.s <= now && now < w.e) live.push([ev, w]); else if (w.s > now) next.push([ev, w]); });
    next.sort(function (a, b) { return a[1].s - b[1].s; });
    var show = live[0] || next[0]; if (!show) return;
    var ev = show[0], w = show[1], isLive = !!live[0];
    var b = document.createElement('div'); b.id = 'evBanner';
    b.style.cssText = 'margin:12px auto;max-width:1100px;border-radius:18px;padding:12px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-weight:700;color:#fff;background:' + (isLive ? 'linear-gradient(135deg,#7c3aed,#db2777)' : 'linear-gradient(135deg,#1e3a8a,#0f766e)');
    var tag = document.createElement('span'); tag.style.cssText = 'background:rgba(0,0,0,.25);border-radius:999px;padding:4px 10px;font-size:12px;font-weight:900';
    tag.textContent = isLive ? T('EVENT NOW', 'إيفنت دلوقتي') : T('NEXT EVENT', 'الإيفنت الجاي');
    var tt = document.createElement('b'); tt.style.fontSize = '17px'; tt.textContent = en() ? ev.title_en : ev.title_ar;
    var g = GAMES.find(function (x) { return x[0] === ev.game; }); var gg = document.createElement('span'); gg.style.opacity = '.85'; gg.textContent = g && g[0] ? '· ' + (en() ? g[1] : g[2]) : '';
    var body = document.createElement('span'); body.style.cssText = 'flex-basis:100%;font-weight:500;opacity:.92'; body.textContent = en() ? ev.body_en : ev.body_ar;
    var when = document.createElement('span'); when.style.cssText = 'margin-inline-start:auto;font-size:13px;opacity:.9';
    when.textContent = isLive ? T('ends ', 'بيخلص ') + fmt(w.e) : T('starts ', 'بيبدأ ') + fmt(w.s);
    b.appendChild(tag); b.appendChild(tt); b.appendChild(gg); b.appendChild(when); if (body.textContent) b.appendChild(body);
    var host = document.getElementById('home'); if (host) host.parentNode.insertBefore(b, host);
  }
  function load() { sb.from('site_events').select('*').eq('hidden', false).order('starts_at').limit(50).then(function (r) { if (!r.error) { window.DS_EVENTS = r.data; banner(r.data); } }); }
  // ---------- admin form ----------
  function adminForm() {
    var wrap = document.querySelector('#admin .admin-wrap'); if (!wrap || document.getElementById('evAdmin')) return;
    var box = document.createElement('div'); box.id = 'evAdmin'; box.style.cssText = 'margin-top:22px;border-top:2px solid var(--line,#334155);padding-top:16px';
    var h = document.createElement('h3'); h.textContent = T('Events (weekly / monthly)', 'الإيفنتات (أسبوعي / شهري)'); box.appendChild(h);
    function field(id, lab, type) { var l = document.createElement('label'); l.textContent = lab; l.htmlFor = id; var i = document.createElement(type === 'area' ? 'textarea' : type === 'sel' ? 'select' : 'input'); i.id = id; if (type && type !== 'area' && type !== 'sel') i.type = type; i.style.width = '100%'; box.appendChild(l); box.appendChild(i); return i; }
    var tAr = field('evTAr', T('Title (Arabic)', 'العنوان بالعربي')), tEn = field('evTEn', T('Title (English)', 'العنوان بالإنجليزي'));
    var bAr = field('evBAr', T('What happens (Arabic)', 'هيحصل إيه (عربي)'), 'area'), bEn = field('evBEn', T('What happens (English)', 'هيحصل إيه (إنجليزي)'), 'area');
    var gm = field('evGame', T('Game', 'اللعبة'), 'sel'); GAMES.forEach(function (g) { var o = document.createElement('option'); o.value = g[0]; o.textContent = en() ? g[1] : g[2]; gm.appendChild(o); });
    var st = field('evStart', T('Starts', 'بيبدأ'), 'datetime-local'), hrs = field('evHours', T('How many hours', 'كام ساعة'), 'number'); hrs.value = 48; hrs.min = 1; hrs.max = 720;
    var rp = field('evRepeat', T('Repeat', 'بيتكرر'), 'sel'); [['none', 'Once', 'مرة واحدة'], ['weekly', 'Every week', 'كل أسبوع'], ['monthly', 'Every month', 'كل شهر']].forEach(function (x) { var o = document.createElement('option'); o.value = x[0]; o.textContent = en() ? x[1] : x[2]; rp.appendChild(o); });
    var go = document.createElement('button'); go.type = 'button'; go.className = 'btn'; go.style.marginTop = '10px'; go.textContent = T('Add event', 'ضيف الإيفنت'); box.appendChild(go);
    var msg = document.createElement('div'); msg.style.marginTop = '8px'; box.appendChild(msg);
    var list = document.createElement('div'); list.style.marginTop = '12px'; box.appendChild(list);
    function refresh() {
      sb.from('site_events').select('*').order('starts_at', { ascending: false }).limit(30).then(function (r) {
        list.innerHTML = ''; (r.data || []).forEach(function (ev) {
          var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line,#334155)' + (ev.hidden ? ';opacity:.45' : '');
          var t = document.createElement('span'); t.style.flex = '1'; t.textContent = (en() ? ev.title_en : ev.title_ar) + ' · ' + fmt(ev.starts_at) + ' · ' + ev.repeat; row.appendChild(t);
          var hb = document.createElement('button'); hb.type = 'button'; hb.className = 'btn ghost'; hb.textContent = ev.hidden ? T('Show', 'اظهر') : T('Hide', 'خبّي');
          hb.onclick = function () { sb.from('site_events').update({ hidden: !ev.hidden }).eq('id', ev.id).then(function () { refresh(); load(); }); };
          row.appendChild(hb); list.appendChild(row);
        });
      });
    }
    go.onclick = function () {
      if (tAr.value.trim().length < 2 || tEn.value.trim().length < 2 || !st.value) { msg.textContent = T('Write both titles and the start time.', 'اكتب العنوانين ووقت البداية.'); return; }
      var s = new Date(st.value), e = new Date(s.getTime() + Math.max(1, +hrs.value || 1) * 36e5);
      sb.from('site_events').insert({ title_ar: tAr.value.trim(), title_en: tEn.value.trim(), body_ar: bAr.value.trim(), body_en: bEn.value.trim(), game: gm.value, starts_at: s.toISOString(), ends_at: e.toISOString(), repeat: rp.value }).then(function (r) {
        msg.textContent = r.error ? T('Could not add: ', 'ما اتضافش: ') + r.error.message : T('Added ✓ — players see it now.', 'اتضاف ✓ — اللاعيبة شايفينه دلوقتي.');
        if (!r.error) { tAr.value = tEn.value = bAr.value = bEn.value = ''; refresh(); load(); }
      });
    };
    wrap.appendChild(box); refresh();
  }
  function checkAdmin() { sb.auth.getSession().then(function (s) { if (s.data && s.data.session) sb.rpc('is_admin').then(function (r) { if (r.data) adminForm(); }); }); }
  // ---------- NEWS: the admin's global channel (only the admin writes, everyone reads) ----------
  function news() {
    sb.from('site_news').select('*').eq('hidden', false).order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(6).then(function (r) {
      var old = document.getElementById('nwBox'); if (old) old.remove(); if (r.error || !r.data.length) return;
      var box = document.createElement('div'); box.id = 'nwBox';
      box.style.cssText = 'margin:10px auto;max-width:1100px;border-radius:18px;padding:12px 16px;background:var(--card,#fff);border:2px solid var(--line,#e2e8f0);color:inherit';
      var h = document.createElement('b'); h.style.cssText = 'display:block;margin-bottom:6px;font-size:16px'; h.textContent = T('📣 News from the admin', '📣 أخبار من الأدمن'); box.appendChild(h);
      r.data.forEach(function (n) {
        var row = document.createElement('div'); row.style.cssText = 'padding:6px 0;border-top:1px solid var(--line,#e2e8f0);display:flex;gap:8px;align-items:baseline';
        var t = document.createElement('span'); t.style.flex = '1'; t.dir = 'auto';
        var txt = en() ? (n.body_en || n.body_ar) : (n.body_ar || n.body_en); t.textContent = (n.pinned ? '📌 ' : '') + txt;
        if ((en() && !n.body_en) || (!en() && !n.body_ar)) t.setAttribute('data-tr', '1');   // the other language is missing: translate it
        var d = document.createElement('small'); d.style.opacity = '.6'; d.textContent = fmt(n.created_at);
        row.appendChild(t); row.appendChild(d); box.appendChild(row);
      });
      var after = document.getElementById('evBanner') || document.getElementById('home'); if (after) after.parentNode.insertBefore(box, document.getElementById('home'));
    });
  }
  function newsAdmin() {
    var wrap = document.querySelector('#admin .admin-wrap'); if (!wrap || document.getElementById('nwAdmin')) return;
    var box = document.createElement('div'); box.id = 'nwAdmin'; box.style.cssText = 'margin-top:22px;border-top:2px solid var(--line,#334155);padding-top:16px';
    var h = document.createElement('h3'); h.textContent = T('News (global channel)', 'الأخبار (القناة العامة)'); box.appendChild(h);
    var ar = document.createElement('textarea'); ar.placeholder = T('News in Arabic', 'الخبر بالعربي'); ar.style.width = '100%'; ar.maxLength = 500;
    var e2 = document.createElement('textarea'); e2.placeholder = T('News in English (optional — it gets translated)', 'الخبر بالإنجليزي (اختياري — بيتترجم لوحده)'); e2.style.width = '100%'; e2.maxLength = 500;
    var pin = document.createElement('label'); var pc = document.createElement('input'); pc.type = 'checkbox'; pin.appendChild(pc); pin.appendChild(document.createTextNode(' ' + T('Pin at the top', 'ثبّته فوق')));
    var go = document.createElement('button'); go.type = 'button'; go.className = 'btn'; go.textContent = T('Post the news', 'انشر الخبر'); go.style.marginTop = '8px';
    var msg = document.createElement('div'); msg.style.marginTop = '6px';
    var list = document.createElement('div');
    [ar, e2, pin, go, msg, list].forEach(function (x) { box.appendChild(x); });
    function refresh() { sb.from('site_news').select('*').order('created_at', { ascending: false }).limit(20).then(function (r) { list.innerHTML = ''; (r.data || []).forEach(function (n) {
      var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line,#334155)' + (n.hidden ? ';opacity:.45' : '');
      var t = document.createElement('span'); t.style.flex = '1'; t.textContent = (n.pinned ? '📌 ' : '') + (n.body_ar || n.body_en); row.appendChild(t);
      var hb = document.createElement('button'); hb.type = 'button'; hb.className = 'btn ghost'; hb.textContent = n.hidden ? T('Show', 'اظهر') : T('Hide', 'خبّي'); hb.onclick = function () { sb.from('site_news').update({ hidden: !n.hidden }).eq('id', n.id).then(function () { refresh(); news(); }); }; row.appendChild(hb);
      list.appendChild(row); }); }); }
    go.onclick = function () { if ((ar.value + e2.value).trim().length < 2) { msg.textContent = T('Write the news first.', 'اكتب الخبر الأول.'); return; }
      sb.from('site_news').insert({ body_ar: ar.value.trim(), body_en: e2.value.trim(), pinned: pc.checked }).then(function (r) { msg.textContent = r.error ? T('Could not post: ', 'ما اتنشرش: ') + r.error.message : T('Posted ✓ — everyone sees it now.', 'اتنشر ✓ — الكل شايفه دلوقتي.'); if (!r.error) { ar.value = e2.value = ''; pc.checked = false; refresh(); news(); } }); };
    wrap.appendChild(box); refresh();
  }
  var _adm = adminForm; adminForm = function () { _adm(); newsAdmin(); };
  news(); setInterval(news, 300000);
  load(); checkAdmin(); setInterval(load, 300000);
  sb.auth.onAuthStateChange(function (e) { if (e === 'SIGNED_IN') checkAdmin(); });
})();
