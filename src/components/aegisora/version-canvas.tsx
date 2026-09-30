export function V1Canvas() {
  return (
    <svg viewBox="0 0 720 160" className="w-full h-auto" role="img" aria-label="Aegisora 1.0 architecture">
      <defs>
        <marker id="arrow-v1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--muted-foreground)" />
        </marker>
      </defs>
      {[
        { x: 20, label: "Agent", sub: "proposes action" },
        { x: 280, label: "Policy Engine", sub: "static rule match" },
        { x: 540, label: "Action", sub: "executes or halts" },
      ].map((box) => (
        <g key={box.label}>
          <rect x={box.x} y="55" width="160" height="60" rx="6" fill="var(--surface-2)" stroke="var(--border)" />
          <text x={box.x + 80} y="80" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--foreground)">{box.label}</text>
          <text x={box.x + 80} y="98" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">{box.sub}</text>
        </g>
      ))}
      <line x1="180" y1="85" x2="278" y2="85" stroke="var(--muted-foreground)" strokeWidth="1.5" markerEnd="url(#arrow-v1)" />
      <line x1="440" y1="85" x2="538" y2="85" stroke="var(--muted-foreground)" strokeWidth="1.5" markerEnd="url(#arrow-v1)" />
    </svg>
  );
}

export function V2Canvas() {
  const stages = [
    { x: 8, label: "Agent" },
    { x: 148, label: "Context" },
    { x: 288, label: "Policy" },
    { x: 428, label: "Risk" },
  ];
  return (
    <svg viewBox="0 0 720 200" className="w-full h-auto" role="img" aria-label="Aegisora 2.0 architecture">
      <defs>
        <marker id="arrow-v2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--muted-foreground)" />
        </marker>
      </defs>
      {stages.map((box) => (
        <g key={box.label}>
          <rect x={box.x} y="60" width="120" height="50" rx="6" fill="var(--surface-2)" stroke="var(--border)" />
          <text x={box.x + 60} y="90" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--foreground)">{box.label}</text>
        </g>
      ))}
      {[128, 268, 408].map((x) => (
        <line key={x} x1={x} y1="85" x2={x + 20} y2="85" stroke="var(--muted-foreground)" strokeWidth="1.5" markerEnd="url(#arrow-v2)" />
      ))}
      <line x1="488" y1="85" x2="560" y2="85" stroke="var(--muted-foreground)" strokeWidth="1.5" markerEnd="url(#arrow-v2)" />
      <rect x="568" y="20" width="132" height="40" rx="6" fill="var(--allow-muted)" stroke="var(--allow)" />
      <text x="634" y="45" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--allow)">ALLOW</text>
      <line x1="600" y1="60" x2="600" y2="78" stroke="var(--allow)" strokeWidth="1.5" />
      <rect x="568" y="90" width="132" height="40" rx="6" fill="var(--block-muted)" stroke="var(--block)" />
      <text x="634" y="115" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--block)">BLOCK</text>
      <rect x="568" y="140" width="132" height="40" rx="6" fill="var(--escalate-muted)" stroke="var(--escalate)" />
      <text x="634" y="165" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--escalate)">ESCALATE</text>
    </svg>
  );
}

export function V3Canvas() {
  const stages = ["REQUEST", "CONTEXT", "POLICY", "RISK", "DECISION", "ENFORCEMENT", "EXECUTION", "EVIDENCE"];
  return (
    <svg viewBox="0 0 760 220" className="w-full h-auto" role="img" aria-label="Aegisora 3.0 architecture">
      <defs>
        <marker id="arrow-v3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--primary)" />
        </marker>
      </defs>
      {stages.map((label, i) => {
        const x = 8 + i * 94;
        return (
          <g key={label}>
            <rect x={x} y="70" width="80" height="52" rx="6" fill="var(--surface-2)" stroke="var(--primary)" strokeOpacity="0.5" />
            <text x={x + 40} y="92" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--primary)">{String(i + 1).padStart(2, "0")}</text>
            <text x={x + 40} y="108" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="var(--foreground)">{label}</text>
            {i < stages.length - 1 && (
              <line x1={x + 80} y1="96" x2={x + 92} y2="96" stroke="var(--primary)" strokeWidth="1.5" markerEnd="url(#arrow-v3)" />
            )}
          </g>
        );
      })}
      <path
        d="M 726 122 Q 726 190 380 190 Q 40 190 40 122"
        fill="none"
        stroke="var(--cyan)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#arrow-v3)"
      />
      <text x="380" y="206" textAnchor="middle" fontSize="9" fill="var(--cyan)">continuous evidence feedback loop</text>
    </svg>
  );
}