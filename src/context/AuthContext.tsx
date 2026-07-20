import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, adminEmails } from '../firebase';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        const email = currentUser.email?.toLowerCase().trim() || "";
        console.log('Checking auth for email:', email);
        console.log('Admin emails list:', adminEmails);
        
        // Defensive: if no email, definitely not admin
        if (!email) {
          console.log('No email, not admin');
          await signOut(auth);
          return;
        }

        const adminEmailsNormalized = adminEmails.map(e => e.toLowerCase().trim());
        const isUserAdmin = adminEmailsNormalized.includes(email);
        console.log('Is user admin:', isUserAdmin);

        if (isUserAdmin) {
          setUser(currentUser);
          setIsAdmin(true);
          showToast(`Welcome back, Trainer ${currentUser.displayName || ''}!`, 'success');
        } else {
          // If NOT an authorized admin, immediately sign out and trigger warning
          setUser(null);
          setIsAdmin(false);
          await signOut(auth);
          // Redirect check will be handled in the route or landing hooks
          sessionStorage.setItem('accessDeniedTriggered', 'true');
          window.location.href = '#/access-denied';
          showToast('Access Denied: You are not authorized for admin tasks.', 'error');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showToast]);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Popup login is best for nested iframe sandboxes
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code === 'auth/popup-blocked') {
        showToast('Login popup blocked! Please enable popups or try again.', 'error');
      } else if (error.code === 'auth/popup-closed-by-user') {
        showToast('Sign-In popup was closed before completing login.', 'info');
      } else {
        showToast('Authentication failed. Please try again.', 'error');
      }
      setLoading(false);
      return null;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      showToast('Logged out successfully.', 'info');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Failed to log out.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
