"use server";

import { ProductParams } from "@/shared.types";
import { createClient } from "../supabase/server";

export async function fetchProducts(): Promise<ProductParams[]> {
  const supabase = await createClient();
  const { data: products, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (products as ProductParams[]) ?? [];
}

export async function fetchProductById(
  id: string,
): Promise<ProductParams | null> {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")  
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return (product as ProductParams) ?? null;
}
