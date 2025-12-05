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

export default function Home() {
  const { data: session, status } = useSession();
  const [searchCount, setSearchCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchData, setSearchData] = useState<any>(null); // ← Tambah type any
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const MAX_FREE_SEARCHES = 3;
  const isLoggedIn = status === 'authenticated';

  // Fetch recipes on mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching recipes from API...');
      
      const response = await fetch('/api/recipes?source=all&limit=8&type=high-protein');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('📦 Received data:', data);
      console.log('📊 Total recipes:', data.total);
      console.log('📊 Sources:', data.sources);
      
      setSearchData(data);
    } catch (error: any) {
      console.error('❌ Error fetching recipes:', error);
      setError(error.message);
      
      setSearchData({
        success: false,
        data: [],
        total: 0,
        sources: { dataset: 0, user: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Load search count from localStorage
  useEffect(() => {
    if (!isLoggedIn) {
      const saved = localStorage.getItem('guestSearchCount');
      if (saved) {
        const count = parseInt(saved, 10) || 0;
        console.log('🔍 Loaded searchCount:', count);
        setSearchCount(count);
      }
    } else {
      setSearchCount(0);
      localStorage.removeItem('guestSearchCount');
    }
  }, [isLoggedIn]);

  // Save search count to localStorage
  useEffect(() => {
    if (!isLoggedIn && searchCount > 0) {
      console.log('💾 Saving searchCount:', searchCount);
      localStorage.setItem('guestSearchCount', searchCount.toString());
    }
  }, [searchCount, isLoggedIn]);

  const handleSearch = (query: string, filters?: Record<string, string[]>) => {
    console.log('🔎 Search triggered. Current count:', searchCount);

    if (isLoggedIn) {
      console.log('✅ Logged in - Unlimited search');
      console.log('Search:', query, 'Filters:', filters);
      // TODO: Implement actual search logic
      // Bisa update searchData di sini jika perlu filter
      return;
    }

    if (searchCount >= MAX_FREE_SEARCHES) {
      console.log('⛔ Limit reached! Opening modal...');
      setShowLoginModal(true);
      return;
    }

    const newCount = searchCount + 1;
    console.log('➕ Incrementing count to:', newCount);
    setSearchCount(newCount);

    console.log('✅ Search query:', query);
    console.log('✅ Filters:', filters);
    // TODO: Implement actual search logic

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

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

          <div className="flex items-center gap-3">
            {isLoggedIn && session?.user ? (
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
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">
                      {session.user.name || 'User'}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      ✨ Unlimited Search
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => signOut()}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-20">
        {!isLoggedIn && searchesLeft <= 1 && searchCount > 0 && (
          <SearchLimitBanner 
            searchesLeft={searchesLeft}
            maxSearches={MAX_FREE_SEARCHES}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}

        {/* ✅ PERBAIKAN: Hapus prop searchData */}
        <HeroSection 
          onSearch={handleSearch}
          searchCount={searchCount}
          maxSearches={MAX_FREE_SEARCHES}
          isLoggedIn={isLoggedIn}
        />

        {/* Recommended Section with Loading */}
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 py-16 mt-20">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FE9412] mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat rekomendasi resep...</p>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-7xl mx-auto px-4 py-16 mt-20">
            <div className="text-center py-16 bg-red-50 rounded-2xl border-2 border-red-200">
              <p className="text-red-600 mb-4">❌ Error: {error}</p>
              <button 
                onClick={fetchRecipes}
                className="px-6 py-3 bg-[#FE9412] text-white rounded-lg hover:bg-[#e58410] transition"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : (
          <RecommendedSection searchData={searchData} />
        )}
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
