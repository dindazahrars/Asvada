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

interface HeroSectionProps {
  onSearch: (query: string, filters: Record<string, string[]>) => void;
  searchCount?: number;
  maxSearches?: number;
  isLoggedIn?: boolean;
  setSearchData: (data: SearchData) => void;
}

const HeroSection = ({ 
  onSearch, 
  setSearchData,
  searchCount = 0, 
  maxSearches = 3, 
  isLoggedIn = false, 
}: HeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [filterValue, setFilterValue] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const placeholderSuggestions = [
    "Ceritain dulu kamu pengen makan apa…",
    "Pengen makan yang pedas dan berlemak...",
    "Lagi pengen dessert manis nih...",
    "Butuh makanan enak tapi rendah lemak...",
    "Pengen masak bumbu asam manis...",
  ];

  const FILTER_INDEX_MAP: Record<string, number> = { 
    manis: 0, 
    asam: 1, 
    asin: 2, 
    pahit: 3, 
    umami: 4, 
    pedas: 5, 
    sepat: 6, 
    berlemak: 7, 
    protein: 8, 
    lemak: 9, 
    karbo: 10, 
    kalori: 11, 
    nutrisi_flag: 12, 
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % placeholderSuggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filterOptions: FilterOption[] = [
    {
      id: 'taste',
      label: 'Rasa',
      options: ['Manis', 'Asam', 'Asin', 'Pahit', 'Gurih', 'Pedas', 'Sepat', 'Berlemak']
    },
    {
      id: 'protein',
      label: 'Protein',
      options: ['Rendah', 'Sedang', 'Tinggi']
    },
    {
      id: 'lemak',
      label: 'Lemak',
      options: ['Rendah', 'Sedang', 'Tinggi']
    },
    {
      id: 'karbo',
      label: 'Karbohidrat',
      options: ['Rendah', 'Sedang', 'Tinggi']
    },
    {
      id: 'calories',
      label: 'Kalori',
      options: ['Rendah', 'Sedang', 'Tinggi']
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
  
  const translateFiltersToArray = (filters: Record<string, string[]>) => {
    const result = [0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, 0];

    (filters.taste || []).forEach((rasa) => {
      const key = rasa.toLowerCase();
      if (FILTER_INDEX_MAP[key] !== undefined) {
        result[FILTER_INDEX_MAP[key]] = 1;
      }
    });

    const toNum = (val?: string) =>
      val === 'Rendah' ? 0 :
      val === 'Sedang' ? 0.5 :
      val === 'Tinggi' ? 1 : -1;

    const rangeCategories = ['lemak', 'protein', 'karbo', 'calories'];

    rangeCategories.forEach((cat) => {
      const value = filters[cat]?.[0];
      if (value) {
        const mappedKey = cat === 'calories' ? 'kalori' : cat;
        result[FILTER_INDEX_MAP[mappedKey]] = toNum(value);
      }
    });

    const hasRangeValue = rangeCategories.some((cat) => {
      const mappedKey = cat === 'calories' ? 'kalori' : cat;
      const idx = FILTER_INDEX_MAP[mappedKey];
      return result[idx] !== -1;
    });

    if (hasRangeValue) {
      result[FILTER_INDEX_MAP['nutrisi_flag']] = 1;
    }

    return result;
  };

  useEffect(() => {
    setFilterValue(translateFiltersToArray(selectedFilters));
  }, [selectedFilters]);

  const filterModel = async(ids: string) => {
    const data = await fetch(`http://localhost:3000/api/${ids}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({"data": ids === "modelDirect" ? filterValue : searchQuery})
    });
    const res = await data.json();
    if (data.ok) {
      setSearchData(res);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      if (Object.keys(selectedFilters).length !== 0) {
        setLoading(true);
        filterModel("modelDirect");
        return;
      }
      return;
    }
    setLoading(true);
    onSearch(searchQuery, selectedFilters);
    filterModel("modelUndirect");
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setSearchData({ data: [] });
  };

  const totalFiltersCount = Object.values(selectedFilters).flat().length;
  const searchesLeft = maxSearches - searchCount;

  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-4xl sm:text-6xl opacity-20 pointer-events-none">🍳</div>
      <div className="absolute bottom-10 right-10 text-4xl sm:text-6xl opacity-20 pointer-events-none">🍽️</div>

      <div className="max-w-4xl mx-auto relative">
        <p className={`text-green-800 absolute left-1/2 transform -translate-x-1/2 bottom-1/3 bg-emerald-400/30 py-5 px-10 rounded-lg backdrop-blur-xs text-4xl font-bold ${loading ? "block" : "hidden"}`}>
          Loading...
        </p>
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

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex justify-center"
        >
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
        </motion.div>

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
      </div>
    </section>
  );
};

export default HeroSection;
