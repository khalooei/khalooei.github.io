(function () {
  "use strict";

  var SCHOLAR_PROFILE =
    "https://scholar.google.com/citations?user=2HFVUn4AAAAJ&hl=en";

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
    if (lang === "fa") return "Scholar";
    if (lang === "ar") return "Scholar";
    if (lang === "zh") return "Scholar";
    return "Scholar";
  }

  function getLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && supported.indexOf(stored) !== -1) return stored;
    return "en";
  }

  function applyI18nAttr(lang) {
    var t = window.I18N[lang];
    if (!t) return;

    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      var val = key.split(".").reduce(function (o, k) {
        return o && o[k];
      }, t);
      if (typeof val === "string") el.setAttribute("title", val);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      var val = key.split(".").reduce(function (o, k) {
        return o && o[k];
      }, t);
      if (typeof val === "string") el.setAttribute("aria-label", val);
    });
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

    applyI18nAttr(lang);

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

  function initFloatNavActive() {
    var nav = document.getElementById("float-nav");
    if (!nav) return;
    var ids = ["spotlight", "teaching", "apps", "research", "bridge", "footer-contact"];
    function update() {
      var rtl = document.documentElement.dir === "rtl";
      var x = rtl ? window.innerWidth * 0.58 : window.innerWidth * 0.42;
      x = Math.min(window.innerWidth - 24, Math.max(48, x));
      var y = window.innerHeight * 0.36;
      var hit = document.elementFromPoint(x, y);
      var cur = "";
      while (hit && hit !== document.documentElement) {
        if (hit.id && ids.indexOf(hit.id) >= 0) {
          cur = hit.id;
          break;
        }
        hit = hit.parentElement;
      }
      nav.querySelectorAll(".float-nav-btn").forEach(function (b) {
        var sid = b.getAttribute("data-section") || "";
        b.classList.toggle("active", sid !== "" && sid === cur);
      });
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /**
   * Deep-space layer: stars (twinkle), occasional polar meteors, soft flares.
   */
  function initSpaceCanvas() {
    var canvas = document.getElementById("space-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var stars = [];
    var meteors = [];
    var flares = [];
    var starCount = 320;
    var time = 0;
    var nextMeteor = 0;
    var nextFlare = 0;

    function spawnMeteor(w, h) {
      var fromTop = Math.random() < 0.65;
      var x = fromTop ? w * (0.25 + Math.random() * 0.5) : Math.random() * w;
      var y = fromTop ? -30 - Math.random() * 80 : Math.random() * h * 0.4;
      var angle = fromTop ? Math.PI * 0.55 + Math.random() * 0.35 : Math.random() * Math.PI * 2;
      var speed = 10 + Math.random() * 14;
      meteors.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.01,
        len: 70 + Math.random() * 100,
        w: 1 + Math.random() * 1.2,
      });
    }

    function spawnFlare(w, h) {
      flares.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.85,
        r: 40 + Math.random() * 120,
        life: 1,
        decay: 0.008 + Math.random() * 0.006,
      });
    }

    function resize() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = [];
      for (var i = 0; i < starCount; i++) {
        var szRoll = Math.random();
        var radius = szRoll < 0.65 ? 0.35 + Math.random() * 0.55 : szRoll < 0.92 ? 0.9 + Math.random() * 0.7 : 1.6 + Math.random() * 1.1;
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: radius,
          b: 0.15 + Math.random() * 0.55,
          tw: Math.random() < 0.42,
          ph: Math.random() * Math.PI * 2,
          sp: 0.8 + Math.random() * 2.2,
        });
      }
      nextMeteor = performance.now() + 2000 + Math.random() * 4000;
      nextFlare = performance.now() + 4000 + Math.random() * 6000;
    }

    function tick(now) {
      if (now === undefined) now = performance.now();
      time += 0.016;
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      if (now > nextMeteor) {
        spawnMeteor(w, h);
        nextMeteor = now + 3500 + Math.random() * 7000;
      }
      if (now > nextFlare) {
        spawnFlare(w, h);
        nextFlare = now + 8000 + Math.random() * 12000;
      }

      for (var i = meteors.length - 1; i >= 0; i--) {
        var m = meteors[i];
        m.x += m.vx * 0.45;
        m.y += m.vy * 0.45;
        m.life -= m.decay;
        var spd = Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1;
        var tailx = m.x - (m.vx / spd) * m.len;
        var taily = m.y - (m.vy / spd) * m.len;
        var grd = ctx.createLinearGradient(tailx, taily, m.x, m.y);
        grd.addColorStop(0, "rgba(186, 230, 253, 0)");
        grd.addColorStop(0.45, "rgba(125, 211, 252, 0.35)");
        grd.addColorStop(1, "rgba(255, 255, 255, 0.85)");
        ctx.strokeStyle = grd;
        ctx.lineWidth = m.w;
        ctx.lineCap = "round";
        ctx.globalAlpha = Math.max(0, m.life);
        ctx.beginPath();
        ctx.moveTo(tailx, taily);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (m.life <= 0 || m.x < -200 || m.x > w + 200 || m.y > h + 200) meteors.splice(i, 1);
      }

      for (var j = flares.length - 1; j >= 0; j--) {
        var f = flares[j];
        f.life -= f.decay;
        var rg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        rg.addColorStop(0, "rgba(147, 197, 253, " + f.life * 0.12 + ")");
        rg.addColorStop(0.5, "rgba(56, 189, 248, " + f.life * 0.04 + ")");
        rg.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = rg;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        if (f.life <= 0) flares.splice(j, 1);
      }

      for (var k = 0; k < stars.length; k++) {
        var s = stars[k];
        var alpha = s.b;
        if (s.tw) alpha *= 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(time * s.sp + s.ph));
        ctx.fillStyle = "rgba(226, 232, 240, " + alpha + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(tick);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initLangSelect();
    initSpaceCanvas();
    initFloatNavActive();
    setLang(getLang());
  });
})();
