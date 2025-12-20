import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useItem } from '../features/items/api/useItems';
import { useAuth } from '../features/auth/api/useAuth';
import { API_URL } from '../config';
import type { Message } from '../features/items/types';
import { UserIcon } from '../features/auth/components/UserIcon';
import { Modal } from '../components/ui/Modal';
import './ItemDetail.css';

const API_HOST = API_URL;

export const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  // @ts-ignore
  const { item, isLoading, error, mutate } = useItem(id);
  const { user } = useAuth();
  const userId = user?.uid || null;
  const navigate = useNavigate();
  
  const [modalConfig, setModalConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'confirm' | 'error';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showModal = (title: string, message: string, type: 'info' | 'confirm' | 'error' = 'info', onConfirm?: () => void) => {
    setModalConfig({ 
        isOpen: true, 
        title, 
        message, 
        type, 
        onConfirm: async () => {
            if (onConfirm) await onConfirm();
            closeModal();
        }
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handlePurchase = async () => {
    if (!userId) {
      showModal('購入エラー', '購入するにはログインしてください', 'error', () => navigate('/login'));
      return;
    }
    
    showModal('購入確認', '本当に購入しますか？', 'confirm', async () => {
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
    
          showModal('購入完了', '購入しました！', 'info', () => navigate('/'));
        } catch (error) {
          console.error(error);
          showModal('購入エラー', '購入に失敗しました', 'error');
        }
    });
  };

  const handleDelete = async () => {
    showModal('削除確認', '本当に削除しますか？', 'confirm', async () => {
        try {
            const response = await fetch(`${API_HOST}/items/${id}?user_id=${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Delete failed');
            showModal('削除完了', '商品を削除しました', 'info', () => navigate('/'));
        } catch (error) {
            console.error(error);
            showModal('削除エラー', '削除に失敗しました', 'error');
        }
    });
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
        currentPrice={item.price}
        userName={user?.displayName || user?.email || 'User'}
        showModal={showModal}
      />
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
};

// Update ChatSection props signature
const ChatSection = ({ itemId, userId, isSeller, onItemUpdate, currentPrice, userName, showModal }: { 
    itemId: string, 
    userId: string | null, 
    isSeller: boolean, 
    onItemUpdate?: () => void, 
    currentPrice: number,
    userName: string,
    showModal: (title: string, message: string, type: 'info' | 'confirm' | 'error', onConfirm?: () => void) => void
}) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [retryInput, setRetryInput] = React.useState('');
  const [retryTargetId, setRetryTargetId] = React.useState<string | null>(null);

  const fetchMessages = React.useCallback(() => {
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
    const interval = setInterval(fetchMessages, 3000); 
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

  const handleRetry = async (instruction: string) => {
      if (!userId) return;
      try {
          const res = await fetch(`${API_HOST}/items/${itemId}/messages/retry`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: userId, instruction: instruction })
          });
          if (res.ok) {
              setRetryTargetId(null);
              setRetryInput('');
              fetchMessages();
          } else {
              showModal('再試行エラー', 'リトライに失敗しました', 'error');
          }
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
              fetchMessages(); 
              if (onItemUpdate) onItemUpdate(); 
          }
      } catch (e) {
          console.error(e);
      }
  };

  const handleReject = async (msgId: string) => {
    if (!userId) return;
    
    showModal('却下確認', 'このAI提案を却下しますか？', 'confirm', async () => {
        // We need to close modal? showModal handles opening. Usually onConfirm implies closing is handled by the caller or the wrapper?
        // My Modal implementation calls onConfirm and doesn't auto-close unless onConfirm calls closeModal.
        // Wait, onConfirm logic in Modal: if(onConfirm) onConfirm(); else onClose();
        // So I must call closeModal() inside onConfirm if I passed it.
        // But `showModal` sets state. The `Modal` component's `onConfirm` prop is `modalConfig.onConfirm`.
        // The `ItemDetail` wrapper: `const showModal = (..., onConfirm) => setModalConfig({..., onConfirm})`.
        // The `Modal` component: `onClick={() => { if (onConfirm) onConfirm(); else onClose(); }}`.
        // So if I pass `onConfirm`, `onClose` is NOT called automatically. I must call it manually.
        // The `showModal` passed via props from ItemDetail implicitly has access to `closeModal`? No.
        // `showModal` implementation in `ItemDetail` doesn't wrap onConfirm to close.
        // So I need to pass `closeModal` to `ChatSection` too?
        // Or I can modify `showModal` in `ItemDetail` to wrap the onConfirm?
        // Modifying `showModal` in `ItemDetail` is better.
        // Let's modify `showModal` logic in Step 3? No, I already wrote it.
        // Re-read Step 99:
        // `const showModal = (..., onConfirm) => { setModalConfig({ ..., onConfirm }) }`
        // So `onConfirm` is stored as is.
        // In `Modal.tsx`: `onClick={() => { if (onConfirm) onConfirm(); else onClose(); }}`.
        // So yes, I need to manually close it.
        // But `ChatSection` doesn't have `closeModal`.
        // I should update `showModal` in `ItemDetail` to AUTO-CLOSE?
        // Ideally yes. But `handlePurchase` called `closeModal()` manually inside onConfirm.
        // Because `ItemDetail` has access to `closeModal`.
        // `ChatSection` does NOT.
        // So I should pass `closeModal` to `ChatSection`.
        try {
            const res = await fetch(`${API_HOST}/messages/${msgId}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });
            if (res.ok) {
                fetchMessages(); 
            }
        } catch (e) {
            console.error(e);
        }
    }); 
    // Wait, I can't close modal here!
    // I made a mistake in design. `showModal` allows passing a raw function.
    // I should pass `closeModal` to ChatSection OR modify `showModal` to support auto-closing.
    
    // Quick Fix: Pass `closeModal` to ChatSection as well.
  };

  return (
    <div className="chat-section" style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      <h3>AI価格交渉チャット {isSeller && <span style={{fontSize: '0.8em', color: 'green'}}>(出品者モード)</span>}</h3>
      {!userId && <div style={{padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '10px', borderRadius: '4px'}}>チャット機能を利用するにはログインしてください。</div>}
      
      <div className="messages-list" style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
        {messages.map(msg => {
            const isPriceChange = msg.suggested_price && msg.suggested_price !== currentPrice;
            const isDraft = msg.is_ai_response && !msg.is_approved;

            return (
          <div key={msg.id} style={{ 
            marginBottom: '10px', 
            textAlign: (userId && msg.sender_id === userId) ? 'right' : 'left',
            backgroundColor: isDraft ? '#FFF3E0' : 'transparent',
            padding: '5px',
            display: 'flex',
            flexDirection: (userId && msg.sender_id === userId) ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
              {/* Icon Logic */}
              {msg.is_ai_response ? (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                      🤖
                  </div>
              ) : (
                  <UserIcon size={32} />
              )}

              <div style={{ 
                display: 'inline-block', 
                padding: '8px 12px', 
                borderRadius: '12px', 
                backgroundColor: (userId && msg.sender_id === userId) ? '#e3f2fd' : '#f5f5f5',
                maxWidth: '70%',
                textAlign: 'left'
              }}>
              {/* Show Name */}
              <div style={{fontSize: '0.75em', color: '#666', marginBottom: '2px', textAlign: (userId && msg.sender_id === userId) ? 'right' : 'left'}}>
                  {msg.is_ai_response ? 
                    (msg.is_approved ? 'Smart-Nego (AI)' : 'Smart-Nego (AI) [下書き]') : 
                    (msg.sender_name || 'User')
                  }
              </div>

               {/* AI Status Color if AI */}
              {msg.is_ai_response && (
                  <div style={{fontSize: '0.8em', color: msg.is_approved ? '#2196f3' : '#ff9800', fontWeight: 'bold', marginBottom: '4px'}}>
                      {msg.is_approved ? '承認済み' : '承認待ち'}
                  </div>
              )}
              
              <div style={{whiteSpace: 'pre-wrap'}}>{msg.content}</div>
              
              {/* Show Reasoning for Seller */}
              {isSeller && msg.ai_reasoning && (
                  <div style={{ marginTop: '8px', padding: '6px', backgroundColor: 'rgba(0,0,0,0.05)', fontSize: '0.85em', borderRadius: '4px', borderLeft: '3px solid #999' }}>
                      <strong>AIの思考プロセス:</strong><br/>
                      {msg.ai_reasoning}
                  </div>
              )}

              {/* Seller Actions for Draft */}
              {isSeller && isDraft && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                            onClick={() => handleReject(msg.id)}
                            style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                        >
                            却下
                        </button>
                        <button 
                            onClick={() => setRetryTargetId(retryTargetId === msg.id ? null : msg.id)}
                            style={{ backgroundColor: '#ff9800', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                        >
                            再指示する...
                        </button>
                        <button 
                            onClick={() => handleApprove(msg.id)}
                            style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                        >
                            {isPriceChange ? `価格を¥${msg.suggested_price!.toLocaleString()}に変更して承認` : '承認する'}
                        </button>
                      </div>
                      
                      {retryTargetId === msg.id && (
                          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                              <input 
                                type="text" 
                                value={retryInput}
                                onChange={(e) => setRetryInput(e.target.value)}
                                placeholder="例: もっと高く粘って、もっと丁寧に..."
                                style={{ flex: 1, padding: '5px' }}
                              />
                              <button 
                                onClick={() => handleRetry(retryInput)}
                                style={{ backgroundColor: '#ff9800', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                  Go
                              </button>
                          </div>
                      )}
                  </div>
              )}

              {msg.suggested_price && (
                  <div style={{marginTop: '4px', fontWeight: 'bold', color: '#e91e63'}}>
                      提案価格: ¥{msg.suggested_price.toLocaleString()}
                  </div>
              )}

              <div style={{fontSize: '0.7em', color: '#999', marginTop: '4px', textAlign: 'right'}}>
                  {new Date(msg.created_at).toLocaleString()}
              </div>
              </div>
          </div>
        )})}
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
