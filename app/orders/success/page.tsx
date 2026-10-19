import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import { OrderParams } from "@/shared.types";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/utils/pricing";

export const metadata: Metadata = {
  title: "Order confirmed",
};

export default async function OrderSuccess({
  searchParams,
}: PageProps<"/orders/success">) {
  const { reference } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } =
    typeof reference === "string"
      ? await supabase
          .from("orders")
          .select("*")
          .eq("paystack_reference", reference)
          .eq("user_id", user.id)
          .maybeSingle()
      : { data: null };
  const order = data as OrderParams | null;

  return (
    <div>
      <Navbar />
      <section className="w-full max-w-lg mx-auto px-4 py-16">
        {order ? (
          <>
            <div className="flex flex-col items-center text-center mb-8">
              <CircleCheck className="w-12 h-12 text-green-600 mb-4" />
              <h1 className="text-xl font-medium text-zinc-900">
                Thank you for your order!
              </h1>
              <p className="text-sm text-zinc-500 mt-2">
                Your payment was received and your order is confirmed.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-y-3 border border-zinc-200 rounded-md p-5 text-sm">
              <dt className="text-zinc-500">Product</dt>
              <dd className="text-zinc-900 text-right">
                {order.product_name ?? "—"}
              </dd>
              <dt className="text-zinc-500">Quantity</dt>
              <dd className="text-zinc-900 text-right">{order.quantity}</dd>
              {(order.size || order.color) && (
                <>
                  <dt className="text-zinc-500">Options</dt>
                  <dd className="text-zinc-900 text-right">
                    {[order.size, order.color].filter(Boolean).join(" · ")}
                  </dd>
                </>
              )}
              <dt className="text-zinc-500">Delivery to</dt>
              <dd className="text-zinc-900 text-right">
                {[order.address, order.city, order.state]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </dd>
              <dt className="text-zinc-500">Reference</dt>
              <dd className="text-zinc-900 text-right text-xs break-all">
                {order.paystack_reference}
              </dd>
              <dt className="font-medium text-zinc-900 pt-3 border-t border-zinc-100">
                Total paid
              </dt>
              <dd className="font-semibold text-zinc-900 text-right pt-3 border-t border-zinc-100">
                {formatPrice(order.total_price)}
              </dd>
            </dl>
          </>
        ) : (
          <div className="text-center">
            <h1 className="text-xl font-medium text-zinc-900">
              We couldn&apos;t find this order
            </h1>
            <p className="text-sm text-zinc-500 mt-2">
              If you were charged, contact support
              {typeof reference === "string" && (
                <>
                  {" "}
                  with reference{" "}
                  <span className="text-zinc-900 break-all">{reference}</span>
                </>
              )}
              .
            </p>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <Link
            href="/"
            className="px-6 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
