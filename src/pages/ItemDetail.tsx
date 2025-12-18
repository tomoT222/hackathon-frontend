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
  const { item, isLoading, error } = useItem(id);
  const { user } = useAuth();
  const userId = user?.uid || null;
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
        const response = await fetch(`${API_HOST}/items/${id}?user_id=${userId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Delete failed');
        alert('Item deleted');
        navigate('/');
    } catch (error) {
        console.error(error);
        alert('Failed to delete item');
    }
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Failed to load item info.</div>;
  if (!item) return <div className="error">Item not found</div>;

  const isSeller = userId === item.user_id;

  return (
    <div className="item-detail-page">
      <Link to="/" className="back-link">← Back to Home</Link>
      <div className="item-detail-container">
        <div className="item-image-placeholder">No Image</div>
        <div className="item-info">
          <h1 className="item-title">{item.name}</h1>
          <p className="item-price">¥{item.price.toLocaleString()}</p>
          <div className="item-meta">
            <span>Views: {item.views_count}</span>
            <span style={{ marginLeft: '10px', color: '#666' }}>
               {item.ai_negotiation_enabled ? '🤖 Smart-Nego Enabled' : ''}
            </span>
          </div>
          <div className="item-description">
            <h3>Description</h3>
            <p>{item.description}</p>
          </div>
          
          {isSeller ? (
              <button 
                className="delete-button"
                onClick={handleDelete}
                style={{ backgroundColor: '#ff4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={item.status !== 'on_sale'}
              >
                  削除する
              </button>
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
      />
    </div>
  );
};

const ChatSection = ({ itemId, userId, isSeller }: { itemId: string, userId: string | null, isSeller: boolean }) => {
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
      // Immediate update handled by polling or manual fetch?
      // Let's just create array locally or wait for poll.
      // Better to wait for next poll or manually call fetchMessages to sync state.
      // But typically we append immediately for UX.
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
              fetchMessages(); // Refresh to see update
          }
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="chat-section" style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      <h3>Smart-Nego Chat {isSeller && <span style={{fontSize: '0.8em', color: 'green'}}>(Seller Mode)</span>}</h3>
      <div className="messages-list" style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ 
            textAlign: msg.sender_id === userId ? 'right' : 'left',
            margin: '8px 0',
            clear: 'both'
          }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '10px 14px', 
              borderRadius: '12px',
              backgroundColor: msg.is_ai_response ? (msg.is_approved ? '#e3f2fd' : '#fff3e0') : (msg.sender_id === userId ? '#dcf8c6' : '#f0f0f0'),
              border: msg.is_ai_response ? (msg.is_approved ? '1px solid #2196f3' : '1px dashed #ff9800') : 'none',
              maxWidth: '70%',
              textAlign: 'left'
            }}>
              {msg.is_ai_response && (
                  <div style={{fontSize: '0.8em', color: msg.is_approved ? '#2196f3' : '#ff9800', fontWeight: 'bold', marginBottom: '4px'}}>
                      {msg.is_approved ? '🤖 AI Agent (Approved)' : '🤖 AI Agent (Draft)'}
                  </div>
              )}
              
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

              {/* Show Reasoning for Seller */}
              {isSeller && msg.ai_reasoning && (
                  <div style={{ marginTop: '8px', padding: '6px', backgroundColor: 'rgba(0,0,0,0.05)', fontSize: '0.85em', borderRadius: '4px', borderLeft: '3px solid #999' }}>
                      <strong>AI Reasoning:</strong><br/>
                      {msg.ai_reasoning}
                  </div>
              )}

              {/* Show Approve Button for Unapproved Drafts (Seller only) */}
              {isSeller && !msg.is_approved && msg.is_ai_response && (
                  <div style={{ marginTop: '8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleApprove(msg.id)}
                        style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                      >
                          承認する (Approve)
                      </button>
                  </div>
              )}
            </div>
          </div>
        ))}
        {messages.length === 0 && <p style={{color: '#999'}}>No messages yet.</p>}
      </div>
      
      <div className="chat-input" style={{ display: 'flex' }}>
        <textarea 
          value={inputText} 
          onChange={e => setInputText(e.target.value)} 
          placeholder="Ask a question or negotiate price..."
          style={{ flex: 1, padding: '8px', minHeight: '40px', resize: 'vertical' }}
        />
        <button onClick={handleSend} style={{ marginLeft: '8px', padding: '0 20px' }}>Send</button>
      </div>
    </div>
  );
};
