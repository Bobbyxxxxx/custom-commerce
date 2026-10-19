"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { AddressParams, ProductParams } from "@/shared.types";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { formatPrice, getUnitPrice, SHIPPING_FEE } from "@/utils/pricing";
import {
  initializePayment,
  verifyPayment,
} from "@/utils/actions/payment.action";
import AddressModal, { formatAddress } from "./AddressModal";

interface BuyNowPageProps {
  product: ProductParams;
  initialQuantity: number;
  selectedOptions: {
    key: "size" | "color" | "style";
    label: string;
    value: string;
  }[];
}

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
  const router = useRouter();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
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
  const isAddressSelected = Boolean(selectedAddress);

  const unitPrice = getUnitPrice(product);
  const subtotal = unitPrice * quantity;
  const total = subtotal + SHIPPING_FEE;
  const canPay = inStock && isAddressSelected && !isPaying;

  const imageUrl =
    product.image_url_array && product.image_url_array.length > 0
      ? product.image_url_array[0]
      : "/placeholder.png";

  const decreaseQuantity = () => {
    if (quantity <= 1) {
      toast.error("Quantity cannot be less than 1", { id: "quantity-min" });
      return;
    }
    setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity >= product.quantity) {
      toast.error(`Only ${product.quantity} in stock`, { id: "quantity-max" });
      return;
    }
    setQuantity(quantity + 1);
  };

  const handleSelectAddress = (address: AddressParams) => {
    setSelectedAddressId(address.id);
    setIsAddressModalOpen(false);
  };

  const handleAddressSaved = (address: AddressParams) => {
    if (userId) {
      setLoadedAddresses((current) => ({
        userId,
        data: [address, ...(current?.data ?? [])],
        error: false,
      }));
    }
    handleSelectAddress(address);
  };

  const optionValue = (key: "size" | "color") =>
    selectedOptions.find((option) => option.key === key)?.value ?? null;

  const handlePaymentSuccess = async (reference: string) => {
    const toastId = toast.loading("Confirming your payment...");
    try {
      const result = await verifyPayment(reference);
      if (result.error) {
        toast.error(result.error, { id: toastId, duration: 8000 });
        setIsPaying(false);
        return;
      }
      toast.success("Payment successful!", { id: toastId });
      router.push(`/orders/success?reference=${encodeURIComponent(reference)}`);
    } catch {
      toast.error(
        `We couldn't confirm your payment. If you were charged, contact support with reference ${reference}.`,
        { id: toastId, duration: 8000 },
      );
      setIsPaying(false);
    }
  };

  const handlePayNow = async () => {
    if (!canPay || !selectedAddress) return;
    setIsPaying(true);

    try {
      const payment = await initializePayment({
        productId: product.id,
        quantity,
        addressId: selectedAddress.id,
        size: optionValue("size"),
        color: optionValue("color"),
      });
      if (payment.error || !payment.accessCode) {
        toast.error(payment.error ?? "We couldn't start the payment.");
        setIsPaying(false);
        return;
      }

      // Loaded on demand because the SDK touches window as soon as it's imported
      const { default: PaystackPop } = await import("@paystack/inline-js");
      new PaystackPop().resumeTransaction(payment.accessCode, {
        onSuccess: ({ reference }) => handlePaymentSuccess(reference),
        onCancel: () => {
          toast.error("Payment cancelled.");
          setIsPaying(false);
        },
        onError: ({ message }) => {
          toast.error(message || "Paystack couldn't load. Please try again.");
          setIsPaying(false);
        },
      });
    } catch (error) {
      console.error("Error starting payment:", error);
      toast.error("We couldn't start the payment. Please try again.");
      setIsPaying(false);
    }
  };

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
                  onClick={decreaseQuantity}
                  disabled={!inStock || isPaying}
                  aria-label="Decrease quantity"
                  className="p-2 text-zinc-600 hover:text-black disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span
                  aria-live="polite"
                  className="w-10 text-center text-sm font-medium text-zinc-900"
                >
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={!inStock || isPaying}
                  aria-label="Increase quantity"
                  className="p-2 text-zinc-600 hover:text-black disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
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

          {/* Select Address Bar */}
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-2">
              Delivery address
            </p>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              disabled={isAuthLoading || isPaying}
              className={`w-full flex items-start gap-3 text-left p-3 border rounded-md transition-colors disabled:opacity-50 ${
                selectedAddress
                  ? "border-zinc-900"
                  : "border-zinc-200 hover:border-zinc-400"
              }`}
            >
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-zinc-500" />
              <span className="flex-1 min-w-0 text-sm">
                {selectedAddress ? (
                  <>
                    <span className="block text-zinc-900 line-clamp-2">
                      {formatAddress(selectedAddress)}
                    </span>
                    {selectedAddress.additional_info && (
                      <span className="block text-xs text-zinc-500 line-clamp-1">
                        {selectedAddress.additional_info}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-zinc-500">Select Address</span>
                )}
              </span>
              <span className="text-xs font-medium text-zinc-700 shrink-0">
                {selectedAddress ? "Change" : "Select"}
              </span>
            </button>
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

          <div className="space-y-2">
            <button
              onClick={handlePayNow}
              disabled={!canPay}
              className="w-full px-6 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-black rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-zinc-900 disabled:cursor-not-allowed"
            >
              {!inStock
                ? "Out of stock"
                : isPaying
                  ? "Processing payment..."
                  : `Pay Now · ${formatPrice(total)}`}
            </button>
            {inStock && !isAddressSelected && (
              <p className="text-xs text-center text-red-600">
                **Please Select An Address To Continue
              </p>
            )}
          </div>
        </aside>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        isLoading={isAddressLoading}
        hasError={Boolean(addressState?.error)}
        selectedAddressId={selectedAddressId}
        onSelect={handleSelectAddress}
        onAddressSaved={handleAddressSaved}
      />
    </section>
  );
};

export default BuyNowPage;
