"use server";

import { AddressParams } from "@/shared.types";
import { createClient } from "../supabase/server";
import {
  addressValidationSchema,
  type AddressInput,
} from "../zodvalidations/form-validations";

export interface CreateAddressResult {
  address?: AddressParams;
  error?: string;
}

export async function createAddress(
  input: AddressInput,
): Promise<CreateAddressResult> {
  const parsed = addressValidationSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to save an address." };
  }

  const { additional_info, phone, ...rest } = parsed.data;
  const { data: address, error } = await supabase
    .from("address")
    .insert({
      ...rest,
      additional_info: additional_info || null,
      phone: phone || null,
      // Taken from the session, never from the client
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving address:", error);
    return { error: "We couldn't save your address. Please try again." };
  }

  return { address: address as AddressParams };
}
