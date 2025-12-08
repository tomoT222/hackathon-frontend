
export type Item = {
  id: string;
  name: string;
  price: number;
  description: string;
  user_id: string;
  buyer_id?: string;
  status: 'on_sale' | 'sold';
};
