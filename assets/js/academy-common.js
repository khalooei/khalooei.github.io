(function () {
  "use strict";

  var KEY = "academy_lang";
  var supported = ["en", "fa", "ar", "zh"];

  var FOOTER_I18N = {
    en: {
      footerPrepared: "Prepared by Mohammad Khalooei",
      footerContact: "Email",
    },
    fa: {
      footerPrepared: "تهیه‌شده توسط محمد خالوئی",
      footerContact: "ایمیل",
    },
    ar: {
      footerPrepared: "إعداد: محمد خلويي",
      footerContact: "البريد الإلكتروني",
    },
    zh: {
      footerPrepared: "制作：Mohammad Khalooei",
      footerContact: "邮箱",
    },
  };

  function getCookie(name) {
    var v = "; " + document.cookie;
    var parts = v.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return "";
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + value + "; expires=" + d.toUTCString() + "; path=/; SameSite=Lax";
  }

  function langToDir(lang) {
    return lang === "fa" || lang === "ar" ? "rtl" : "ltr";
  }

  function payloadFor(lang) {
    var base = (window.ACADEMY_I18N && window.ACADEMY_I18N[lang]) || {};
    var footer = FOOTER_I18N[lang] || FOOTER_I18N.en;
    var out = {};
    var k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    for (k in footer) if (Object.prototype.hasOwnProperty.call(footer, k)) out[k] = footer[k];
    return out;
  }

  function apply(lang) {
    if (supported.indexOf(lang) < 0) lang = "en";
    setCookie(KEY, lang, 365);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    document.documentElement.dir = langToDir(lang);
    var payload = payloadFor(lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (payload[key]) el.textContent = payload[key];
    });
    var sel = document.getElementById("academy-lang");
    if (sel) sel.value = lang;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var sel = document.getElementById("academy-lang");
    var lang = getCookie(KEY) || "en";
    apply(lang);
    if (sel) {
      sel.addEventListener("change", function () {
        apply(sel.value);
      });
    }
  });
})();
