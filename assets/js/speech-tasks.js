(function () {
  "use strict";

  function drawWave(canvas, seed) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#7dd3fc";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i < 900; i++) {
      var t = i / 899;
      var yv = 0.6 * Math.sin(2 * Math.PI * (2.5 + seed * 0.2) * t) + 0.3 * Math.sin(2 * Math.PI * (11 + seed) * t);
      var x = t * w;
      var y = h * 0.5 - yv * (h * 0.36);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function drawBars(canvas, seed) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var n = 56;
    for (var i = 0; i < n; i++) {
      var x = (i / n) * w;
      var v = 0.25 + 0.75 * Math.abs(Math.sin((i + seed) * 0.35));
      var bh = v * (h - 12);
      ctx.fillStyle = "rgba(52,211,153,0.75)";
      ctx.fillRect(x + 2, h - bh, w / n - 4, bh);
    }
  }

  function drawSegments(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var segs = [
      [0.05, 0.24, "#38bdf8"],
      [0.24, 0.44, "#a78bfa"],
      [0.44, 0.68, "#34d399"],
      [0.68, 0.91, "#f59e0b"],
    ];
    segs.forEach(function (s) {
      ctx.fillStyle = s[2];
      ctx.fillRect(s[0] * w, h * 0.24, (s[1] - s[0]) * w, h * 0.52);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    drawWave(document.getElementById("task-stt"), 1);
    drawWave(document.getElementById("task-tts"), 3);
    drawBars(document.getElementById("task-sent"), 5);
    drawWave(document.getElementById("task-spk"), 7);
    drawSegments(document.getElementById("task-dia"));
    drawBars(document.getElementById("task-sep"), 2);
  });
})();
