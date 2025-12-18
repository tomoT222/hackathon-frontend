import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useItem } from '../features/items/api/useItems';
import { useAuth } from '../features/auth/api/useAuth';
import { API_URL } from '../config';
import type { Message } from '../features/items/types';
import './ItemDetail.css';

const API_HOST = API_URL;

export const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  // @ts-ignore
  const { item, isLoading, error, mutate } = useItem(id);
  const { user } = useAuth();
  const userId = user?.uid || null;
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!userId) {
      alert('購入するにはログインしてください');
      navigate('/login');
      return;
    }
    if (!confirm('本当に購入しますか？')) return;

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

      alert('購入しました！');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('購入に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return;
    try {
        const response = await fetch(`${API_HOST}/items/${id}?user_id=${userId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Delete failed');
        alert('商品を削除しました');
        navigate('/');
    } catch (error) {
        console.error(error);
        alert('削除に失敗しました');
    }
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Failed to load item info.</div>;
  if (!item) return <div className="error">Item not found</div>;

  const isSeller = userId === item.user_id;

  return (
    <div className="item-detail-page">
      {/* ... (existing UI) */}
      <Link to="/" className="back-link">← ホームに戻る</Link>
      <div className="item-detail-container">
        {item.image_url ? (
             <div className="item-image-container-detail">
                 <img src={item.image_url} alt={item.name} className="item-detail-image" />
             </div>
        ) : (
             <div className="item-image-placeholder">画像なし</div>
        )}
        <div className="item-info">
          <h1 className="item-title">{item.name}</h1>
          <p className="item-price">¥{item.price.toLocaleString()}</p>
          <div className="item-meta">
            <span>閲覧数: {item.views_count}</span>
            <span style={{ marginLeft: '10px', color: '#666' }}>
               {item.ai_negotiation_enabled ? '🤖 AI価格交渉 対応' : ''}
            </span>
          </div>
          <div className="item-description">
            <h3>商品説明</h3>
            <p>{item.description}</p>
          </div>
          
          {isSeller ? (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    onClick={() => navigate(`/items/${item.id}/edit`)}
                    style={{ backgroundColor: '#2196f3', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                      編集する
                  </button>
                  <button 
                    onClick={handleDelete}
                    style={{ backgroundColor: '#ff4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    disabled={item.status !== 'on_sale'}
                  >
                      削除する
                  </button>
              </div>
          ) : (
              <button 
                className="buy-button" 
                disabled={item.status === 'sold'}
                onClick={handlePurchase}
              >
                {item.status === 'sold' ? 'SOLD OUT' : '購入する'}
              </button>
          )}
        </div>
      </div>
      
      <ChatSection 
        itemId={item.id} 
        userId={userId} 
        isSeller={isSeller} 
        onItemUpdate={() => mutate()}
      />
    </div>
  );
};

// Update ChatSection props signature
const ChatSection = ({ itemId, userId, isSeller, onItemUpdate }: { itemId: string, userId: string | null, isSeller: boolean, onItemUpdate?: () => void }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputText, setInputText] = React.useState('');
  
  const fetchMessages = React.useCallback(() => {
     // Pass user_id for filtering
     const url = userId ? `${API_HOST}/items/${itemId}/messages?user_id=${userId}` : `${API_HOST}/items/${itemId}/messages`;
     fetch(url)
      .then(res => res.json())
      .then(data => {
          if(data.messages) setMessages(data.messages);
      })
      .catch(console.error);
  }, [itemId, userId]);

  React.useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || !userId) return;
    try {
      await fetch(`${API_HOST}/items/${itemId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, content: inputText })
      });
      fetchMessages(); 
      setInputText('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (msgId: string) => {
      if (!userId) return;
      try {
          const res = await fetch(`${API_HOST}/messages/${msgId}/approve`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: userId })
          });
          if (res.ok) {
              fetchMessages(); // Refresh messages to see approved status
              if (onItemUpdate) onItemUpdate(); // Refresh item to see new price
          }
      } catch (e) {
          console.error(e);
      }
  };

  const handleReject = async (msgId: string) => {
    if (!userId) return;
    if (!confirm('このAI提案を却下しますか？')) return;
    try {
        const res = await fetch(`${API_HOST}/messages/${msgId}/reject`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
        if (res.ok) {
            fetchMessages(); // Refresh to see update
        }
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="chat-section" style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      <h3>AI価格交渉チャット {isSeller && <span style={{fontSize: '0.8em', color: 'green'}}>(出品者モード)</span>}</h3>
      {!userId && <div style={{padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '10px', borderRadius: '4px'}}>チャット機能を利用するにはログインしてください。</div>}
      
      <div className="messages-list" style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ 
            marginBottom: '10px', 
            textAlign: (userId && msg.sender_id === userId) ? 'right' : 'left',
            backgroundColor: msg.is_ai_response && !msg.is_approved ? '#FFF3E0' : 'transparent',
            padding: '5px'
          }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '8px 12px', 
                borderRadius: '12px', 
                backgroundColor: (userId && msg.sender_id === userId) ? '#e3f2fd' : '#f5f5f5',
                maxWidth: '80%'
              }}>
              {msg.is_ai_response && (
                  <div style={{fontSize: '0.8em', color: msg.is_approved ? '#2196f3' : '#ff9800', fontWeight: 'bold', marginBottom: '4px'}}>
                      {msg.is_approved ? '🤖 AIエージェント (承認済み)' : '🤖 AIエージェント (下書き)'}
                  </div>
              )}
              
              {msg.content}
              
              {/* Show Reasoning for Seller */}
              {isSeller && msg.ai_reasoning && (
                  <div style={{ marginTop: '8px', padding: '6px', backgroundColor: 'rgba(0,0,0,0.05)', fontSize: '0.85em', borderRadius: '4px', borderLeft: '3px solid #999' }}>
                      <strong>AIの思考プロセス:</strong><br/>
                      {msg.ai_reasoning}
                  </div>
              )}

              {/* Seller Actions for Draft */}
              {isSeller && msg.is_ai_response && !msg.is_approved && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleReject(msg.id)}
                        style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                      >
                          却下
                      </button>
                      <button 
                        onClick={() => handleApprove(msg.id)}
                        style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                      >
                          {msg.suggested_price ? `承認して価格を¥${msg.suggested_price.toLocaleString()}に変更` : '承認して送信'}
                      </button>
                  </div>
              )}
              </div>
          </div>
        ))}
        {messages.length === 0 && <p style={{color: '#999'}}>まだメッセージはありません。</p>}
      </div>
      
      <div className="chat-input" style={{ display: 'flex' }}>
        <textarea 
          value={inputText} 
          onChange={e => setInputText(e.target.value)} 
          placeholder={userId ? "質問や希望価格を入力してください..." : "ログインが必要です"}
          disabled={!userId}
          style={{ flex: 1, padding: '8px', minHeight: '40px', resize: 'vertical' }}
        />
        <button 
            onClick={handleSend} 
            style={{ marginLeft: '8px', padding: '0 20px' }}
            disabled={!userId}
        >
            送信
        </button>
      </div>
    </div>
  );
};
