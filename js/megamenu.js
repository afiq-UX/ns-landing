/* ==========================================================================
   megamenu.js — opens the panel from the masthead and swaps the rail's
   groups. Without JS the panels stay hidden and the masthead links still
   point at their landing pages.
   ========================================================================== */

(function () {
  const triggers = Array.from(document.querySelectorAll("[data-megamenu]"));
  if (!triggers.length) return;

  const scrim = document.querySelector(".mm-scrim");
  const zone = document.querySelector(".masthead-zone");
  let open = null;

  const panelFor = (trigger) => document.getElementById(trigger.dataset.megamenu);

  function close() {
    if (!open) return;
    open.setAttribute("aria-expanded", "false");
    panelFor(open).hidden = true;
    if (scrim) scrim.hidden = true;
    if (zone) zone.classList.remove("is-menu-open");
    open = null;
  }

  function show(trigger) {
    if (open === trigger) return close();
    close();
    trigger.setAttribute("aria-expanded", "true");
    panelFor(trigger).hidden = false;
    if (scrim) scrim.hidden = false;
    if (zone) zone.classList.add("is-menu-open");
    open = trigger;
  }

  triggers.forEach((trigger) => {
    const menu = panelFor(trigger);
    if (!menu) return;

    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-controls", menu.id);
    menu.hidden = true;

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      show(trigger);
    });

    // Rail: hovering only lights the red edge (CSS). Swapping the pane is a
    // deliberate click, so passing over the rail never churns the content.
    const items = Array.from(menu.querySelectorAll(".mm-item"));
    items.forEach((item) => {
      item.addEventListener("click", () => {
        items.forEach((other) => {
          const on = other === item;
          other.setAttribute("aria-selected", String(on));
          const panel = document.getElementById(other.getAttribute("aria-controls"));
          if (panel) panel.classList.toggle("is-current", on);
        });
      });
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !open) return;
    const trigger = open;
    close();
    trigger.focus();
  });

  document.addEventListener("click", (event) => {
    if (!open) return;
    if (open.contains(event.target)) return;
    if (panelFor(open).contains(event.target)) return;
    close();
  });
})();
