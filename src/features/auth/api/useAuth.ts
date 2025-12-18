import { useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { fireAuth } from '../../../firebase';
import { API_URL } from '../../../config';

const API_HOST = API_URL;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncWithBackend = async (currentUser: User) => {
    try {
      await fetch(`${API_HOST}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentUser.uid,
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'No Name',
          email: currentUser.email || 'no-email@example.com',
        }),
      });
    } catch (error) {
      console.error('Failed to sync user with backend:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
          await syncWithBackend(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(fireAuth, provider);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(fireAuth, email, pass);
        // Update Profile if name is provided
        if (name) {
            // @ts-ignore
            await import('firebase/auth').then(({ updateProfile }) => updateProfile(userCredential.user, { displayName: name }));
            // Force sync with backend immediately with the new name
            await syncWithBackend({ ...userCredential.user, displayName: name });
        }
    } catch (error) {
        console.error("Registration failed", error);
        throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
        await signInWithEmailAndPassword(fireAuth, email, pass);
    } catch (error) {
        console.error("Login failed", error);
        throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(fireAuth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getToken = async () => {
    if (!user) return null;
    return await user.getIdToken();
  };

  return { 
      user, 
      loading, 
      loginWithGoogle, 
      registerWithEmail,
      loginWithEmail,
      logout, 
      getToken 
  };
};
