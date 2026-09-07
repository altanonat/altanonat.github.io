/* ============================================================
   Altan Onat — Personal Website
   Nav, theme toggle, scroll reveal, counters, pub filters
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Theme (persisted, respects OS preference) ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  const savedTheme = (function () {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  })();

  if (savedTheme) {
    root.setAttribute("data-theme", savedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
  }

  themeToggle.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
  });

  /* ---------- Navbar: shadow on scroll ---------- */
  const navbar = document.getElementById("navbar");
  const onScroll = function () {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");

  burger.addEventListener("click", function () {
    const open = navLinks.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");
      burger.classList.remove("open");
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll(".stat-num");

  const animateCount = function (el) {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const duration = 1400;
    const start = performance.now();

    const step = function (now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Publication filters ---------- */
  const filterWrap = document.getElementById("pubFilters");
  const groups = document.querySelectorAll(".pub-group");

  if (filterWrap) {
    filterWrap.addEventListener("click", function (e) {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;

      filterWrap.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      groups.forEach(function (g) {
        const show = filter === "all" || g.getAttribute("data-group") === filter;
        g.classList.toggle("hidden", !show);
      });
    });
  }

  /* ---------- Scrollspy: highlight active nav link ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = navLinks.querySelectorAll("a");

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navAnchors.forEach(function (a) {
              a.classList.toggle("active", a.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Private message form (AJAX submit) ---------- */
  const form = document.getElementById("messageForm");
  const status = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      status.textContent = "Sending...";
      status.className = "form-status";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            status.textContent = "Thank you! Your message has been sent.";
            status.className = "form-status success";
            form.reset();
          } else {
            throw new Error(data.message || "Request failed");
          }
        })
        .catch(function () {
          status.textContent = "Something went wrong. Please try again or use the email address above.";
          status.className = "form-status error";
        });
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
