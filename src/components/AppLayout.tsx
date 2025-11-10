// components/AppLayout.tsx
'use client';

import { useState, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { LogOut, User, Menu, Bell, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: ReactNode;
  showLoginModal?: boolean;
  setShowLoginModal?: (show: boolean) => void;
  showCreateButton?: boolean;
}

export default function AppLayout({ 
  children, 
  showLoginModal = false, 
  setShowLoginModal,
  showCreateButton = false
}: AppLayoutProps) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  
  const isLoggedIn = status === 'authenticated';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Asvada
              </span>
            </div>
          </div>

          {/* Right: Buttons + User Profile */}
          <div className="flex items-center gap-3">
            {isLoggedIn && session?.user ? (
              <>
                {/* Create Recipe Button - Conditional */}
                {showCreateButton && (
                  <button
                    onClick={() => router.push('/recipes/create=')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Buat Resep Baru</span>
                  </button>
                )}

                {/* Notification Bell */}
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
                onClick={() => setShowLoginModal && setShowLoginModal(true)}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-20">
        {children}
      </main>

      <Footer />

      {showLoginModal && setShowLoginModal && (
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          searchCount={0}
          maxSearches={3}
        />
      )}
    </div>
  );
}
