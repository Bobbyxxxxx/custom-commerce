import HeaderSlider from "@/components/HeaderSlider";
import Navbar from "@/components/Navbar";
import HomeProducts from "@/components/HomeProducts";
import { fetchProducts } from "@/utils/actions/product.action";
import React from "react";
import { createClient } from "@/utils/supabase/server";
const allProducts = await fetchProducts();

console.log(allProducts);
export default async function page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <div>
      <Navbar user={user} />
      <div>
        <HeaderSlider />
        <HomeProducts products={allProducts} />
      </div>
      <footer />
    </div>
  );
}
