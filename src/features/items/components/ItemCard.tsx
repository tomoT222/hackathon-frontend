import { Link } from 'react-router-dom';
import type { Item } from '../types';
import './ItemCard.css'; // Simple CSS for card styling

type Props = {
  item: Item;
};

export const ItemCard = ({ item }: Props) => {
  return (
    <div className="item-card">
      <Link to={`/items/${item.id}`} className="item-card-link" style={{position: 'relative'}}>
        {item.status === 'sold' && (
             <div className="ribbon"><span>SOLD</span></div>
        )}
        {item.image_url ? (
            <div className="item-card-image-container">
                <img src={item.image_url} alt={item.name} className="item-card-image" />
            </div>
        ) : (
            <div className="item-card-image-placeholder">画像なし</div>
        )}
        <div className="item-card-content">
          <h3 className="item-card-title">{item.name}</h3>
          <p className="item-card-price">¥{item.price.toLocaleString()}</p>
          <p className="item-card-status" style={{color: item.status === 'sold' ? '#ff4444' : '#4caf50', fontWeight: 'bold'}}>
            {item.status === 'sold' ? 'SOLD OUT' : '販売中'}
          </p>
        </div>
      </Link>
    </div>
  );
};
