"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from "@/components/ui/button";
import { useUser } from '@/src/contexts/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          router.push(data.role === 'admin' ? 'admin/dashboard' : '/avatars');
        } else {
          const errorData = await res.json();
          setLoginError(errorData.error || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('An unexpected error occurred');
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      setLoginError('Google login failed. Please try again.');
    },
  });

  useEffect(() => {
    console.log('logging')
    const token = localStorage.getItem('token');
    if (token) {
      const role = localStorage.getItem('role');
      router.push(role === 'admin' ? '/dashboard' : '/avatars');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <Button onClick={() => login()}>
          Sign in with Google
        </Button>
        {loginError && (
          <p className="mt-4 text-red-500">{loginError}</p>
        )}
      </div>
    </div>
  );
}