// components/Header.tsx
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User, Menu, Bell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from './Sidebar';

interface HeaderProps {
  onLoginClick?: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLoggedIn = status === 'authenticated';

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-3">
            {/* Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-orange-50 rounded-lg transition-colors group"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-700 group-hover:text-orange-600 transition-colors" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Asvada
              </span>
            </Link>
          </div>

          {/* Right: User Profile / Login */}
          <div className="flex items-center gap-3">
            {isLoggedIn && session?.user ? (
              <>
                {/* Notification Bell */}
                <button
                  className="p-2 hover:bg-orange-50 rounded-lg transition-colors relative group"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full ring-2 ring-orange-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold text-gray-800">
                        {session.user.name || 'User'}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        ✨ Unlimited Search
                      </p>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => signOut()}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
