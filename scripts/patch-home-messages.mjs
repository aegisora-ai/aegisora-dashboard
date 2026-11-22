import fs from 'node:fs';

const en = {
  hero: { badge: "Runtime security for AI agents", early: "Early access", title1: "Your agents act.", title2: "Aegisora decides first.",
    lead: "Each sensitive action is checked against policy, context and risk, then returned as ALLOW, ESCALATE or BLOCK before it executes.",
    cta1: "Test Aegisora", cta2: "Talk to us", note: "Default is BLOCK. No matching policy, nothing runs." },
  demo: { label: "Try a decision", run: "Check", agent: "Agent", policy: "Policy", evidence: "Evidence", noPolicy: "No matching policy", disclaimer: "Illustrative sample data." },
  how: { eyebrow: "How it works", title: "One check between your agent and the action.",
    s1t: "Your agent asks", s1d: "Before a sensitive action, your backend sends it to Aegisora together with its context.",
    s2t: "Aegisora decides", s2d: "Policy, risk and authorization are evaluated. The answer is ALLOW, ESCALATE or BLOCK.",
    s3t: "You stay in control", s3d: "Continue only on ALLOW. Escalations wait for a person. Every decision is recorded." },
  feat: { eyebrow: "What you get", title: "Everything between a request and an action.",
    f1t: "Policies", f1d: "Write rules for who may do what. When nothing matches, the answer is BLOCK.",
    f2t: "Approvals", f2d: "Escalated actions wait for an authorized person. Execution stays paused until they decide.",
    f3t: "Evidence", f3d: "Every decision is recorded with a verifiable evidence chain.",
    f4t: "Live activity", f4d: "Watch decisions arrive in real time and open incidents when something goes wrong.",
    f5t: "API and webhooks", f5d: "Call Aegisora from your backend with a workspace API key and get notified by webhook.",
    f6t: "Team access", f6d: "Invite your team with roles and require a second factor for sensitive changes." },
  live: { eyebrow: "Live", title: "Every decision, as it happens.", copy: "Aegisora checks each request before your action runs. This is what the stream of decisions looks like (sample data)." },
  feed: { label: "Live decisions" },
  code: { title: "Fail closed by design.", copy: "Ask first, then act. On BLOCK or an unknown answer, nothing happens.", label: "Illustrative" },
  cta: { title: "Put a check in front of your agents.", copy: "Test workspaces are open in early access. Design partner pilots are scoped in writing.", cta1: "Test Aegisora", cta2: "Pilot program" }
};

const de = {
  hero: { badge: "Laufzeitschutz f\u00fcr KI-Agenten", early: "Early Access", title1: "Ihre Agenten handeln.", title2: "Aegisora entscheidet zuerst.",
    lead: "Jede sensible Aktion wird gegen Richtlinie, Kontext und Risiko gepr\u00fcft und als ALLOW, ESCALATE oder BLOCK zur\u00fcckgegeben, bevor sie ausgef\u00fchrt wird.",
    cta1: "Aegisora testen", cta2: "Mit uns sprechen", note: "Standard ist BLOCK. Ohne passende Richtlinie l\u00e4uft nichts." },
  demo: { label: "Entscheidung ausprobieren", run: "Pr\u00fcfen", agent: "Agent", policy: "Richtlinie", evidence: "Nachweis", noPolicy: "Keine passende Richtlinie", disclaimer: "Beispieldaten zur Veranschaulichung." },
  how: { eyebrow: "So funktioniert es", title: "Eine Pr\u00fcfung zwischen Agent und Aktion.",
    s1t: "Ihr Agent fragt an", s1d: "Vor einer sensiblen Aktion sendet Ihr Backend sie mit Kontext an Aegisora.",
    s2t: "Aegisora entscheidet", s2d: "Richtlinie, Risiko und Berechtigung werden ausgewertet. Die Antwort lautet ALLOW, ESCALATE oder BLOCK.",
    s3t: "Sie behalten die Kontrolle", s3d: "Fortfahren nur bei ALLOW. Eskalationen warten auf eine Person. Jede Entscheidung wird protokolliert." },
  feat: { eyebrow: "Das bekommen Sie", title: "Alles zwischen Anfrage und Aktion.",
    f1t: "Richtlinien", f1d: "Regeln festlegen, wer was darf. Passt nichts, lautet die Antwort BLOCK.",
    f2t: "Freigaben", f2d: "Eskalierte Aktionen warten auf eine berechtigte Person. Die Ausf\u00fchrung bleibt angehalten, bis sie entscheidet.",
    f3t: "Nachweise", f3d: "Jede Entscheidung wird mit einer pr\u00fcfbaren Nachweiskette aufgezeichnet.",
    f4t: "Live-Aktivit\u00e4t", f4d: "Entscheidungen in Echtzeit verfolgen und bei Problemen Vorf\u00e4lle \u00f6ffnen.",
    f5t: "API und Webhooks", f5d: "Aegisora mit einem Workspace-API-Schl\u00fcssel aus dem Backend aufrufen und per Webhook benachrichtigt werden.",
    f6t: "Team-Zugriff", f6d: "Team mit Rollen einladen und f\u00fcr sensible \u00c4nderungen einen zweiten Faktor verlangen." },
  live: { eyebrow: "Live", title: "Jede Entscheidung, sobald sie f\u00e4llt.", copy: "Aegisora pr\u00fcft jede Anfrage, bevor Ihre Aktion l\u00e4uft. So sieht der Strom der Entscheidungen aus (Beispieldaten)." },
  feed: { label: "Live-Entscheidungen" },
  code: { title: "Im Zweifel gesperrt.", copy: "Erst fragen, dann handeln. Bei BLOCK oder unbekannter Antwort passiert nichts.", label: "Illustrativ" },
  cta: { title: "Setzen Sie eine Pr\u00fcfung vor Ihre Agenten.", copy: "Test-Workspaces sind im Early Access offen. Design-Partner-Pilotprojekte werden schriftlich vereinbart.", cta1: "Aegisora testen", cta2: "Pilotprogramm" }
};

for (const [loc, data] of [['en', en], ['de', de]]) {
  const p = 'messages/' + loc + '.json';
  if (!fs.existsSync(p)) { console.log('YOK: ' + p); process.exitCode = 2; continue; }
  const raw = fs.readFileSync(p, 'utf8');
  const j = JSON.parse(raw.replace(/^\uFEFF/, ''));
  j.HomeCalm = data;
  let out = JSON.stringify(j, null, 2);
  const crlf = raw.indexOf('\r\n') >= 0;
  if (crlf) out = out.replace(/\n/g, '\r\n');
  fs.writeFileSync(p, out + (crlf ? '\r\n' : '\n'), 'utf8');
  console.log('mesajlar guncellendi: ' + p);
}