import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';

const API_HOST = API_URL;

export type User = {
  id: string;
  name: string;
  email: string;
};

export const useAuth = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('hackathon_user_id');
    if (storedId) {
      setUserId(storedId);
    }
  }, []);

  const register = async (name: string, email: string) => {
    try {
      const response = await fetch(`${API_HOST}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const user: User = await response.json();
      localStorage.setItem('hackathon_user_id', user.id);
      setUserId(user.id);
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('hackathon_user_id');
    setUserId(null);
  };

  return { userId, register, logout };
};
