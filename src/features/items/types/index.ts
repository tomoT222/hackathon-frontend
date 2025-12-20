
export type Item = {
  id: string;
  name: string;
  price: number;
  description: string;
  user_id: string;
  buyer_id?: string;
  status: 'on_sale' | 'sold';
  views_count: number;
  ai_negotiation_enabled: boolean;
  min_price?: number;
  image_url?: string;
  created_at: string;
};

export type Message = {
  id: string;
  item_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  is_ai_response: boolean;
  is_approved: boolean;
  created_at: string;
  ai_reasoning?: string;
  suggested_price?: number;
};
