// app/favorites/page.tsx
'use client';

import AppLayout from '@/components/AppLayout';
import FavoritesPage from '@/components/FavoritePage';

export default function Favorites() {
  return (
    <AppLayout>
      <FavoritesPage />
    </AppLayout>
  );
}
