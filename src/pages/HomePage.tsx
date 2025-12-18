import { useNavigate } from 'react-router-dom';
import { useItems } from '../features/items/api/useItems';
import { ItemCard } from '../features/items/components/ItemCard';
import { useAuth } from '../features/auth/api/useAuth';
import './HomePage.css';

export const HomePage = () => {
  const { items, isLoading, error } = useItems();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Failed to load items.</div>;

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Merchackathon</h1>
        <div className="header-actions">
          {user ? (
            <>
              <span style={{ marginRight: '15px', fontWeight: 'bold', fontSize: '0.9em' }}>
                {user.displayName || user.email} さま
              </span>
              <button className="sell-button" onClick={() => navigate('/sell')}>出品する</button>
              <button className="logout-button" onClick={logout}>ログアウト</button>
            </>
          ) : (
            <button className="login-button" onClick={() => navigate('/login')}>ログイン / 登録</button>
          )}
        </div>
      </header>
      <div className="item-grid">
        {items?.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
