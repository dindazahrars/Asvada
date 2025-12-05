'use client';

import { motion } from 'framer-motion';
import { ChefHat, Heart, Loader2, Flame, Zap, TrendingUp, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Recipe {
  id: number | string;
  name: string;
  image: string;
  slug: string;
  calories: number;
  proteins: number;
  fat: number;
  carbohydrate: number;
  source: 'dataset';
}

interface RecommendedSectionProps {
  searchData?: any;
}

const RecommendedSection = ({ searchData }: RecommendedSectionProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentLimit, setCurrentLimit] = useState(8);
  const [savingFavorite, setSavingFavorite] = useState<string | null>(null);

  // Load favorites from API if logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadFavorites();
    } else if (status === 'unauthenticated') {
      // Load from localStorage for guest users
      const saved = localStorage.getItem('favorites');
      if (saved) {
        try {
          setFavorites(new Set(JSON.parse(saved)));
          console.log('💾 Loaded favorites from localStorage:', JSON.parse(saved));
        } catch (e) {
          console.error('Error loading favorites:', e);
        }
      }
    }
  }, [session, status]);

  const loadFavorites = async () => {
    try {
      console.log('📡 Loading favorites from API...');
      
      const response = await fetch('/api/favorites');
      const data = await response.json();
      
      console.log('✅ API Response:', data);
      
      if (data.success) {
        // PENTING: Gunakan id dari recipe, bukan favoriteId
        const favoriteIds = data.data.map((f: any) => String(f.id));
        console.log('❤️ Favorite IDs:', favoriteIds);
        setFavorites(new Set(favoriteIds));
      } else {
        console.error('❌ Failed to load favorites:', data.message);
      }
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
    }
  };

  useEffect(() => {
    if (searchData?.data) {
      setRecipes(searchData.data);
      setDisplayedRecipes(searchData.data.slice(0, currentLimit));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [searchData]);

  useEffect(() => {
    setDisplayedRecipes(recipes.slice(0, currentLimit));
  }, [currentLimit, recipes]);

  const toggleFavorite = async (recipeId: string | number) => {
    const id = String(recipeId);
    
    console.log('🔍 Toggle favorite:', {
      recipeId: id,
      isLoggedIn: !!session?.user,
      currentFavorites: Array.from(favorites)
    });
    
    if (!session?.user) {
      // Guest user - use localStorage
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(id)) {
          newFavorites.delete(id);
        } else {
          newFavorites.add(id);
        }
        localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)));
        console.log('💾 Saved to localStorage:', Array.from(newFavorites));
        return newFavorites;
      });
      return;
    }

    // Logged in user - use API
    setSavingFavorite(id);
    
    try {
      const isFavorited = favorites.has(id);
      
      console.log('📡 API Request:', {
        action: isFavorited ? 'DELETE' : 'POST',
        recipeId: id
      });
      
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?recipeId=${id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        console.log('✅ DELETE Response:', data);
        
        if (response.ok) {
          setFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(id);
            return newFavorites;
          });
        } else {
          alert(data.message || 'Gagal menghapus favorit');
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeId: id })
        });
        
        const data = await response.json();
        console.log('✅ POST Response:', data);
        
        if (response.ok) {
          setFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.add(id);
            return newFavorites;
          });
        } else {
          alert(data.message || 'Gagal menyimpan favorit');
        }
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      alert('Gagal menyimpan favorit. Silakan coba lagi.');
    } finally {
      setSavingFavorite(null);
    }
  };

  const handleLoadMore = () => setCurrentLimit(prev => prev + 8);
  const handleRecipeClick = (recipe: Recipe) => router.push(`/recipes/dataset/${recipe.slug}`);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Memuat rekomendasi...</p>
          </div>
        </div>
      </section>
    );
  }

  if (recipes.length === 0) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center py-20">
            <ChefHat className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Tidak ada rekomendasi</h3>
            <p className="text-gray-600">Belum ada resep yang tersedia</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <ChefHat className="w-6 h-6" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🍽️ Rekomendasi Resep Sehat
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pilihan resep terbaik dari dataset dengan informasi nutrisi lengkap
          </p>

          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award className="w-4 h-4 text-purple-500" />
              <span>{recipes.length} resep tersedia</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Informasi kalori lengkap</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Data nutrisi akurat</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                  <div onClick={() => handleRecipeClick(recipe)} className="cursor-pointer w-full h-full">
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
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recipe.id);
                    }}
                    disabled={savingFavorite === String(recipe.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all z-10 disabled:opacity-50"
                  >
                    {savingFavorite === String(recipe.id) ? (
                      <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                    ) : (
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          favorites.has(String(recipe.id))
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-600'
                        }`}
                      />
                    )}
                  </button>

                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold">
                      📊 Dataset
                    </span>
                  </div>

                  {recipe.calories > 0 && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold flex items-center gap-1 z-10">
                      <Flame className="w-3 h-3" />
                      {recipe.calories} kal
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div onClick={() => handleRecipeClick(recipe)} className="cursor-pointer">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors capitalize">
                      {recipe.name}
                    </h3>
                  </div>

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

        {displayedRecipes.length < recipes.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <button
              onClick={handleLoadMore}
              className="px-8 py-4 bg-white text-orange-500 font-semibold rounded-xl border-2 border-orange-500 hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
            >
              <TrendingUp className="w-5 h-5" />
              Lihat Lebih Banyak
              <span className="text-sm">({displayedRecipes.length} / {recipes.length})</span>
            </button>
          </motion.div>
        )}

        {displayedRecipes.length >= recipes.length && recipes.length > 8 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-12">
            <p className="text-gray-500">✨ Anda telah melihat semua {recipes.length} resep</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default RecommendedSection;
