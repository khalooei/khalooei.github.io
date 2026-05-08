(function () {
  "use strict";

  /**
   * Prefer your canonical profile URL:
   * https://scholar.google.com/citations?user=YOUR_ID
   * Fallback: author search on Scholar.
   */
  var SCHOLAR_URL =
    "https://scholar.google.com/scholar?q=Mohammad+Khalooei+Amirkabir+Sharif";
  var ARXIV_RECENT = "https://arxiv.org/list/cs.LG/recent";

  var STORAGE_KEY = "khalooei-site-lang";
  var supported = ["en", "fa", "ar", "zh"];

  function getLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && supported.indexOf(stored) !== -1) return stored;
    var nav = navigator.language || navigator.userLanguage || "en";
    if (nav.startsWith("fa")) return "fa";
    if (nav.startsWith("ar")) return "ar";
    if (nav.startsWith("zh")) return "zh";
    return "en";
  }

  function setLang(lang) {
    if (supported.indexOf(lang) === -1) lang = "en";
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang =
      lang === "zh" ? "zh-CN" : lang === "fa" ? "fa" : lang === "ar" ? "ar" : "en";
    var rtl = lang === "fa" || lang === "ar";
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", rtl);

    var t = window.I18N[lang];
    if (!t) return;

    document.title = t.metaTitle;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", t.metaDesc);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = key.split(".").reduce(function (o, k) {
        return o && o[k];
      }, t);
      if (typeof val === "string") el.textContent = val;
    });

    var sel = document.getElementById("lang-select");
    if (sel) sel.value = lang;

    renderLists(t, lang);
    wireScholarLinks();

    document.dispatchEvent(new CustomEvent("site:languagechange", { detail: { lang: lang } }));
  }

  function renderLists(t, lang) {
    var spotlightEl = document.getElementById("spotlight-grid");
    if (spotlightEl && t.spotlight && t.spotlight.items) {
      spotlightEl.innerHTML = t.spotlight.items
        .map(function (item, i) {
          return (
            '<article class="card spotlight-card reveal" style="--d:' +
            i +
            '">' +
            '<span class="tag">' +
            escapeHtml(item.tag) +
            "</span>" +
            "<h3>" +
            escapeHtml(item.title) +
            "</h3>" +
            "<p>" +
            escapeHtml(item.desc) +
            "</p>" +
            "</article>"
          );
        })
        .join("");
    }

    var teachEl = document.getElementById("teaching-grid");
    if (teachEl && t.teaching && t.teaching.courses) {
      teachEl.innerHTML = t.teaching.courses
        .map(function (c, i) {
          return (
            '<article class="card course-card reveal icon-' +
            escapeHtml(c.icon) +
            '" style="--d:' +
            i +
            '">' +
            '<div class="course-head"><span class="course-icon" aria-hidden="true"></span>' +
            "<h3>" +
            escapeHtml(c.name) +
            "</h3></div>" +
            "<p>" +
            escapeHtml(c.topics) +
            "</p>" +
            "</article>"
          );
        })
        .join("");
    }

    var appsEl = document.getElementById("apps-grid");
    if (appsEl && t.apps && t.apps.items) {
      appsEl.innerHTML = t.apps.items
        .map(function (a, i) {
          var isRoute = a.href && a.href.indexOf("#") === 0;
          return (
            '<article class="card app-card reveal" style="--d:' +
            i +
            '">' +
            '<div class="app-top"><span class="badge">' +
            escapeHtml(a.badge) +
            "</span></div>" +
            "<h3>" +
            escapeHtml(a.title) +
            "</h3>" +
            "<p>" +
            escapeHtml(a.desc) +
            "</p>" +
            '<a class="btn btn-ghost" href="' +
            escapeAttr(a.href) +
            '"' +
            (isRoute ? "" : ' target="_blank" rel="noopener noreferrer"') +
            ">" +
            (lang === "en"
              ? "Open"
              : lang === "fa"
                ? "باز کردن"
                : lang === "ar"
                  ? "فتح"
                  : "打开") +
            "</a>" +
            "</article>"
          );
        })
        .join("");
    }

    var awardsEl = document.getElementById("awards-grid");
    if (awardsEl && t.awards && t.awards.items) {
      awardsEl.innerHTML = t.awards.items
        .map(function (w, i) {
          return (
            '<article class="card award-card reveal" style="--d:' +
            i +
            '">' +
            '<div class="award-org">' +
            escapeHtml(w.org) +
            "</div>" +
            "<h3>" +
            escapeHtml(w.title) +
            "</h3>" +
            "<p>" +
            escapeHtml(w.desc) +
            "</p>" +
            "</article>"
          );
        })
        .join("");
    }

    var alsEl = document.getElementById("als-links");
    if (alsEl && t.research && t.research.alsItems) {
      alsEl.innerHTML = t.research.alsItems
        .map(function (x) {
          return (
            '<a href="' +
            escapeAttr(x.h) +
            '" target="_blank" rel="noopener noreferrer">' +
            escapeHtml(x.t) +
            "</a>"
          );
        })
        .join("");
    }

    observeReveals();
  }

  function escapeHtml(s) {
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function wireScholarLinks() {
    document.querySelectorAll('a[data-scholar="true"]').forEach(function (a) {
      a.href = SCHOLAR_URL;
    });
    document.querySelectorAll('a[data-arxiv="true"]').forEach(function (a) {
      a.href = ARXIV_RECENT;
    });
  }

  function observeReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach(function (el) {
      return io.observe(el);
    });
  }

  function initNav() {
    var header = document.getElementById("site-header");
    var toggle = document.getElementById("nav-toggle");
    var panel = document.getElementById("nav-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      panel.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          panel.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 24);
      },
      { passive: true }
    );
  }

  function initLangSelect() {
    var sel = document.getElementById("lang-select");
    if (sel) {
      sel.addEventListener("change", function () {
        setLang(sel.value);
      });
    }
  }

  function initHeroCanvas() {
    var canvas = document.getElementById("hero-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [];
    var n = 42;

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = r.width + "px";
      canvas.style.height = r.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = [];
      for (var i = 0; i < n; i++) {
        nodes.push({
          x: Math.random() * r.width,
          y: Math.random() * r.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
        });
      }
    }

    function tick() {
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(125, 211, 252, 0.12)";
      ctx.lineWidth = 1;
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.globalAlpha = (1 - dist / 110) * 0.35;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
      nodes.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    tick();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initLangSelect();
    initHeroCanvas();
    setLang(getLang());
  });
})();
