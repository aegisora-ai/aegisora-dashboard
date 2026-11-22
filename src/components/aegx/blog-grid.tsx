"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { BlogCover } from "./blog-cover";

type P = { slug: string; title: string; excerpt: string; category: string; date: string; read: string };

export function BlogGrid({ posts, allLabel }: { posts: P[]; allLabel: string }) {
  const cats = Array.from(new Set(posts.map((p) => p.category)));
  const [cat, setCat] = useState("");
  const list = cat ? posts.filter((p) => p.category === cat) : posts;
  const missing = list.length % 3 === 0 ? 0 : 3 - (list.length % 3);
  return (
    <>
      <div className="aegx-tabs">
        <button type="button" aria-pressed={cat === ""} onClick={() => setCat("")}>{allLabel}</button>
        {cats.map((c) => (<button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>))}
      </div>
      <div className="aegx-cells aegx-cells--3">
        {list.map((p) => (
          <Link key={p.slug} href={"/blog/" + p.slug} className="aegx-cell aegx-post">
            <div className="aegx-post__cover"><BlogCover seed={p.slug} label={p.category} /></div>
            <div className="aegx-post__b">
              <span className="aegx-post__cat">{p.category}</span>
              <h3 className="aegx-h3">{p.title}</h3>
              <p className="aegx-p">{p.excerpt}</p>
              <span className="aegx-post__meta">{p.date + " \u00b7 " + p.read}</span>
            </div>
          </Link>
        ))}
        {Array.from({ length: missing }).map((_, i) => (<div key={"f" + i} className="aegx-cell aegx-cell--fill" aria-hidden="true" />))}
      </div>
    </>
  );
}