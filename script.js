history.scrollRestoration = "manual";

const themeKey = "jayesh-portfolio-theme-v4";
let theme = "light";
try {
  const saved = localStorage.getItem(themeKey);
  if (saved === "dark" || saved === "light") theme = saved;
} catch (error) {
  console.warn("Could not read the saved theme.", error);
}
document.documentElement.dataset.theme = theme;
document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#121416" : "#f3f0e9";

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("#site-nav");
  const menu = document.querySelector(".menu-toggle");
  const themeToggle = document.querySelector(".theme-toggle");
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...nav.querySelectorAll("a")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector(".hero");
  const heroRoute = document.querySelector(".hero__route");
  const progressCurrent = document.querySelector(".page-progress__current");
  const progressFill = document.querySelector(".page-progress__line i");

  if (!reducedMotion && hero && heroRoute) {
    let pointerFrame = 0;
    hero.addEventListener("pointermove", (event) => {
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        heroRoute.style.setProperty("--route-x", `${x * 10}px`);
        heroRoute.style.setProperty("--route-y", `${y * 8}px`);
        pointerFrame = 0;
      });
    });
    hero.addEventListener("pointerleave", () => {
      heroRoute.style.setProperty("--route-x", "0px");
      heroRoute.style.setProperty("--route-y", "0px");
    });
  }

  const setTheme = (next) => {
    theme = next;
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#121416" : "#f3f0e9";
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
    try { localStorage.setItem(themeKey, theme); } catch (error) { console.warn("Could not save the selected theme.", error); }
  };
  setTheme(theme);

  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menu.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }
  });
  themeToggle.addEventListener("click", () => setTheme(theme === "dark" ? "light" : "dark"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.toggleAttribute("aria-current", link.hash === `#${entry.target.id}`));
      const sectionIndex = sections.indexOf(entry.target) + 1;
      if (progressCurrent) progressCurrent.textContent = String(sectionIndex).padStart(2, "0");
    });
  }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
  sections.forEach((section) => observer.observe(section));

  const updateProgress = () => {
    if (!progressFill) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressFill.style.height = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });

  if (!reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        instance.unobserve(entry.target);
      });
    }, { threshold: .12 });
    document.querySelectorAll(".panel > *, .work-card, .experience-row, .education-items article").forEach((item) => {
      item.classList.add("reveal");
      revealObserver.observe(item);
    });
  }

  const filters = [...document.querySelectorAll(".work-filters button")];
  const cards = [...document.querySelectorAll(".work-card")];
  filters.forEach((filter) => filter.addEventListener("click", () => {
    filters.forEach((item) => item.classList.toggle("is-active", item === filter));
    const selected = filter.dataset.filter;
    cards.forEach((card) => card.toggleAttribute("hidden", selected !== "all" && !card.dataset.tags.includes(selected)));
  }));

  const caseData = {
    fmcg: ["Field operations / route intelligence", "Making a beat work harder.", [["Context", "Sales Representative at CavinKare, covering 50+ general trade and supermarket outlets across Mumbai’s Andheri–Bandra corridor."], ["Move", "Grouped outlets by velocity and route behaviour, synced field booking with distributor replenishment and used trade schemes where they could change the next order."], ["Signal", "The active GT retailer base grew 20% in month one, with a 30% month-on-month lift in a focus category."]]],
    solar: ["0→1 launch / commercial operations", "From supplier to shelf.", [["Context", "Only Solar was an import-distribution venture built around overseas sourcing and B2B channel development."], ["Move", "Owned the chain from RFQs and landed-cost modelling through customs coordination, tiered pricing, channel conversations and P&L decisions."], ["Signal", "A practical operating model that connected supplier terms to what the market could actually absorb."]]],
    visibility: ["Systems / product concept", "See the whole flow.", [["Problem", "Order booking, distributor dispatch and outlet inventory often live in separate views."], ["Approach", "A relational SQL model and Power BI layer connecting outlet master data, beat visits, SKU bookings and closing inventory."], ["Output", "Exception-first signals for fill-rate gaps, days since last order and high-velocity outlets at risk."]]],
    dashboard: ["Concept / operations analytics", "Exceptions first.", [["Frame", "A clearly labelled portfolio concept using synthetic or sample data, not a deployed company dashboard."], ["Model", "Inventory movement, SKU velocity and outlet-level demand translated into turnover, ABC classification, reorder level and service-level views."], ["Principle", "A dashboard should make the next replenishment action clearer, not simply show more charts."]]]
  };
  const dialog = document.querySelector("#case-dialog");
  const dialogTitle = document.querySelector("#case-dialog-title");
  const dialogKicker = document.querySelector("#case-dialog-kicker");
  const dialogBody = document.querySelector("#case-dialog-body");
  let trigger = null;
  document.querySelectorAll(".work-card").forEach((card) => card.addEventListener("click", (event) => {
    if (event.target.closest("button")) trigger = card;
    const data = caseData[card.dataset.case];
    if (!data) return;
    dialogKicker.textContent = data[0];
    dialogTitle.textContent = data[1];
    dialogBody.innerHTML = data[2].map(([heading, copy]) => `<section><h3>${heading}</h3><p>${copy}</p></section>`).join("");
    dialog.showModal();
  }));
  document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("cancel", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => trigger?.focus());

  const copy = document.querySelector(".copy-email");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copy.dataset.email);
      copy.innerHTML = "Copied — thank you <span>✓</span>";
      setTimeout(() => { copy.innerHTML = "Copy email <span>⌘C</span>"; }, 1800);
    } catch (error) {
      copy.textContent = "Copy unavailable — use the email link";
      console.warn("Clipboard access failed.", error);
    }
  });
});
