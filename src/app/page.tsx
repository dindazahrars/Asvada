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
// import { createSupabaseBrowser } from '@/lib/supabase_client'; // Tidak dipakai karena via API

interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url: string;
  cook_time: string | number;
  difficulty: string;
  servings: number;
  user_id: string | null;
  category?: string;
  // Tambahan property jika dari AI
  ingredients?: string[];
  steps?: string[];
}

interface SearchData {
  data: Recipe[];
}

export default function Home() {
  const { data: session, status } = useSession();
  const [searchCount, setSearchCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const [searchData, setSearchData] = useState<SearchData>({ data: [] });
  
  const MAX_FREE_SEARCHES = 3;
  const isLoggedIn = status === 'authenticated';

  // --- 1. Guest Search Limit Logic ---
  useEffect(() => {
    if (!isLoggedIn) {
      const saved = localStorage.getItem('guestSearchCount');
      if (saved) setSearchCount(parseInt(saved, 10) || 0);
    } else {
      setSearchCount(0);
      localStorage.removeItem('guestSearchCount');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn && searchCount > 0) {
      localStorage.setItem('guestSearchCount', searchCount.toString());
    }
  }, [searchCount, isLoggedIn]);

  // --- 2. Handle Search via API Routes (Model Direct/Undirect) ---
  const handleSearch = async (query: string, filters?: Record<string, string[]>) => {
    console.log('🔎 Search Triggered:', { query, filters });

    // A. Cek Limit Guest
    if (!isLoggedIn) {
      if (searchCount >= MAX_FREE_SEARCHES) {
        setShowLoginModal(true);
        return;
      }
      setSearchCount((prev) => prev + 1);
    }

    setIsLoading(true);

    try {
      let endpoint = '';
      let payload = {};

      // LOGIKA PEMILIHAN ROUTE:
      // Jika ada teks input -> Gunakan 'modelUndirect' (Biasanya untuk AI/Fuzzy Search)
      // Jika hanya filter -> Gunakan 'modelDirect' (Biasanya untuk Strict Filter)
      if (query && query.trim() !== '') {
        endpoint = '/api/modelUndirect';
        payload = { 
          prompt: query,   // Kirim sebagai prompt/query
          filters: filters // Sertakan filter jika ada
        };
      } else {
        endpoint = '/api/modelDirect';
        payload = { 
          filters: filters // Kirim object filter
        };
      }

      console.log(`🚀 Fetching to ${endpoint}...`, payload);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      const result = await res.json();
      console.log("✅ Data received:", result);

      // Handle variasi struktur response (sesuaikan dengan return API kamu)
      // Kadang API return { data: [...] } atau langsung array [...]
      const recipes = Array.isArray(result) ? result : (result.data || []);
      
      setSearchData({ data: recipes });

      // Trigger modal limit jika pas di batas
      if (!isLoggedIn && searchCount + 1 >= MAX_FREE_SEARCHES) {
         setTimeout(() => setShowLoginModal(true), 1500);
      }

    } catch (err) {
      console.error("🔥 Error searching:", err);
      // Opsional: Tampilkan toast error ke user
    } finally {
      setIsLoading(false);
    }
  };

  const searchesLeft = MAX_FREE_SEARCHES - searchCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* HEADER */}
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
              <Image src="/logo.png" alt="Asvada Logo" width={120} height={120} priority />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn && session?.user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name || 'User'} width={32} height={32} className="rounded-full ring-2 ring-orange-200" />
                  ) : (
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-700" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{session.user.name}</span>
                </div>
                <button onClick={() => signOut()} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg font-medium">
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} searchCount={searchCount} maxSearches={MAX_FREE_SEARCHES} />

      <main className="pt-20">
        {!isLoggedIn && (
          <SearchLimitBanner searchesLeft={searchesLeft} maxSearches={MAX_FREE_SEARCHES} onLoginClick={() => setShowLoginModal(true)} />
        )}

        {/* HERO SECTION */}
        {/* onSearch sekarang memanggil handleSearch yang nge-fetch ke API modelDirect/Undirect */}
        <HeroSection 
          onSearch={handleSearch} 
          setSearchData={setSearchData}
          searchCount={searchCount}
          maxSearches={MAX_FREE_SEARCHES}
          isLoggedIn={isLoggedIn}
        />

        {/* LOADING INDICATOR (Optional) */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="text-gray-500 mt-2">Sedang mencari resep terbaik...</p>
          </div>
        )}

        {/* RECOMMENDED / RESULTS */}
        <RecommendedSection searchData={searchData} />
      </main>

      <Footer />
    </div>
  );
}
