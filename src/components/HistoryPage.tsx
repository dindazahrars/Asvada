'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { History, Trash2, Calendar, Search, BookOpen, Clock, Users } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// IMPORT MODAL (Pastikan path-nya benar)
import ModalRecipeDetail from './ModalRecipeDetail';

const supabase = createSupabaseBrowser();

interface HistoryItem {
  uniqueId: string;
  type: 'local' | 'dataset';
  id: number;
  title: string;
  image_url: string | null;
  date: string;
  details?: {
    difficulty?: string;
    cook_time?: number;
    servings?: number;
  };
  full_detail?: any; // Data lengkap dataset dari backend
}

const ImageWithFallback = ({ src, alt, className }: { src: string | null, alt: string, className?: string }) => {
  const [imgSrc, setImgSrc] = useState<string>(src || '/logo.png');
  const [error, setError] = useState(false);
  useEffect(() => { setImgSrc(src || '/logo.png'); setError(false); }, [src]);
  return <Image src={error ? '/logo.png' : imgSrc} alt={alt} fill className={className} unoptimized={true} onError={() => { setError(true); setImgSrc('/logo.png'); }} />;
};

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // STATE UNTUK MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<any>(null);

  // 1. Cek Login & Load Data
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
    if (session?.user?.email) loadCombinedHistory();
  }, [session, status]);

  // 2. FETCH DATA DARI API BACKEND
  const loadCombinedHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json();

      if (res.ok && json.data) {
        const rawData = json.data as HistoryItem[];

        // --- LOGIKA FILTERING DUPLIKASI ---
        // Kita menggunakan Set untuk menyimpan judul yang sudah muncul.
        // Karena data dari API sudah urut waktu (Terbaru -> Terlama),
        // kemunculan pertama adalah yang paling baru.
        
        const uniqueHistories: HistoryItem[] = [];
        const seenTitles = new Set<string>();

        rawData.forEach((item) => {
          // Normalisasi judul (lowercase & trim) agar akurat
          const normalizedTitle = item.title.trim().toLowerCase();

          if (!seenTitles.has(normalizedTitle)) {
            // Jika judul belum pernah dilihat, simpan ke list hasil
            uniqueHistories.push(item);
            // Tandai judul ini sudah dilihat
            seenTitles.add(normalizedTitle);
          }
          // Jika judul sudah ada di Set, berarti ini history lama -> Skip.
        });

        setHistories(uniqueHistories);
      } else {
        console.error("❌ Gagal load history dari API:", json.error);
      }
    } catch (error) {
      console.error('❌ Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Hapus SEMUA riwayat (Lokal & AI)?')) return;
    try {
       const { data: userData } = await supabase.from('users').select('id').eq('email', session?.user?.email).single();
       if(userData) {
         await Promise.all([
             supabase.from('history').delete().eq('id_user', userData.id),
             supabase.from('history_ai').delete().eq('user_id', userData.id)
         ]);
         setHistories([]);
       }
    } catch(err) { console.error(err); }
  };

  // 3. HANDLE KLIK ITEM
  const handleItemClick = (item: HistoryItem) => {
    if (item.type === 'local') {
      // Jika Resep Aplikasi -> Pindah Halaman
      router.push(`/recipe/${item.id}`);
    } else {
      // Jika Resep Dataset AI -> Buka Modal
      const dbData = item.full_detail || {};
      
      // Mapping data DB agar sesuai format ModalRecipeDetail
      const modalData = {
        "Title": item.title,
        "image_url": item.image_url,
        "Category": "Dataset AI",
        "URL": "#", 
        "Loves": 0,
        
        // Data Bahan & Langkah
        "Ingredients Cleaned": dbData.ingredients_cleaned || "", 
        "Steps": dbData.steps || "Tidak ada langkah tersedia.",
        
        // Hitung statistik
        "Total Steps": dbData.steps ? dbData.steps.split('\n').length : 0,
        "Total Ingredients": dbData.ingredients_cleaned ? dbData.ingredients_cleaned.split(',').length : 0
      };

      setSelectedRecipeForModal(modalData);
      setIsModalOpen(true);
    }
  };

  if (loading) return (
     <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Memuat riwayat...</p>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pb-12">
      
      {/* --- POP-UP MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <ModalRecipeDetail 
            open={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            recipe={selectedRecipeForModal} 
          />
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg"><History className="text-orange-600"/></div>
              <div>
                  <h1 className="text-2xl font-bold text-gray-900">Riwayat Aktivitas</h1>
                  <p className="text-sm text-gray-500">Resep Aplikasi & Pencocokan AI</p>
              </div>
            </div>
            {histories.length > 0 && (
                <button onClick={clearHistory} className="text-red-500 flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 rounded-lg transition text-sm font-medium">
                    <Trash2 size={16} /> Hapus Semua
                </button>
            )}
        </div>
      </div>

      {/* LIST ITEM */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {histories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
             <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
             <p className="text-gray-500 font-medium">Belum ada riwayat aktivitas.</p>
             <p className="text-gray-400 text-sm mb-4">Buka resep untuk mencatat history.</p>
             <Link href="/" className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition">
                Mulai Jelajah Resep
             </Link>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {histories.map((item) => (
              <motion.div
                key={item.uniqueId}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group cursor-pointer"
                onClick={() => handleItemClick(item)} // <-- PANGGIL FUNGSI KLIK
              >
                {/* GAMBAR */}
                <div className="relative h-48 bg-gray-100">
                  <ImageWithFallback src={item.image_url} alt={item.title} className="object-cover group-hover:scale-105 transition duration-500" />
                  
                  {/* BADGE TIPE */}
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm flex items-center gap-1 ${
                      item.type === 'local' ? 'bg-orange-500' : 'bg-blue-600'
                  }`}>
                    {item.type === 'local' ? <BookOpen size={10} /> : <Search size={10} />}
                    {item.type === 'local' ? 'Resep App' : 'Dataset AI'}
                  </div>
                </div>

                {/* INFO TEXT */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 capitalize h-10 text-sm md:text-base leading-tight">
                    {item.title}
                  </h3>
                  
                  {/* Info Khusus Dataset */}
                  {item.type === 'dataset' && (
                       <p className="text-[10px] text-blue-600 mb-3 bg-blue-50 px-2 py-1 rounded inline-block font-medium">
                          Klik untuk Detail AI
                       </p>
                  )}

                  {/* Info Khusus Local */}
                  {item.type === 'local' && item.details && (
                      <div className="flex gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><Clock size={12}/> {item.details.cook_time}m</span>
                          <span className="flex items-center gap-1"><Users size={12}/> {item.details.servings}org</span>
                      </div>
                  )}
                  
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-auto border-t pt-3">
                    <Calendar size={10} />
                    {new Date(item.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
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