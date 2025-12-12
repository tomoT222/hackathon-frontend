import { useParams, Link, useNavigate } from 'react-router-dom';
import { useItem } from '../features/items/api/useItems';
import { useAuth } from '../features/auth/api/useAuth';
import { API_URL } from '../config';
import './ItemDetail.css';

const API_HOST = API_URL;

export const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { item, isLoading, error } = useItem(id);
  const { userId } = useAuth();
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!userId) {
      alert('Please login to purchase');
      navigate('/login');
      return;
    }
    if (!confirm('Are you sure you want to purchase this item?')) return;

    try {
      const response = await fetch(`${API_HOST}/items/${id}/buy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Purchase failed');
      }

      alert('Purchase successful!');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Failed to purchase item');
    }
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Failed to load item info.</div>;
  if (!item) return <div className="error">Item not found</div>;

  return (
    <div className="item-detail-page">
      <Link to="/" className="back-link">← Back to Home</Link>
      <div className="item-detail-container">
        <div className="item-image-placeholder">No Image</div>
        <div className="item-info">
          <h1 className="item-title">{item.name}</h1>
          <p className="item-price">¥{item.price.toLocaleString()}</p>
          <div className="item-description">
            <h3>Description</h3>
            <p>{item.description}</p>
          </div>
          <button 
            className="buy-button" 
            disabled={item.status === 'sold'}
            onClick={handlePurchase}
          >
            {item.status === 'sold' ? 'SOLD OUT' : '購入する'}
          </button>
        </div>
      </div>
    </div>
  );
};
