import "server-only";

const PAYSTACK_API = "https://api.paystack.co";

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

// What we attach to every transaction on initialize. Set by our server with the
// secret key, so it can be trusted when it comes back on verify.
export interface PaymentMetadata {
  user_id: string;
  product_id: string;
  quantity: number;
  address_id: string;
  size: string | null;
  color: string | null;
  expected_amount_kobo: number;
}

export interface PaystackInitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackVerifyData {
  status:
    | "success"
    | "failed"
    | "abandoned"
    | "ongoing"
    | "pending"
    | "processing"
    | "queued"
    | "reversed";
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  // Paystack returns an empty string when no metadata was set
  metadata: PaymentMetadata | string | null;
}

export const toKobo = (naira: number) => Math.round(naira * 100);

async function paystackRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY is not set");

  const response = await fetch(`${PAYSTACK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const body = (await response.json()) as PaystackResponse<T>;

  if (!response.ok || !body.status) {
    throw new Error(`Paystack ${path} failed: ${body.message}`);
  }

  return body.data;
}

export function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  metadata: PaymentMetadata;
}) {
  return paystackRequest<PaystackInitializeData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      currency: "NGN",
      reference: params.reference,
      metadata: params.metadata,
    }),
  });
}

export function verifyTransaction(reference: string) {
  return paystackRequest<PaystackVerifyData>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

export function parseMetadata(
  metadata: PaystackVerifyData["metadata"],
): PaymentMetadata | null {
  if (!metadata) return null;
  if (typeof metadata !== "string") return metadata;
  try {
    return JSON.parse(metadata) as PaymentMetadata;
  } catch {
    return null;
  }
}
