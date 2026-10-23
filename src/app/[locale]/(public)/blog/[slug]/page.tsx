import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";
import { POSTS, formatDate } from "@/lib/blog-posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const more = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={post.category + " · " + formatDate(post.date) + " · " + post.readMinutes + " min read"}
        title={post.title}
        intro={post.excerpt}
      />
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
        {post.body.map((b, i) => {
          if (b.t === "h2") return <h2 key={i} className="mt-10 text-2xl font-medium tracking-[-0.01em] text-white">{b.text}</h2>;
          if (b.t === "p") return <p key={i} className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">{b.text}</p>;
          if (b.t === "ul")
            return (
              <ul key={i} className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-white/75 sm:text-lg marker:text-sky-300">
                {b.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            );
          return (
            <pre key={i} className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#030f3d] p-4 font-mono text-sm text-sky-100">{b.text}</pre>
          );
        })}
      </article>
      <Section title="More from the blog" tone="alt">
        <CardGrid
          cols={3}
          items={more.map((p) => ({
            n: p.category,
            title: p.title,
            body: p.excerpt,
            href: "/blog/" + p.slug,
          }))}
        />
      </Section>
      <CtaBand
        title="Put a decision point in front of your agents."
        body="Create a test workspace, send one request and read the decision."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Talk to Enterprise", href: "/enterprise" }}
      />
    </>
  );
}