// DINOSPEAR translate V01 — messages written in Arabic show in English for English players (and the other way),
// as a natural translation, not word by word. Tap "Original" to see what was written.
(function () {
  'use strict';
  var SEL = ['#pcFeed .msg > span', '.post > p', '.msgs span:not([class])', '[data-tr]'];
  var CACHE_KEY = 'ds_tr_cache', cache = {};
  try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch (e) {}
  function saveCache() { try { var k = Object.keys(cache); if (k.length > 400) k.slice(0, k.length - 400).forEach(function (x) { delete cache[x]; }); localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) {} }
  function uiLang() { var l = 'ar'; try { l = localStorage.getItem('aser_lang') || localStorage.getItem('ds_lang') || ''; } catch (e) {} if (l !== 'en' && l !== 'ar') l = (document.documentElement.lang || 'ar').slice(0, 2); return l === 'en' ? 'en' : 'ar'; }
  function langOf(t) { var ar = (t.match(/[؀-ۿ]/g) || []).length, la = (t.match(/[A-Za-z]/g) || []).length; if (ar + la < 2) return null; return ar >= la ? 'ar' : 'en'; }
  // 1) Chrome's own translator on the device; 2) MyMemory (free); 3) Google's free web translator as a last try
  var tr = {};
  function viaDevice(text, from, to) {
    if (!('Translator' in self)) return Promise.reject();
    var key = from + to;
    tr[key] = tr[key] || self.Translator.availability({ sourceLanguage: from, targetLanguage: to }).then(function (a) { if (a === 'unavailable') throw 0; return self.Translator.create({ sourceLanguage: from, targetLanguage: to }); });
    return tr[key].then(function (t) { return t.translate(text); });
  }
  function viaGoogle(text, from, to) {
    return fetch('https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=' + from + '&tl=' + to + '&q=' + encodeURIComponent(text.slice(0, 900)))
      .then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { var o = (j && j[0] || []).map(function (x) { return x && x[0] || ''; }).join(''); if (!o) throw 0; return o; });
  }
  function viaWeb(text, from, to) {
    return fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text.slice(0, 480)) + '&langpair=' + from + '|' + to)
      .then(function (r) { return r.json(); }).then(function (j) { var o = j && j.responseData && j.responseData.translatedText; if (!o || /MYMEMORY WARNING|QUERY LENGTH/i.test(o)) throw 0; return o; });
  }
  // Egyptian / Gulf chat words → clear Arabic first, so the English comes out natural (not word by word)
  var SLANG = [['يا عم', 'يا صديقي'], ['جامد اوي', 'رائع جداً'], ['جامد أوي', 'رائع جداً'], ['جامدة', 'رائعة'], ['جامد', 'رائع'], ['اوي', 'جداً'], ['أوي', 'جداً'], ['قوي', 'جداً'],
    ['عامل ايه', 'كيف حالك'], ['عاملة ايه', 'كيف حالك'], ['عامل إيه', 'كيف حالك'], ['ازيك', 'كيف حالك'], ['إزيك', 'كيف حالك'], ['شلونك', 'كيف حالك'], ['يلا', 'هيا'], ['عايزة', 'أريد'], ['عايز', 'أريد'], ['أبي', 'أريد'], ['ابغى', 'أريد'],
    ['دلوقتي', 'الآن'], ['الحين', 'الآن'], ['فين', 'أين'], ['وين', 'أين'], ['ليه', 'لماذا'], ['امتى', 'متى'], ['ايه', 'ماذا'], ['إيه', 'ماذا'], ['برضو', 'أيضاً'], ['تمام', 'حسناً'], ['ماشي', 'حسناً'],
    ['مش', 'ليس'], ['كده', 'هكذا'], ['حلوة', 'جميلة'], ['حلو', 'جميل'], ['زي', 'مثل'], ['سوا', 'معاً'], ['النهارده', 'اليوم'], ['بكرة', 'غداً'], ['بكره', 'غداً'], ['اوعى', 'احذر'], ['خلاص', 'انتهى'], ['معلش', 'آسف'], ['دي', 'هذه'], ['ده', 'هذا'], ['اللعبة دي', 'هذه اللعبة']];
  SLANG.sort(function (a, b) { return b[0].length - a[0].length; });
  function clearArabic(t) { SLANG.forEach(function (p) { t = t.replace(new RegExp('(?<![\\p{L}])' + p[0] + '(?![\\p{L}])', 'gu'), p[1]); }); return t; }
  var queue = [], busy = 0;
  function pump() {
    while (busy < 2 && queue.length) {
      var job = queue.shift(); busy++;
      (function (job) {
        var k = job.from + job.to + ':' + job.text;
        var p = cache[k] ? Promise.resolve(cache[k]) : (function () { var src = job.from === 'ar' ? clearArabic(job.text) : job.text; return viaDevice(src, job.from, job.to).catch(function () { return viaWeb(src, job.from, job.to); }).catch(function () { return viaGoogle(src, job.from, job.to); }); })();
        p.then(function (out) { cache[k] = out; saveCache(); show(job.el, out, job.text, job.to); }, function () {}).then(function () { busy--; pump(); });
      })(job);
    }
  }
  function show(el, out, orig, to) {
    if (!el.isConnected || out.trim().toLowerCase() === orig.trim().toLowerCase()) return;
    el.dataset.trDone = '1'; el.dataset.orig = orig; el.dataset.tran = out; el.textContent = out; el.dir = 'auto';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ds-tr-btn';
    b.style.cssText = 'display:inline-block;margin-inline-start:6px;border:0;background:none;color:inherit;opacity:.6;font-size:11px;font-weight:700;cursor:pointer;padding:0;text-decoration:underline';
    var showing = 'tran';
    function lab() { b.textContent = showing === 'tran' ? (to === 'en' ? 'translated · original' : 'مترجمة · الأصل') : (to === 'en' ? 'translate' : 'ترجم'); }
    b.onclick = function (e) { e.stopPropagation(); showing = showing === 'tran' ? 'orig' : 'tran'; el.textContent = showing === 'tran' ? el.dataset.tran : el.dataset.orig; lab(); };
    lab(); el.after(b);
  }
  function scan(root) {
    var to = uiLang();
    SEL.forEach(function (s) {
      (root.querySelectorAll ? root.querySelectorAll(s) : []).forEach(function (el) {
        if (el.dataset.trDone || el.dataset.trQ) return;
        var t = (el.textContent || '').trim(), from = langOf(t);
        if (!from || from === to || t.length > 480 || /★★★/.test(t)) return;
        el.dataset.trQ = '1'; queue.push({ el: el, text: t, from: from, to: to });
      });
    });
    pump();
  }
  var mo = new MutationObserver(function (list) { list.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) scan(n.parentNode || n); }); }); });
  function boot() { scan(document); mo.observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.DS_translateScan = function () { document.querySelectorAll('[data-tr-q]').forEach(function (e) { if (!e.dataset.trDone) delete e.dataset.trQ; }); scan(document); };
})();
