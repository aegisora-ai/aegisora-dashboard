export const THEME_KEY = "aeg-theme-v2";

/** Pages already converted to both themes. Every other page stays on the navy theme. */
export const LIGHT_READY: string[] = ["/", "/pilot", "/solutions", "/enterprise", "/security", "/product", "/trust", "/trust/privacy", "/trust/subprocessors", "/proof", "/terms", "/pricing", "/about"];

export const LIGHT_PREFIXES: string[] = ["/dashboard", "/onboarding", "/docs", "/blog", "/product", "/developers", "/support"];

/** App areas keep the navy theme unless the user chose light. Public pages default to light. */
export const APP_PREFIXES: string[] = ["/dashboard", "/onboarding"];

export function stripLocale(path: string): string {
  const p = path.replace(/^\/[a-z]{2}(?:-[A-Za-z]+)?(?=\/|$)/, "") || "/";
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

export function supportsLight(path: string): boolean {
  void path;
  return true;
}

export function isDarkTheme(path: string, stored: string | null): boolean {
  void path;
  return stored === "dark";
}

/** Runs before first paint. Light is the default; only an explicit "dark" choice turns dark on. */
export const THEME_INIT_SCRIPT = `(function(){try{document.documentElement.classList.toggle('dark',localStorage.getItem('${THEME_KEY}')==='dark');}catch(e){}})();`;