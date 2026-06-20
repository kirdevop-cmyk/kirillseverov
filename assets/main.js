/* Кирило Северов — interactions
   - sticky header shadow
   - mobile drawer
   - scroll reveal (IntersectionObserver, respects reduced-motion)
   - lead form validation + fake submit
*/
(function () {
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky header ---- */
  var header = document.querySelector(".header");
  var onScroll = function () {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile drawer ---- */
  var burger = document.querySelector(".burger");
  var drawer = document.getElementById("drawer");
  var closeBtn = drawer && drawer.querySelector(".drawer__close");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    var first = drawer.querySelector("a, button");
    if (first) first.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (burger) burger.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (drawer) {
    drawer.addEventListener("click", function (e) {
      if (e.target === drawer) closeDrawer();
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) closeDrawer();
  });

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Current year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- Lead form ---- */
  var form = document.getElementById("lead-form");
  if (form) {
    var success = document.getElementById("form-success");

    function setInvalid(input, on) {
      var field = input.closest(".field");
      if (field) field.classList.toggle("invalid", on);
    }

    // validate on blur, clear on input
    form.querySelectorAll("input[required]").forEach(function (input) {
      input.addEventListener("blur", function () {
        setInvalid(input, !input.value.trim());
      });
      input.addEventListener("input", function () {
        if (input.value.trim()) setInvalid(input, false);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      form.querySelectorAll("input[required]").forEach(function (input) {
        var bad = !input.value.trim();
        setInvalid(input, bad);
        if (bad && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      // No backend wired yet — show confirmation. Replace with real endpoint.
      if (success) success.classList.add("show");
      form.querySelector('button[type="submit"]').setAttribute("disabled", "true");
      form.reset();
      if (success) success.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    });
  }
})();
