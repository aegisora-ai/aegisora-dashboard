import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { POSTS } from "@/lib/blog-posts";
import { BlogCover } from "@/components/aegx/blog-cover";
import { Cta, Hero, Sec } from "@/components/aegx/ui";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function BlogPost({ params }: Props) {
  const { locale, slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  const t = await getTranslations({ locale, namespace: "Blog" });
  const de = locale === "de";
  const fmt = (iso: string) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString(de ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const more = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <Hero
        compact
        badge={post.category + " \u00b7 " + fmt(post.date) + " \u00b7 " + t("minRead", { n: post.readMinutes })}
        title={post.title}
        intro={post.excerpt}
      />
      <Sec flush>
        <article className="aegx-art">
          {locale !== "en" ? <p className="aegx-art__note">{t("enOnly")}</p> : null}
          {post.body.map((b, i) => {
            if (b.t === "h2") return <h2 key={i} className="aegx-art__h2">{b.text}</h2>;
            if (b.t === "p") return <p key={i} className="aegx-art__p">{b.text}</p>;
            if (b.t === "ul")
              return (
                <ul key={i} className="aegx-art__ul">
                  {b.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              );
            return <pre key={i} className="aegx-art__code">{b.text}</pre>;
          })}
        </article>
      </Sec>
      {more.length > 0 ? (
        <Sec flush>
          <div className="aegx-tabs"><span style={{ fontSize: 13, color: "#a3a3a3" }}>{t("more")}</span></div>
          <div className="aegx-cells aegx-cells--3">
            {more.map((p) => (
              <Link key={p.slug} href={"/blog/" + p.slug} className="aegx-cell aegx-post">
                <div className="aegx-post__cover"><BlogCover seed={p.slug} label={p.category} /></div>
                <div className="aegx-post__b">
                  <span className="aegx-post__cat">{p.category}</span>
                  <h3 className="aegx-h3">{p.title}</h3>
                  <span className="aegx-post__meta">{fmt(p.date) + " \u00b7 " + t("minRead", { n: p.readMinutes })}</span>
                </div>
              </Link>
            ))}
          </div>
        </Sec>
      ) : null}
      <Cta
        title={t("postCtaTitle")}
        body={t("postCtaBody")}
        primary={{ label: t("test"), href: "/signup" }}
        secondary={{ label: t("enterprise"), href: "/enterprise" }}
      />
    </>
  );
}