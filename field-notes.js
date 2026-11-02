const fileContent = {
  beat: {
    kicker: "Field experience / FMCG distribution",
    title: "Making a beat work harder.",
    sections: [
      ["Context", "Sales Representative at CavinKare from October 2025 to February 2026 on third-party payroll, working across general trade and supermarket outlets."],
      ["Question", "How can a field rhythm make the next order more informed without adding another layer of ceremony?"],
      ["Practice", "Observe outlet behaviour, connect retailer conversations with distributor replenishment and make the route visible enough to improve the next visit."]
    ]
  },
  shelf: {
    kicker: "Entrepreneurship / Only Solar",
    title: "From supplier to shelf.",
    sections: [
      ["Context", "Co-Founder & Business Head at Only Solar from 2024 to early 2025."],
      ["Question", "What has to be true between an overseas supplier quote and a viable B2B channel?"],
      ["Practice", "Worked across sourcing, landed-cost thinking, import coordination, pricing and channel development as one connected commercial system."]
    ]
  },
  flow: {
    kicker: "Independent concept / SQL + Power BI",
    title: "See the whole flow.",
    sections: [
      ["Frame", "An independent systems concept, separate from employment experience."],
      ["Model", "Connect outlet master data, beat visits, SKU bookings and closing inventory in a relational view."],
      ["Output", "A practical intelligence layer that surfaces fill-rate gaps, days since last order and high-velocity outlets needing attention."]
    ]
  },
  exceptions: {
    kicker: "Independent concept / operations analytics",
    title: "Exceptions first.",
    sections: [
      ["Frame", "A clearly labelled portfolio concept using synthetic or sample data, not a deployed company dashboard."],
      ["Model", "Translate inventory movement, SKU velocity and outlet-level demand into turnover, ABC classification and reorder-level views."],
      ["Principle", "A dashboard earns its place when it makes the next replenishment action clearer, not when it shows more charts."]
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-button");
  const menu = document.querySelector(".chapter-menu");
  const dialog = document.querySelector("#file-dialog");
  const dialogTitle = document.querySelector("#file-title");
  const dialogKicker = document.querySelector("#file-kicker");
  const dialogBody = document.querySelector("#file-body");
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

  document.querySelectorAll(".file").forEach((file) => file.addEventListener("click", () => {
    const data = fileContent[file.dataset.file];
    if (!data) return;
    trigger = file;
    dialogKicker.textContent = data.kicker;
    dialogTitle.textContent = data.title;
    dialogBody.innerHTML = data.sections.map(([heading, copy]) => `<section><h3>${heading}</h3><p>${copy}</p></section>`).join("");
    dialog.showModal();
  }));
  document.querySelector(".close-dialog").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => trigger?.focus());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open) dialog.close();
  });

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-seen");
        instance.unobserve(entry.target);
      });
    }, { threshold: .12 });
    document.querySelectorAll(".chapter__head,.method-intro,.method-grid article,.files-intro,.file,.arc-layout,.timeline article,.closing__grid").forEach((element) => {
      element.classList.add("observe");
      observer.observe(element);
    });
  }
});
