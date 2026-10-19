export interface ProductParams {
  id: string;
  author_id: string;
  category: { id: string; name: string };
  name: string;
  description: string;
  brand: string;
  location: string;
  price: number;
  offer_price: number;
  discount: number;
  quantity: number;
  product_shipping_fee: number;
  sizes: string[];
  colors: string[];
  styles: string[];
  image_url_array: string[];
  video_url_array: string[];
  product_comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileParams {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface AddressParams {
  id: string;
  user_id: string;
  address: string;
  city: string;
  state: string;
  additional_info: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface OrderParams {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  amount_paid: number;
  address_id: string;
  paystack_reference: string;
  status: string;
  // Snapshot of the product and address at the time of purchase
  product_name: string | null;
  size: string | null;
  color: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string | null;
}
