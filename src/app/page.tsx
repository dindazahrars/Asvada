
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import HeroSection from '@/components/HeroSection';
import LoginModal from '@/components/LoginModal';
import SearchLimitBanner from '@/components/SearchLimitBanner';
import Header from '@/components/Header';
import RecommendedSection from '@/components/RecommendedSection';
import Footer from '@/components/Footer';

export default function Home() {
  const { data: session, status } = useSession();
  const [searchCount, setSearchCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const MAX_FREE_SEARCHES = 3;
  const isLoggedIn = status === 'authenticated';

  // Load search count from localStorage (only for guests)
  useEffect(() => {
    if (!isLoggedIn) {
      const saved = localStorage.getItem('guestSearchCount');
      if (saved) {
        const count = parseInt(saved, 10) || 0;
        setSearchCount(count);
      }
    } else {
      setSearchCount(0);
      localStorage.removeItem('guestSearchCount');
    }
  }, [isLoggedIn]);

  // Save search count to localStorage (only for guests)
  useEffect(() => {
    if (!isLoggedIn && searchCount > 0) {
      localStorage.setItem('guestSearchCount', searchCount.toString());
    }
  }, [searchCount, isLoggedIn]);

  const handleSearch = (query: string, filters?: Record<string, string[]>) => {
    if (isLoggedIn) {
      console.log('✅ Logged in - Unlimited search');
      console.log('Search:', query, 'Filters:', filters);
      return;
    }

    if (searchCount >= MAX_FREE_SEARCHES) {
      setShowLoginModal(true);
      return;
    }

    const newCount = searchCount + 1;
    setSearchCount(newCount);

    console.log('✅ Search query:', query);
    console.log('✅ Filters:', filters);

    if (newCount >= MAX_FREE_SEARCHES) {
      setTimeout(() => {
        setShowLoginModal(true);
      }, 500);
    }
  };

  const searchesLeft = MAX_FREE_SEARCHES - searchCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header dengan Sidebar */}
      <Header onToggleSidebar={() => setShowLoginModal(true)} />

      {/* Main Content */}
      <main className="pt-20">
        {!isLoggedIn && searchesLeft <= 1 && searchCount > 0 && (
          <SearchLimitBanner 
            searchesLeft={searchesLeft}
            maxSearches={MAX_FREE_SEARCHES}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}

        <HeroSection 
          onSearch={handleSearch}
          searchCount={searchCount}
          maxSearches={MAX_FREE_SEARCHES}
          isLoggedIn={isLoggedIn}
        />

        <RecommendedSection />
      </main>

      <Footer />

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        searchCount={searchCount}
        maxSearches={MAX_FREE_SEARCHES}
      />
    </div>
  );
}
