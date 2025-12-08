import { SellItemForm } from '../features/items/components/SellItemForm';
import { Link } from 'react-router-dom';

export const SellItemPage = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '24px', color: '#666', textDecoration: 'none' }}>
        ← Back to Home
      </Link>
      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>商品を出品する</h1>
      <SellItemForm />
    </div>
  );
};
