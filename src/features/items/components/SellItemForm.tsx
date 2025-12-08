import { useState } from 'react';
import { useAuth } from '../../auth/api/useAuth';
import { useNavigate } from 'react-router-dom';
import './SellItemForm.css';

const API_HOST = 'http://localhost:8080';

export const SellItemForm = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Please login first');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_HOST}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          price: parseInt(price),
          description,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create item');
      }

      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Failed to list item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return <div>Please login to sell items.</div>;
  }

  return (
    <form className="sell-item-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">商品名</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="price">価格</label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="1"
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">商品説明</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />
      </div>
      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? '出品中...' : '出品する'}
      </button>
    </form>
  );
};
