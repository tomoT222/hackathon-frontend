import { useState } from 'react';
import { useAuth } from '../../auth/api/useAuth';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config';
import type { Item } from '../../items/types';
import './SellItemForm.css';

const API_HOST = API_URL;

type Props = {
  initialData?: Item;
};

export const SellItemForm = ({ initialData }: Props) => {
  const { user } = useAuth();
  const userId = user?.uid;
  const navigate = useNavigate();

  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [aiNegotiationEnabled, setAiNegotiationEnabled] = useState(initialData?.ai_negotiation_enabled || false);
  const [minPrice, setMinPrice] = useState(initialData?.min_price?.toString() || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple size check (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズが大きすぎます (上限5MB)');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('出品するにはログインしてください');
      return;
    }

    // Validation: MinPrice > Price
    if (aiNegotiationEnabled && minPrice && parseInt(minPrice) > parseInt(price)) {
        alert('最低許容価格は販売価格以下に設定してください');
        return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name,
        price: parseInt(price),
        description,
        user_id: userId, // Keep owner for verification
        ai_negotiation_enabled: aiNegotiationEnabled,
        image_url: imageUrl,
      };
      if (minPrice) {
        payload.min_price = parseInt(minPrice);
      }

      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `${API_HOST}/items/${initialData.id}` : `${API_HOST}/items`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save item');
      }

      navigate(initialData ? `/items/${initialData.id}` : '/');
    } catch (error) {
      console.error(error);
      alert(initialData ? '更新に失敗しました' : '出品に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return <div>出品するにはログインしてください。</div>;
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
        <label htmlFor="image">商品画像 (任意)</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imageUrl && (
            <div style={{marginTop: '10px'}}>
                <img src={imageUrl} alt="Preview" style={{maxWidth: '200px', maxHeight: '200px', objectFit: 'contain'}} />
            </div>
        )}
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

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={aiNegotiationEnabled}
            onChange={(e) => setAiNegotiationEnabled(e.target.checked)}
          />
          AIによる価格交渉を有効にする
        </label>
      </div>

      {aiNegotiationEnabled && (
        <div className="form-group">
          <label htmlFor="minPrice">最低許容価格 (円)</label>
          <input
            id="minPrice"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="1"
            style={{ borderColor: (minPrice && price && parseInt(minPrice) > parseInt(price)) ? 'red' : undefined }}
          />
          {(minPrice && price && parseInt(minPrice) > parseInt(price)) && (
              <div style={{color: 'red', fontSize: '0.9em', marginTop: '4px'}}>
                  販売価格より高い価格は設定できません
              </div>
          )}
          <small>AIはこの価格を下回らない範囲で交渉します</small>
        </div>
      )}

      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : (initialData ? '更新する' : '出品する')}
      </button>
    </form>
  );
};
