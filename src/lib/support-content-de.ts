import { Briefcase, LifeBuoy, Rocket, Scale, ShieldCheck } from "lucide-react";
import type { Collection } from "./support-content";

export const COLLECTIONS_DE: Collection[] = [
  {
    slug: "getting-started",
    title: "Erste Schritte",
    desc: "Was Aegisora ist, wie Sie einen Test-Workspace anlegen und Ihre erste Agentenaktion bewerten.",
    icon: Rocket,
    articles: [
      {
        slug: "what-is-aegisora",
        title: "Was ist Aegisora?",
        summary: "Eine Laufzeit-Kontrollschicht, die entscheidet, was ein KI-Agent ausführen darf.",
        body: [
          { t: "p", text: "Aegisora ist eine Ausführungskontrollschicht für KI-Agenten. Sie sitzt unterhalb Ihrer Agenten-Orchestrierung, an der Stelle, an der aus einer Anfrage eine ausführbare Aktion wird, und liefert für jede Aktion eine eindeutige Entscheidung, bevor sie läuft." },
          { t: "h", text: "Was es leistet" },
          { t: "ul", items: [
            "Bewertet jede Agentenaktion anhand der Richtlinien eines Workspace.",
            "Liefert einen von drei Zuständen: ALLOW, BLOCK oder ESCALATE.",
            "Blockiert standardmäßig, wenn keine Richtlinie zur Aktion passt.",
            "Liefert zu jeder Entscheidung einen Nachweis-Hash, damit sich die Entscheidung nachgelagert nachvollziehen lässt.",
          ] },
          { t: "h", text: "Womit es funktioniert" },
          { t: "p", text: "Die Grenze ist Framework-unabhängig. Sie sitzt unterhalb Ihres Agenten-Stacks und nicht in einem bestimmten Framework; auch die Ausführung durch Anbieter kann denselben Durchsetzungspfad nehmen." },
          { t: "warn", text: "Aegisora befindet sich im frühen Zugang und wird mit Design-Partnern validiert. Produktions-Hosting, Kunden-SSO und vollständige Audit-Prozesse sind noch nicht verifiziert. Details finden Sie in der Sammlung Piloten und Preise." },
        ],
      },
      {
        slug: "create-test-workspace",
        title: "Test-Workspace anlegen",
        summary: "Registrieren Sie sich und erhalten Sie einen Workspace, in dem Sie Ihre erste Aktion bewerten können.",
        body: [
          { t: "p", text: "Ein Test-Workspace ist der schnellste Weg, um zu sehen, wie Aegisora entscheidet. Er ist zur Evaluierung gedacht, nicht für Produktivlasten." },
          { t: "ol", items: [
            "Öffnen Sie aegisora.org und wählen Sie Aegisora testen oder gehen Sie direkt zur Registrierungsseite.",
            "Legen Sie Ihr Konto an und melden Sie sich an.",
            "Legen Sie Ihren Workspace an oder öffnen Sie ihn.",
            "Folgen Sie dem Schnellstart, um Ihre erste Aktion zu bewerten.",
          ] },
          { t: "h", text: "Was Sie beachten sollten" },
          { t: "ul", items: [
            "Für Test-Workspaces gibt es keinen kostenpflichtigen Tarif und keinen Online-Checkout.",
            "Verbinden Sie keine Produktivsysteme und keine sensiblen Kundendaten mit einem Test-Workspace.",
            "Jeder kostenpflichtige Pilot wird schriftlich abgegrenzt und vereinbart, bevor Kundendaten oder Produktivsysteme angebunden werden.",
          ] },
        ],
      },
      {
        slug: "evaluate-first-action",
        title: "Erste Aktion bewerten",
        summary: "Senden Sie eine Aktion an die Laufzeit und lesen Sie die zurückgelieferte Entscheidung.",
        body: [
          { t: "p", text: "Sobald Sie einen Test-Workspace haben, führt Sie der Schnellstart durch das Senden einer einzelnen Agentenaktion zur Bewertung an die Laufzeit." },
          { t: "ol", items: [
            "Öffnen Sie den Schnellstart im Entwicklerbereich der Hauptseite.",
            "Senden Sie mit den Zugangsdaten Ihres Workspace eine Aktion zur Bewertung.",
            "Lesen Sie die Entscheidung: ALLOW, BLOCK oder ESCALATE.",
            "Notieren Sie die Entscheidungs-ID und den Nachweis-Hash, die mit ihr zurückkommen.",
          ] },
          { t: "p", text: "Wenn Sie lieber zusehen möchten, wie die Laufzeit entscheidet, bevor Sie Code schreiben: Der Live-Laufzeitnachweis auf der Hauptseite führt eine Entscheidung für Sie aus." },
          { t: "tip", text: "Ein neuer Workspace hat noch keine Richtlinien, daher ist zu erwarten, dass Ihre erste Aktion BLOCKIERT wird. Das ist das Standardverhalten, kein Fehler." },
        ],
      },
      {
        slug: "allow-block-escalate",
        title: "ALLOW, BLOCK und ESCALATE erklärt",
        summary: "Die drei Entscheidungszustände und wann welcher geliefert wird.",
        body: [
          { t: "p", text: "Jede bewertete Aktion endet in genau einem von drei Zuständen. Die Ergebnisse sind deterministisch: Dieselbe Aktion ergibt unter denselben Richtlinien denselben Zustand." },
          { t: "h", text: "ALLOW" },
          { t: "p", text: "Eine Richtlinie erlaubt die Aktion ausdrücklich. Ihr Agent darf sie ausführen." },
          { t: "h", text: "BLOCK" },
          { t: "p", text: "Die Aktion darf nicht laufen. Das ist auch das Ergebnis, wenn keine Richtlinie passt: Aegisora blockiert standardmäßig." },
          { t: "h", text: "ESCALATE" },
          { t: "p", text: "Die Aktion braucht eine menschliche Freigabe, bevor sie laufen darf. Sie wird an der Grenze gehalten, bis eine Person sie freigibt oder ablehnt." },
        ],
      },
    ],
  },
  {
    slug: "policies-decisions",
    title: "Richtlinien und Entscheidungen",
    desc: "Wie Richtlinien, Entscheidungen, Freigaben und Nachweise an der Ausführungsgrenze zusammenwirken.",
    icon: Scale,
    articles: [
      {
        slug: "policies-overview",
        title: "So funktionieren Richtlinien",
        summary: "Ausführbare Governance-Kontrollen, die entscheiden, was jede Aktion darf.",
        body: [
          { t: "p", text: "Richtlinien sind ausführbare Governance-Kontrollen. Es sind keine Dokumente, die Menschen lesen; die Laufzeit wertet sie für jede Aktion aus." },
          { t: "ul", items: [
            "Richtlinien gehören zu einem Workspace.",
            "Eine Aktion, zu der keine Richtlinie passt, wird standardmäßig blockiert.",
            "Eine Richtlinie kann für die von ihr abgedeckten Aktionen zu ALLOW, BLOCK oder ESCALATE führen.",
          ] },
          { t: "tip", text: "Weil der Standard BLOCK ist, erlaubt ein leerer Workspace nie etwas. Fügen Sie Richtlinien gezielt hinzu und testen Sie sie mit Ihren eigenen Aktionen." },
        ],
      },
      {
        slug: "decision-inspector",
        title: "Eine Entscheidung lesen",
        summary: "Was eine Entscheidung aussagt und wie Sie ihr nachgelagert folgen.",
        body: [
          { t: "p", text: "Jede Entscheidung trägt eine Identität und einen Nachweis-Hash. Geben Sie beide nachgelagert weiter, damit sich die Aktion, die Ihr Agent ausführt, auf die Entscheidung zurückführen lässt, die sie erlaubt hat." },
          { t: "ul", items: [
            "Der Zustand: ALLOW, BLOCK oder ESCALATE.",
            "Die Entscheidungs-ID, mit der Sie die Entscheidung erneut abrufen.",
            "Der mit der Entscheidung gelieferte Nachweis-Hash.",
          ] },
          { t: "p", text: "Die Produktseiten auf der Hauptseite beschreiben den Decision Inspector ausführlicher." },
        ],
      },
      {
        slug: "approvals",
        title: "Menschliche Freigaben",
        summary: "Wie ESCALATE einen Menschen in die Entscheidung einbindet.",
        body: [
          { t: "p", text: "Wenn eine Richtlinie ESCALATE liefert, wartet die Aktion an der Grenze auf eine menschliche Freigabe. Die Freigabe wird als Teil der Entscheidungsspur protokolliert." },
          { t: "ol", items: [
            "Der Agent fordert eine Aktion an und die Laufzeit liefert ESCALATE.",
            "Eine Person mit der passenden Workspace-Rolle prüft die Anfrage.",
            "Die Person gibt sie frei oder lehnt sie ab.",
            "Das Ergebnis wird protokolliert und die Aktion läuft entweder weiter oder bleibt blockiert.",
          ] },
          { t: "note", text: "Privilegierte Aktionen können zusätzlich eine MFA-Hochstufung verlangen. Siehe Zugriff und Sicherheit." },
        ],
      },
      {
        slug: "evidence",
        title: "Nachweise und Nachweis-Hashes",
        summary: "Welche Nachweise Aegisora protokolliert und was nicht behauptet wird.",
        body: [
          { t: "p", text: "Zu jeder Entscheidung wird ein Nachweis-Hash geliefert. Nachweisdatensätze sind per Hash verkettet, sodass sich die Änderung eines früheren Datensatzes erkennen lässt." },
          { t: "h", text: "Was nicht behauptet wird" },
          { t: "p", text: "Aegisora behauptet heute kein vollständiges Audit-Hauptbuch. Nachweisdatensätze helfen, einzelne Entscheidungen nachzuvollziehen; sie ersetzen nicht Ihr eigenes Audit-Programm." },
        ],
      },
    ],
  },
  {
    slug: "access-security",
    title: "Zugriff und Sicherheit",
    desc: "Workspace-Rollen, MFA-Hochstufung, API-Schlüssel und was bereits verifiziert ist und was nicht.",
    icon: ShieldCheck,
    articles: [
      {
        slug: "workspace-roles",
        title: "Workspace-Rollen",
        summary: "OWNER, ADMIN, OPERATOR und VIEWER.",
        body: [
          { t: "p", text: "Der Zugriff innerhalb eines Workspace wird über Rollen gesteuert. Jede Anfrage wird serverseitig gegen die Rolle des Aufrufers in diesem Workspace geprüft." },
          { t: "ul", items: ["OWNER", "ADMIN", "OPERATOR", "VIEWER"] },
          { t: "p", text: "Geben Sie Personen die niedrigste Rolle, mit der sie ihre Arbeit erledigen können. Nutzen Sie VIEWER für Personen, die Entscheidungen nur lesen müssen." },
        ],
      },
      {
        slug: "mfa-step-up",
        title: "MFA-Hochstufung für privilegierte Aktionen",
        summary: "Warum manche Aktionen eine Bestätigung mit einem zweiten Faktor verlangen.",
        body: [
          { t: "p", text: "Privilegierte Aktionen können auch dann einen zweiten Faktor verlangen, wenn Sie bereits angemeldet sind. Das begrenzt, was eine gestohlene oder offen gelassene Sitzung bewirken kann." },
          { t: "p", text: "Wenn eine Aktion eine Hochstufung verlangt, schließen Sie die MFA-Abfrage ab und wiederholen Sie die Aktion." },
        ],
      },
      {
        slug: "api-keys",
        title: "API-Schlüssel und Anfrage-Authentifizierung",
        summary: "Auf Workspaces begrenzte Schlüssel und der sichere Umgang damit.",
        body: [
          { t: "p", text: "API-Schlüssel sind auf einen Workspace begrenzt. Ein Schlüssel kann nur innerhalb des Workspace handeln, für den er ausgestellt wurde." },
          { t: "h", text: "Behandeln Sie Schlüssel wie Geheimnisse" },
          { t: "ul", items: [
            "Committen Sie Schlüssel nie in ein Repository und fügen Sie sie nie in Chats oder Tickets ein.",
            "Bewahren Sie Schlüssel in Ihrem Secret-Manager oder in Umgebungsvariablen auf.",
            "Verwenden Sie für jede Umgebung einen eigenen Schlüssel.",
            "Entfernen Sie einen Schlüssel, sobald er nicht mehr gebraucht wird oder abgeflossen sein könnte.",
          ] },
          { t: "p", text: "Anfragen ohne gültige Zugangsdaten werden abgelehnt. Die API-Referenz auf der Hauptseite listet die Endpunkte und das Anfrageformat auf." },
        ],
      },
      {
        slug: "security-overview",
        title: "Sicherheits- und Vertrauensüberblick",
        summary: "Was heute geschützt ist und was noch nicht verifiziert wurde.",
        body: [
          { t: "p", text: "Aegisora ist darauf ausgelegt, die Ausführungsgrenze zu schützen: Entscheidungen fallen serverseitig, der Standard ist BLOCK, der Zugriff ist rollenbasiert und privilegierte Aktionen können eine MFA-Hochstufung verlangen." },
          { t: "h", text: "Noch nicht verifiziert" },
          { t: "ul", items: [
            "Produktions-Hosting und Service-Level.",
            "Kunden-SSO (SAML / OIDC) und automatisierte Bereitstellung.",
            "Vollständige Audit-Prozesse.",
          ] },
          { t: "p", text: "Die Sicherheitsseite und das Trust Center auf der Hauptseite beschreiben Datenschutz, Unterauftragsverarbeiter und Nutzungsbedingungen." },
        ],
      },
    ],
  },
  {
    slug: "pilots-pricing",
    title: "Piloten und Preise",
    desc: "Wie Design-Partner-Piloten abgegrenzt werden und was heute verfügbar ist und was nicht.",
    icon: Briefcase,
    articles: [
      {
        slug: "is-pricing-published",
        title: "Sind Preise veröffentlicht?",
        summary: "Nein. Piloten werden abgegrenzt und schriftlich vereinbart.",
        body: [
          { t: "p", text: "Preis, steuerliche Behandlung, Hosting, Service-Level und Produktionsverfügbarkeit sind nicht veröffentlicht und werden nicht als feststehende Angebote dargestellt." },
          { t: "ul", items: [
            "Es gibt keinen kostenpflichtigen Self-Service-Tarif.",
            "Es gibt keinen Online-Checkout.",
            "Es gibt heute keine automatisierte Abonnementabrechnung.",
          ] },
          { t: "p", text: "Sie können trotzdem kostenlos einen Test-Workspace anlegen und Aegisora evaluieren. Wenn Sie einen Pilot prüfen möchten, sprechen Sie mit dem Team." },
        ],
      },
      {
        slug: "how-a-pilot-works",
        title: "So funktioniert ein Design-Partner-Pilot",
        summary: "Was ein schriftliches Pilotangebot festlegt, bevor Daten angebunden werden.",
        body: [
          { t: "p", text: "Jeder kostenpflichtige Pilot muss schriftlich abgegrenzt und vereinbart werden, bevor Kundendaten oder Produktivsysteme angebunden werden. Das Angebot legt fest:" },
          { t: "ol", items: [
            "Workflow",
            "Umgebung",
            "Laufzeit",
            "Support-Grenzen",
            "Aufbewahrung",
            "Sicherheitsvoraussetzungen",
            "Erfolgskriterien",
            "Rückabwicklung",
          ] },
          { t: "p", text: "Nehmen Sie zunächst über die Enterprise-Seite auf der Hauptseite Kontakt mit dem Team auf." },
        ],
      },
      {
        slug: "sso-production",
        title: "SSO und Produktionsverfügbarkeit",
        summary: "Was noch nicht verfügbar ist.",
        body: [
          { t: "h", text: "Kunden-SSO" },
          { t: "p", text: "Noch nicht. Eine Anbietergrenze ist dokumentiert, aber Kunden-SAML / OIDC und automatisierte Bereitstellung sind nicht konfiguriert oder verifiziert." },
          { t: "h", text: "Produktions-Hosting" },
          { t: "p", text: "Noch nicht. Produktions-Hosting, Kunden-SSO und vollständige Audit-Prozesse sind noch nicht verifiziert." },
          { t: "note", text: "Wenn diese Punkte für Sie Voraussetzungen sind, sprechen Sie sie im Pilotgespräch an, damit sie in den Umfang aufgenommen werden können." },
        ],
      },
    ],
  },
  {
    slug: "help",
    title: "Hilfe erhalten",
    desc: "Wie Sie das Team erreichen und was Sie angeben sollten, damit wir schnell helfen können.",
    icon: LifeBuoy,
    articles: [
      {
        slug: "contact-support",
        title: "Das Aegisora-Team kontaktieren",
        summary: "Wohin Sie schreiben und was Sie angeben sollten.",
        body: [
          { t: "p", text: "Nutzen Sie die Kontaktseite auf der Hauptseite für Supportfragen, Pilotanfragen und Sicherheitsmeldungen." },
          { t: "h", text: "Geben Sie diese Angaben an" },
          { t: "ul", items: [
            "Was Sie versucht haben.",
            "Was stattdessen passiert ist, und die genaue Meldung, falls es eine gab.",
            "Den Zeitpunkt des Versuchs und die betroffene Seite oder den Endpunkt.",
            "Den Namen Ihres Workspace. Senden Sie niemals API-Schlüssel oder Passwörter.",
          ] },
        ],
      },
    ],
  },
];