(function () {
  "use strict";

  function byId(id) {
    return document.getElementById(id);
  }

  function initEmbedSim() {
    var canvas = byId("adv-embed-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var centers = [
      { x: w * 0.28, y: h * 0.46, c: "rgba(56,189,248,0.9)" },
      { x: w * 0.55, y: h * 0.36, c: "rgba(167,139,250,0.9)" },
      { x: w * 0.74, y: h * 0.62, c: "rgba(52,211,153,0.9)" },
    ];
    centers.forEach(function (p) {
      for (var i = 0; i < 42; i++) {
        var a = (i / 42) * 2 * Math.PI;
        var r = 10 + (i % 7) * 3;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x + Math.cos(a) * r, p.y + Math.sin(a) * (r * 0.7), 2.9, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }

  function initDiffusionSim() {
    var canvas = byId("adv-diff-canvas");
    var stepEl = byId("adv-step");
    if (!canvas || !stepEl) return;
    function draw() {
      var step = Number(stepEl.value);
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var noiseAmp = Math.max(0.02, (65 - step) / 65);
      ctx.strokeStyle = "#7dd3fc";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var i = 0; i < 800; i++) {
        var t = i / 799;
        var clean = 0.62 * Math.sin(2 * Math.PI * 4.5 * t) + 0.24 * Math.sin(2 * Math.PI * 15 * t);
        var noisy = clean + noiseAmp * (Math.random() * 2 - 1);
        var x = t * w;
        var y = h * 0.5 - noisy * (h * 0.38);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    stepEl.addEventListener("input", draw);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initEmbedSim();
    initDiffusionSim();
  });
})();
