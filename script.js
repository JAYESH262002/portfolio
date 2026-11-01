history.scrollRestoration = "manual";
if (window.location.hash) {
  history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

const themeStorageKey = "jayesh-portfolio-theme-v3";
let currentTheme = "dark";

try {
  const savedTheme = localStorage.getItem(themeStorageKey);
  if (savedTheme === "light" || savedTheme === "dark") currentTheme = savedTheme;
} catch (error) {
  console.warn("Could not read the saved color theme.", error);
}

document.documentElement.dataset.theme = currentTheme;
document.querySelector('meta[name="theme-color"]').content =
  currentTheme === "dark" ? "#020617" : "#f8f6f0";

document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo({ top: 0, behavior: "instant" });

  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector("#site-nav");
  const siteNavLinks = [...siteNav.querySelectorAll('a[href^="#"]')];
  const homeLink = document.querySelector(".wordmark__label");
  const navigableSections = [
    document.querySelector("#home"),
    ...siteNavLinks.map((link) => document.querySelector(link.getAttribute("href"))),
  ];
  const themeToggle = document.querySelector(".theme-toggle");
  const profileDialog = document.querySelector("#profile-dialog");
  const profileTrigger = document.querySelector(".profile-trigger");
  const profileClose = document.querySelector(".profile-dialog__close");
  const revealTargets = document.querySelectorAll(
    ".about__grid, .section-heading, .experience-card, .expertise-card, .minor-note, .projects__grid, .education-item, .education__aside, .contact__content, .site-footer",
  );
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setCurrentSection(sectionId) {
    homeLink.removeAttribute("aria-current");
    siteNavLinks.forEach((link) => {
      if (link.hash === `#${sectionId}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (sectionId === "home") homeLink.setAttribute("aria-current", "location");
  }

  let sectionUpdateScheduled = false;
  function updateCurrentSection() {
    if (sectionUpdateScheduled) return;
    sectionUpdateScheduled = true;

    window.requestAnimationFrame(() => {
      sectionUpdateScheduled = false;
      const activationPoint = window.innerHeight * 0.35;
      let currentSection = navigableSections[0];

      for (const section of navigableSections) {
        if (section.getBoundingClientRect().top > activationPoint) break;
        currentSection = section;
      }

      setCurrentSection(currentSection.id);
    });
  }

  window.addEventListener("scroll", updateCurrentSection, { passive: true });
  window.addEventListener("resize", updateCurrentSection);
  updateCurrentSection();

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
    );

    revealTargets.forEach((element) => {
      element.classList.add("reveal-on-scroll");
      revealObserver.observe(element);
    });
  }

  function updateThemeButton() {
    const isDark = currentTheme === "dark";
    const label = `Switch to ${isDark ? "light" : "dark"} mode`;
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;
  }

  themeToggle.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = currentTheme;
    document.querySelector('meta[name="theme-color"]').content =
      currentTheme === "dark" ? "#020617" : "#f8f6f0";
    updateThemeButton();

    try {
      localStorage.setItem(themeStorageKey, currentTheme);
    } catch (error) {
      console.error("Could not save the selected color theme.", error);
    }
  });

  updateThemeButton();

  profileTrigger.addEventListener("click", () => profileDialog.showModal());
  profileClose.addEventListener("click", () => profileDialog.close());
  profileDialog.addEventListener("click", (event) => {
    if (event.target === profileDialog) profileDialog.close();
  });
  profileDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    profileDialog.close();
  });

  const contactForm = document.querySelector("#contact-form");
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const topic = formData.get("subject");
    const message = formData.get("message").trim();
    const subject = `Portfolio enquiry: ${topic}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Topic: ${topic}`,
      "",
      message,
    ].join("\n");
    const mailto = `mailto:jayeshsingh9b@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    document.querySelector("#contact-form-status").textContent =
      "Your email app should open with this message. Review it and press Send to contact Jayesh.";
    window.location.href = mailto;
  });

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    siteNav.classList.toggle("is-open", !isExpanded);
  });

  siteNav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link) {
      setCurrentSection(link.hash.slice(1));
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (profileDialog.open) {
      profileDialog.close();
      profileTrigger.focus();
      return;
    }

    if (siteNav.classList.contains("is-open")) {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
      menuToggle.focus();
    }
  });
});
