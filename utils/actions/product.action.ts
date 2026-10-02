"use server";

import { createClient } from "../supabase/server";

export async function fetchProducts() {
  const supabase = await createClient();
  let { data: products, error } = await supabase.from("products").select("*");

  if (error) {
    console.log(error);
    return [];
  }

  return products;
}
