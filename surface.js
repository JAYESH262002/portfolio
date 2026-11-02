const dossiers = {
  beat: { kicker: "Field experience / CavinKare", title: "Making a beat work harder.", sections: [["Context", "Sales Representative from October 2025 to February 2026 on third-party payroll, working across FMCG general trade and supermarket outlets."], ["Question", "How can a field rhythm make the next order more informed without adding another layer of ceremony?"], ["Practice", "Observe outlet behaviour, connect retailer conversations with distributor replenishment and make the route visible enough to improve the next visit."]] },
  shelf: { kicker: "Entrepreneurship / Only Solar", title: "From supplier to shelf.", sections: [["Context", "Co-Founder & Business Head from 2024 to early 2025 at an import-distribution venture."], ["Question", "What has to be true between an overseas supplier quote and a viable B2B channel?"], ["Practice", "Worked across sourcing, RFQ comparison, landed-cost thinking, import coordination, pricing and channel development."]] },
  flow: { kicker: "Independent concept / SQL + Power BI", title: "See the whole flow.", sections: [["Frame", "An independent systems concept, separate from employment experience."], ["Model", "Connect outlet master data, beat visits, SKU bookings and closing inventory in a relational view."], ["Output", "A practical intelligence layer that surfaces fill-rate gaps, days since last order and high-velocity outlets needing attention."]] },
  exceptions: { kicker: "Independent concept / analytics", title: "Exceptions first.", sections: [["Frame", "A portfolio concept using synthetic or sample data, not a deployed company dashboard."], ["Model", "Translate inventory movement, SKU velocity and outlet-level demand into turnover, ABC classification and reorder-level views."], ["Principle", "A dashboard earns its place when it makes the next replenishment action clearer, not when it shows more charts."]] }
};

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu");
  const menu = document.querySelector(".index-menu");
  const dialog = document.querySelector("#dossier-dialog");
  const title = document.querySelector("#dossier-title");
  const kicker = document.querySelector("#dossier-kicker");
  const content = document.querySelector("#dossier-content");
  let trigger;
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    menu.classList.toggle("is-open", !open);
  });
  menu.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    menuButton.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  });
  document.querySelectorAll(".dossier").forEach((item) => item.addEventListener("click", () => {
    const data = dossiers[item.dataset.file];
    if (!data) return;
    trigger = item;
    kicker.textContent = data.kicker;
    title.textContent = data.title;
    content.innerHTML = data.sections.map(([head, copy]) => `<section><h3>${head}</h3><p>${copy}</p></section>`).join("");
    dialog.showModal();
  }));
  document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => trigger?.focus());
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && dialog.open) dialog.close(); });
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, instance) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-seen");
      instance.unobserve(entry.target);
    }), { threshold: .12 });
    document.querySelectorAll(".band__head,.practice__intro,.practice__list article,.dossiers__intro,.dossier,.journey__intro,.record li,.open__grid").forEach((item) => {
      item.classList.add("observe");
      observer.observe(item);
    });
  }
});
