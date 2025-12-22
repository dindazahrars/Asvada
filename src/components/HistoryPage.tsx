'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Users, History, Trash2, ImageOff } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

const supabase = createSupabaseBrowser();

// --- Interfaces ---
interface Recipe {
  id: number;
  title: string;
  image_url: string;
  cook_time: number;
  servings: number;
  difficulty: string;
}

interface HistoryItem {
  id_recipe: number;
  created_at: string;
  resep: Recipe;
}

// --- Komponen Khusus untuk Gambar dengan Fallback ---
const ImageWithFallback = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src); // Reset image source when prop changes
    setError(false);
  }, [src]);

  return (
    <Image
      src={error ? '/logo.png' : imgSrc} // Jika error, ganti ke logo.png
      alt={alt}
      fill
      className={className}
      unoptimized={true} // Wajib: Matikan optimasi server untuk link eksternal
      onError={() => {
        setError(true); // Tandai error agar pindah ke fallback
        setImgSrc('/logo.png'); // Pastikan src berubah
      }}
    />
  );
};

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Redirect jika belum login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/'); 
    }
  }, [status, router]);

  // 2. Load History
  useEffect(() => {
    if (session?.user?.email) {
      loadHistory();
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [session, status]);

  const loadHistory = async () => {
    setLoading(true);
    try {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', session?.user?.email)
          .single();

        if (userData) {
          const { data: historyData } = await supabase
            .from('history')
            .select('id_recipe, created_at')
            .eq('id_user', userData.id)
            .order('created_at', { ascending: false });

          if (historyData && historyData.length > 0) {
            const recipeIds = historyData.map((h) => h.id_recipe);
            
            const { data: recipes } = await supabase
              .from('resep')
              .select('*')
              .in('id', recipeIds);

            if (recipes) {
              const combined = historyData.map((h) => ({
                id_recipe: h.id_recipe,
                created_at: h.created_at,
                resep: recipes.find((r) => r.id === h.id_recipe),
              })).filter(item => item.resep);

              setHistories(combined as any);
            }
          }
        }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Hapus semua riwayat?')) return;
    try {
       const { data: userData } = await supabase
       .from('users')
       .select('id')
       .eq('email', session?.user?.email)
       .single();
       
       if(userData) {
         await supabase.from('history').delete().eq('id_user', userData.id);
         setHistories([]);
       }
    } catch(err) {
        console.error(err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FE9412] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat riwayat...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <History className="w-6 h-6 text-[#FE9412]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Riwayat Terakhir</h1>
                <p className="text-sm text-gray-500">Resep yang baru saja Anda lihat</p>
              </div>
            </div>
            
            {histories.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Riwayat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {histories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <History className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada riwayat</h3>
            <p className="text-gray-500 mb-6">Mulai jelajahi resep untuk melihatnya di sini</p>
            <Link href="/" className="px-6 py-3 bg-[#FE9412] text-white rounded-xl hover:bg-[#e58510] transition font-medium">
              Cari Resep
            </Link>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {histories.map((item, index) => (
              <motion.div
                key={`${item.id_recipe}-${index}`}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                onClick={() => router.push(`/recipe/${item.resep.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition group"
              >
                <div className="relative h-48 bg-gray-100">
                  {/* --- MENGGUNAKAN KOMPONEN GAMBAR BARU (SAFE MODE) --- */}
                  <ImageWithFallback
                    src={item.resep.image_url}
                    alt={item.resep.title}
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                    {item.resep.difficulty}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FE9412] transition">
                    {item.resep.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.resep.cook_time} m
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {item.resep.servings} org
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}