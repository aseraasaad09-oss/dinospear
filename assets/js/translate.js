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
  // 1) Chrome's own translator on the device (natural, free, private); 2) a free online translator as a fallback
  var tr = {};
  function viaDevice(text, from, to) {
    if (!('Translator' in self)) return Promise.reject();
    var key = from + to;
    tr[key] = tr[key] || self.Translator.availability({ sourceLanguage: from, targetLanguage: to }).then(function (a) { if (a === 'unavailable') throw 0; return self.Translator.create({ sourceLanguage: from, targetLanguage: to }); });
    return tr[key].then(function (t) { return t.translate(text); });
  }
  function viaWeb(text, from, to) {
    return fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text.slice(0, 480)) + '&langpair=' + from + '|' + to)
      .then(function (r) { return r.json(); }).then(function (j) { var o = j && j.responseData && j.responseData.translatedText; if (!o || /MYMEMORY WARNING|QUERY LENGTH/i.test(o)) throw 0; return o; });
  }
  var queue = [], busy = 0;
  function pump() {
    while (busy < 2 && queue.length) {
      var job = queue.shift(); busy++;
      (function (job) {
        var k = job.from + job.to + ':' + job.text;
        var p = cache[k] ? Promise.resolve(cache[k]) : viaDevice(job.text, job.from, job.to).catch(function () { return viaWeb(job.text, job.from, job.to); });
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
