import { useItems } from '../features/items/api/useItems';
import { ItemCard } from '../features/items/components/ItemCard';
import './HomePage.css';

export const HomePage = () => {
  const { items, isLoading, error } = useItems();

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Failed to load items.</div>;

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Merchackathon</h1>
        <button className="sell-button">出品する</button>
      </header>
      <div className="item-grid">
        {items?.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
