'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, BookOpen, Heart, User, Settings, ChefHat, Coffee, Utensils } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [activeMenu, setActiveMenu] = useState('Beranda');

  const menuItems = [
    { icon: Home, label: 'Beranda', href: '/' },
    { icon: BookOpen, label: 'Resep Saya', href: '/my-recipes' },
    { icon: Heart, label: 'Favorit', href: '/favorites' },
    { icon: ChefHat, label: 'Chef Populer', href: '/chefs' },
    { icon: Coffee, label: 'Minuman', href: '/drinks' },
    { icon: Utensils, label: 'Makanan', href: '/foods' },
    { icon: User, label: 'Profil', href: '/profile' },
    { icon: Settings, label: 'Pengaturan', href: '/settings' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
q                <span className="text-2xl font-bold text-[#902E2B]">Asvada</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = activeMenu === item.label;
                  return (
                    <li key={item.label}>
                      <motion.a
                        href={item.href}
                        onClick={() => setActiveMenu(item.label)}
                        whileHover={{ x: 4 }}
                        className={`
                          flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                          ${isActive 
                            ? 'bg-[#FE9412] text-white shadow-md' 
                            : 'text-gray-700 hover:bg-orange-50 hover:text-[#FE9412]'
                          }
                        `}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </motion.a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User Profile */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FE9412] to-[#902E2B] rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Guest User</p>
                  <p className="text-xs text-gray-500">guest@asvada.com</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;