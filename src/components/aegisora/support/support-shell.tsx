export function SupportShell({ children }: { children: React.ReactNode; locale: string }) {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-[1100px] px-4 pb-20 sm:px-6">{children}</div>
    </div>
  );
}