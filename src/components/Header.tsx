'use client';

import { Menu, Send } from 'lucide-react'; 
import { motion } from 'framer-motion';
import Image from 'next/image';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">     
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#FE9412] text-white rounded-lg hover:bg-[#e58510] transition-colors font-medium"
            >
              <Send className="w-4 h-4" />
              <span>Buat Resep</span>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
