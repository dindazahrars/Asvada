'use client';

import AppLayout from '@/components/AppLayout';
import MyRecipesPage from '@/components/MyRecipesPage';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyRecipesRoute() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <AppLayout showCreateButton> {/* ← Tambahkan prop */}
      <MyRecipesPage />
    </AppLayout>
  );
}
