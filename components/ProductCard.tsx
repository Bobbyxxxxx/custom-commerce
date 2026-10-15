"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, getUnitPrice } from "@/utils/pricing";
import { Star } from "lucide-react";
import { ProductParams } from "@/shared.types"; // Adjust path to where your ProductParams interface is saved

interface ProductCardProps {
  product: ProductParams;
}

const ProductCard = ({ product }: { product: ProductParams }) => {
  const imageUrl =
    product.image_url_array && product.image_url_array.length > 0
      ? product.image_url_array[0]
      : "/placeholder.png";

  return (
    <div className="flex flex-col justify-between h-full bg-white rounded-md overflow-hidden">
      <Link href={`/products/${product.id}`} className="block">
        {/* Product Image Container */}
        <div className="relative w-full h-48 sm:h-52 bg-zinc-100 flex items-center justify-center p-4">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Product Information */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-zinc-900 line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 py-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">4.5</span>
          </div>
        </div>
      </Link>

      {/* Price & Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 mt-2">
        <p className="text-sm font-semibold text-zinc-900">
          {formatPrice(getUnitPrice(product))}
        </p>

        <button className="text-xs text-zinc-600 hover:text-black px-3 py-1 border border-zinc-200 rounded hover:border-zinc-400 transition-colors">
          Buy now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
