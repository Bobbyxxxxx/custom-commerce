"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { ProductParams } from "@/shared.types";
import { formatPrice, getUnitPrice, SHIPPING_FEE } from "@/utils/pricing";

interface ProductDetailsProps {
  product: ProductParams;
}

interface OptionGroupProps {
  label: string;
  options: string[];
  selected: string | undefined;
  onSelect: (option: string) => void;
}

const OptionGroup = ({
  label,
  options,
  selected,
  onSelect,
}: OptionGroupProps) => {
  if (options.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 mb-2">
        {label}
        {selected && <span className="text-zinc-900">: {selected}</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            aria-pressed={selected === option}
            className={`text-xs px-3 py-1.5 border rounded transition-colors ${
              selected === option
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-black"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const images =
    product.image_url_array && product.image_url_array.length > 0
      ? product.image_url_array
      : ["/placeholder.png"];
  const sizes = product.sizes ?? [];
  const colors = product.colors ?? [];
  const styles = product.styles ?? [];

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    sizes[0],
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    colors[0],
  );
  const [selectedStyle, setSelectedStyle] = useState<string | undefined>(
    styles[0],
  );
  const [quantity, setQuantity] = useState(1);

  const inStock = product.quantity > 0;
  const currentPrice = getUnitPrice(product);
  const hasOffer = currentPrice < product.price;

  // Carry the shopper's choices over to checkout
  const buyNowParams = new URLSearchParams({ quantity: String(quantity) });
  if (selectedSize) buyNowParams.set("size", selectedSize);
  if (selectedColor) buyNowParams.set("color", selectedColor);
  if (selectedStyle) buyNowParams.set("style", selectedStyle);
  const buyNowHref = `/buy-now/${product.id}?${buyNowParams.toString()}`;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black transition-colors">
          Shop
        </Link>
        <span>/</span>
        <span className="text-zinc-900 line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="relative w-full aspect-square bg-zinc-100 rounded-md overflow-hidden">
            <Image
              src={images[activeImage]}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain p-6"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3 mt-3">
              {images.map((image, i) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`relative aspect-square bg-zinc-100 rounded-md overflow-hidden border transition-colors ${
                    activeImage === i
                      ? "border-zinc-900"
                      : "border-transparent hover:border-zinc-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.brand && (
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {product.brand}
              </p>
            )}
            <h1 className="text-2xl font-medium text-zinc-900">
              {product.name}
            </h1>
            {product.category?.name && (
              <p className="text-xs text-zinc-500">{product.category.name}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <p className="text-2xl font-semibold text-zinc-900">
              {formatPrice(currentPrice)}
            </p>
            {hasOffer && (
              <p className="text-sm text-zinc-400 line-through">
                {formatPrice(product.price)}
              </p>
            )}
            {hasOffer && product.discount > 0 && (
              <span className="text-xs font-medium text-white bg-zinc-900 px-2 py-0.5 rounded">
                -{product.discount}%
              </span>
            )}
          </div>

          <p className="text-sm text-zinc-600 leading-relaxed">
            {product.description}
          </p>

          <OptionGroup
            label="Size"
            options={sizes}
            selected={selectedSize}
            onSelect={setSelectedSize}
          />
          <OptionGroup
            label="Color"
            options={colors}
            selected={selectedColor}
            onSelect={setSelectedColor}
          />
          <OptionGroup
            label="Style"
            options={styles}
            selected={selectedStyle}
            onSelect={setSelectedStyle}
          />

          {/* Quantity & Stock */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-zinc-200 rounded">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!inStock || quantity <= 1}
                aria-label="Decrease quantity"
                className="p-2 text-zinc-600 hover:text-black disabled:opacity-40 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium text-zinc-900">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.quantity, q + 1))
                }
                disabled={!inStock || quantity >= product.quantity}
                aria-label="Increase quantity"
                className="p-2 text-zinc-600 hover:text-black disabled:opacity-40 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p
              className={`text-xs font-medium ${
                inStock ? "text-zinc-500" : "text-red-600"
              }`}
            >
              {inStock ? `${product.quantity} in stock` : "Out of stock"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              disabled={!inStock}
              className="flex-1 px-6 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-zinc-100"
            >
              Add to cart
            </button>
            {inStock ? (
              <Link
                href={buyNowHref}
                className="flex-1 px-6 py-2.5 text-center text-sm font-medium text-white bg-zinc-900 hover:bg-black rounded-md transition-colors"
              >
                Buy now
              </Link>
            ) : (
              <button
                disabled
                className="flex-1 px-6 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-md opacity-50"
              >
                Buy now
              </button>
            )}
          </div>

          {/* Shipping Details */}
          <dl className="grid grid-cols-2 gap-y-2 pt-6 border-t border-zinc-100 text-xs">
            <dt className="text-zinc-500">Shipping fee</dt>
            <dd className="text-zinc-900 text-right">
              {formatPrice(SHIPPING_FEE)}
            </dd>
            {product.location && (
              <>
                <dt className="text-zinc-500">Ships from</dt>
                <dd className="text-zinc-900 text-right">{product.location}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
