'use client';

import AppLayout from '@/components/AppLayout';
import HistoryPage from '@/components/HistoryPage';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HistoryRoute() {
  const { status } = useSession();
  const router = useRouter();

  // Proteksi Halaman: Redirect ke login jika belum login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/'); 
      // Atau bisa arahkan ke router.push('/?login=true') jika ingin langsung buka modal
    }
  }, [status, router]);

  if (status === 'loading') {
    return null; // Atau tampilkan loading spinner sederhana
  }

  return (
    <AppLayout>
      <HistoryPage />
    </AppLayout>
  );
}