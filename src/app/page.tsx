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
import { createSupabaseBrowser } from '@/lib/supabase_client'; // Pastikan path ini benar

// Definisi Tipe Data Resep (Sesuaikan dengan kolom di Table Supabase 'resep' kamu)
interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url: string; // Pastikan di DB namanya 'image_url'
  cook_time: string | number;
  difficulty: string;
  servings: number;
  user_id: string | null;
  category?: string; // Tambahan untuk filter
}

interface SearchData {
  data: Recipe[];
}

export default function Home() {
  const { data: session, status } = useSession();
  const [searchCount, setSearchCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State untuk menampung hasil pencarian
  const [searchData, setSearchData] = useState<SearchData>({ data: [] });
  
  // Inisialisasi Supabase Client
  const supabase = createSupabaseBrowser();
  
  const MAX_FREE_SEARCHES = 3;
  const isLoggedIn = status === 'authenticated';

  // --- 1. Load & Save Search Count (Logic Lama Tetap Dipakai) ---
  useEffect(() => {
    if (!isLoggedIn) {
      const saved = localStorage.getItem('guestSearchCount');
      if (saved) {
        setSearchCount(parseInt(saved, 10) || 0);
      }
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

  // --- 2. Handle Search (UPDATE UTAMA DI SINI) ---
  const handleSearch = async (query: string, filters?: Record<string, string[]>) => {
    console.log('🔎 Search triggered:', query);

    // A. Cek Limit Pencarian untuk Guest
    if (!isLoggedIn) {
      if (searchCount >= MAX_FREE_SEARCHES) {
        console.log('⛔ Limit reached! Opening modal...');
        setShowLoginModal(true);
        return;
      }
      // Tambah counter jika belum limit
      setSearchCount((prev) => prev + 1);
    }

    // B. Mulai Query ke Supabase
    try {
      let queryBuilder = supabase
        .from('resep') // Pastikan nama tabel di Supabase adalah 'resep'
        .select('*');

      // 1. Filter Berdasarkan Judul (Keyword Search)
      if (query) {
        // 'ilike' mencari teks yang mirip (case-insensitive)
        queryBuilder = queryBuilder.ilike('title', `%${query}%`);
      }

      // 2. Filter Lanjutan (Kategori, Tingkat Kesulitan, dll)
      // Mapping dari label UI (FilterSection) ke nama kolom Database
      if (filters) {
        // Contoh: Jika UI mengirim filter 'Kategori' -> Mapping ke kolom 'category'
        if (filters['Kategori'] && filters['Kategori'].length > 0 && !filters['Kategori'].includes('Semua')) {
             queryBuilder = queryBuilder.in('category', filters['Kategori']);
        }
        
        // Contoh: Jika UI mengirim filter 'Tingkat Kesulitan' -> Mapping ke kolom 'difficulty'
        if (filters['Tingkat Kesulitan'] && filters['Tingkat Kesulitan'].length > 0 && !filters['Tingkat Kesulitan'].includes('Semua')) {
             queryBuilder = queryBuilder.in('difficulty', filters['Tingkat Kesulitan']);
        }

        // Tambahkan mapping lain sesuai kolom DB kamu (misal: cook_time, dll)
      }

      // Eksekusi Query
      const { data, error } = await queryBuilder;

      if (error) {
        console.error("❌ Error fetching recipes:", error.message);
        return;
      }

      console.log(`✅ Found ${data?.length || 0} recipes`);
      
      // Update State agar UI menampilkan hasil
      setSearchData({ data: (data as Recipe[]) || [] });

      // Jika user guest baru saja mencapai limit setelah search ini
      if (!isLoggedIn && searchCount + 1 >= MAX_FREE_SEARCHES) {
         setTimeout(() => setShowLoginModal(true), 1000);
      }

    } catch (err) {
      console.error("🔥 Unexpected error:", err);
    }
  };

  const searchesLeft = MAX_FREE_SEARCHES - searchCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Menu + Logo */}
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

          {/* Right: User Profile / Login */}
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
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-700" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {session.user.name}
                  </span>
                </div>

                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
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

      {/* --- SIDEBAR --- */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* --- MODAL LOGIN --- */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        searchCount={searchCount}
        maxSearches={MAX_FREE_SEARCHES}
      />

      {/* --- MAIN CONTENT --- */}
      <main className="pt-20">
        {/* Banner Limit (Guest Only) */}
        {!isLoggedIn && (
          <SearchLimitBanner
            searchesLeft={searchesLeft}
            maxSearches={MAX_FREE_SEARCHES}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}

        {/* Hero Section (Search Bar ada di sini) */}
        <HeroSection 
          onSearch={handleSearch} 
          setSearchData={setSearchData}
          searchCount={searchCount}
          maxSearches={MAX_FREE_SEARCHES}
          isLoggedIn={isLoggedIn}
        />

        {/* Recommended / Results Section */}
        {/* Pass data hasil search ke sini agar ditampilkan */}
        <RecommendedSection searchData={searchData} />
      </main>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
}
