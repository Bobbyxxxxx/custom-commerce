"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import { ProductParams } from "@/shared.types";

interface HomeProductsParams {
  products: ProductParams[];
}

const HomeProducts = ({ products }: HomeProductsParams) => {
  return (
    <div>
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {/* Section Subhead */}
        <h2 className="text-xl font-medium text-zinc-800 mb-8">
          Popular products
        </h2>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* See More Button */}
        {/* <div className="flex justify-center mt-12">
          <Link
            href="/shop"
            className="px-6 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
          >
            See more
          </Link>
        </div> */}
      </section>
    </div>
  );
};

export default HomeProducts;
