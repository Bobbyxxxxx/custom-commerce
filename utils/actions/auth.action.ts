"use server";

import { createClient } from "../supabase/server";
import { emailValidationSchema } from "../zodvalidations/form-validations";

export interface AuthActionResult {
  error?: string;
}

// Emails a one-time code. Supabase creates the account if the email is new.
export async function sendLoginCode(email: string): Promise<AuthActionResult> {
  const parsed = emailValidationSchema.safeParse({
    email: email.trim().toLowerCase(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    console.error("Error sending login code:", error);
    if (error.status === 429) {
      return { error: "Please wait a moment before requesting another code." };
    }
    return { error: "We couldn't send the code. Please try again." };
  }

  return {};
}
