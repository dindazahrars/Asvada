'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Clock, Users, ChefHat, Heart, RefreshCw } from 'lucide-react';

interface Recipe {
  id: number;
  title: string;
  image_url: string | null;
  cook_time: number;
  servings: number;
  difficulty: string;
  description: string;
}

export default function FavoritePage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (session?.user?.email) {
      loadFavorites();
    }
  }, [session, status]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      // 1. Ambil ID User
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', session?.user?.email)
        .single();

      if (!userData) return;

      // 2. Ambil data Favorit dengan Join ke tabel Resep
      // MENGGUNAKAN resep (*) agar lebih aman mendeteksi relasi
      const { data, error } = await supabase
        .from('favorite')
        .select(`
          id_recipe,
          resep (*) 
        `)
        .eq('id_user', userData.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }

      // 3. Mapping data & Filter yang valid saja
      const validRecipes = data
        .map((item: any) => item.resep) // Ambil object resepnya
        .filter((r: any) => r !== null && r !== undefined); // Pastikan resepnya ada (tidak null)

      setFavorites(validRecipes);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (e: React.MouseEvent, recipeId: number) => {
    e.stopPropagation();
    
    if (!confirm('Hapus dari favorit?')) return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', session?.user?.email)
        .single();

      if (userData) {
        const { error } = await supabase
          .from('favorite')
          .delete()
          .eq('id_user', userData.id)
          .eq('id_recipe', recipeId);

        if (!error) {
          // Update state langsung agar UI responsif tanpa reload
          setFavorites(prev => prev.filter(r => r.id !== recipeId));
        }
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FE9412] mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat favorit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-[#FE9412] fill-current" />
            <h1 className="text-3xl font-bold text-gray-900">Resep Favorit Saya</h1>
          </div>
          <button 
            onClick={loadFavorites} 
            className="p-2 text-gray-500 hover:text-[#FE9412] hover:bg-orange-50 rounded-full transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-orange-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada favorit</h3>
            <p className="text-gray-500 mb-6">Simpan resep yang kamu suka disini!</p>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-[#FE9412] text-white rounded-xl hover:bg-[#e08310] transition"
            >
              Cari Resep
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                onClick={() => router.push(`/recipe/${recipe.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-md transition-all"
              >
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={recipe.image_url || '/logo.png'}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={true} // FIX: Agar gambar selalu muncul
                  />
                  <button
                    onClick={(e) => removeFavorite(e, recipe.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm z-10"
                    title="Hapus dari favorit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty || 'Medium'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-[#FE9412] transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                    {recipe.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{recipe.cook_time}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{recipe.servings} porsi</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
