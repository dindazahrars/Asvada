'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Clock, Users, ChefHat, Trash2, Bookmark } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const supabase = createSupabaseBrowser();

interface Recipe {
  id: number;
  title: string;
  image_url: string;
  cook_time: number;
  servings: number;
  difficulty: string;
  description: string;
}

interface FavoriteWithRecipe {
  id: number;
  id_recipe: number;
  created_at: string;
  resep: Recipe;
}

export default function FavoritesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteWithRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      if (session?.user?.email) {
        const { data } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single();
        
        if (data) {
          setCurrentUserId(data.id);
        }
      }
    };

    fetchUserId();
  }, [session]);

  useEffect(() => {
    if (currentUserId) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [currentUserId]);

  const loadFavorites = async () => {
    if (!currentUserId) return;

    setLoading(true);
    
    try {
      const { data: favoriteIds } = await supabase
        .from('favorite')
        .select('id, id_recipe, created_at')
        .eq('id_user', currentUserId)
        .order('created_at', { ascending: false });

      if (favoriteIds && favoriteIds.length > 0) {
        const recipeIds = favoriteIds.map(f => f.id_recipe);
        const { data: recipes } = await supabase
          .from('resep')
          .select('*')
          .in('id', recipeIds);

        if (recipes) {
          const combined = favoriteIds.map(fav => ({
            id: fav.id,
            id_recipe: fav.id_recipe,
            created_at: fav.created_at,
            resep: recipes.find(r => r.id === fav.id_recipe)
          }));

          setFavorites(combined as any);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (e: React.MouseEvent, favoriteId: number) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('favorite')
      .delete()
      .eq('id', favoriteId);

    if (!error) {
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Mudah';
      case 'medium': return 'Sedang';
      case 'hard': return 'Sulit';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FE9412] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Memuat favorit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Heart className="w-10 h-10 fill-current" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Resep Favorit</h1>
              <p className="text-orange-100 text-lg">
                {favorites.length} resep tersimpan • Koleksi resep pilihan Anda
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-2xl mx-auto border-2 border-orange-100">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-16 h-16 text-[#FE9412]" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Belum Ada Resep Favorit
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Mulai simpan resep favoritmu dengan klik tombol bookmark pada resep yang kamu suka
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white px-8 py-4 rounded-full hover:shadow-xl transition font-semibold text-lg"
              >
                <ChefHat className="w-6 h-6" />
                Jelajahi Resep
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {favorites.map((favorite) => {
              const recipe = favorite.resep;
              if (!recipe) return null;

              return (
                <motion.div
                  key={favorite.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  onClick={() => router.push(`/recipe/${recipe.id}`)}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group border border-gray-100"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={recipe.image_url}
                      alt={recipe.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => removeFavorite(e, favorite.id)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg z-10"
                      aria-label="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Difficulty Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
                        {getDifficultyText(recipe.difficulty)}
                      </span>
                    </div>

                    {/* Favorite Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-[#902E2B] text-white p-2 rounded-full shadow-lg">
                        <Bookmark className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FE9412] transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {recipe.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.cook_time} menit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} porsi</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {new Date(favorite.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      <span className="text-[#FE9412] hover:text-[#902E2B] font-medium text-sm transition">
                        Lihat →
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Stats Section */}
      {favorites.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-orange-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-[#FE9412] mb-2">
                  {favorites.length}
                </div>
                <div className="text-gray-600">Total Resep Favorit</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#902E2B] mb-2">
                  {favorites.filter(f => f.resep?.difficulty === 'easy').length}
                </div>
                <div className="text-gray-600">Resep Mudah</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  {Math.round(favorites.reduce((acc, f) => acc + (f.resep?.cook_time || 0), 0) / favorites.length) || 0}
                </div>
                <div className="text-gray-600">Rata-rata Waktu (menit)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}