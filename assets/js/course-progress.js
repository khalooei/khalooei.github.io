/* Course progress renderer: semester bar, roadmap, filterable week cards and an applications atlas.
 * Reads window.COURSE_PROGRESS (see the course pages) and follows the page language
 * chosen in #academy-lang (handled by academy-common.js). */
(function () {
  "use strict";

  var UI = {
    en: {
      delivered: "sessions delivered", nowLbl: "Now", nextLbl: "This week", semester: "of the semester", weekOf: "Week {n} of {t}",
      done: "Done", current: "This week", upcoming: "Upcoming", all: "All weeks", allMods: "All modules", week: "Week",
      slides: "Slides", lab: "Interactive lab", paper: "Paper", code: "Docs / code", read: "Reading", more: "Details",
      legendDone: "delivered", legendCur: "this week", legendUp: "upcoming", nothing: "No weeks match this filter.",
      relWeeks: "Covered in", openWeek: "Open week",
    },
    fa: {
      delivered: "جلسهٔ برگزارشده", nowLbl: "اکنون", nextLbl: "این هفته", semester: "از نیم‌سال", weekOf: "هفتهٔ {n} از {t}",
      done: "برگزار شد", current: "این هفته", upcoming: "پیش رو", all: "همهٔ هفته‌ها", allMods: "همهٔ بخش‌ها", week: "هفته",
      slides: "اسلاید", lab: "آزمایشگاه تعاملی", paper: "مقاله", code: "مستندات / کد", read: "مطالعه", more: "جزئیات",
      legendDone: "برگزارشده", legendCur: "این هفته", legendUp: "پیش رو", nothing: "هفته‌ای با این فیلتر وجود ندارد.",
      relWeeks: "در هفته‌های", openWeek: "باز کردن هفته",
    },
    ar: {
      delivered: "جلسات منعقدة", nowLbl: "الآن", nextLbl: "هذا الأسبوع", semester: "من الفصل", weekOf: "الأسبوع {n} من {t}",
      done: "منجز", current: "هذا الأسبوع", upcoming: "قادم", all: "كل الأسابيع", allMods: "كل الوحدات", week: "الأسبوع",
      slides: "الشرائح", lab: "مختبر تفاعلي", paper: "ورقة", code: "توثيق / شيفرة", read: "قراءة", more: "تفاصيل",
      legendDone: "منجز", legendCur: "هذا الأسبوع", legendUp: "قادم", nothing: "لا توجد أسابيع مطابقة.", relWeeks: "في الأسابيع", openWeek: "فتح الأسبوع",
    },
    zh: {
      delivered: "已完成课次", nowLbl: "当前", nextLbl: "本周", semester: "学期进度", weekOf: "第 {n} 周 / 共 {t} 周",
      done: "已完成", current: "本周", upcoming: "即将进行", all: "全部", allMods: "全部模块", week: "第",
      slides: "课件", lab: "交互实验", paper: "论文", code: "文档 / 代码", read: "阅读", more: "详情",
      legendDone: "已完成", legendCur: "本周", legendUp: "即将进行", nothing: "没有符合条件的周次。", relWeeks: "相关周次", openWeek: "打开",
    },
  };
  var ICON = {
    slides: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></svg>',
    lab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/></svg>',
    paper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 7-5 5 5 5M16 7l5 5-5 5"/></svg>',
    read: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/></svg>',
  };

  var state = { status: "all", module: "all" };

  function lang() { return (document.documentElement.lang || "en").slice(0, 2); }
  function ui(k, vars) {
    var s = (UI[lang()] && UI[lang()][k]) || UI.en[k] || k;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (_, v) { return vars[v]; });
    return s;
  }
  function tr(v) {
    if (v == null) return "";
    if (typeof v === "string" || Array.isArray(v)) return v;
    var l = lang();
    return v[l] != null ? v[l] : v.en;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function modOf(D, id) { for (var i = 0; i < D.modules.length; i++) if (D.modules[i].id === id) return D.modules[i]; return D.modules[0]; }
  function isExternal(h) { return /^https?:\/\//.test(h); }

  function renderSummary(D) {
    var el = document.getElementById("cp-summary");
    if (!el) return;
    var done = D.weeks.filter(function (w) { return w.status === "done"; }).length;
    var cur = D.weeks.filter(function (w) { return w.status === "current"; })[0];
    var elapsed = D.elapsed != null ? D.elapsed : done;
    var pct = Math.round((elapsed / D.totalWeeks) * 100);
    var bar = D.weeks.map(function (w) {
      var m = modOf(D, w.module);
      return '<i class="' + w.status + '" style="--m:' + m.color + ";--w:" + (w.span || 1) + '" title="' + esc(ui("week") + " " + w.n + " · " + tr(w.title)) + '"></i>';
    }).join("");
    var legend = D.modules.map(function (m) { return '<span style="--m:' + m.color + '"><i></i>' + esc(tr(m.name)) + "</span>"; }).join("");
    el.innerHTML =
      '<div class="cp-stats">' +
      '<div class="cp-stat"><b>' + done + "</b><span>" + esc(ui("delivered")) + "</span></div>" +
      '<div class="cp-stat"><b>' + esc(ui("weekOf", { n: D.currentWeek, t: D.totalWeeks })) + "</b><span>" + esc(tr(D.termLabel) || "") + "</span></div>" +
      '<div class="cp-stat"><b>' + pct + "%</b><span>" + esc(ui("semester")) + "</span></div>" +
      '<div class="cp-stat next"><b>' + (cur ? esc(tr(cur.short || cur.title)) : "—") + "</b><span>" + esc(ui("nextLbl")) + (cur ? " · " + esc(ui("week")) + " " + esc(cur.n) : "") + "</span></div>" +
      "</div>" +
      '<div class="cp-bar" role="img" aria-label="' + esc(pct + "% " + ui("semester")) + '">' + bar + "</div>" +
      '<div class="cp-legend">' + legend + '<span class="st"><span>■ ' + esc(ui("legendDone")) + "</span><span>▨ " + esc(ui("legendCur")) + "</span><span>□ " + esc(ui("legendUp")) + "</span></span></div>";
  }

  function renderRoadmap(D) {
    var el = document.getElementById("cp-roadmap");
    if (!el) return;
    el.innerHTML = D.modules.map(function (m) {
      var ws = D.weeks.filter(function (w) { return w.module === m.id; });
      if (!ws.length) return "";
      var st = ws.map(function (w) {
        return '<button type="button" class="cp-station ' + w.status + '" data-go="' + esc(w.n) + '" title="' + esc(tr(w.title)) + '">' +
          (w.status === "current" ? '<span class="cp-now">' + esc(ui("nowLbl")) + "</span>" : "") +
          '<span class="cp-dot">' + (w.status === "done" ? "✓" : esc(w.n)) + "</span><small>" + esc(ui("week")) + " " + esc(w.n) + "<br>" + esc(tr(w.short || w.title)) + "</small></button>";
      }).join("");
      return '<div class="cp-module" style="--m:' + m.color + ";--n:" + ws.length + '"><h4>' + esc(tr(m.name)) + '</h4><div class="cp-stations">' + st + "</div></div>";
    }).join("");
  }

  function linkHTML(l) {
    var label = l.label ? tr(l.label) : ui(l.type);
    var ext = isExternal(l.href);
    return '<a class="' + l.type + '" href="' + esc(l.href) + '"' + (ext || l.type === "slides" ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" +
      (ICON[l.type] || "") + "<span>" + esc(label) + "</span>" + (l.meta ? ' <span class="meta">' + esc(l.meta) + "</span>" : "") + "</a>";
  }

  function renderWeeks(D) {
    var el = document.getElementById("cp-weeks");
    if (!el) return;
    var f = document.getElementById("cp-filters");
    if (f) {
      var sb = ["all", "done", "current", "upcoming"].map(function (s) {
        return '<button type="button" data-s="' + s + '" class="' + (state.status === s ? "on" : "") + '">' + esc(ui(s === "all" ? "all" : s)) + "</button>";
      }).join("");
      var mb = '<button type="button" data-m="all" style="--m:var(--c-navy)" class="' + (state.module === "all" ? "on" : "") + '">' + esc(ui("allMods")) + "</button>" +
        D.modules.map(function (m) { return '<button type="button" data-m="' + m.id + '" style="--m:' + m.color + '" class="' + (state.module === m.id ? "on" : "") + '">' + esc(tr(m.name)) + "</button>"; }).join("");
      f.innerHTML = sb + '<span class="sep"></span>' + mb;
    }
    var list = D.weeks.filter(function (w) {
      return (state.status === "all" || w.status === state.status) && (state.module === "all" || w.module === state.module);
    });
    if (!list.length) { el.innerHTML = '<p class="cp-empty">' + esc(ui("nothing")) + "</p>"; return; }
    el.innerHTML = list.map(function (w) {
      var m = modOf(D, w.module);
      var chips = (tr(w.topics) || []).map(function (c) { return "<span>" + esc(c) + "</span>"; }).join("");
      var links = (w.links || []).map(linkHTML).join("");
      var extra = w.extra ? '<details><summary>' + esc(tr(w.extraTitle) || ui("more")) + '</summary><div class="cp-extra">' + tr(w.extra) + "</div></details>" : "";
      return '<article class="cp-week ' + w.status + '" id="cp-w-' + esc(String(w.n).replace(/[^\w]/g, "_")) + '" style="--m:' + m.color + '">' +
        '<div class="cp-week-head"><span class="cp-wk">' + esc(ui("week")) + " " + esc(w.n) + '</span><span class="cp-mod">' + esc(tr(m.name)) + '</span><span class="cp-status ' + w.status + '">' + esc(ui(w.status)) + "</span></div>" +
        "<h3>" + esc(tr(w.title)) + "</h3>" +
        (w.summary ? '<p class="cp-sum">' + esc(tr(w.summary)) + "</p>" : "") +
        (chips ? '<div class="cp-chips">' + chips + "</div>" : "") +
        (links ? '<div class="cp-links">' + links + "</div>" : "") + extra + "</article>";
    }).join("");
  }

  function renderApps(D) {
    var el = document.getElementById("cp-apps");
    if (!el || !D.applications) return;
    el.innerHTML = D.applications.map(function (a) {
      var tech = (tr(a.tech) || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
      var refs = (a.weeks || []).map(function (n) {
        var w = D.weeks.filter(function (x) { return String(x.n) === String(n); })[0];
        var m = w ? modOf(D, w.module) : D.modules[0];
        return '<button type="button" data-go="' + esc(n) + '" style="--m:' + m.color + '" title="' + esc(w ? tr(w.title) : "") + '">' + esc(ui("week")) + " " + esc(n) + "</button>";
      }).join("");
      return '<article class="cp-app"><h4><i aria-hidden="true">' + a.icon + "</i>" + esc(tr(a.name)) + "</h4><p>" + esc(tr(a.desc)) + '</p><div class="cp-tech">' + tech + '</div><div class="cp-wkrefs"><small style="color:var(--c-muted);font-size:.72rem;align-self:center">' + esc(ui("relWeeks")) + "</small>" + refs + "</div></article>";
    }).join("");
  }

  function go(n) {
    var D = window.COURSE_PROGRESS;
    var w = D.weeks.filter(function (x) { return String(x.n) === String(n); })[0];
    if (!w) return;
    if ((state.status !== "all" && state.status !== w.status) || (state.module !== "all" && state.module !== w.module)) {
      state.status = "all"; state.module = "all"; renderWeeks(D);
    }
    var card = document.getElementById("cp-w-" + String(n).replace(/[^\w]/g, "_"));
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    card.classList.add("flash");
    setTimeout(function () { card.classList.remove("flash"); }, 1600);
  }

  function renderAll() {
    var D = window.COURSE_PROGRESS;
    if (!D) return;
    renderSummary(D); renderRoadmap(D); renderWeeks(D); renderApps(D);
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-go],[data-s],[data-m]") : null;
    if (!t) return;
    if (t.hasAttribute("data-go")) { go(t.getAttribute("data-go")); return; }
    if (!t.closest("#cp-filters")) return;
    if (t.hasAttribute("data-s")) state.status = t.getAttribute("data-s");
    if (t.hasAttribute("data-m")) state.module = t.getAttribute("data-m");
    renderWeeks(window.COURSE_PROGRESS);
  });
  document.addEventListener("DOMContentLoaded", function () {
    renderAll();
    var sel = document.getElementById("academy-lang");
    if (sel) sel.addEventListener("change", function () { setTimeout(renderAll, 0); });
  });
})();
