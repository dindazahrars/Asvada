// components/Sidebar.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, BookOpen, Heart, User, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    { icon: Home, label: 'Beranda', href: '/', requireAuth: false },
    { icon: BookOpen, label: 'Resep Saya', href: '/my-recipes', requireAuth: true },
    { icon: Heart, label: 'Favorit', href: '/favorites', requireAuth: true },
    { icon: User, label: 'Profil', href: '/profile', requireAuth: true }
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Asvada
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
            <nav className="p-4 flex-1">
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
                          <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded">
                            Login
                          </span>
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

            {/* User Profile */}
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
                        {session.user.email || 'user@asvada.com'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
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
  );
};

export default Sidebar;
