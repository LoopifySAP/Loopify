document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  // Tahun footer
  $("#currentYear").textContent = new Date().getFullYear();

  // Navigasi mobile
  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
    );
    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  $$("#navLinks a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Buka menu navigasi");
      menuToggle.textContent = "☰";
    });
  });

  // Animasi saat section masuk ke viewport
  $$(".ticker, .slider-viewport, .slider-progress, .footer .container, .concept-quote, .community-stamp")
    .forEach((el) => el.classList.add("reveal-zoom"));

  // Delay bertahap agar elemen muncul satu per satu
  const groups = new Map();
  $$(".reveal, .reveal-left, .reveal-right, .reveal-zoom").forEach((el) => {
    const list = groups.get(el.parentElement) || [];
    list.push(el);
    groups.set(el.parentElement, list);
  });
  groups.forEach((list) => list.forEach((el, i) => {
    el.dataset.delay = Math.min(i, 5) * 90;
    el.style.transitionDelay = `${el.dataset.delay}ms`;
  }));

  const revealElements = $$(".reveal, .reveal-left, .reveal-right, .reveal-zoom");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    const timers = new WeakMap();

    function countUp(root) {
      root.querySelectorAll("[data-count]").forEach((node) => {
        const target = Number(node.dataset.count);
        const start = performance.now();
        const duration = 1300;
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          node.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(tick);
        };
        node.textContent = "0";
        requestAnimationFrame(tick);
      });
    }

    // Animasi berulang: muncul saat masuk layar, reset saat keluar layar
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;

        if (entry.intersectionRatio >= 0.12) {
          if (el.classList.contains("visible")) return;
          window.clearTimeout(timers.get(el));
          el.style.transitionDelay = `${el.dataset.delay || 0}ms`;
          el.classList.remove("done");
          el.classList.add("visible");
          if (el.querySelector("[data-count]")) countUp(el);
          timers.set(el, window.setTimeout(() => {
            el.style.transitionDelay = "";
            el.classList.add("done");
          }, 1300));
        } else if (entry.intersectionRatio === 0) {
          window.clearTimeout(timers.get(el));
          el.style.transitionDelay = "0ms";
          el.classList.remove("visible", "done");
        }
      });
    }, { threshold: [0, 0.12], rootMargin: "0px 0px -30px 0px" });

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  // Slider tantangan
  const track = $("#sliderTrack");
  const cards = $$(".challenge-card");
  const prev = $("#sliderPrev");
  const next = $("#sliderNext");
  const count = $("#sliderCount");
  const progressFill = $("#progressFill");

  let currentIndex = 0;

  function visibleCount() {
    if (window.innerWidth <= 760) return 1;
    if (window.innerWidth <= 950) return 2;
    return 3;
  }

  function updateSlider() {
    if (!cards.length) return;

    const visible = visibleCount();
    const maxIndex = Math.max(0, cards.length - visible);
    currentIndex = Math.min(currentIndex, maxIndex);

    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    track.style.transform =
      `translateX(-${currentIndex * (cardWidth + gap)}px)`;

    prev.disabled = currentIndex === 0;
    next.disabled = currentIndex >= maxIndex;

    count.textContent =
      `${String(currentIndex + 1).padStart(2, "0")} / ` +
      `${String(maxIndex + 1).padStart(2, "0")}`;

    const progress = maxIndex === 0
      ? 100
      : ((currentIndex + 1) / (maxIndex + 1)) * 100;

    progressFill.style.width = `${progress}%`;
  }

  prev.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateSlider();
  });

  next.addEventListener("click", () => {
    const maxIndex = Math.max(0, cards.length - visibleCount());
    currentIndex = Math.min(maxIndex, currentIndex + 1);
    updateSlider();
  });

  window.addEventListener("resize", updateSlider);
  updateSlider();

  // Popup bar setelah pengguna melakukan scroll
  const signupBar = $("#signupBar");
  const barClose = $("#barClose");
  const barJoin = $("#barJoin");
  let barDismissed = false;

  function handleScroll() {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;

    if (progress > 0.24 && !barDismissed) {
      signupBar.classList.add("show");
    } else if (progress <= 0.24) {
      signupBar.classList.remove("show");
    }
  }

  const navbar = $(".navbar");
  const scrollProgress = $("#scrollProgress");
  const parallaxEls = $$(".hero, .section");
  let ticking = false;

  function onScrollFx() {
    handleScroll();
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    navbar.classList.toggle("scrolled", window.scrollY > 10);

    if (!reduceMotion) {
      parallaxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        const offset = (r.top + r.height / 2 - window.innerHeight / 2) * -0.07;
        el.style.setProperty("--py", `${offset.toFixed(1)}px`);
      });
    }
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScrollFx);
    }
  }, { passive: true });
  onScrollFx();

  barClose.addEventListener("click", () => {
    barDismissed = true;
    signupBar.classList.remove("show");
  });

  barJoin.addEventListener("click", () => {
    signupBar.classList.remove("show");
  });

  // Modal sambutan
  const modal = $("#welcomeModal");
  const modalClose = $("#modalClose");
  const modalExplore = $("#modalExplore");
  let modalDismissed = false;

  function openModal() {
    if (modalDismissed || reduceMotion) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modalClose.focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    modalDismissed = true;
  }

  if (!reduceMotion) {
    window.setTimeout(openModal, 9000);
  }

  modalClose.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  modalExplore.addEventListener("click", closeModal);
});
