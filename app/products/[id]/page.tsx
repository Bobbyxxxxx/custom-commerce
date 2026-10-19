import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Navbar from "@/components/Navbar";
import ProductDetails from "@/components/ProductDetails";
import { fetchProductById } from "@/utils/actions/product.action";

// Shared between generateMetadata and the page so the product is fetched once per request
const getProduct = cache(fetchProductById);

export async function generateMetadata({
  params,
}: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  // console.log(product);
  if (!product) return { title: "Product not found" };

  return { title: product.name, description: product.description };
}

export default async function page({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();
  // console.log("productData:", product);
  return (
    <div>
      <Navbar />
      <ProductDetails product={product} />
    </div>
  );
}
