(function () {
  "use strict";

  var SCHOLAR_PROFILE =
    "https://scholar.google.com/citations?user=2HFVUn4AAAAJ&hl=en";

  /**
   * Recent representative works (titles and venues in bibliographic English).
   * Linked to Google Scholar citation records for traceability.
   */
  var RECENT_PUBLICATIONS = [
    {
      title: "ProJan: A probabilistic trojan attack on deep neural networks",
      venue: "Knowledge-Based Systems · 2024",
      href:
        "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=2HFVUn4AAAAJ&citation_for_view=2HFVUn4AAAAJ:3fE2CSJIrl8C",
    },
    {
      title:
        "Enhancing anomaly detection generalization through knowledge exposure: The dual effects of augmentation",
      venue: "arXiv:2406.10617 · 2024",
      href:
        "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=2HFVUn4AAAAJ&citation_for_view=2HFVUn4AAAAJ:kNdYIx-mwKoC",
    },
    {
      title:
        "Layer-wise regularized adversarial training using layers sustainability analysis framework",
      venue: "Neurocomputing · 2023",
      href:
        "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=2HFVUn4AAAAJ&citation_for_view=2HFVUn4AAAAJ:Y0pCki6q_DkC",
    },
    {
      title: "Low-epsilon adversarial attack against a neural network online image stream classifier",
      venue: "Applied Soft Computing · 2023",
      href:
        "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=2HFVUn4AAAAJ&citation_for_view=2HFVUn4AAAAJ:YsMSGLbcyi4C",
    },
    {
      title: "Mitigating bias: Enhancing image classification by improving model explanations",
      venue: "Proceedings of Machine Learning Research (ACML) · 2023",
      href:
        "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=2HFVUn4AAAAJ&citation_for_view=2HFVUn4AAAAJ:MXK_kJrjxJIC",
    },
    {
      title:
        "A survey on vulnerability of deep neural networks to adversarial examples and defense approaches to deal with them",
      venue: "Signal and Data Processing · 2023",
      href:
        "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=2HFVUn4AAAAJ&citation_for_view=2HFVUn4AAAAJ:eQOLeE2rZwMC",
    },
    {
      title: "Self-supervised representation learning via neighborhood-relational encoding",
      venue: "IEEE/CVF International Conference on Computer Vision (ICCV) · 2019",
      href:
        "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=2HFVUn4AAAAJ&citation_for_view=2HFVUn4AAAAJ:2osOgNQ5qMEC",
    },
  ];

  var STORAGE_KEY = "khalooei-site-lang";
  var supported = ["en", "fa", "ar", "zh"];

  function pubCta(lang) {
    if (lang === "fa") return "رکورد در Scholar";
    if (lang === "ar") return "سجل Scholar";
    if (lang === "zh") return "Scholar 条目";
    return "Scholar record";
  }

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
    document.documentElement.setAttribute("data-lang", lang);
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
    renderResearchThemes(t);
    renderPublications(lang);
    renderBridge(t, lang);
    wireScholarLinks();
    observeReveals();

    document.dispatchEvent(new CustomEvent("site:languagechange", { detail: { lang: lang } }));
  }

  function renderResearchThemes(t) {
    var el = document.getElementById("research-themes");
    if (!el || !t.research || !t.research.themes) return;
    el.innerHTML = t.research.themes
      .map(function (th, i) {
        return (
          '<article class="card theme-card reveal" style="--d:' +
          i +
          '"><h3>' +
          escapeHtml(th.title) +
          "</h3><p>" +
          escapeHtml(th.body) +
          "</p></article>"
        );
      })
      .join("");
  }

  function renderPublications(lang) {
    var el = document.getElementById("publications-list");
    if (!el) return;
    var cta = pubCta(lang);
    el.innerHTML = RECENT_PUBLICATIONS.map(function (p, i) {
      return (
        '<li class="pub-item reveal" style="--d:' +
        i +
        '"><div class="pub-main"><span class="pub-title">' +
        escapeHtml(p.title) +
        '</span><span class="pub-venue">' +
        escapeHtml(p.venue) +
        '</span></div><a class="pub-link" href="' +
        escapeAttr(p.href) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(cta) +
        "</a></li>"
      );
    }).join("");
  }

  function renderBridge(t, lang) {
    var el = document.getElementById("bridge-grid");
    if (!el || !t.bridge || !t.bridge.items) return;
    el.innerHTML = t.bridge.items
      .map(function (item, i) {
        var ext = item.external !== false;
        var scholarAttr = item.scholar ? ' data-scholar="true"' : "";
        var btn2 =
          item.cta2 && item.href2 ?
            '<a class="btn btn-secondary" href="' +
            escapeAttr(item.href2) +
            '"' +
            (item.external2 !== false ? ' target="_blank" rel="noopener noreferrer"' : "") +
            ">" +
            escapeHtml(item.cta2) +
            "</a>"
          : "";
        return (
          '<article class="card bridge-card reveal" style="--d:' +
          i +
          '"><h3>' +
          escapeHtml(item.title) +
          "</h3><p>" +
          escapeHtml(item.desc) +
          '</p><div class="bridge-actions"><a class="btn btn-ghost" href="' +
          escapeAttr(item.href) +
          '"' +
          scholarAttr +
          (ext ? ' target="_blank" rel="noopener noreferrer"' : "") +
          ">" +
          escapeHtml(item.cta) +
          "</a>" +
          btn2 +
          "</div></article>"
        );
      })
      .join("");
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
          var link =
            c.href ?
              '<a class="course-link" href="' +
              escapeAttr(c.href) +
              '" target="_blank" rel="noopener noreferrer">' +
              escapeHtml(c.linkLabel || "") +
              "</a>"
            : "";
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
            link +
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
            escapeHtml(a.cta) +
            "</a>" +
            "</article>"
          );
        })
        .join("");
    }
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
      a.href = SCHOLAR_PROFILE;
    });
  }

  function observeReveals() {
    var els = document.querySelectorAll(".reveal:not(.io-ready)");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("visible", "io-ready");
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
      el.classList.add("io-ready");
      io.observe(el);
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
