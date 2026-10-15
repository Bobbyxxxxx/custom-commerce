import { ProductParams } from "@/shared.types";

// Flat delivery fee charged on every order
export const SHIPPING_FEE = 3000;

const wholeNaira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const nairaWithKobo = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

export const formatPrice = (amount: number) =>
  Number.isInteger(amount)
    ? wholeNaira.format(amount)
    : nairaWithKobo.format(amount);

// The offer price only applies when it's set and actually cheaper
export const getUnitPrice = (
  product: Pick<ProductParams, "price" | "offer_price">,
) =>
  product.offer_price > 0 && product.offer_price < product.price
    ? product.offer_price
    : product.price;
