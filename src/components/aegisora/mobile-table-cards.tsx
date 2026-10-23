"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/*
  Phones: dashboard tables are shown as cards. This only tags each cell with its
  column title (data-label); the layout itself is plain CSS in globals.css and
  applies below 768px. Desktop is never touched.
*/
function labelTables() {
  document.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
    const heads = Array.from(table.querySelectorAll("thead th")).map((th) => (th.textContent ?? "").trim());
    if (heads.length === 0) return;
    if (!table.hasAttribute("data-aeg-cards")) table.setAttribute("data-aeg-cards", "");
    table.querySelectorAll("tbody tr").forEach((tr) => {
      Array.from(tr.children).forEach((cell, i) => {
        if (cell.hasAttribute("colspan")) return;
        const h = heads[i];
        if (h && cell.getAttribute("data-label") !== h) cell.setAttribute("data-label", h);
      });
    });
  });
}

export function MobileTableCards() {
  const pathname = usePathname();

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(labelTables);
    };
    schedule();
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { mo.disconnect(); cancelAnimationFrame(raf); };
  }, [pathname]);

  return null;
}