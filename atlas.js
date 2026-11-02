const entries={
 beat:{kicker:"A / 01 · Field / distribution",title:"Making a Beat Work Harder.",body:"A field note on the mechanics behind retail distribution: the route, the shelf and the small decisions that determine whether a beat creates momentum.",detail:"CavinKare · Sales Representative · October 2025 – February 2026 · Third-party payroll"},
 shelf:{kicker:"B / 02 · Venture / sourcing",title:"From Supplier to Shelf.",body:"A view into the commercial handoffs behind Only Solar. The focus is practical connective tissue: sourcing, pricing, channel conversations and follow-through.",detail:"Only Solar · Co-Founder & Business Head · 2024 – early 2025"},
 flow:{kicker:"C / 03 · Concept / visibility",title:"See the Whole Flow.",body:"A synthetic operations concept for connecting purchase, inventory and dispatch signals in one readable view. The aim is to help a team see movement before it becomes a surprise.",detail:"Independent concept · Synthetic data · SQL + Power BI"},
 exceptions:{kicker:"D / 04 · Concept / analytics",title:"Exceptions First.",body:"A decision surface that prioritises the few orders, suppliers or stock movements that need attention now. Everything else can wait.",detail:"Independent concept · Synthetic data · Prototype direction"}
};
const menu=document.querySelector(".rail__menu"),drawer=document.querySelector("#drawer");
menu.addEventListener("click",()=>{const open=drawer.classList.toggle("is-open");menu.setAttribute("aria-expanded",String(open))});
drawer.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{drawer.classList.remove("is-open");menu.setAttribute("aria-expanded","false")}));
const dialog=document.querySelector("#entry-dialog");
document.querySelectorAll(".entry").forEach(entry=>entry.addEventListener("click",()=>{const item=entries[entry.dataset.entry];document.querySelector("#dialog-kicker").textContent=item.kicker;document.querySelector("#dialog-title").textContent=item.title;document.querySelector("#dialog-body").innerHTML=`<p>${item.body}</p><p class="dialog-detail"><b>Context</b>${item.detail}</p>`;dialog.showModal()}));
document.querySelector(".dialog-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!reduce){document.querySelectorAll(".intro-copy,.atlas-object,.about-grid,.entry,.path-list li,.contact-grid").forEach((el,i)=>{el.classList.add("reveal");el.style.setProperty("--delay",`${(i%4)*70}ms`)});const observer=new IntersectionObserver(items=>items.forEach(item=>{if(item.isIntersecting){item.target.classList.add("is-visible");observer.unobserve(item.target)}}),{threshold:.12});document.querySelectorAll(".reveal").forEach(el=>observer.observe(el))}
