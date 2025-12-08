import { useState } from 'react';
import { useAuth } from '../features/auth/api/useAuth';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email);
      navigate('/');
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px' }}>
      <h1>Login / Register</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '8px' }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#333', color: 'white', border: 'none' }}>
          Start Using App
        </button>
      </form>
    </div>
  );
};
