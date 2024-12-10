"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/src/contexts/UserContext';

export function withAuth(WrappedComponent: React.ComponentType, allowedRoles: ('user' | 'admin')[]) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();
    const { user, role } = useUser();

    useEffect(() => {
      if (!user || !role) {
        console.log('here error: ', user, role)
        router.push('/login');
        return;
      }

      if (!allowedRoles.includes(role as 'user' | 'admin')) {
        if (role === 'user') {
          router.push('/avatars');
        } else if (role === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      }
    }, [user, role, router]);

    if (!user || !role || !allowedRoles.includes(role as 'user' | 'admin')) {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };
}