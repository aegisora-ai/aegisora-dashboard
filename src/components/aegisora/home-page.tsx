import { useTranslations } from "next-intl";
import { Activity, ArrowRight, FileCheck, KeyRound, ShieldCheck, UserCheck, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HeroDemo } from "./calm/hero-demo";
import { DecisionFeed } from "./calm/decision-feed";

const FEATURES = [
  { k: "f1", Icon: ShieldCheck },
  { k: "f2", Icon: UserCheck },
  { k: "f3", Icon: FileCheck },
  { k: "f4", Icon: Activity },
  { k: "f5", Icon: KeyRound },
  { k: "f6", Icon: Users },
];
const STEPS = ["s1", "s2", "s3"];
const CODE = [
  "// ask first, then act",
  "const decision = await checkAction({ action, agent });",
  "",
  'if (decision === "ALLOW") await run(action);',
  'if (decision === "ESCALATE") await waitForApproval();',
  "// BLOCK or unknown: fail closed",
];

export default function HomePage() {
  const t = useTranslations("HomeCalm");
  return (
    <div className="vc">
      <section className="vc-hero" aria-labelledby="vc-title">
        <div aria-hidden="true" className="vc-grid" />
        <div aria-hidden="true" className="vc-orb vc-orb--a" />
        <div aria-hidden="true" className="vc-orb vc-orb--b" />
        <div aria-hidden="true" className="vc-orb vc-orb--c" />
        <div className="vc-wrap vc-hero__inner">
          <p className="vc-badge"><span>{t("hero.badge")}</span><b>{t("hero.early")}</b></p>
          <h1 id="vc-title" className="vc-h1">
            <span>{t("hero.title1")}</span>
            <span className="vc-accent">{t("hero.title2")}</span>
          </h1>
          <p className="vc-lead">{t("hero.lead")}</p>
          <div className="vc-cta">
            <Link href="/signup" className="vc-btn vc-btn--primary">{t("hero.cta1")} <ArrowRight aria-hidden="true" size={16} /></Link>
            <Link href="/enterprise" className="vc-btn vc-btn--ghost">{t("hero.cta2")}</Link>
          </div>
          <p className="vc-note">{t("hero.note")}</p>
          <HeroDemo />
        </div>
      </section>

      <section className="vc-section" aria-labelledby="vc-how">
        <div className="vc-wrap">
          <div className="vc-center vc-rv">
            <p className="vc-eyebrow">{t("how.eyebrow")}</p>
            <h2 id="vc-how" className="vc-sec-h">{t("how.title")}</h2>
          </div>
          <ol className="vc-steps">
            {STEPS.map((s, i) => (
              <li key={s} className="vc-card vc-rv">
                <span className="vc-step__n">{"0" + (i + 1)}</span>
                <h3 className="vc-card__h">{t("how." + s + "t")}</h3>
                <p className="vc-card__p">{t("how." + s + "d")}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="vc-section" aria-labelledby="vc-feat">
        <div className="vc-wrap">
          <div className="vc-center vc-rv">
            <p className="vc-eyebrow">{t("feat.eyebrow")}</p>
            <h2 id="vc-feat" className="vc-sec-h">{t("feat.title")}</h2>
          </div>
          <ul className="vc-feats">
            {FEATURES.map(({ k, Icon }) => (
              <li key={k} className="vc-card vc-rv">
                <span className="vc-ico"><Icon size={20} aria-hidden="true" /></span>
                <h3 className="vc-card__h">{t("feat." + k + "t")}</h3>
                <p className="vc-card__p">{t("feat." + k + "d")}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="vc-section" aria-labelledby="vc-live">
        <div className="vc-wrap vc-split">
          <div className="vc-rv">
            <p className="vc-eyebrow">{t("live.eyebrow")}</p>
            <h2 id="vc-live" className="vc-sec-h">{t("live.title")}</h2>
            <p className="vc-sec-p">{t("live.copy")}</p>
          </div>
          <div className="vc-rv"><DecisionFeed /></div>
        </div>
      </section>

      <section className="vc-section" aria-labelledby="vc-code">
        <div className="vc-wrap vc-split">
          <div className="vc-rv">
            <h2 id="vc-code" className="vc-sec-h">{t("code.title")}</h2>
            <p className="vc-sec-p">{t("code.copy")}</p>
          </div>
          <div className="vc-codewrap vc-rv">
            <div className="vc-code__bar">{t("code.label")}</div>
            <pre className="vc-code"><code>{CODE.map((line, i) => (
              <span key={i} className={line.startsWith("//") ? "vc-c" : undefined}>{line + "\n"}</span>
            ))}</code></pre>
          </div>
        </div>
      </section>

      <section className="vc-section" aria-labelledby="vc-final">
        <div className="vc-wrap">
          <div className="vc-final vc-rv">
            <div aria-hidden="true" className="vc-orb vc-orb--a" />
            <h2 id="vc-final" className="vc-sec-h" style={{ marginLeft: "auto", marginRight: "auto" }}>{t("cta.title")}</h2>
            <p className="vc-sec-p" style={{ marginLeft: "auto", marginRight: "auto" }}>{t("cta.copy")}</p>
            <div className="vc-cta">
              <Link href="/signup" className="vc-btn vc-btn--primary">{t("cta.cta1")} <ArrowRight aria-hidden="true" size={16} /></Link>
              <Link href="/pilot" className="vc-btn vc-btn--ghost">{t("cta.cta2")}</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}