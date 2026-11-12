// ===== إعدادات الموقع (ده الملف اللي بتعدله) =====
window.ASER = {
  // 1) Supabase → Project Settings → API  (لو فاضيين: الموقع بيشتغل "معاينة" بأمثلة ومش بيسجّل حاجة)
  //    الـ anon key عادي يبقى ظاهر. أوعى تحط service_role key هنا أبداً.
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",

  // 2) فيديو اللعبة: بعد ما ترفعه على يوتيوب، انسخ الكود اللي بعد watch?v=  (مثال: "dQw4w9WgXcQ")
  //    لو فاضي: بيعرض أحدث فيديو على قناة اللعبة.
  YT_VIDEO_ID: "",
  YT_UPLOADS_PLAYLIST: "UUl0LLCJ4qkQitS80CtJdjAw",

  // 3) ميعاد نزول اللعبة (لو حطيته يظهر عدّاد تنازلي)  مثال: "2027-01-15T18:00:00+02:00"
  RELEASE_DATE: "",

  // 4) الطريق لنزول اللعبة: غيّر done لـ true لما المرحلة تخلص (النسبة بتتحسب لوحدها)
  ROAD: [
    { en: "Power fruits and fighting styles", ar: "فواكه القوة وأساليب القتال", done: true },
    { en: "Cars, races and the bank robbery", ar: "العربيات والسباقات وسرقة البنك", done: true },
    { en: "The sea, caves and the workshop", ar: "البحر والكهوف والورشة", done: true },
    { en: "English and Arabic", ar: "إنجليزي وعربي", done: true },
    { en: "The game website and ASER CITY", ar: "موقع اللعبة ومدينة ASER", done: true },
    { en: "The game's name (players vote)", ar: "اسم اللعبة (اللاعيبة بيصوّتوا)", done: false },
    { en: "Online server for everyone", ar: "سيرفر أونلاين للكل", done: false },
    { en: "Mobile version", ar: "نسخة الموبايل", done: false },
    { en: "Release day!", ar: "يوم النزول!", done: false }
  ],

  // 5) اسم المستخدم بيتحوّل لحساب داخلي بالشكل ده (اللاعب مش بيشوفه ومفيش إيميلات بتتبعت). ما تغيّروش بعد ما ناس تسجّل.
  ACCOUNT_DOMAIN: "players.aserworld.com"
};
