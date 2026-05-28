(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".cmd-copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var block = btn.closest(".cmd-block");
        var code = block && block.querySelector("code");
        if (!code) return;
        var text = code.textContent || "";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = "✓";
            setTimeout(function () {
              btn.textContent = btn.getAttribute("data-copy-label") || "Copy";
            }, 900);
          });
        }
      });
    });
  });
})();
