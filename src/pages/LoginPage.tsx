import { useAuth } from '../features/auth/api/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getJapaneseAuthErrorMessage } from '../features/auth/utils/firebaseErrors';

export const LoginPage = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(getJapaneseAuthErrorMessage(err.code || ''));
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        if (!name) {
             setError('ユーザー名を入力してください');
             return;
        }
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(getJapaneseAuthErrorMessage(err.code || ''));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif', position: 'relative' }}>
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>← ホームに戻る</Link>
        </div>
      <h1>{isRegister ? 'アカウント登録' : 'ログイン'}</h1>
      <p style={{marginBottom: '20px', color: '#666'}}>続けるにはログインしてください</p>
      
      {error && <div style={{color: 'red', marginBottom: '16px', padding: '10px', backgroundColor: '#ffebee'}}>{error}</div>}

      {/* Email/Pass Form */}
      <form onSubmit={handleEmailAuth} style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px'}}>
          {isRegister && (
            <input 
                type="text" 
                placeholder="ユーザー名 (表示名)" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{padding: '10px', fontSize: '16px'}}
            />
          )}
          <input 
            type="email" 
            placeholder="メールアドレス" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{padding: '10px', fontSize: '16px'}}
          />
          <input 
            type="password" 
            placeholder="パスワード" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{padding: '10px', fontSize: '16px'}}
          />
          <button type="submit" style={{
              padding: '12px', 
              backgroundColor: isRegister ? '#2196f3' : '#333', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
          }}>
              {isRegister ? 'メールで登録' : 'メールでログイン'}
          </button>
      </form>

      <div style={{marginBottom: '24px'}}>
          <span 
            onClick={() => setIsRegister(!isRegister)} 
            style={{color: '#2196f3', cursor: 'pointer', textDecoration: 'underline'}}
          >
              {isRegister ? 'すでにアカウントをお持ちの方はこちら' : 'アカウント登録はこちら'}
          </span>
      </div>

      <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px'}}>
          <hr style={{flex: 1, border: 'none', borderTop: '1px solid #ddd'}} />
          <span style={{padding: '0 10px', color: '#888'}}>OR</span>
          <hr style={{flex: 1, border: 'none', borderTop: '1px solid #ddd'}} />
      </div>

      <button 
        onClick={handleGoogleLogin} 
        style={{ 
          width: '100%',
          padding: '12px 24px', 
          background: 'white', 
          color: '#555', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}
      >
        <span style={{fontWeight: 'bold'}}>G</span> Googleでログイン
      </button>
    </div>
  );
};
