// DINOSPEAR home V01 — sign-in gate + content + install app
(function () {
  'use strict';
  // V08: any link ending in ?update (e.g. from the Framer site) clears the old copy first
  if (/[?&]update\b/.test(location.search)) { location.replace('update.html'); return; }
  var S = {
    n_home: ['Home', 'الرئيسية'], n_art: ['Article', 'المقال'], n_pchat: ['Public chat', 'الشات العام'], n_wa: ['WhatsApp', 'واتساب'], n_admin: ['Admin', 'لوحة الأدمن'], close: ['Close', 'اقفل'],
    pc_rules: ['Be respectful. Bad words are hidden automatically (★★★) in every language; 100+ bad messages in a day = automatic 1-day ban.', 'خليك محترم. الشتايم بتتشفّر لوحدها (★★★) بكل اللغات، واللي يبعت أكتر من 100 رسالة فيها شتايم في يوم بيتبند يوم كامل أوتوماتيك.'],
    pc_ph: ['Write to everyone…', 'اكتب للكل…'], pc_send: ['Send', 'ابعت'], pc_banned: ['You are banned until', 'انت متبند لحد'],
    ad_h: ['Admin panel', 'لوحة الأدمن'], ad_user: ['Player name', 'اسم اللاعب'], ad_arg: ['Value (hours / amount / word / message)', 'القيمة (ساعات / عدد / كلمة / رسالة)'],
    st_h: ['Settings', 'الإعدادات'], st_theme: ['Mode', 'الوضع'], st_day: ['Day', 'صباحي'], st_night: ['Night', 'ليلي'], st_auto: ['Auto', 'تلقائي'], st_lang: ['Language', 'اللغة'], st_motion: ['Animations', 'الحركة'], st_on: ['On', 'شغّال'], st_off: ['Off', 'مقفول'], st_acc: ['Account', 'الحساب'], n_video: ['Video', 'الفيديو'], t_k: ['Inside the app', 'جوه البرنامج'], t_h: ['TOWN DINOSPEAR 3D', 'المدينة ثلاثية الأبعاد'], t_p: ['Walk with your avatar, enter the houses, work and play — right here.', 'اتمشّى بالأفاتار بتاعك، وادخل البيوت، واشتغل والعب — هنا على طول.'], t_full: ['Full screen', 'الشاشة كلها'], v_k: ['Watch', 'اتفرج'], v_h: ['A tour of DINOSPEAR in 5 minutes', 'جولة في دينوسبير في 5 دقايق'], n_town: ['3D Town', 'المدينة 3D'], n_app: ['Chat & Chess', 'الشات والشطرنج'], n_demo: ['App games', 'ألعاب البرنامج'], st_ver: ['App version', 'إصدار البرنامج'], st_rot: ['Turn-screen button', 'زرار قلب الشاشة'], n_ideas: ['Your ideas', 'أفكاركم'], n_road: ['Roadmap', 'التطوير'], n_game: ['The game', 'اللعبة'], n_helper: ['Helper', 'المساعد'], n_comm: ['Community', 'المجتمع'],
    signin: ['Sign in', 'تسجيل الدخول'], signup: ['New account', 'حساب جديد'], signout: ['Sign out', 'تسجيل الخروج'],
    uname: ['Username', 'اسم المستخدم'], pass: ['Password', 'الباسورد'], pass2: ['Repeat the password', 'اكتب الباسورد تاني'],
    g_sub: ['Sign in to see the site, the 3D town, the chat, chess and the demos.', 'سجّل دخول عشان تشوف الموقع والمدينة 3D والشات والشطرنج والديمو.'],
    g_note: ['Same account as the 3D town. Never share your password.', 'نفس حساب المدينة 3D. ما تقولش الباسورد بتاعك لحد.'],
    h_pill: ['In development', 'قيد التطوير'], h_lead: ['An online world of blocks: eat power fruits, learn fighting styles, drive cars, rob the bank and explore the sea with your friends.', 'عالم أونلاين من المكعبات: كُل فواكه القوة، واتعلّم أساليب القتال، وسوق العربيات، واسرق البنك، واكتشف البحر مع صحابك.'],
    h_by: ['Made by Aser Amro Ahmed', 'صناعة أسر عمرو أحمد'], c_town: ['Enter the 3D town', 'ادخل المدينة 3D'], c_demo: ['Try the demos', 'جرّب الديمو'], install: ['Install the app', 'نزّل التطبيق'],
    a_k: ['Your account', 'حسابك'], a_h: ['Streak, chat and chess', 'الستريك والشات والشطرنج'], a_p: ['Your streak, the WhatsApp-style chat with your 7-digit ID, chess and the guide — all in one place.', 'الستريك بتاعك، والشات زي واتساب بالـ ID بتاعك (7 أرقام)، والشطرنج، والشرح — في مكان واحد.'],
    i_k: ['Vote', 'صوّت'], i_h: ['Your ideas and game names', 'أفكاركم وأسامي اللعبة'],
    r_k: ['The road to release', 'الطريق لنزول اللعبة'], r_h: ['The game is coming', 'اللعبة جاية'], r_p: ['of development done', 'اكتمل من التطوير'],
    f_k: ['The game', 'اللعبة'], f_h: ['A whole world waiting for you', 'عالم كامل مستنّيك'],
    w_h: ['Something is watching you', 'في حاجة بتراقبك'], w_p: ['Something is looking for you…', 'في حاجة بتدوّر عليك…'],
    hp_k: ['Questions?', 'عندك سؤال؟'], hp_h: ['ASER Helper', 'المساعد'],
    cm_k: ['Community', 'المجتمع'], cm_h: ['Be part of the story', 'خليك جزء من الحكاية'], cm_d: ['Discord', 'الديسكورد'], cm_dp: ['Game news, your friends, support, and the first chance to play.', 'أخبار اللعبة، وصحابك، والدعم، وأول فرصة للعب.'], cm_db: ['Join the Discord', 'ادخل الديسكورد'],
    cm_y: ['YouTube', 'اليوتيوب'], cm_yp: ['Game videos and behind the scenes.', 'فيديوهات اللعبة وكواليس التطوير.'], cm_yb: ['Subscribe', 'اشترك في القناة'],
    foot: ['DINOSPEAR · ASER WORLD · Made by Aser Amro Ahmed · Support on Discord only', 'DINOSPEAR · ASER WORLD · صناعة أسر عمرو أحمد · الدعم على الديسكورد بس'],
  };
  var ROAD = [['Power fruits and fighting styles', 'فواكه القوة وأساليب القتال', 1], ['Cars, races and the bank heist', 'العربيات والسباقات وسرقة البنك', 1], ['The sea, caves and the workshop', 'البحر والكهوف والورشة', 1], ['English and Arabic', 'الإنجليزي والعربي', 1], ['The game website', 'موقع اللعبة', 1], ['The game name — players decide', 'اسم اللعبة — اللاعيبة بيقرروا', 2], ['Online server for everyone', 'سيرفر أونلاين للكل', 0], ['Mobile version', 'نسخة الموبايل', 0], ['Release day!', 'يوم نزول اللعبة!', 0]];
  var FEATS = [['fruit', 'Power fruits', 'فواكه القوة', 'Every fruit unlocks a different power.', 'كل فاكهة بتفتح قوة مختلفة.'], ['world', 'Fighting styles', 'أساليب القتال', 'Learn and mix your style with your power.', 'اتعلّم وامزج أسلوبك مع قوتك.'], ['cars', 'Cars', 'العربيات', 'Drive around the city with your friends.', 'لفّ المدينة بعربيتك مع صحابك.'], ['races', 'Races', 'السباقات', 'Race your friends on 4 tracks.', 'اتسابق مع صحابك على 4 حلبات.'], ['heist', 'Bank heist', 'سرقة البنك', 'Plan the heist with your team.', 'خطّط للسرقة مع فريقك.'], ['sea', 'The sea', 'البحر', 'Adventures beyond the city shore.', 'مغامرات أبعد من شط المدينة.'], ['caves', 'The caves', 'الكهوف', 'Find what hides in the dark.', 'اكتشف اللي مستخبي في الضلمة.'], ['workshop', 'The workshop', 'الورشة', 'Craft new things for your world.', 'اصنع حاجات جديدة لعالمك.']];

  var lang = DSA.lang(), $ = function (id) { return document.getElementById(id); };
  var t = function (k) { var s = S[k]; return s ? s[lang === 'en' ? 0 : 1] : k; };
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.querySelectorAll('[data-i]').forEach(function (el) { el.textContent = t(el.dataset.i); });
    document.querySelectorAll('[data-ph]').forEach(function (el) { el.placeholder = t(el.dataset.ph); });
    document.querySelectorAll('.lang button').forEach(function (b) { b.classList.toggle('on', b.dataset.l === lang); });
    $('urule').textContent = DSA.urule(); $('prule').textContent = DSA.prule();
    $('aBtn').textContent = mode === 'up' ? t('signup') : t('signin');
    var L = lang === 'en' ? 0 : 1;
    $('road').innerHTML = '';
    ROAD.forEach(function (r, i) {
      var d = document.createElement('div'); d.className = 'step';
      var b = document.createElement('b'); b.textContent = String(i + 1).padStart(2, '0');
      var s = document.createElement('span'); s.textContent = r[L];
      var e = document.createElement('em'); e.className = r[2] === 1 ? '' : r[2] === 2 ? 'vote' : 'soon';
      e.textContent = r[2] === 1 ? (L ? 'تمّ الإنجاز' : 'Done') : r[2] === 2 ? (L ? 'دورك تختار' : 'Your vote') : (L ? 'قريبًا' : 'Soon');
      d.appendChild(b); d.appendChild(s); d.appendChild(e); $('road').appendChild(d);
    });
    $('feats').innerHTML = '';
    FEATS.forEach(function (f) {
      var d = document.createElement('div'); d.className = 'feat';
      var im = document.createElement('img'); im.src = 'assets/img/' + f[0] + '.jpg'; im.alt = ''; im.loading = 'lazy';
      var c = document.createElement('div'); var h = document.createElement('h3'); h.textContent = f[1 + L]; var p = document.createElement('p'); p.textContent = f[3 + L];
      c.appendChild(h); c.appendChild(p); d.appendChild(im); d.appendChild(c); $('feats').appendChild(d);
    });
  }
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.onclick = function () { lang = b.dataset.l; try { localStorage.setItem('aser_lang', lang); } catch (e) {} applyLang(); };
  });

  // ---------- Supabase ----------
  var URL = 'https://djpgranztcqxyfehynux.supabase.co', DOMAIN = 'players.aserworld.com';
  var sb = (window.supabase && window.ASER_KEY) ? window.supabase.createClient(URL, window.ASER_KEY, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
  var mode = 'in', busy = false;
  function setMode(m) {
    mode = m; $('tIn').setAttribute('aria-selected', m === 'in'); $('tUp').setAttribute('aria-selected', m === 'up');
    $('p2box').hidden = m !== 'up'; $('pass').autocomplete = m === 'up' ? 'new-password' : 'current-password';
    $('aBtn').textContent = m === 'up' ? t('signup') : t('signin'); status('');
  }
  $('tIn').onclick = function () { setMode('in'); }; $('tUp').onclick = function () { setMode('up'); };
  function status(msg, cls) { var s = $('ast'); s.textContent = msg || ''; s.className = 'status' + (cls ? ' ' + cls : ''); }
  function errText(e) {
    var m = (e && (e.message || e.code)) || '';
    if (/USERNAME_TAKEN|already registered|already been registered|User already/i.test(m)) return DSA.t('This name is taken — pick another one.', 'الاسم ده متاخد — اختار اسم تاني.');
    if (/Invalid login credentials/i.test(m)) return DSA.t('Wrong name or password. (Spaces don\'t matter.)', 'الاسم أو الباسورد غلط. (المسافات مش بتفرق.)');
    if (/rate|too many/i.test(m)) return DSA.t('Too many tries — wait a minute and try again.', 'محاولات كتير — استنى دقيقة وجرّب تاني.');
    if (/Failed to fetch|NetworkError|network/i.test(m)) return DSA.t('No internet connection to the server — try again.', 'مفيش اتصال بالسيرفر — جرّب تاني.');
    return DSA.t('Something went wrong: ', 'حصلت مشكلة: ') + m;
  }
  $('aForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!sb) return status(DSA.t('Can\'t reach the server right now.', 'مش قادرين نوصل للسيرفر دلوقتي.'), 'err');
    var n = DSA.u($('uname').value), p = DSA.p($('pass').value);
    if (!DSA.ok(n)) return status(DSA.urule(), 'err');
    if (p.length < 8) return status(DSA.prule(), 'err');
    if (mode === 'up' && p !== DSA.p($('pass2').value)) return status(DSA.t('The two passwords are not the same.', 'الباسوردين مش زي بعض.'), 'err');
    if (busy) return; busy = true; $('aBtn').disabled = true; status(DSA.t('Loading…', 'بنحمّل…'));
    var email = DSA.mail(n, DOMAIN);
    var job = mode === 'up'
      ? sb.rpc('username_available', { p_username: n }).then(function (r) { if (r.error) throw r.error; if (!r.data) throw { message: 'USERNAME_TAKEN' }; return sb.auth.signUp({ email: email, password: p, options: { data: { username: n } } }); })
      : sb.auth.signInWithPassword({ email: email, password: p });
    job.then(function (r) { if (r.error) throw r.error; $('pass').value = ''; $('pass2').value = ''; status(''); })
      .catch(function (e) { status(errText(e), 'err'); })
      .then(function () { busy = false; $('aBtn').disabled = false; });
  });
  function show(user) {
    var on = !!user;
    $('gate').hidden = on; $('site').hidden = !on; $('nav').hidden = !on; $('outBtn').hidden = !on;
    var nm = on ? ((user.user_metadata && user.user_metadata.username) || '') : '';
    $('who').textContent = nm;
    if (on) { checkAdmin(); if (location.hash === '#pchat') pcStart(); var sw = document.getElementById('stWho'); if (sw) sw.textContent = nm; } else { $('navAdmin').hidden = true; pcStop(); }
  }
  $('outBtn').onclick = function () { DSA.confirmOut().then(function (ok) { if (ok && sb) sb.auth.signOut().then(function () { show(null); scrollTo(0, 0); }); }); };
  if (sb) {
    sb.auth.getSession().then(function (r) { show(r.data && r.data.session ? r.data.session.user : null); });
    sb.auth.onAuthStateChange(function (_e, s) { show(s ? s.user : null); });
  } else show(null);

  // ---------- views (one screen at a time) ----------
  var VIEWS = ['home', 'town3d', 'app', 'wa', 'pchat', 'demo', 'ideas', 'helper', 'admin'];
  function setHH() { document.documentElement.style.setProperty('--hh', document.querySelector('header').offsetHeight + 'px'); }
  addEventListener('resize', setHH);
  function route() {
    var h = (location.hash || '#home').slice(1), v = VIEWS.indexOf(h) >= 0 ? h : 'home', anchor = v === 'home' && h !== 'home' ? h : null;
    VIEWS.forEach(function (x) { document.body.classList.toggle('v-' + x, x === v); });
    var scrollV = ['app', 'wa', 'ideas', 'helper', 'pchat', 'admin'].indexOf(v) >= 0;   // V04: these scroll with the whole page (no box inside a box)
    document.body.classList.toggle('v-full', v !== 'home' && !scrollV);
    document.body.classList.toggle('v-scroll', scrollV);
    document.querySelectorAll('nav.main a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + (anchor || v)); });
    var sec = document.getElementById(v);
    if (sec) sec.querySelectorAll('iframe[data-src]').forEach(function (f) { if (!f.getAttribute('src')) f.setAttribute('src', f.getAttribute('data-src')); });
    setHH();
    if (anchor && document.getElementById(anchor)) setTimeout(function () { document.getElementById(anchor).scrollIntoView(); }, 30); else scrollTo(0, 0);
  }
  addEventListener('hashchange', route);
  // V04: inner pages grow to their full height, so you scroll the page only
  var FIT_CSS = 'html,body{height:auto!important;min-height:0!important;overflow:visible!important}';
  function fitFrames() {
    if (!document.body.classList.contains('v-scroll')) return;
    document.querySelectorAll('section iframe').forEach(function (f) {
      if (f.offsetParent === null) return;
      try {
        var d = f.contentDocument; if (!d || !d.body) return;
        if (!d.getElementById('ds-fit')) { var st = d.createElement('style'); st.id = 'ds-fit'; st.textContent = FIT_CSS; d.head.appendChild(st); }
        var h = Math.max(d.documentElement.scrollHeight, d.body.scrollHeight, 480);
        if (Math.abs(f.offsetHeight - h) > 4) f.style.setProperty('height', h + 'px', 'important');
      } catch (e) {}
    });
  }
  setInterval(fitFrames, 700);
  route();
  $('townFull').onclick = function () { var f = $('townFrame'); (f.requestFullscreen || f.webkitRequestFullscreen || function () { location.href = 'town/'; }).call(f); };

  // ---------- day / night + settings ----------
  function themeNow() { var m = 'day'; try { m = localStorage.getItem('ds_theme') || 'day'; } catch (e) {} if (m === 'auto') { var h = new Date().getHours(); return (h >= 19 || h < 6) ? 'night' : 'day'; } return m; }
  var APP_DAY = ':root{--night:#2a3f78;--deep:#33508f;--panel:#3d5ba3;--line:#6c87cc;--text:#ffffff;--muted:#e3e9fb}';
  var APP_NIGHT = ':root{--night:#0b1226;--deep:#111b3a;--panel:#16213f;--line:#2a3a6b;--text:#eef2ff;--muted:#a9b6dc}';
  function paintFrames() {
    var css = themeNow() === 'night' ? APP_NIGHT : APP_DAY;
    document.querySelectorAll('iframe').forEach(function (f) {
      try { var d = f.contentDocument; if (!d || !d.head) return; var st = d.getElementById('ds-theme2'); if (!st) { st = d.createElement('style'); st.id = 'ds-theme2'; d.head.appendChild(st); } st.textContent = css; } catch (e) {}
    });
  }
  function applyTheme() { document.documentElement.dataset.theme = themeNow(); paintFrames(); syncSeg(); }
  function setPref(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function syncSeg() {
    var m = 'day', mo = 'on'; try { m = localStorage.getItem('ds_theme') || 'day'; mo = localStorage.getItem('ds_motion') || 'on'; } catch (e) {}
    document.querySelectorAll('#segTheme button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === m); });
    document.querySelectorAll('#segLang button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === lang); });
    document.querySelectorAll('#segMotion button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === mo); });
  }
  document.querySelectorAll('iframe').forEach(function (f) { f.addEventListener('load', paintFrames); });
  $('themeBtn').onclick = function () { setPref('ds_theme', themeNow() === 'night' ? 'day' : 'night'); applyTheme(); };
  $('setBtn').onclick = function () { $('sheet').hidden = false; syncSeg(); };
  $('stClose').onclick = function () { $('sheet').hidden = true; };
  $('sheet').onclick = function (e) { if (e.target === $('sheet')) $('sheet').hidden = true; };
  document.querySelectorAll('#segTheme button').forEach(function (b) { b.onclick = function () { setPref('ds_theme', b.dataset.v); applyTheme(); }; });
  document.querySelectorAll('#segLang button').forEach(function (b) { b.onclick = function () { lang = b.dataset.v; setPref('aser_lang', lang); applyLang(); syncSeg(); }; });
  document.querySelectorAll('#segMotion button').forEach(function (b) { b.onclick = function () { setPref('ds_motion', b.dataset.v); document.documentElement.dataset.motion = b.dataset.v; syncSeg(); }; });
  $('stOut').onclick = function () { $('sheet').hidden = true; $('outBtn').click(); };
  setInterval(function () { var m = 'day'; try { m = localStorage.getItem('ds_theme'); } catch (e) {} if (m === 'auto') applyTheme(); }, 60000);
  applyTheme();

  // ---------- public chat ----------
  var pcLast = 0, pcTimer = null, pcBusy = false;
  function pcRender(rows) {
    var feed = $('pcFeed'), atBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 80;
    rows.forEach(function (m) {
      pcLast = Math.max(pcLast, m.id);
      var d = document.createElement('div'); d.className = 'msg' + (m.mine ? ' me' : '');
      var b = document.createElement('b'); b.textContent = m.username + (m.is_admin ? ' ★ ADMIN' : ''); if (m.is_admin) b.className = 'adm';
      var p = document.createElement('span'); p.textContent = m.body; p.dir = 'auto';
      d.appendChild(b); d.appendChild(p); feed.appendChild(d);
    });
    while (feed.children.length > 200) feed.removeChild(feed.firstChild);
    if (atBottom || rows.some(function (m) { return m.mine; })) feed.scrollTop = feed.scrollHeight;
  }
  function pcPoll() {
    if (!sb || pcBusy) return; pcBusy = true;
    sb.rpc('public_feed', { p_after: pcLast }).then(function (r) { pcBusy = false; if (!r.error && r.data) pcRender(r.data); }, function () { pcBusy = false; });
  }
  function pcStart() { if (pcTimer) return; pcPoll(); pcTimer = setInterval(pcPoll, 2500); }
  function pcStop() { clearInterval(pcTimer); pcTimer = null; }
  $('pcForm').addEventListener('submit', function (e) {
    e.preventDefault(); var v = $('pcIn').value.replace(/[<>]/g, '').trim(); if (!v || !sb) return;
    $('pcIn').value = '';
    sb.rpc('public_send', { p_body: v }).then(function (r) {
      if (r.error) { var m = r.error.message || ''; alertMsg(/BANNED/.test(m) ? DSA.t('You are banned right now.', 'انت متبند دلوقتي.') : /RATE/.test(m) ? DSA.t('Slow down a little.', 'استنى شوية وابعت تاني.') : m); return; }
      pcPoll();
    });
  });
  function alertMsg(m) { var n = document.createElement('div'); n.className = 'msg'; n.style.background = '#fee2e2'; n.style.color = '#991b1b'; n.textContent = m; $('pcFeed').appendChild(n); $('pcFeed').scrollTop = 1e9; }

  // ---------- admin panel (only shows for admins; the server checks again on every command) ----------
  var ADM = [
    ['stats', 'Stats', 'إحصائيات'], ['players', 'All players', 'كل اللاعيبة'], ['info', 'Player info', 'معلومات لاعب'],
    ['ban', 'Ban (hours)', 'بان (ساعات)'], ['unban', 'Unban', 'فك البان'], ['bans', 'Banned list', 'المتبندين'],
    ['clear_user', 'Delete player posts', 'امسح منشورات لاعب'], ['clear_public', 'Clear public chat', 'امسح الشات العام'], ['announce', 'Announce', 'إعلان للكل'],
    ['word_add', 'Add bad word', 'ضيف شتيمة للفلتر'], ['word_del', 'Remove bad word', 'شيل كلمة من الفلتر'], ['words', 'Filter size', 'عدد كلمات الفلتر'],
    ['t:coins', 'Give coins 🪙', 'إدي فلوس 🪙'], ['t:gems', 'Give gems', 'إدي جواهر'], ['t:unlock_all', 'Unlock all houses', 'افتح كل البيوت'], ['t:reset_heists', 'Reset heists', 'رجّع السرقات'], ['t:stats', 'Town stats', 'إحصائيات المدينة']
  ];
  function adRun(cmd) {
    var u = $('adUser').value.trim(), a = $('adArg').value.trim(), out = $('adOut'); out.textContent = '…';
    var job = cmd.indexOf('t:') === 0
      ? sb.rpc('town_admin', { p_cmd: cmd.slice(2), p_user: u, p_amount: parseInt(a, 10) || 0 })
      : sb.rpc('admin_cmd', { p_cmd: cmd, p_user: u || null, p_arg: a || null });
    job.then(function (r) { out.textContent = r.error ? ('✗ ' + (r.error.message || 'error')) : ('✓ ' + (r.data == null ? 'OK' : r.data)); });
  }
  function adBuild() {
    var box = $('adBtns'); box.innerHTML = '';
    ADM.forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (/ban|clear/.test(c[0]) ? '' : ' ghost'); b.textContent = lang === 'en' ? c[1] : c[2]; b.onclick = function () { adRun(c[0]); }; box.appendChild(b); });
  }
  function checkAdmin() {
    if (!sb) return;
    sb.rpc('admin_cmd', { p_cmd: 'stats' }).then(function (r) { var ok = !r.error; $('navAdmin').hidden = !ok; if (ok) adBuild(); });
  }
  addEventListener('hashchange', function () { (location.hash === '#pchat') ? pcStart() : pcStop(); });

  // ---------- install as an app (PWA) ----------
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; $('installBtn').hidden = false; });
  $('installBtn').onclick = function () { if (deferred) { deferred.prompt(); deferred = null; $('installBtn').hidden = true; } };
  // V06: every 10 minutes remind the player to share an idea or a comment
  setInterval(function () {
    if (document.hidden || $('site').hidden || location.hash === '#ideas') return;
    var t = document.getElementById('ideaNudge');
    if (!t) { t = document.createElement('a'); t.id = 'ideaNudge'; t.href = '#ideas'; t.style.cssText = 'position:fixed;inset-inline-start:14px;bottom:14px;z-index:70;background:#8b5cf6;color:#fff;font-weight:800;padding:12px 16px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.25);text-decoration:none;max-width:80vw'; document.body.appendChild(t); t.onclick = function () { t.remove(); }; }
    t.textContent = DSA.t('💡 Got an idea or a comment for the game? Write it in Your ideas!', '💡 عندك فكرة أو كومنت للعبة؟ اكتبها في أفكاركم!');
    setTimeout(function () { t && t.remove(); }, 12000);
  }, 600000);
  // V10: in-app updates — the app checks by itself, shows "new update" with what changed, one tap updates
  var APP_V = 'V36';
  var UPD = { box: null, shown: '' };
  function wipeAndReload() {
    var p = [];
    if ('serviceWorker' in navigator) p.push(navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }));
    if (window.caches) p.push(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }));
    ['./', 'index.html', 'assets/js/home.js', 'assets/js/events.js', 'assets/js/translate.js', 'assets/js/rotate.js', 'assets/js/ds_auth.js', 'assets/js/icons.js', 'sw.js', 'demo/index.html', 'town/index.html', 'app/city.html'].forEach(function (u) { p.push(fetch(u, { cache: 'reload' }).catch(function () {})); });
    try { sessionStorage.setItem('ds_upd_done', UPD.target || ''); } catch (e) {}
    Promise.all(p).catch(function () {}).then(function () { location.replace(location.pathname + '?v=' + Date.now() + location.hash); });
  }
  function updBox(info, auto) {
    if (!UPD.box) {
      var b = document.createElement('div'); b.id = 'updBox';
      b.style.cssText = 'position:fixed;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:90;width:min(440px,calc(100vw - 24px));background:#0f172a;color:#fff;border:2px solid #22c55e;border-radius:20px;padding:14px 16px;box-shadow:0 18px 50px rgba(0,0,0,.45);font-weight:600';
      document.body.appendChild(b); UPD.box = b;
    }
    var en = (document.documentElement.lang || 'ar').indexOf('en') === 0, b = UPD.box;
    b.innerHTML = '';
    var h = document.createElement('div'); h.style.cssText = 'font-weight:900;font-size:17px;margin-bottom:6px';
    h.textContent = auto ? (en ? 'Updating the app…' : 'جاري تحديث البرنامج…') : (en ? 'New update ' : 'تحديث جديد ') + info.v + ' 🎉';
    b.appendChild(h);
    var list = (en ? info.en : info.ar) || [];
    if (list.length) { var ul = document.createElement('ul'); ul.style.cssText = 'margin:0 0 10px;padding-inline-start:20px;line-height:1.7;font-size:14px;opacity:.92'; list.slice(0, 5).forEach(function (x) { var li = document.createElement('li'); li.textContent = x; ul.appendChild(li); }); b.appendChild(ul); }
    if (auto) return;
    var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px';
    var q = document.createElement('div'); q.style.cssText = 'font-weight:800;margin:4px 0 10px'; q.textContent = en ? 'Do you want to update now?' : 'تحب تحدّث دلوقتي؟'; b.appendChild(q);
    var go = document.createElement('button'); go.type = 'button'; go.className = 'btn'; go.style.flex = '2'; go.textContent = en ? 'Yes, update' : 'أيوه، حدّث';
    go.onclick = function () { h.textContent = en ? 'Updating…' : 'جاري التحديث…'; row.remove(); wipeAndReload(); };
    var later = document.createElement('button'); later.type = 'button'; later.className = 'btn ghost'; later.style.flex = '1'; later.textContent = en ? 'No' : 'لأ';
    later.onclick = function () { UPD.no = info.v; b.remove(); UPD.box = null; };
    row.appendChild(go); row.appendChild(later); b.appendChild(row);
  }
  var bootT = Date.now();
  function notify(info) {
    if (!('Notification' in window)) return;
    var en = (document.documentElement.lang || 'ar').indexOf('en') === 0;
    function fire() {
      try {
        var n = new Notification(en ? 'DINOSPEAR — new update ' + info.v : 'DINOSPEAR — تحديث جديد ' + info.v, { body: ((en ? info.en : info.ar) || []).slice(0, 2).join(' • ') + (en ? '\nOpen the app to update.' : '\nافتح البرنامج علشان تحدّث.'), icon: 'assets/img/icon-192.png', tag: 'ds-update' });
        n.onclick = function () { window.focus(); n.close(); };
      } catch (e) {}
    }
    if (Notification.permission === 'granted') { if (document.hidden) fire(); }
    else if (Notification.permission === 'default' && UPD.box && !UPD.askedPerm) {
      UPD.askedPerm = true;
      var nb = document.createElement('button'); nb.type = 'button'; nb.className = 'btn ghost'; nb.style.cssText = 'margin-top:8px;width:100%';
      nb.textContent = en ? 'Notify me about next updates' : 'بلّغني بالتحديثات الجاية';
      nb.onclick = function () { Notification.requestPermission().then(function () { nb.remove(); }); };
      UPD.box.appendChild(nb);
    }
  }
  function checkUpdate(manual) {
    if (!navigator.onLine) { if (manual) manual(null); return; }
    fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (info) {
      if (manual) manual(info);
      if (!info || !info.v || info.v === APP_V) return;
      var done = ''; try { done = sessionStorage.getItem('ds_upd_done') || ''; } catch (e) {}
      if (done === info.v) return;                       // already updated to this one in this visit: never loop
      if (UPD.no === info.v) return;                     // the player pressed "No" for this version
      UPD.target = info.v;
      if (UPD.shown !== info.v || !UPD.box) { UPD.shown = info.v; updBox(info, false); notify(info); }
    }).catch(function () { if (manual) manual(null); });
  }
  window.DS_checkUpdate = checkUpdate;
  // settings: show the version + a "check for updates" button
  (function () {
    var acc = $('stWho'); if (!acc) return;
    var opt = document.createElement('div'); opt.className = 'opt';
    var lb = document.createElement('b'); lb.setAttribute('data-i', 'st_ver'); lb.textContent = DSA.t('App version', 'إصدار البرنامج');
    var wrap = document.createElement('span'); wrap.style.cssText = 'display:flex;gap:8px;align-items:center';
    var vv = document.createElement('span'); vv.textContent = APP_V; vv.style.direction = 'ltr';
    var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'btn ghost'; bt.style.cssText = 'padding:8px 12px'; bt.textContent = DSA.t('Check for update', 'دوّر على تحديث');
    bt.onclick = function () {
      bt.textContent = DSA.t('Checking…', 'بدوّر…');
      checkUpdate(function (info) {
        if (!info) bt.textContent = DSA.t('No internet', 'مفيش نت');
        else if (info.v === APP_V) bt.textContent = DSA.t('You have the newest ✓', 'عندك آخر نسخة ✓');
        else { bt.textContent = DSA.t('Updating…', 'بيحدّث…'); wipeAndReload(); }
        setTimeout(function () { bt.textContent = DSA.t('Check for update', 'دوّر على تحديث'); }, 2500);
      });
    };
    wrap.appendChild(vv); wrap.appendChild(bt); opt.appendChild(lb); opt.appendChild(wrap);
    acc.parentNode.parentNode.insertBefore(opt, acc.parentNode.nextSibling);
  })();
  // V13: settings switch for the movable "turn the screen" button (phones)
  (function () {
    var acc = $('stWho'); if (!acc || !matchMedia('(pointer:coarse)').matches) return;
    var opt = document.createElement('div'); opt.className = 'opt';
    var lb = document.createElement('b'); lb.setAttribute('data-i', 'st_rot'); lb.textContent = DSA.t('Turn-screen button', 'زرار قلب الشاشة');
    var seg = document.createElement('div'); seg.className = 'seg';
    var cur = 'off'; try { cur = localStorage.getItem('ds_rot_btn') || 'off'; } catch (e) {}
    [['on', 'st_on'], ['off', 'st_off']].forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-i', o[1]); b.textContent = DSA.t(o[0] === 'on' ? 'On' : 'Off', o[0] === 'on' ? 'شغّال' : 'مقفول');
      if (o[0] === cur) b.className = 'on';
      b.onclick = function () { try { localStorage.setItem('ds_rot_btn', o[0]); } catch (e) {} seg.querySelectorAll('button').forEach(function (x) { x.className = x === b ? 'on' : ''; }); window.DS_rotBtn && window.DS_rotBtn(); };
      seg.appendChild(b);
    });
    opt.appendChild(lb); opt.appendChild(seg);
    acc.parentNode.parentNode.insertBefore(opt, acc.parentNode);
  })();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
      setInterval(function () { if (navigator.onLine) reg.update().catch(function () {}); }, 120000);
    }).catch(function () {});
  }
  checkUpdate(); setInterval(function () { if (!document.hidden) checkUpdate(); }, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) checkUpdate(); });

  setMode('in'); applyLang();
})();
