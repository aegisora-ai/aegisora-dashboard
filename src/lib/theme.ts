export const THEME_KEY = "aeg-theme";

/** Pages already converted to both themes. Every other page stays on the navy theme. */
export const LIGHT_READY: string[] = ["/"];

export function stripLocale(path: string): string {
  const p = path.replace(/^\/[a-z]{2}(?:-[A-Za-z]+)?(?=\/|$)/, "") || "/";
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

export function supportsLight(path: string): boolean {
  return LIGHT_READY.includes(stripLocale(path));
}

/** Runs before first paint so the page never flashes the wrong theme. */
export const THEME_INIT_SCRIPT = `(function(){try{var p=location.pathname.replace(/^\\/[a-z]{2}(?:-[A-Za-z]+)?(?=\\/|$)/,'')||'/';if(p.length>1&&p.slice(-1)==='/')p=p.slice(0,-1);var ok=${JSON.stringify(LIGHT_READY)}.indexOf(p)>-1;var s=localStorage.getItem('${THEME_KEY}');document.documentElement.classList.toggle('dark',!(ok&&s==='light'));}catch(e){}})();`;