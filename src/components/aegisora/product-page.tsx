import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";
import type { ProductData } from "@/lib/product-content";

export function ProductPage({ data }: { data: ProductData }) {
  return (
    <>
      <PageHero
        eyebrow={data.eyebrow}
        title={data.title}
        intro={data.intro}
        primary={data.primary}
        secondary={data.secondary}
        rows={data.rows}
      />
      <Section eyebrow={data.stepsEyebrow} title={data.stepsTitle} intro={data.stepsIntro} tone="alt">
        <CardGrid items={data.steps} cols={data.stepCols} />
      </Section>
      <Section eyebrow="Capabilities" title={data.featuresTitle}>
        <CardGrid items={data.features} cols={3} />
      </Section>
      <CtaBand
        title={data.ctaTitle}
        body={data.ctaBody}
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Talk to Enterprise", href: "/enterprise" }}
      />
    </>
  );
}