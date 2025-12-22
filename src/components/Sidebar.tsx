'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, BookOpen, Heart, User, History, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// IMPORT MODAL
import ModalRecipeDetail from './ModalRecipeDetail';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Interface Data History (Sama seperti HistoryPage)
interface HistoryItem {
  uniqueId: string;
  type: 'local' | 'dataset';
  id: number;
  title: string;
  image_url: string | null;
  date: string;
  full_detail?: any; 
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // State untuk History & Modal
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<any>(null);

  const menuItems = [
    { icon: Home, label: 'Beranda', href: '/', requireAuth: false },
    { icon: BookOpen, label: 'Resep Saya', href: '/my-recipes', requireAuth: true },
    { icon: Heart, label: 'Favorit', href: '/favorites', requireAuth: true },
    { icon: History, label: 'Riwayat Penuh', href: '/history', requireAuth: true },
    { icon: User, label: 'Profil', href: '/profile', requireAuth: true }
  ];

  // 1. FETCH HISTORY SAAT SIDEBAR DIBUKA
  useEffect(() => {
    if (isOpen && session?.user) {
      fetchHistory();
    }
  }, [isOpen, session]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/history');
      const json = await res.json();
      
      if (res.ok && json.data) {
        const rawData = json.data as HistoryItem[];

        // LOGIKA FILTERING (UNIK JUDUL) - Sama seperti HistoryPage
        const uniqueHistories: HistoryItem[] = [];
        const seenTitles = new Set<string>();

        rawData.forEach((item) => {
          const normalizedTitle = item.title.trim().toLowerCase();
          if (!seenTitles.has(normalizedTitle)) {
            uniqueHistories.push(item);
            seenTitles.add(normalizedTitle);
          }
        });

        // Ambil 5 Teratas saja untuk Sidebar
        setRecentHistory(uniqueHistories.slice(0, 5));
      }
    } catch (error) {
      console.error("Gagal load history sidebar", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 2. HANDLE KLIK HISTORY ITEM
  const handleHistoryClick = (item: HistoryItem) => {
    // Tutup sidebar dulu (opsional, tergantung preferensi UX)
    // onClose(); 

    if (item.type === 'local') {
      router.push(`/recipe/${item.id}`);
      onClose(); // Tutup sidebar jika pindah halaman
    } else {
      // BUKA MODAL (Sama seperti HistoryPage)
      const dbData = item.full_detail || {};
      const modalData = {
        "Title": item.title,
        "image_url": item.image_url,
        "Category": "Dataset AI",
        "URL": "#",
        "Loves": 0,
        "Ingredients Cleaned": dbData.ingredients_cleaned || "", 
        "Steps": dbData.steps || "Tidak ada langkah tersedia.",
        "Total Steps": dbData.steps ? dbData.steps.split('\n').length : 0,
        "Total Ingredients": dbData.ingredients_cleaned ? dbData.ingredients_cleaned.split(',').length : 0
      };
      setSelectedRecipeForModal(modalData);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* --- MODAL POPUP (Dirender di luar aside agar z-index aman) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <ModalRecipeDetail 
            open={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            recipe={selectedRecipeForModal} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 overflow-y-auto flex flex-col no-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    <Image
                      src="/logo.png" 
                      alt="Asvada Logo"
                      width={100}
                      height={100}
                      priority
                      className="object-contain"
                    />
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="p-4 flex-none">
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const isDisabled = item.requireAuth && !session;
                    
                    return (
                      <li key={item.label}>
                        {isDisabled ? (
                          <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed opacity-50">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                            <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded">Login</span>
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={`
                              flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                              ${isActive 
                                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md' 
                                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                              }
                            `}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* --- SECTION QUICK HISTORY --- */}
              {session?.user && (
                <div className="px-6 py-4 border-t border-gray-100 flex-1 overflow-y-auto">
                   <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Terakhir Dilihat</h3>
                      {loadingHistory && <Loader2 className="w-3 h-3 text-orange-500 animate-spin"/>}
                   </div>

                   <div className="space-y-1">
                      {!loadingHistory && recentHistory.length === 0 && (
                          <p className="text-xs text-gray-400 italic">Belum ada riwayat.</p>
                      )}

                      {recentHistory.map((item) => (
                        <button
                          key={item.uniqueId}
                          onClick={() => handleHistoryClick(item)}
                          className="w-full text-left group flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                           <div className="w-1.5 h-1.5 rounded-full bg-orange-200 group-hover:bg-orange-500 transition-colors shrink-0"></div>
                           <span className="text-sm text-gray-600 group-hover:text-orange-700 truncate font-medium">
                              {item.title}
                           </span>
                           {/* Indikator Tipe (Opsional) */}
                      
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {/* User Profile Footer */}
              <div className="p-4 border-t border-gray-100 bg-gradient-to-br from-orange-50 to-amber-50 shrink-0">
                {session?.user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-xl cursor-pointer transition-colors shadow-sm mb-2">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full ring-2 ring-orange-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                          {session.user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {session.user.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        signOut();
                        onClose();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-xl cursor-pointer transition-colors shadow-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                      G
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">Guest User</p>
                      <p className="text-xs text-gray-500 truncate">Silakan login</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;