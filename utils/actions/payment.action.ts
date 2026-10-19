"use server";

import { randomUUID } from "node:crypto";
import { AddressParams } from "@/shared.types";
import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";
import { fetchProductById } from "./product.action";
import { getUnitPrice, SHIPPING_FEE } from "../pricing";
import {
  initializeTransaction,
  parseMetadata,
  toKobo,
  verifyTransaction,
  type PaymentMetadata,
  type PaystackVerifyData,
} from "../paystack";
import {
  checkoutValidationSchema,
  paymentReferenceSchema,
  type CheckoutInput,
} from "../zodvalidations/form-validations";

export interface InitializePaymentResult {
  accessCode?: string;
  reference?: string;
  error?: string;
}

export interface VerifyPaymentResult {
  reference?: string;
  error?: string;
}

// Step 1: price the order on the server and open a Paystack transaction for it
export async function initializePayment(
  input: CheckoutInput,
): Promise<InitializePaymentResult> {
  const parsed = checkoutValidationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { productId, quantity, addressId, size, color } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: "Please sign in to continue." };
  }

  const product = await fetchProductById(productId);
  if (!product) {
    return { error: "This product is no longer available." };
  }
  if (quantity > product.quantity) {
    return {
      error:
        product.quantity > 0
          ? `Only ${product.quantity} left in stock.`
          : "This product is out of stock.",
    };
  }
  if (
    (size && !(product.sizes ?? []).includes(size)) ||
    (color && !(product.colors ?? []).includes(color))
  ) {
    return { error: "Please reselect your options for this product." };
  }

  // Make sure the address belongs to the person paying
  const { data: address } = await supabase
    .from("address")
    .select("id")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!address) {
    return { error: "Please select a delivery address." };
  }

  const amountKobo = toKobo(getUnitPrice(product) * quantity + SHIPPING_FEE);
  const reference = `trx_${randomUUID().replace(/-/g, "")}`;

  try {
    const transaction = await initializeTransaction({
      email: user.email,
      amountKobo,
      reference,
      metadata: {
        user_id: user.id,
        product_id: product.id,
        quantity,
        address_id: addressId,
        size,
        color,
        expected_amount_kobo: amountKobo,
      },
    });
    return { accessCode: transaction.access_code, reference };
  } catch (error) {
    console.error("Error initializing Paystack transaction:", error);
    return { error: "We couldn't start the payment. Please try again." };
  }
}

// Step 3: confirm with Paystack that the money arrived, then record the order
export async function verifyPayment(
  reference: string,
): Promise<VerifyPaymentResult> {
  const parsedReference = paymentReferenceSchema.safeParse(reference);
  if (!parsedReference.success) {
    return { error: "Invalid payment reference." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Please sign in to continue." };
  }

  let transaction: PaystackVerifyData;
  try {
    transaction = await verifyTransaction(parsedReference.data);
  } catch (error) {
    console.error("Error verifying Paystack transaction:", error);
    return {
      error: `We couldn't confirm your payment yet. If you were charged, contact support with reference ${reference}.`,
    };
  }

  if (transaction.status !== "success") {
    return { error: "Your payment was not successful." };
  }

  const metadata = parseMetadata(transaction.metadata);
  if (
    !metadata ||
    metadata.user_id !== user.id ||
    transaction.currency !== "NGN" ||
    transaction.amount !== metadata.expected_amount_kobo
  ) {
    console.error("Paystack transaction failed checks:", {
      reference,
      userId: user.id,
      metadata,
      amount: transaction.amount,
      currency: transaction.currency,
    });
    return {
      error: `We couldn't match this payment to your order. Contact support with reference ${reference}.`,
    };
  }

  return recordPaidOrder(transaction, metadata);
}

async function recordPaidOrder(
  transaction: PaystackVerifyData,
  metadata: PaymentMetadata,
): Promise<VerifyPaymentResult> {
  const admin = createAdminClient();
  const { reference } = transaction;

  // Verifying twice (a retry, a double click) must not create two orders
  const { data: existingOrder } = await admin
    .from("orders")
    .select("id")
    .eq("paystack_reference", reference)
    .maybeSingle();
  if (existingOrder) return { reference };

  const [{ data: product }, { data: address }] = await Promise.all([
    admin
      .from("products")
      .select("name")
      .eq("id", metadata.product_id)
      .maybeSingle(),
    admin
      .from("address")
      .select("*")
      .eq("id", metadata.address_id)
      .maybeSingle(),
  ]);
  const deliveryAddress = address as AddressParams | null;
  const amountPaid = transaction.amount / 100;

  const { error } = await admin.from("orders").insert({
    user_id: metadata.user_id,
    product_id: metadata.product_id,
    quantity: metadata.quantity,
    total_price: amountPaid,
    amount_paid: amountPaid,
    address_id: metadata.address_id,
    paystack_reference: reference,
    status: "paid",
    product_name: product?.name ?? null,
    size: metadata.size,
    color: metadata.color,
    address: deliveryAddress?.address ?? null,
    city: deliveryAddress?.city ?? null,
    state: deliveryAddress?.state ?? null,
    phone: deliveryAddress?.phone ?? null,
  });

  // 23505 = unique violation: a parallel request already recorded this reference
  if (error && error.code !== "23505") {
    console.error("Error recording paid order:", { reference, error });
    return {
      error: `Your payment went through, but we couldn't record the order. Contact support with reference ${reference}.`,
    };
  }

  return { reference };
}
