"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { AddressParams, ProductParams } from "@/shared.types";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { formatPrice, getUnitPrice, SHIPPING_FEE } from "@/utils/pricing";

interface BuyNowPageProps {
  product: ProductParams;
  initialQuantity: number;
  selectedOptions: { label: string; value: string }[];
}

const formatAddress = (address: AddressParams) =>
  [address.street_address, address.city, address.state]
    .filter(Boolean)
    .join(", ");

const BuyNowPage = ({
  product,
  initialQuantity,
  selectedOptions,
}: BuyNowPageProps) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [supabase] = useState(() => createClient());

  const inStock = product.quantity > 0;
  const [quantity, setQuantity] = useState(() =>
    Math.min(Math.max(1, initialQuantity), Math.max(1, product.quantity)),
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  // Kept with the id it belongs to, so another user's addresses are never shown
  const [loadedAddresses, setLoadedAddresses] = useState<{
    userId: string;
    data: AddressParams[];
    error: boolean;
  } | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let ignore = false;

    supabase
      .from("address")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) console.error("Error fetching addresses:", error);
        setLoadedAddresses({
          userId,
          data: (data as AddressParams[]) ?? [],
          error: Boolean(error),
        });
      });

    return () => {
      ignore = true;
    };
  }, [supabase, userId]);

  const addressState =
    loadedAddresses && loadedAddresses.userId === userId
      ? loadedAddresses
      : null;
  const addresses = addressState?.data ?? [];
  const isAddressLoading = isAuthLoading || (Boolean(userId) && !addressState);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const imageUrl =
    product.image_url_array && product.image_url_array.length > 0
      ? product.image_url_array[0]
      : "/placeholder.png";
  const unitPrice = getUnitPrice(product);
  const subtotal = unitPrice * quantity;
  const total = subtotal + SHIPPING_FEE;
  const canCheckout = inStock && Boolean(selectedAddress);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12">
      <h1 className="text-xl font-medium text-zinc-800 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Item Row */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center border border-zinc-200 rounded-md p-4">
            <Link
              href={`/products/${product.id}`}
              className="relative w-full sm:w-28 aspect-square shrink-0 bg-zinc-100 rounded-md overflow-hidden"
            >
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 112px, 100vw"
                className="object-contain p-2"
              />
            </Link>

            <div className="flex-1 min-w-0 space-y-1">
              <Link
                href={`/products/${product.id}`}
                className="text-sm font-medium text-zinc-900 hover:underline line-clamp-2"
              >
                {product.name}
              </Link>
              {selectedOptions.length > 0 && (
                <p className="text-xs text-zinc-500">
                  {selectedOptions
                    .map((option) => `${option.label}: ${option.value}`)
                    .join(" · ")}
                </p>
              )}
              <p className="text-sm text-zinc-900">{formatPrice(unitPrice)}</p>
              {!inStock && (
                <p className="text-xs font-medium text-red-600">Out of stock</p>
              )}
            </div>

            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
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
              <p className="text-sm font-semibold text-zinc-900">
                {formatPrice(subtotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <aside className="border border-zinc-200 rounded-md p-5 h-fit space-y-6">
          <h2 className="text-base font-medium text-zinc-900">Order Summary</h2>

          {/* Address Picker */}
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-3">
              Delivery address
            </p>

            {isAddressLoading ? (
              <p className="text-xs text-zinc-400">Loading addresses...</p>
            ) : addressState?.error ? (
              <p className="text-xs text-red-600">
                We couldn&apos;t load your addresses. Please refresh the page.
              </p>
            ) : addresses.length === 0 ? (
              <p className="text-xs text-zinc-500">
                You don&apos;t have any saved addresses yet.
              </p>
            ) : (
              <div className="space-y-2" role="radiogroup">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? "border-zinc-900"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-0.5 accent-zinc-900"
                    />
                    <span className="text-xs leading-relaxed">
                      {address.full_name && (
                        <span className="block font-medium text-zinc-900">
                          {address.full_name}
                        </span>
                      )}
                      <span className="block text-zinc-600">
                        {formatAddress(address)}
                      </span>
                      {address.phone_number && (
                        <span className="block text-zinc-500">
                          {address.phone_number}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <dl className="grid grid-cols-2 gap-y-2 pt-4 border-t border-zinc-100 text-sm">
            <dt className="text-zinc-500">
              Subtotal ({quantity} {quantity === 1 ? "item" : "items"})
            </dt>
            <dd className="text-zinc-900 text-right">{formatPrice(subtotal)}</dd>
            <dt className="text-zinc-500">Shipping fee</dt>
            <dd className="text-zinc-900 text-right">
              {formatPrice(SHIPPING_FEE)}
            </dd>
            <dt className="font-medium text-zinc-900 pt-2 border-t border-zinc-100">
              Total
            </dt>
            <dd className="font-semibold text-zinc-900 text-right pt-2 border-t border-zinc-100">
              {formatPrice(total)}
            </dd>
          </dl>

          <button
            disabled={!canCheckout}
            className="w-full px-6 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-black rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-zinc-900 disabled:cursor-not-allowed"
          >
            {!inStock
              ? "Out of stock"
              : selectedAddress
                ? `Checkout · ${formatPrice(total)}`
                : "Please Select An Address To Continue"}
          </button>
        </aside>
      </div>
    </section>
  );
};

export default BuyNowPage;
