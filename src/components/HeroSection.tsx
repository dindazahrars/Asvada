'use client';

import { useState, useEffect } from 'react';
import { Send, ChevronDown, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface FilterOption {
  id: string;
  label: string;
  options: string[];
}

interface HeroSectionProps {
  onSearch: (query: string, filters: Record<string, string[]>) => void;
  searchCount?: number;
  maxSearches?: number;
  isLoggedIn?: boolean;
}

const HeroSection = ({ 
  onSearch, 
  searchCount = 0, 
  maxSearches = 3, 
  isLoggedIn = false 
}: HeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  const placeholderSuggestions = [
    "Ceritain dulu kamu pengen makan apa…",
    "Pengen makan yang hangat dan berkuah...",
    "Lagi pengen dessert manis nih...",
    "Butuh makanan yang cepat dan mudah...",
    "Pengen masak yang sehat dan bergizi...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % placeholderSuggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filterOptions: FilterOption[] = [
    {
      id: 'category',
      label: 'Kategori',
      options: ['Makanan Ringan', 'Makanan Berat', 'Dessert', 'Minuman', 'Sarapan']
    },
    {
      id: 'taste',
      label: 'Rasa',
      options: ['Manis', 'Asin', 'Pedas', 'Asam', 'Gurih']
    },
    {
      id: 'sugar',
      label: 'Gula',
      options: ['Tanpa Gula', 'Gula Rendah', 'Gula Sedang', 'Gula Tinggi']
    },
    {
      id: 'calories',
      label: 'Kalori',
      options: ['<200 kal', '200-500 kal', '>500 kal']
    },
    {
      id: 'difficulty',
      label: 'Tingkat Kesulitan',
      options: ['Mudah', 'Sedang', 'Sulit']
    },
    {
      id: 'time',
      label: 'Waktu Memasak',
      options: ['<30 menit', '30-60 menit', '>60 menit']
    },
  ];

  const toggleFilter = (filterId: string, option: string) => {
    setSelectedFilters(prev => {
      const current = prev[filterId] || [];
      const updated = current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option];
      
      return updated.length > 0 
        ? { ...prev, [filterId]: updated }
        : Object.fromEntries(Object.entries(prev).filter(([key]) => key !== filterId));
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim() && Object.keys(selectedFilters).length === 0) {
      return;
    }
    onSearch(searchQuery, selectedFilters);
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
  };

  const totalFiltersCount = Object.values(selectedFilters).flat().length;
  const searchesLeft = maxSearches - searchCount;

  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-4xl sm:text-6xl opacity-20 pointer-events-none">🍳</div>
      <div className="absolute bottom-10 right-10 text-4xl sm:text-6xl opacity-20 pointer-events-none">🍽️</div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center mb-6"
          >
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
              <Image
                src="/logo1.png" 
                alt="Asvada Logo"
                width={192}
                height={192}
                priority
              />
            </div>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Welcome to <span className="text-[#902E2B]">Asvada</span>! 
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Mau masak apa hari ini? 🤔
          </p>
        </motion.div>

        {/* Search Counter Badge */}
        {!isLoggedIn && searchesLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-4"
          >
            <div className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-md border
              ${searchesLeft === 1 
                ? 'bg-orange-50 border-orange-300' 
                : 'bg-white border-orange-200'
              }
            `}>
              <Sparkles className={`w-4 h-4 ${searchesLeft === 1 ? 'text-orange-600' : 'text-orange-500'}`} />
              <span className="text-sm font-semibold text-gray-700">
                Pencarian gratis:{' '}
                <span className={`${searchesLeft === 1 ? 'text-orange-600' : 'text-green-600'}`}>
                  {searchesLeft} tersisa
                </span>
              </span>
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <div className="relative">
            <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FE9412] w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={placeholderSuggestions[currentPlaceholder]}
              className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FE9412] focus:border-transparent text-gray-700 shadow-lg transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#FE9412] text-white p-3 rounded-xl hover:bg-[#e58510] transition-colors shadow-md"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Filter Buttons - COMPLETELY FIXED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          {/* Filter Container dengan spacing yang konsisten */}
          <div className="flex flex-wrap items-center gap-3">
            {filterOptions.map((filter) => {
              const selectedCount = selectedFilters[filter.id]?.length || 0;
              return (
                <div key={filter.id} className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === filter.id ? null : filter.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-medium text-sm whitespace-nowrap
                      ${selectedCount > 0
                        ? 'bg-[#FE9412] text-white border-[#FE9412] shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#FE9412] hover:shadow-sm'
                      }
                    `}
                  >
                    <span>{filter.label}</span>
                    {selectedCount > 0 && (
                      <span className="bg-white text-[#FE9412] text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {selectedCount}
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      openDropdown === filter.id ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {openDropdown === filter.id && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-[45]"
                          onClick={() => setOpenDropdown(null)}
                        />
                        
                        {/* Dropdown Content */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-100 p-3 min-w-[220px] max-h-[300px] overflow-y-auto z-50"
                        >
                          {filter.options.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-3 p-2.5 hover:bg-orange-50 rounded-lg cursor-pointer transition-colors group"
                            >
                              <input
                                type="checkbox"
                                checked={selectedFilters[filter.id]?.includes(option) || false}
                                onChange={() => toggleFilter(filter.id, option)}
                                className="w-4 h-4 text-[#FE9412] border-gray-300 rounded focus:ring-[#FE9412] cursor-pointer"
                              />
                              <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                                {option}
                              </span>
                            </label>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Clear Filters Button */}
          {totalFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-center"
            >
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-[#902E2B] hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Hapus semua filter ({totalFiltersCount})</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
