import { useParams, Link } from 'react-router-dom';
import { useItem } from '../features/items/api/useItems';
import './ItemDetail.css';

export const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { item, isLoading, error } = useItem(id);

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
          <button className="buy-button" disabled={item.status === 'sold'}>
            {item.status === 'sold' ? 'SOLD OUT' : '購入する'}
          </button>
        </div>
      </div>
    </div>
  );
};
