import HeaderSlider from "@/components/HeaderSlider";
import Navbar from "@/components/Navbar";
import HomeProducts from "@/components/productsSection";
import { fetchProducts } from "@/utils/actions/product.action";
import React from "react";
const allProducts = await fetchProducts();

console.log(allProducts);
export default function page() {
  return (
    <div>
      <Navbar />
      <div>
        <HeaderSlider />
        {/* <HomeProducts products={allProducts} /> */}
      </div>
    </div>
  );
}
