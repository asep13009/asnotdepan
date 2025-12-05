import React, { createContext, useState, useEffect } from 'react';

export type UserRole = 'USER' | 'ADMIN';

// Function to decode JWT token
const decodeJWT = (token: string) => {
  console.log("decode>> ")
  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    console.log("decode>> "+decodedPayload)
    return decodedPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  // Add other user properties as needed
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Decode JWT token to get user data on app start
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeJWT(token);
      if (decodedToken && decodedToken.role) {
        // Create user object from decoded token
        const userData: User = {
          id: decodedToken.id || decodedToken.userId || 0,
          username: decodedToken.username || decodedToken.email || '',
          email: decodedToken.email || '',
          role: decodedToken.role,
        };
        console.log("userdata >>>"+userData)
        setUser(userData);
      } else {
        console.error('Invalid token or missing role');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    console.log("this is login"+userData)
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      hasRole,
    }}>
      {children}
    </UserContext.Provider>
  );
};


