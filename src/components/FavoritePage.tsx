'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2, ChefHat, Flame, Zap, Award, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface Recipe {
  id: string;
  favoriteId: string;
  name: string;
  image: string;
  slug: string;
  calories: number;
  proteins: number;
  fat: number;
  carbohydrate: number;
  savedAt: string;
  source: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      loadFavorites();
    }
  }, [status, router]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      console.log('📡 Loading favorites...');
      
      const response = await fetch('/api/favorites');
      const data = await response.json();

      console.log('✅ Favorites Response:', data);

      if (data.success) {
        setFavorites(data.data);
        console.log('❤️ Total favorites:', data.data.length);
      } else {
        console.error('❌ Failed to load favorites:', data.message);
        if (data.error) {
          console.error('Error details:', data.error);
        }
      }
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (recipeId: string) => {
    if (!confirm('Hapus dari favorit?')) return;

    setRemoving(recipeId);
    
    try {
      console.log('🗑️ Removing favorite:', recipeId);
      
      const response = await fetch(`/api/favorites?recipeId=${recipeId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      console.log('✅ Remove Response:', data);

      if (response.ok) {
        setFavorites(prev => prev.filter(f => f.id !== recipeId));
      } else {
        alert(data.message || 'Gagal menghapus favorit');
      }
    } catch (error) {
      console.error('❌ Error removing favorite:', error);
      alert('Terjadi kesalahan');
    } finally {
      setRemoving(null);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    router.push(`/recipes/dataset/${recipe.slug}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Memuat favorit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white">
              <Heart className="w-6 h-6 fill-current" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            ❤️ Resep Favorit Saya
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Koleksi resep yang telah Anda simpan
          </p>

          <div className="mt-6">
            <span className="px-4 py-2 bg-white rounded-full text-gray-600 text-sm font-semibold shadow-md">
              {favorites.length} resep tersimpan
            </span>
          </div>
        </motion.div>

        {/* Empty State */}
        {favorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Belum Ada Favorit
            </h3>
            <p className="text-gray-600 mb-8">
              Mulai simpan resep favorit Anda dengan klik ikon ❤️
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
            >
              Jelajahi Resep
            </button>
          </motion.div>
        )}

        {/* Favorites Grid */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                    <div 
                      onClick={() => handleRecipeClick(recipe)} 
                      className="cursor-pointer w-full h-full"
                    >
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(recipe.id);
                      }}
                      disabled={removing === recipe.id}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-red-500 hover:text-white transition-all z-10 group/btn disabled:opacity-50"
                    >
                      {removing === recipe.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-red-500 group-hover/btn:text-white" />
                      )}
                    </button>

                    {/* Source Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold">
                        📊 Dataset
                      </span>
                    </div>

                    {/* Calories Badge */}
                    {recipe.calories > 0 && (
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold flex items-center gap-1 z-10">
                        <Flame className="w-3 h-3" />
                        {recipe.calories} kal
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div 
                      onClick={() => handleRecipeClick(recipe)} 
                      className="cursor-pointer"
                    >
                      <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors capitalize">
                        {recipe.name}
                      </h3>
                    </div>

                    {/* Nutrition Info */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Protein</div>
                        <div className="text-sm font-bold text-blue-600">{recipe.proteins}g</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Lemak</div>
                        <div className="text-sm font-bold text-yellow-600">{recipe.fat}g</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Karbo</div>
                        <div className="text-sm font-bold text-green-600">{recipe.carbohydrate}g</div>
                      </div>
                    </div>

                    {/* Saved Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 rounded-lg p-2">
                      <Calendar className="w-3 h-3" />
                      <span>Disimpan: {formatDate(recipe.savedAt)}</span>
                    </div>

                    {/* View Button */}
                    <button 
                      onClick={() => handleRecipeClick(recipe)}
                      className="mt-auto w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-4 h-4" />
                      Lihat Resep
                    </button>
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
