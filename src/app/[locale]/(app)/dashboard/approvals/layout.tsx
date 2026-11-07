import { NoSsr } from "@/components/aegisora/no-ssr";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <NoSsr>{children}</NoSsr>;
}