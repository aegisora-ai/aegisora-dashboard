export function DraftNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 max-w-2xl rounded-md border border-escalate/30 bg-escalate-muted px-4 py-3 text-sm text-escalate">
      {children}
    </div>
  );
}