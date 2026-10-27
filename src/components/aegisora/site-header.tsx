import { BwHeader } from "./bw/bw-header";

/* Accepts any props so the existing layout keeps compiling. */
export function SiteHeader(_props: { [key: string]: unknown }) {
  return <BwHeader />;
}
export default SiteHeader;
