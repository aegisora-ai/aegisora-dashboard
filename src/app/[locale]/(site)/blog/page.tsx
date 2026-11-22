import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { POSTS } from "@/lib/blog-posts";
import { BlogCover } from "@/components/aegx/blog-cover";
import { BlogGrid } from "@/components/aegx/blog-grid";
import { Cta, Hero, Sec } from "@/components/aegx/ui";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const de = locale === "de";
  const fmt = (iso: string) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString(de ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const [first, ...rest] = POSTS;
  const posts = rest.map((p) => ({
    slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, date: fmt(p.date), read: t("minRead", { n: p.readMinutes }),
  }));
  return (
    <>
      <Hero compact badge={t("metaTitle")} title={t("title")} intro={t("intro")} />
      {first ? (
        <Sec flush>
          <Link href={"/blog/" + first.slug} className="aegx-feature">
            <div className="aegx-feature__cover"><BlogCover seed={first.slug} label={first.category} /></div>
            <div className="aegx-feature__b">
              <span className="aegx-post__cat">{first.category}</span>
              <h2 className="aegx-h2">{first.title}</h2>
              <p className="aegx-p">{first.excerpt}</p>
              <span className="aegx-post__meta">{fmt(first.date) + " \u00b7 " + t("minRead", { n: first.readMinutes })}</span>
            </div>
          </Link>
          {posts.length > 0 ? <BlogGrid posts={posts} allLabel={de ? "Alle" : "All"} /> : null}
        </Sec>
      ) : null}
      <Cta
        title={t("ctaTitle")}
        body={t("ctaBody")}
        primary={{ label: t("test"), href: "/signup" }}
        secondary={{ label: t("quick"), href: "/docs/quickstart" }}
      />
    </>
  );
}