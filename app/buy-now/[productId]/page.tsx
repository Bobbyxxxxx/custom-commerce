import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import BuyNowPage from "@/components/BuyNowPage";
import { fetchProductById } from "@/utils/actions/product.action";

export const metadata: Metadata = {
  title: "Checkout",
};

const OPTION_LABELS = { size: "Size", color: "Color", style: "Style" } as const;

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function BuyNow({
  params,
  searchParams,
}: PageProps<"/buy-now/[productId]">) {
  const { productId } = await params;
  const query = await searchParams;

  const product = await fetchProductById(productId);
  if (!product) notFound();

  const initialQuantity = Number.parseInt(firstValue(query.quantity) ?? "", 10);

  // Only keep choices the product actually offers
  const productOptions = {
    size: product.sizes ?? [],
    color: product.colors ?? [],
    style: product.styles ?? [],
  };
  const selectedOptions = (
    Object.keys(OPTION_LABELS) as (keyof typeof OPTION_LABELS)[]
  ).flatMap((key) => {
    const value = firstValue(query[key]);
    return value && productOptions[key].includes(value)
      ? [{ key, label: OPTION_LABELS[key], value }]
      : [];
  });

  return (
    <div>
      <Navbar />
      <BuyNowPage
        product={product}
        initialQuantity={Number.isNaN(initialQuantity) ? 1 : initialQuantity}
        selectedOptions={selectedOptions}
      />
    </div>
  );
}
