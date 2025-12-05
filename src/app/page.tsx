'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import HeroSection from '@/components/HeroSection';
import LoginModal from '@/components/LoginModal';
import SearchLimitBanner from '@/components/SearchLimitBanner';
import Sidebar from '@/components/Sidebar';
import RecommendedSection from '@/components/RecommendedSection';
import Footer from '@/components/Footer';
import { LogOut, User, Menu } from 'lucide-react';
import Image from 'next/image';

interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url: string;
  cook_time: string | number;
  difficulty: string;
  servings: number;
  user_id: string | null;
}

interface SearchData {
  data: Recipe[];
}

export default function Home() {
  const { data: session, status } = useSession();
  const [searchCount, setSearchCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchData, setSearchData] = useState<SearchData>({ data: [] });
  
  const MAX_FREE_SEARCHES = 3;
  const isLoggedIn = status === 'authenticated';

  // Load search count from localStorage (only for guests)
  useEffect(() => {
    if (!isLoggedIn) {
      const saved = localStorage.getItem('guestSearchCount');
      if (saved) {
        const count = parseInt(saved, 10) || 0;
        console.log('🔍 Loaded searchCount:', count);
        setSearchCount(count);
      }
    } else {
      // Reset counter when logged in
      setSearchCount(0);
      localStorage.removeItem('guestSearchCount');
    }
  }, [isLoggedIn]);

  // Save search count to localStorage (only for guests)
  useEffect(() => {
    if (!isLoggedIn && searchCount > 0) {
      console.log('💾 Saving searchCount:', searchCount);
      localStorage.setItem('guestSearchCount', searchCount.toString());
    }
  }, [searchCount, isLoggedIn]);

  const handleSearch = (query: string, filters?: Record<string, string[]>) => {
    console.log('🔎 Search triggered. Current count:', searchCount);

    // If logged in, unlimited search
    if (isLoggedIn) {
      console.log('✅ Logged in - Unlimited search');
      console.log('Search:', query, 'Filters:', filters);
      return;
    }

    // Check if limit reached
    if (searchCount >= MAX_FREE_SEARCHES) {
      console.log('⛔ Limit reached! Opening modal...');
      setShowLoginModal(true);
      return;
    }

    // Increment search count
    const newCount = searchCount + 1;
    console.log('➕ Incrementing count to:', newCount);
    setSearchCount(newCount);

    // Perform search
    console.log('✅ Search query:', query);
    console.log('✅ Filters:', filters);

    // Show modal if limit reached after this search
    if (newCount >= MAX_FREE_SEARCHES) {
      setTimeout(() => {
        console.log('⚠️ Limit reached after search. Opening modal...');
        setShowLoginModal(true);
      }, 500);
    }
  };

  const searchesLeft = MAX_FREE_SEARCHES - searchCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-3">
            {/* Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-4">
              <Image
                  src="/logo.png" 
                  alt="Asvada Logo"
                  width={120}
                  height={120}
                  priority
                />
            </div>
          </div>

          {/* Right: User Profile / Login */}
          <div className="flex items-center gap-3">
            {isLoggedIn && session?.user ? (
              <>
                {/* User Profile */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full ring-2 ring-orange-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-orange-700" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {session.user.name}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Main Content */}
      <main className="pt-20">
        {/* Search Limit Banner (only for guests) */}
        {!isLoggedIn && (
          <SearchLimitBanner
            searchesLeft={searchesLeft}
            maxSearches={MAX_FREE_SEARCHES}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}

        {/* Hero Section */}
        <HeroSection 
          onSearch={handleSearch} 
          setSearchData={setSearchData}
          searchCount={searchCount}
          maxSearches={MAX_FREE_SEARCHES}
          isLoggedIn={isLoggedIn}
        />

        {/* Recommended Section */}
        <RecommendedSection searchData={searchData} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
