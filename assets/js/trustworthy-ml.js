(function () {
  "use strict";

  function byId(id) {
    return document.getElementById(id);
  }

  function drawAdv(canvas, eps) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(15,23,42,0.9)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#334155";
    for (var i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i / 7) * h);
      ctx.lineTo(w, (i / 7) * h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((i / 7) * w, 0);
      ctx.lineTo((i / 7) * w, h);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(56,189,248,0.25)";
    ctx.beginPath();
    ctx.arc(w * 0.35, h * 0.55, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(52,211,153,0.25)";
    ctx.beginPath();
    ctx.arc(w * 0.68, h * 0.42, 70, 0, Math.PI * 2);
    ctx.fill();
    var px = w * 0.35 + eps * 0.35;
    var py = h * 0.55 - eps * 0.2;
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f87171";
    ctx.beginPath();
    ctx.arc(px + eps * 0.55, py - eps * 0.35, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fca5a5";
    ctx.fill();
  }

  function drawCalib(canvas, temp) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#64748b";
    ctx.beginPath();
    ctx.moveTo(40, h - 30);
    ctx.lineTo(w - 20, 30);
    ctx.stroke();
    for (var b = 0; b < 10; b++) {
      var x = 40 + (b / 9) * (w - 70);
      var conf = (b + 1) / 10;
      var acc = Math.min(1, Math.pow(conf, 1 / temp));
      var y = h - 30 - acc * (h - 70);
      ctx.fillStyle = temp > 1.2 ? "#f59e0b" : "#34d399";
      ctx.fillRect(x - 8, y, 16, h - 30 - y);
    }
  }

  function drawFair(canvas, shift) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var groups = [
      ["A", 0.82 - shift * 0.08],
      ["B", 0.74 + shift * 0.06],
      ["C", 0.79],
    ];
    groups.forEach(function (g, i) {
      var x = 60 + i * ((w - 120) / 2);
      var bh = g[1] * (h - 60);
      ctx.fillStyle = ["#38bdf8", "#a78bfa", "#34d399"][i];
      ctx.fillRect(x - 24, h - 30 - bh, 48, bh);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "12px sans-serif";
      ctx.fillText(g[0], x - 5, h - 12);
      ctx.fillText(Math.round(g[1] * 100) + "%", x - 12, h - 40 - bh);
    });
  }

  function drawDeploy(canvas, level) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var steps = ["Data", "Train", "Eval", "Monitor", "Rollback"];
    steps.forEach(function (s, i) {
      var x = 30 + i * ((w - 60) / (steps.length - 1));
      var active = i <= level;
      ctx.fillStyle = active ? "#38bdf8" : "#334155";
      ctx.beginPath();
      ctx.arc(x, h * 0.45, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px sans-serif";
      ctx.fillText(s, x - 18, h * 0.75);
      if (i < steps.length - 1) {
        ctx.strokeStyle = active ? "#7dd3fc" : "#475569";
        ctx.beginPath();
        ctx.moveTo(x + 18, h * 0.45);
        ctx.lineTo(x + ((w - 60) / (steps.length - 1)) - 18, h * 0.45);
        ctx.stroke();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var adv = byId("trust-adv-canvas");
    var cal = byId("trust-calib-canvas");
    var fair = byId("trust-fair-canvas");
    var dep = byId("trust-deploy-canvas");
    var eps = byId("trust-eps");
    var temp = byId("trust-temp");
    var shift = byId("trust-shift");
    var stage = byId("trust-stage");

    function redraw() {
      drawAdv(adv, Number((eps && eps.value) || 30));
      drawCalib(cal, Number((temp && temp.value) || 100) / 100);
      drawFair(fair, Number((shift && shift.value) || 0) / 100);
      drawDeploy(dep, Number((stage && stage.value) || 3));
    }

    [eps, temp, shift, stage].forEach(function (el) {
      if (el) el.addEventListener("input", redraw);
    });
    redraw();
  });
})();
