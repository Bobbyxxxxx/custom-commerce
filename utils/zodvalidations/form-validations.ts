import { z } from "zod";

export const emailValidationSchema = z.object({
  email: z.email({ message: "invalid email address" }),
});

export const loginCodeValidationSchema = emailValidationSchema.extend({
  token: z
    .string()
    .regex(/^\d{6,10}$/, { message: "enter the code from your email" }),
});

export const addressValidationSchema = z.object({
  address: z
    .string()
    .trim()
    .min(3, { message: "enter your street address" })
    .max(200, { message: "street address is too long" }),
  city: z
    .string()
    .trim()
    .min(2, { message: "enter your city" })
    .max(100, { message: "city is too long" }),
  state: z
    .string()
    .trim()
    .min(2, { message: "enter your state" })
    .max(100, { message: "state is too long" }),
  additional_info: z
    .string()
    .trim()
    .max(200, { message: "extra details are too long" }),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d[\d\s-]{6,16})?$/, { message: "enter a valid phone number" }),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});

export type AddressInput = z.input<typeof addressValidationSchema>;

const optionValue = z.string().trim().max(50).nullable();

export const checkoutValidationSchema = z.object({
  productId: z.string().min(1),
  quantity: z
    .number()
    .int()
    .min(1, { message: "quantity cannot be less than 1" })
    .max(100, { message: "quantity is too large" }),
  addressId: z.string().min(1, { message: "select a delivery address" }),
  size: optionValue,
  color: optionValue,
});

export type CheckoutInput = z.input<typeof checkoutValidationSchema>;

export const paymentReferenceSchema = z
  .string()
  .regex(/^trx_[a-z0-9]{32}$/, { message: "invalid payment reference" });
