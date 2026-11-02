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
  const caseDialog = document.querySelector("#case-dialog");
  const caseDialogTitle = document.querySelector("#case-dialog-title");
  const caseDialogKicker = document.querySelector("#case-dialog-kicker");
  const caseDialogBody = document.querySelector("#case-dialog-body");
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

  const lensTabs = [...document.querySelectorAll(".lens-tab")];
  const lensPanels = [...document.querySelectorAll(".lens-panel")];
  lensTabs.forEach((tab) => tab.addEventListener("click", () => {
    const lens = tab.dataset.lens;
    lensTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    lensTabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
    lensPanels.forEach((panel) => {
      const active = panel.id === `lens-${lens}`;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
  }));

  const caseData = {
    fmcg: {
      kicker: "CASE STUDY 01 · FMCG OPERATIONS & ROUTE INTELLIGENCE",
      title: "Optimizing Retail Distribution & Replenishment in Mumbai’s Andheri–Bandra Corridor",
      sections: [
        ["Context", "High outlet density, variable retailer reorder cycles and shelf-space competition across general trade and supermarkets."],
        ["Operational Bottleneck", "Field signals were fragmented across beat visits, order booking and distributor stock availability."],
        ["Framework & Execution", "Segment beats by outlet velocity, standardize order-booking cadence and create distributor stock-out feedback loops."],
        ["Key Business Takeaways", "Frontline friction becomes DMS/SFA product requirements: better route visibility, reorder triggers and fill-rate instrumentation."]
      ]
    },
    solar: {
      kicker: "CASE STUDY 02 · 0-TO-1 SUPPLY CHAIN & COMMERCIAL LAUNCH",
      title: "End-to-End International Sourcing, Import Logistics & GTM for Only Solar",
      sections: [
        ["Context", "A commercial and street lighting line required cross-border vendor vetting, lead-time planning and multi-tier distributor margins."],
        ["Operational Bottleneck", "Supplier uncertainty and landed-cost variability made pricing, inventory and working-capital decisions inseparable."],
        ["Framework & Execution", "Built supplier evaluation matrices, RFQ negotiation workflows, landed-cost pricing models and direct distributor channel economics."],
        ["Key Business Takeaways", "A successful launch connects sourcing discipline to channel-ready pricing, quality assurance and P&L ownership."]
      ]
    },
    visibility: {
      kicker: "CASE STUDY 03 · TECH + OPS PRODUCT CONCEPT",
      title: "Retailer Replenishment & Territory Visibility Playbook",
      sections: [
        ["Context", "Information asymmetry between field reps, local distributors and supply planners causes lost secondary sales."],
        ["Operational Bottleneck", "Teams lack a shared view of fill rate, beat strike rate and SKU velocity at the moment decisions are made."],
        ["Framework & Execution", "Combine B.Tech CS systems thinking with field insight to define KPI instrumentation, workflow automation and exception-based alerts."],
        ["Key Business Takeaways", "Physical supply-chain bottlenecks can be translated into scalable digital product specifications and measurable outcomes."]
      ]
    }
  };
  const caseCards = [...document.querySelectorAll(".case-card")];
  document.querySelectorAll(".case-filter").forEach((filter) => filter.addEventListener("click", () => {
    document.querySelectorAll(".case-filter").forEach((item) => item.classList.toggle("is-active", item === filter));
    const tag = filter.dataset.filter;
    caseCards.forEach((card) => { card.hidden = tag !== "all" && !card.dataset.tags.split(",").includes(tag); });
  }));
  document.querySelectorAll(".case-open").forEach((button) => button.addEventListener("click", () => {
    const data = caseData[button.dataset.case];
    if (!data) return;
    caseDialogKicker.textContent = data.kicker;
    caseDialogTitle.textContent = data.title;
    caseDialogBody.innerHTML = data.sections.map(([heading, copy]) => `<section><h3>${heading}</h3><p>${copy}</p></section>`).join("");
    caseDialog.showModal();
  }));
  document.querySelector(".case-dialog__close").addEventListener("click", () => caseDialog.close());
  caseDialog.addEventListener("click", (event) => { if (event.target === caseDialog) caseDialog.close(); });

  const copyEmail = document.querySelector(".copy-email");
  copyEmail.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copyEmail.dataset.email);
      copyEmail.textContent = "Copied!";
      setTimeout(() => { copyEmail.textContent = "Copy Email (jayeshsingh9b@gmail.com)"; }, 1800);
    } catch (error) {
      console.error("Could not copy the email address.", error);
      copyEmail.textContent = "Copy failed — use the email link";
    }
  });

  const contactForm = document.querySelector("#contact-form");
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector("button[type='submit']");
    const hint = document.querySelector("#contact-form-hint");
    submitButton.disabled = true;
    hint.textContent = "Sending your note…";
    const formData = new FormData(contactForm);
    try {
      const response = await fetch("https://formsubmit.co/ajax/jayeshsingh9b@gmail.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      if (!response.ok) throw new Error(`Contact submission failed with status ${response.status}.`);
      contactForm.reset();
      hint.textContent = "Thanks — your message is on its way.";
    } catch (error) {
      console.error(error);
      hint.textContent = "Something went wrong. Please copy the email address and send your note directly.";
    } finally {
      submitButton.disabled = false;
    }
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

    if (caseDialog.open) {
      event.preventDefault();
      caseDialog.close();
      return;
    }

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
