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
  full_name: string | null;
  phone_number: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}
