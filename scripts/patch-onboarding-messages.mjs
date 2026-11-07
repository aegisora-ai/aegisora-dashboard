import fs from 'node:fs';

const add = {
  en: {
    steps: { s1: "First agent", s2: "Connect" },
    q: {
      title: "Set up your first agent",
      desc: "Name an agent and choose what happens when it tries a sensitive action. You can change everything later.",
      agent: "Agent name",
      action: "Action to govern",
      resource: "Resource",
      outcome: "When this action is requested",
      escalate: "Pause and ask a person",
      block: "Block it",
      allow: "Allow it",
      create: "Create agent and rule",
      busy: "Saving\u2026",
      skip: "Skip for now",
      mfaTitle: "Verify your identity first",
      mfaDesc: "Creating agents and rules needs a second factor. Set it up in a new tab, then check again.",
      mfaOpen: "Set up two-factor sign-in",
      mfaCheck: "I\u2019ve done it, check again",
      checking: "Checking\u2026"
    },
    finish: {
      title: "You\u2019re ready to connect",
      desc: "Create an API key and call Aegisora from your backend before each sensitive action.",
      ws: "Workspace",
      agent: "Agent",
      policy: "Rule",
      notSet: "No agent or rule yet. You can add them any time in the dashboard.",
      key: "Create an API key",
      quickstart: "Open the quickstart"
    }
  },
  de: {
    steps: { s1: "Erster Agent", s2: "Verbinden" },
    q: {
      title: "Ersten Agenten einrichten",
      desc: "Agenten benennen und festlegen, was bei einer sensiblen Aktion passiert. Alles l\u00e4sst sich sp\u00e4ter \u00e4ndern.",
      agent: "Name des Agenten",
      action: "Zu steuernde Aktion",
      resource: "Ressource",
      outcome: "Wenn diese Aktion angefragt wird",
      escalate: "Anhalten und eine Person fragen",
      block: "Blockieren",
      allow: "Erlauben",
      create: "Agent und Regel anlegen",
      busy: "Wird gespeichert\u2026",
      skip: "Vorerst \u00fcberspringen",
      mfaTitle: "Zuerst Identit\u00e4t best\u00e4tigen",
      mfaDesc: "Zum Anlegen von Agenten und Regeln ist ein zweiter Faktor n\u00f6tig. In einem neuen Tab einrichten, dann erneut pr\u00fcfen.",
      mfaOpen: "Zwei-Faktor-Anmeldung einrichten",
      mfaCheck: "Erledigt, erneut pr\u00fcfen",
      checking: "Wird gepr\u00fcft\u2026"
    },
    finish: {
      title: "Bereit zur Anbindung",
      desc: "API-Schl\u00fcssel erstellen und Aegisora vor jeder sensiblen Aktion aus dem Backend aufrufen.",
      ws: "Workspace",
      agent: "Agent",
      policy: "Regel",
      notSet: "Noch kein Agent und keine Regel. Beides l\u00e4sst sich jederzeit im Dashboard hinzuf\u00fcgen.",
      key: "API-Schl\u00fcssel erstellen",
      quickstart: "Quickstart \u00f6ffnen"
    }
  }
};

for (const loc of ['en', 'de']) {
  const p = 'messages/' + loc + '.json';
  if (!fs.existsSync(p)) { console.log('YOK: ' + p); process.exitCode = 2; continue; }
  const raw = fs.readFileSync(p, 'utf8');
  const j = JSON.parse(raw.replace(/^\uFEFF/, ''));
  j.Onboarding = j.Onboarding || {};
  const o = j.Onboarding;
  o.steps = Object.assign({}, o.steps, add[loc].steps);
  o.q = add[loc].q;
  o.finish = add[loc].finish;
  let out = JSON.stringify(j, null, 2);
  const crlf = raw.indexOf('\r\n') >= 0;
  if (crlf) out = out.replace(/\n/g, '\r\n');
  fs.writeFileSync(p, out + (crlf ? '\r\n' : '\n'), 'utf8');
  console.log('mesajlar guncellendi: ' + p);
}