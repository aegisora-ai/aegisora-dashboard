import { BlogCover } from "@/components/aegx/blog-cover";
import { POSTS } from "@/lib/blog-posts";

export default async function PostLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  return (
    <>
      {post ? (
        <section className="aegx-sec">
          <div className="aegx-col">
            <div className="aegx-banner"><BlogCover seed={post.slug} label={post.category} /></div>
          </div>
        </section>
      ) : null}
      {children}
    </>
  );
}