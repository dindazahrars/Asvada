'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Chrome, Sparkles } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchCount: number;
  maxSearches: number;
}

const LoginModal = ({ isOpen, onClose, searchCount, maxSearches }: LoginModalProps) => {
  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Login ke Asvada
            </h2>
            <p className="text-gray-600">
              Kamu sudah menggunakan <span className="font-bold text-orange-600">{searchCount}/{maxSearches}</span> pencarian gratis
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 mb-6">
            <p className="font-semibold text-gray-800 mb-2">✨ Keuntungan Login:</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>🔓 Unlimited pencarian resep</li>
              <li>💾 Simpan resep favorit</li>
              <li>📝 Buat meal plan personal</li>
              <li>🎯 Rekomendasi yang lebih akurat</li>
            </ul>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-md"
          >
            <Chrome className="w-5 h-5" />
            Login dengan Google
          </button>

          {/* Register Link */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;
