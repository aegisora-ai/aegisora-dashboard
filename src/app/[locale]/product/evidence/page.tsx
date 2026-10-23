import type { Metadata } from "next";
import { ProductPage } from "@/components/aegisora/product-page";
import { PRODUCTS } from "@/lib/product-content";

const data = PRODUCTS.evidence;

export const metadata: Metadata = { title: data.eyebrow.replace("Product / ", ""), description: data.intro };

export default function Page() {
  return <ProductPage data={data} />;
}