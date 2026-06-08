/* aglingael.github.io — interactions
   Motion gated by prefers-reduced-motion. Transforms/opacity only. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- current year ---------------------------------------------------- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ---- live stats ------------------------------------------------------ */
  /* Numbers come from data/stats.json, refreshed daily by a GitHub Action
     (Google Scholar via SerpApi + GitHub API). The HTML ships with the last
     known values, so a failed fetch or no-JS just keeps those. */
  (function () {
    var hooks = document.querySelectorAll("[data-stat]");
    if (!hooks.length) return;
    fetch("/data/stats.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        hooks.forEach(function (el) {
          var value = el.getAttribute("data-stat").split(".").reduce(function (obj, key) {
            return obj == null ? obj : obj[key];
          }, data);
          if (value === null || value === undefined || value === "") return;
          el.textContent =
            typeof value === "number" ? value.toLocaleString("en-US") : String(value);
        });
      })
      .catch(function () {});
  })();

  /* ---- sticky header scrolled state ------------------------------------ */
  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () {
      head.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- scroll reveals (staggered) -------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var ro = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var sibs = el.parentElement
          ? Array.prototype.slice.call(el.parentElement.querySelectorAll(":scope > [data-reveal]"))
          : [el];
        var i = Math.max(0, sibs.indexOf(el));
        el.style.setProperty("--reveal-delay", Math.min(i, 8) * 65 + "ms");
        el.classList.add("in");
        obs.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { ro.observe(el); });
  }

  /* ---- scrollspy: highlight current section in nav --------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  if (navLinks.length && "IntersectionObserver" in window) {
    var map = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (id) map[id] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.style.color = ""; });
        var active = map[e.target.id];
        if (active) active.style.color = "var(--ink)";
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* ---- decision-tree draw-in ------------------------------------------- */
  var tree = document.querySelector(".tree svg");
  if (tree) {
    var edges = Array.prototype.slice.call(tree.querySelectorAll(".edge"));
    var nodes = Array.prototype.slice.call(
      tree.querySelectorAll(".node-split, .node-leaf, .nlabel, .elabel")
    );

    if (reduce) {
      // present final state, no motion
      edges.forEach(function (p) { p.style.strokeDashoffset = "0"; });
      nodes.forEach(function (n) { n.style.opacity = "1"; });
    } else {
      // prep: hide nodes, dash edges
      nodes.forEach(function (n) { n.style.opacity = "0"; n.style.transition = "opacity 380ms var(--ease-out)"; });
      edges.forEach(function (p) {
        var len = 0;
        try { len = p.getTotalLength(); } catch (e) { len = 200; }
        p.style.strokeDasharray = len + " " + len;
        p.style.strokeDashoffset = String(len);
        p.style.transition = "stroke-dashoffset 620ms var(--ease-out)";
      });

      var play = function () {
        edges.forEach(function (p, i) {
          var d = 120 + i * 95;
          setTimeout(function () { p.style.strokeDashoffset = "0"; }, d);
        });
        nodes.forEach(function (n, i) {
          var d = 260 + i * 55;
          setTimeout(function () { n.style.opacity = "1"; }, d);
        });
      };

      if ("IntersectionObserver" in window) {
        var to = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { play(); obs.disconnect(); }
          });
        }, { threshold: 0.25 });
        to.observe(tree);
      } else {
        play();
      }
    }
  }
})();
