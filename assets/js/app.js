(function () {
  "use strict";
  var CFG = window.ASER || {};
  var $ = function (id) { return document.getElementById(id); };

  // ================= اللغة =================
  var AR = {
    nav_road: "النزول", my_house_btn: "بيتي", nav_trailer: "الفيديو", nav_city: "المدينة", nav_features: "اللعبة", nav_vote: "صوّت للاسم", nav_community: "المجتمع",
    badge: "تحت التطوير · ادخل الديسكورد عشان تلعب قبل الكل",
    tagline: "عالم أونلاين بالبلوكات. كُل فواكه القوة، اتعلم أساليب القتال، سوق عربيات، اسرق البنك، واتسابق مع صحابك.",
    join_discord: "ادخل الديسكورد", get_house: "خُد بيتك في المدينة",
    k_road: "الطريق لنزول اللعبة", h_road: "اللعبة جاية", days: "يوم", hours: "ساعة", minutes: "دقيقة", seconds: "ثانية",
    k_trailer: "اتفرج", h_trailer: "فيديو اللعبة", open_yt: "افتح قناة اليوتيوب",
    k_city: "مدينة ASER", h_city: "كل لاعب ليه بيت",
    city_d: "اعمل حساب وبيتك هيظهر في المدينة. بيبدأ مقاس 5 ويكبر 1 كل يوم بتدخل فيه، لحد 100.",
    find_me: "بيتي", houses: "بيت",
    sign_up: "حساب جديد", sign_in: "دخول", username: "اسم المستخدم", uname_rule: "من 3 لـ 16 حرف إنجليزي أو رقم أو _ . ما تكتبش اسمك الحقيقي.",
    password: "الباسورد", password2: "الباسورد تاني", pass_rule: "8 حروف على الأقل. اكتبه في مكان أمان: لو ضاع مش هيرجع.",
    create: "اعمل بيتي", enter: "ادخل", hello: "أهلاً", house_size: "مقاس البيت", go_vote: "صوّت للاسم", logout: "خروج",
    city_demo: "معاينة بس: الحسابات لسه مش متوصلة، فالبيوت دي أمثلة.",
    k_features: "اللعبة", h_features: "كل اللي تقدر تعمله",
    s_fruits: "فاكهة قوة", s_styles: "أساليب قتال", s_skins: "باقة سكنات", s_faces: "وش",
    f1: "فواكه القوة", f1d: "امسك الفاكهة في إيدك، كُلها، وخد قوتها. كل فاكهة ليها حركاتها ونسخة V2 أقوى.",
    f2: "الورشة", f2d: "اجمع خامات واعمل سيوفك وكازماتك بنفسك.",
    f3: "العربيات", f3d: "اشتري عربية، اركنها في أي حتة، ولف بيها البلد.",
    f4: "سرقة البنك", f4d: "اسرق البنك مع صحابك. البوليس جاي بعد دقيقة.",
    f5: "السباقات", f5d: "اتسابق على الحلبات، اكسر رقمك، واكسب كوينز.",
    f6: "البحر", f6d: "انزل البحر، الاقي الجزر، وحارب وحوش البحر.",
    f7: "الكهوف والكنوز", f7d: "احفر لتحت، افتح صناديق الكنز، والاقي الأماكن السرية.",
    f8: "العب بالعربي", f8d: "اللعبة كلها شغالة إنجليزي وعربي. غيّرها من التليفون.",
    watch_d: "في ASER WORLD، لما الليل ييجي… ما تبصلوش.",
    k_vote: "اللاعيبة بيقرروا", h_vote: "صوّت لاسم اللعبة",
    vote_rule: "الاسم اللي ياخد أكتر أصوات هيبقى الاسم الرسمي للعبة. صوت واحد لكل لاعب، وتقدر تغيّر صوتك لحد ما التصويت يقفل.",
    demo: "معاينة بس: التصويت لسه مش متوصل، فالأرقام دي مثال.",
    h_suggest: "اقترح اسم", vote_need: "اعمل حساب في المدينة الأول، وبعدين تقدر تصوّت وتقترح أسامي.",
    suggest: "اقترح اسم جديد", suggest_rule: "من 2 لـ 24 حرف. الفريق بيراجع كل اسم قبل ما يظهر في التصويت.", send: "ابعت",
    k_comm: "المجتمع", h_comm: "العب معانا",
    dc_d: "الأخبار والتحديثات والمساعدة، وأول ناس هتلعب. كل الدعم هنا.",
    yt_d: "فيديوهات وشروحات وتحديثات ASER WORLD.", yt_u: "اشترك في القناة"
  };
  var MSG = {
    en: { pick: "Make an account in the city first, then tap a name to vote.", voted: "Your vote is saved.",
          bad_user: "Username: 3 to 16 English letters, numbers or _ .", bad_pass: "Password: at least 8 characters.", pass_diff: "The two passwords are not the same.",
          taken: "This username is taken. Try another one.", wrong: "Wrong username or password.", welcome: "Welcome to ASER CITY! Your house is ready.",
          grew: "Your house grew to size ", same: "Come back tomorrow and your house grows again.", maxed: "Your house is at the biggest size!",
          bad_name: "Use 2 to 24 letters, numbers or spaces.", sug_ok: "Thanks! The team will check your name.", err: "Something went wrong. Try again in a minute.",
          limit: "You already sent 3 names.", exists: "This name is already in the list.", closed: "Voting is closed.", wait: "Too many tries. Wait a minute and try again.",
          votes: "votes", loading: "Loading…", demo_act: "Preview only. This works when the site is connected.", size: "House size", you: "your house",
          release: "Release day is here!" },
    ar: { pick: "اعمل حساب في المدينة الأول، وبعدين دوس على اسم عشان تصوّت.", voted: "صوتك اتسجل.",
          bad_user: "اسم المستخدم: من 3 لـ 16 حرف إنجليزي أو رقم أو _ .", bad_pass: "الباسورد: 8 حروف على الأقل.", pass_diff: "الباسوردين مش زي بعض.",
          taken: "الاسم ده متاخد. جرّب اسم تاني.", wrong: "اسم المستخدم أو الباسورد غلط.", welcome: "أهلاً بيك في مدينة ASER! بيتك جاهز.",
          grew: "بيتك كبر وبقى مقاس ", same: "تعالى بكرة وبيتك هيكبر تاني.", maxed: "بيتك وصل لأكبر مقاس!",
          bad_name: "استخدم من 2 لـ 24 حرف أو رقم أو مسافة.", sug_ok: "شكراً! الفريق هيراجع الاسم.", err: "حصلت مشكلة. جرّب تاني بعد دقيقة.",
          limit: "انت بعت 3 أسامي خلاص.", exists: "الاسم ده موجود في القائمة.", closed: "التصويت اتقفل.", wait: "محاولات كتير. استنى دقيقة وجرّب تاني.",
          votes: "صوت", loading: "بنحمّل…", demo_act: "معاينة بس. ده هيشتغل لما الموقع يتوصل.", size: "مقاس البيت", you: "بيتك",
          release: "اللعبة نزلت!" }
  };
  var EN = {}, lang = "en";
  try { lang = localStorage.getItem("aser_lang") || ((navigator.language || "").indexOf("ar") === 0 ? "ar" : "en"); } catch (e) {}
  function t(k) { return MSG[lang][k] || MSG.en[k] || k; }
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], k = el.getAttribute("data-i18n");
      if (!(k in EN)) EN[k] = el.textContent;
      el.textContent = lang === "ar" && AR[k] ? AR[k] : EN[k];
    }
    $("lang").textContent = lang === "ar" ? "English" : "عربي";
    setMode(mode); renderVotes(); renderRoad();
  }
  $("lang").addEventListener("click", function () { lang = lang === "ar" ? "en" : "ar"; try { localStorage.setItem("aser_lang", lang); } catch (e) {} applyLang(); });
  function status(id, msg, kind) { var s = $(id); if (!s) return; s.textContent = msg || ""; s.className = "status" + (kind ? " " + kind : ""); }

  // ================= الطريق لنزول اللعبة =================
  function renderRoad() {
    var road = CFG.ROAD || [], done = road.filter(function (r) { return r.done; }).length, pc = road.length ? Math.round(done * 100 / road.length) : 0;
    $("meterFill").style.width = pc + "%"; $("meterTxt").textContent = pc + "%"; $("meter").setAttribute("aria-valuenow", pc);
    var ol = $("steps"); ol.innerHTML = "";
    var next = true;
    road.forEach(function (r) {
      var li = document.createElement("li"); li.className = r.done ? "done" : (next ? "next" : "");
      if (!r.done) next = false;
      li.textContent = lang === "ar" ? r.ar : r.en; ol.appendChild(li);
    });
  }
  var rel = CFG.RELEASE_DATE ? new Date(CFG.RELEASE_DATE) : null;
  if (rel && !isNaN(rel)) {
    $("countdown").hidden = false;
    var tick = function () {
      var ms = rel - Date.now();
      if (ms <= 0) { $("countdown").textContent = t("release"); $("countdown").className = "countdown live"; return; }
      var s = Math.floor(ms / 1000);
      $("cd_d").textContent = Math.floor(s / 86400); $("cd_h").textContent = Math.floor(s % 86400 / 3600);
      $("cd_m").textContent = Math.floor(s % 3600 / 60); $("cd_s").textContent = s % 60;
      setTimeout(tick, 1000);
    };
    tick();
  }

  // ================= الفيديو: فيديو اللعبة بس • بيتحمّل لما تدوس =================
  var ytWatch = CFG.YT_VIDEO_ID ? "https://www.youtube.com/watch?v=" + encodeURIComponent(CFG.YT_VIDEO_ID) : "https://www.youtube.com/channel/UCl0LLCJ4qkQitS80CtJdjAw";
  if (window.self !== window.top || location.protocol === "file:") {   // معاينة أو فتح من الجهاز: يوتيوب مش بيشتغل جوه، فالزرار بيفتح الفيديو على يوتيوب
    var pst = $("poster"), lnk = document.createElement("a");
    lnk.className = "poster"; lnk.id = "poster"; lnk.href = ytWatch; lnk.target = "_blank"; lnk.rel = "noopener noreferrer";
    lnk.setAttribute("aria-label", "Watch on YouTube"); lnk.innerHTML = pst.innerHTML; pst.parentNode.replaceChild(lnk, pst);
  } else $("poster").addEventListener("click", function () {
    var f = document.createElement("iframe");
    f.src = CFG.YT_VIDEO_ID ? "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(CFG.YT_VIDEO_ID) + "?autoplay=1&rel=0"
                            : "https://www.youtube-nocookie.com/embed/videoseries?list=" + encodeURIComponent(CFG.YT_UPLOADS_PLAYLIST || "") + "&autoplay=1&rel=0";
    f.title = "ASER WORLD video"; f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
    f.referrerPolicy = "strict-origin-when-cross-origin";
    var p = $("player"); p.innerHTML = ""; p.appendChild(f);
  });

  // ================= الحسابات (اسم + باسورد • من غير إيميل) =================
  var live = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY && window.supabase);
  var db = live ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
  var user = null, myName = null, busy = false, mode = "up";
  var USER_RE = /^[A-Za-z0-9_]{3,16}$/;
  function acct(u) { return u.toLowerCase() + "@" + (CFG.ACCOUNT_DOMAIN || "players.aserworld.com"); }   // حساب داخلي مخفي • مفيش إيميلات بتتبعت

  function setMode(m) {
    mode = m;
    $("tabUp").setAttribute("aria-selected", m === "up"); $("tabIn").setAttribute("aria-selected", m === "in");
    $("pass2Row").hidden = m !== "up";
    $("pass").setAttribute("autocomplete", m === "up" ? "new-password" : "current-password");
    $("authBtn").textContent = m === "up" ? (lang === "ar" ? AR.create : EN.create || "Create my house") : (lang === "ar" ? AR.enter : "Enter");
  }
  $("tabUp").addEventListener("click", function () { setMode("up"); status("astatus", ""); });
  $("tabIn").addEventListener("click", function () { setMode("in"); status("astatus", ""); });

  function errText(e) {
    var m = (e && (e.message || e.code)) || "";
    if (/USERNAME_TAKEN|already registered|already been registered|user_already_exists/i.test(m)) return t("taken");
    if (/Invalid login|invalid_credentials/i.test(m)) return t("wrong");
    if (/BAD_USERNAME/.test(m)) return t("bad_user");
    if (/Password should|weak_password/i.test(m)) return t("bad_pass");
    if (/LIMIT/.test(m)) return t("limit");
    if (/EXISTS|duplicate/.test(m)) return t("exists");
    if (/CLOSED/.test(m)) return t("closed");
    if (/BAD_NAME/.test(m)) return t("bad_name");
    if (/rate|429|seconds/i.test(m)) return t("wait");
    return t("err");
  }

  $("authForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var u = $("uname").value.trim(), p = $("pass").value;
    if (!USER_RE.test(u)) { status("astatus", t("bad_user"), "err"); return; }
    if (p.length < 8) { status("astatus", t("bad_pass"), "err"); return; }
    if (mode === "up" && p !== $("pass2").value) { status("astatus", t("pass_diff"), "err"); return; }
    if (!live) { status("astatus", t("demo_act")); return; }
    if (busy) return; busy = true; status("astatus", t("loading"));
    var go = mode === "up"
      ? db.rpc("username_available", { p_username: u }).then(function (r) {
          if (r.error) throw r.error; if (!r.data) throw { message: "USERNAME_TAKEN" };
          return db.auth.signUp({ email: acct(u), password: p, options: { data: { username: u } } });
        })
      : db.auth.signInWithPassword({ email: acct(u), password: p });
    go.then(function (r) {
      busy = false; if (r.error) { status("astatus", errText(r.error), "err"); return; }
      $("pass").value = ""; $("pass2").value = "";
      if (!r.data || !r.data.session) { status("astatus", t("err"), "err"); return; }   // لو "Confirm email" شغّال في Supabase
      status("astatus", mode === "up" ? t("welcome") : "", "ok");
    }).catch(function (e) { busy = false; status("astatus", errText(e), "err"); });
  });
  $("logout").addEventListener("click", function () { if (db) db.auth.signOut(); setUser(null); status("astatus", ""); });

  function setUser(u) {
    user = u || null;
    myName = user && user.user_metadata ? user.user_metadata.username || null : null;
    $("authForms").hidden = !!user; $("who").hidden = !user;
    $("suggestForm").hidden = !user; $("voteNeed").hidden = !!user;
    $("whoName").textContent = myName || "";
    if (user) grow(); else { $("growMsg").textContent = ""; }
    loadMine(); loadCity();
  }
  // كل يوم تدخل فيه = البيت يكبر 1 (السيرفر هو اللي بيقرر)
  function grow() {
    db.rpc("visit_city").then(function (r) {
      if (r.error || !r.data) return;
      var d = Array.isArray(r.data) ? r.data[0] : r.data; if (!d) return;
      myName = d.username || myName; $("whoName").textContent = myName; $("mySize").textContent = d.house_size;
      $("growMsg").textContent = d.house_size >= 100 ? t("maxed") : d.grew ? t("grew") + d.house_size + "! " + t("same") : t("same");
      if (d.grew) loadCity();
    });
  }

  // ================= المدينة =================
  var DEMO_CITY = [["Aser", 31], ["BlockKing", 12], ["FruitMaster", 8], ["NinjaZ", 5], ["SpeedRacer", 19], ["Mido_77", 6], ["IceQueen", 54], ["Builder01", 9], ["Shadow", 5], ["RedTruck", 14], ["Gamer_Omar", 7], ["Lava", 5]]
    .map(function (x, i) { return { name: x[0], size: x[1], plot: i }; });
  var pop = $("pop");
  AserCity.init($("cityCanvas"), function (h, x, y) {
    if (!h) { pop.hidden = true; return; }
    pop.textContent = ""; var b = document.createElement("b"); b.textContent = h.name; pop.appendChild(b);
    var sp = document.createElement("span"); sp.textContent = t("size") + ": " + h.size + (myName && h.name.toLowerCase() === myName.toLowerCase() ? " · " + t("you") : "");
    pop.appendChild(sp); pop.style.left = Math.min(x, $("cityCanvas").clientWidth - 160) + "px"; pop.style.top = Math.max(0, y - 70) + "px"; pop.hidden = false;
  });
  $("zin").addEventListener("click", function () { AserCity.zoom(1.25); });
  $("zout").addEventListener("click", function () { AserCity.zoom(0.8); });
  $("zme").addEventListener("click", function () { if (!myName || !AserCity.focus(myName)) $("uname").focus(); });
  function loadCity() {
    if (!live) { $("cityDemo").hidden = false; AserCity.set(DEMO_CITY, null); $("cityCount").textContent = DEMO_CITY.length; return; }
    db.rpc("city_houses").then(function (r) {
      if (r.error) return;
      var list = (r.data || []).map(function (x) { return { name: x.username, size: x.house_size, plot: x.plot }; });
      AserCity.set(list, myName); $("cityCount").textContent = list.length;
    });
  }

  // ================= التصويت =================
  var names = [], myVote = null;
  var DEMO = [{ id: 1, name: "ASER WORLD", votes: 41 }, { id: 2, name: "ASER TOWN", votes: 23 }, { id: 3, name: "ASER LEGENDS", votes: 17 }, { id: 4, name: "FRUIT KINGDOM", votes: 11 }, { id: 5, name: "BLOCK CITY ONLINE", votes: 8 }];
  function renderVotes() {
    var box = $("opts"); box.innerHTML = "";
    if (!names.length) return;
    var total = 0; names.forEach(function (n) { total += n.votes; });
    names.forEach(function (n) {
      var pc = total ? Math.round(n.votes * 100 / total) : 0;
      var b = document.createElement("button"); b.type = "button"; b.className = "opt" + (myVote === n.id ? " mine" : "");
      var bar = document.createElement("span"); bar.className = "bar"; bar.style.width = pc + "%";
      var nm = document.createElement("span"); nm.className = "nm"; nm.textContent = n.name;
      var p = document.createElement("span"); p.className = "pc"; p.textContent = pc + "% · " + n.votes + " " + t("votes");
      b.appendChild(bar); b.appendChild(nm); b.appendChild(p);
      b.addEventListener("click", function () { vote(n.id); });
      box.appendChild(b);
    });
  }
  function loadVotes() {
    if (!live) { names = DEMO.slice(); $("demo").hidden = false; renderVotes(); return; }
    db.rpc("name_results").then(function (r) {
      if (r.error) { status("vstatus", t("err"), "err"); return; }
      names = (r.data || []).map(function (x) { return { id: x.id, name: String(x.name), votes: Number(x.votes) || 0 }; }); renderVotes();
    });
  }
  function loadMine() {
    if (!live || !user) { myVote = null; renderVotes(); return; }
    db.from("votes").select("name_id").eq("user_id", user.id).maybeSingle().then(function (r) { myVote = r.data ? r.data.name_id : null; renderVotes(); });
  }
  function vote(id) {
    if (!live) { status("vstatus", t("demo_act")); return; }
    if (!user) { status("vstatus", t("pick")); return; }
    if (busy) return; busy = true;
    db.rpc("cast_vote", { p_name_id: id }).then(function (r) {
      busy = false; if (r.error) { status("vstatus", errText(r.error), "err"); return; }
      myVote = id; status("vstatus", t("voted"), "ok"); loadVotes();
    });
  }
  $("suggestForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var n = $("sname").value.replace(/\s+/g, " ").trim();
    if (!/^[A-Za-z0-9؀-ۿ ]{2,24}$/.test(n)) { status("sstatus", t("bad_name"), "err"); return; }
    if (!live || busy) return; busy = true;
    db.rpc("suggest_name", { p_name: n }).then(function (r) {
      busy = false; if (r.error) { status("sstatus", errText(r.error), "err"); return; }
      $("sname").value = ""; status("sstatus", t("sug_ok"), "ok");
    });
  });


  // ================= القائمة =================
  var menu = $("menu"), burger = $("burger");
  function openMenu(o) { menu.hidden = !o; burger.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; if (o) $("menuClose").focus(); }
  burger.addEventListener("click", function () { openMenu(true); });
  $("menuClose").addEventListener("click", function () { openMenu(false); });
  menu.addEventListener("click", function (e) { if (e.target === menu || e.target.closest("a")) openMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) openMenu(false); });
  // الجزء اللي إنت فيه بيتنوّر في القائمة
  if ("IntersectionObserver" in window) {
    var navLinks = document.querySelectorAll("nav.links a[data-sec]");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id); }); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["road", "trailer", "city", "features", "vote", "community"].forEach(function (id) { var el = $(id); if (el) io.observe(el); });
  }

  // ================= البداية =================
  applyLang(); renderRoad(); loadVotes(); loadCity();
  if (live) {
    db.auth.getSession().then(function (r) { setUser(r.data && r.data.session ? r.data.session.user : null); });
    db.auth.onAuthStateChange(function (ev, s) { if (ev === "SIGNED_IN" || ev === "SIGNED_OUT") setUser(s ? s.user : null); });
    setInterval(function () { if (!document.hidden) { loadVotes(); loadCity(); } }, 30000);
  }
})();
