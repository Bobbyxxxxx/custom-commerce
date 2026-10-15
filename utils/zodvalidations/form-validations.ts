import { z } from "zod";

export const emailValidationSchema = z.object({
  email: z.email({ message: "invalid email address" }),
});

export const loginCodeValidationSchema = emailValidationSchema.extend({
  token: z
    .string()
    .regex(/^\d{6,10}$/, { message: "enter the code from your email" }),
});
