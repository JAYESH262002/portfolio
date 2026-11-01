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
  const navigableSections = siteNavLinks.map((link) =>
    document.querySelector(link.getAttribute("href")),
  );
  const themeToggle = document.querySelector(".theme-toggle");
  const profileDialog = document.querySelector("#profile-dialog");
  const profileTrigger = document.querySelector(".profile-trigger");
  const profileClose = document.querySelector(".profile-dialog__close");
  const infoDialog = document.querySelector("#info-dialog");
  const infoDialogTitle = document.querySelector("#info-dialog-title");
  const infoDialogDescription = document.querySelector("#info-dialog-description");
  const infoDialogClose = document.querySelector(".info-dialog__close");
  const infoDialogDiagram = document.querySelector(".info-dialog__diagram");
  const infoDialogSteps = [...infoDialogDiagram.querySelectorAll(".info-dialog__step")];
  const infoDialogTriggers = document.querySelectorAll(
    ".info-dialog-trigger, .hero__visual-card",
  );
  const revealTargets = document.querySelectorAll(
    ".about-layout, .content-heading, .resume-entry, .focus-grid, .minor-row, .project-layout, .education-entry, .off-clock, .contact-layout, .site-footer",
  );
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let currentSectionId = null;
  function setCurrentSection(sectionId) {
    if (currentSectionId === sectionId) return;
    currentSectionId = sectionId;

    siteNavLinks.forEach((link) => {
      if (link.hash === `#${sectionId}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

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

  let infoDialogTrigger = null;
  infoDialogTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const steps = trigger.dataset.infoSteps?.split("|") ?? [];
      const motion = trigger.dataset.infoMotion;

      if (
        steps.length !== infoDialogSteps.length ||
        steps.some((step) => !step.trim()) ||
        !motion
      ) {
        console.error("The information popup requires three diagram steps and a motion type.");
        return;
      }

      infoDialogTrigger = trigger;
      infoDialogTitle.textContent = trigger.dataset.infoTitle;
      infoDialogDescription.textContent = trigger.dataset.infoDescription;
      infoDialogDiagram.dataset.motion = motion;
      infoDialogSteps.forEach((step, index) => {
        step.textContent = steps[index];
      });
      infoDialogDiagram.classList.remove("is-animating");
      if (!reducedMotion) {
        void infoDialogDiagram.offsetWidth;
        infoDialogDiagram.classList.add("is-animating");
      }
      infoDialog.showModal();
    });
  });
  infoDialogClose.addEventListener("click", () => infoDialog.close());
  infoDialog.addEventListener("click", (event) => {
    if (event.target === infoDialog) infoDialog.close();
  });
  infoDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    infoDialog.close();
  });
  infoDialog.addEventListener("close", () => {
    infoDialogDiagram.classList.remove("is-animating");
    infoDialogTrigger?.focus();
  });

  const contactForm = document.querySelector("#contact-form");
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const subject = `Portfolio enquiry: ${formData.get("subject")}`;
    const body = [
      `Name: ${formData.get("name").trim()}`,
      `Email: ${formData.get("email").trim()}`,
      `Topic: ${formData.get("subject")}`,
      "",
      formData.get("message").trim(),
    ].join("\n");
    const query = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: "jayeshsingh9b@gmail.com",
      su: subject,
      body,
    });
    const gmailUrl = `https://mail.google.com/mail/?${query}`;
    contactForm.reset();
    window.location.assign(gmailUrl);
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

    if (infoDialog.open) {
      event.preventDefault();
      infoDialog.close();
      return;
    }

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
