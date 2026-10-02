import React from "react";
import { fetchProducts } from "@/utils/actions/product.action";

interface productsParam {
  id: number;
  name: string;
  image: string;
}

const HomeProducts = (fetchProducts: productsParam) => {
  return <div>products</div>;
};

export default HomeProducts;
