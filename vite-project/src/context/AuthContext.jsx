// client/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        console.log('✅ User loaded from localStorage:', parsedUser);
      } catch (err) {
        console.error('❌ Error parsing user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

const login = (userData, userToken) => {
  if (!userData || typeof userData !== 'object' || Array.isArray(userData)) {
    console.error('❌ login() called with invalid userData, ignoring:', userData);
    return;
  }
  const userWithAllFields = {
    _id: userData._id || userData.id,
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
    city: userData.city || '',
    bio: userData.bio || '',
    avatar: userData.avatar || '',
    rating: userData.rating || 0,
    notifications: userData.notifications !== undefined ? userData.notifications : true,
    theme: userData.theme || 'light',
    createdAt: userData.createdAt || new Date().toISOString()
  };
  setUser(userWithAllFields);
  setToken(userToken);
  localStorage.setItem('token', userToken);
  localStorage.setItem('user', JSON.stringify(userWithAllFields));
};

const updateUser = (userData) => {
  if (!userData || typeof userData !== 'object' || Array.isArray(userData)) {
    console.error('❌ updateUser() called with invalid userData, ignoring:', userData);
    return;
  }
  const updatedUser = { ...user, ...userData };
  setUser(updatedUser);
  localStorage.setItem('user', JSON.stringify(updatedUser));
};

const logout = () => {
  console.log('🚪 Logout');
  setUser(null);
  setToken(null);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
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