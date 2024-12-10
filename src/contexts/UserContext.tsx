"use client";

import { useRouter } from 'next/navigation';
import React, { createContext, useState, useContext, useEffect } from 'react';

type User = {
  id: number;
  email: string;
  name?: string;
};

type UserContextType = {
  user: User | null;
  role: string | null;
  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for existing user and role
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedRole) setRole(storedRole);
  }, []);

  const setUserWithStorage = (newUser: User | null | any) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  const setRoleWithStorage = (newRole: string | null) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem('role', newRole);
    } else {
      localStorage.removeItem('role');
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setUser(null);
    setRole(null);
    router.push("/login");
  };

  return (
    <UserContext.Provider value={{ user, role, setUser: setUserWithStorage, setRole: setRoleWithStorage, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};