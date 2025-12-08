import { Link } from 'react-router-dom';
import type { Item } from '../types';
import './ItemCard.css'; // Simple CSS for card styling

type Props = {
  item: Item;
};

export const ItemCard = ({ item }: Props) => {
  return (
    <div className="item-card">
      <Link to={`/items/${item.id}`} className="item-card-link">
        <div className="item-card-image-placeholder">No Image</div>
        <div className="item-card-content">
          <h3 className="item-card-title">{item.name}</h3>
          <p className="item-card-price">¥{item.price.toLocaleString()}</p>
          <p className="item-card-status">{item.status === 'sold' ? 'SOLD' : 'On Sale'}</p>
        </div>
      </Link>
    </div>
  );
};
