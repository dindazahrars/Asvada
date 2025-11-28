'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface SearchLimitBannerProps {
  searchesLeft: number;
  maxSearches: number;
  onLoginClick: () => void;
}

const SearchLimitBanner = ({ searchesLeft, onLoginClick }: SearchLimitBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  console.log('🚨 Banner render:', { searchesLeft, isVisible });

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`
          fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] max-w-md w-full mx-4
          ${searchesLeft === 0 ? 'bg-red-500' : 'bg-orange-500'}
          text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3
        `}
      >
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">
            {searchesLeft === 0 
              ? 'Pencarian gratis habis!' 
              : `Sisa ${searchesLeft} pencarian!`
            }
          </p>
          <p className="text-sm opacity-90">
            Login untuk lanjut mencari resep
          </p>
        </div>
        <button
          onClick={onLoginClick}
          className="bg-white text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          Login
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchLimitBanner;
