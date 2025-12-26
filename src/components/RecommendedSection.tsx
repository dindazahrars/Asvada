'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Clock, Users, Star, Bookmark, ChefHat } from 'lucide-react';
import CardRecipe from './CardRecipe';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { useSession } from 'next-auth/react';

const supabase = createSupabaseBrowser();

interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url: string;
  cook_time: string | number;
  difficulty: string;
  servings: number;
  user_id: string | null;
}

interface SearchData {
  data: Recipe[];
}

interface Props {
  searchData: SearchData;
}

const RecommendedSection = ({ searchData }: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [randomRecipes, setRandomRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isEmptyObj = !searchData || !searchData.data || searchData.data.length === 0;

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
    const loadFavorites = async () => {
      if (!currentUserId) return;

      const { data } = await supabase
        .from('favorite')
        .select('id_recipe')
        .eq('id_user', currentUserId);

      if (data) {
        setFavoriteIds(new Set(data.map(f => f.id_recipe)));
      }
    };

    loadFavorites();
  }, [currentUserId]);

  useEffect(() => {
    if (!isEmptyObj) return;

    const fetchRandom = async () => {
      const { data, error } = await supabase
        .from('resep')
        .select('*')
        .eq('status', 'published');

      if (!error && data) {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setRandomRecipes(shuffled.slice(0, 8));
      }
    };

    fetchRandom();
  }, [isEmptyObj]);

  const handleRecipeClick = (recipeId: number) => {
    router.push(`/recipe/${recipeId}`);
  };

  const toggleFavorite = async (e: React.MouseEvent, recipeId: number) => {
    e.stopPropagation();

    if (!session) {
      alert('Silakan login terlebih dahulu untuk menyimpan favorit!');
      return;
    }

    if (!currentUserId) {
      alert('Gagal mendapatkan data user!');
      return;
    }

    const isFavorited = favoriteIds.has(recipeId);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorite')
          .delete()
          .eq('id_user', currentUserId)
          .eq('id_recipe', recipeId);

        if (!error) {
          setFavoriteIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(recipeId);
            return newSet;
          });
        }
      } else {
        const { error } = await supabase
          .from('favorite')
          .insert({
            id_user: currentUserId,
            id_recipe: recipeId
          });

        if (!error) {
          setFavoriteIds(prev => new Set(prev).add(recipeId));
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 mt-20 relative z-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isEmptyObj ? "Rekomendasi Resep" : "Hasil Pencarian"}
          </h2>
          <p className="text-gray-600">
            {isEmptyObj ? "Resep pilihan yang mungkin kamu suka" : "Resep hasil pencarianmu"}
          </p>
        </div>
      </div>

      {isEmptyObj ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {randomRecipes.map((recipe) => {
            const isFavorited = favoriteIds.has(recipe.id);
            
            return (
              <motion.article
                key={recipe.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                onClick={() => handleRecipeClick(recipe.id)}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={recipe.image_url}
                    alt={recipe.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <button 
                      onClick={(e) => toggleFavorite(e, recipe.id)}
                      className={`p-2 rounded-full shadow-md transition-all ${
                        isFavorited 
                          ? 'bg-[#902E2B] text-white' 
                          : 'bg-white text-gray-600 hover:bg-[#902E2B] hover:text-white'
                      }`}
                      title={isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                    >
                      <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 bg-[#FE9412] text-white text-xs font-semibold rounded-full">
                      {recipe.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-[#FE9412] transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.cook_time} menit</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings || 1} porsi</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{recipe.user_id ?? "Anon"}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {searchData.data.slice(0, 15).map((data, idx) =>
            data.image_url && <CardRecipe key={idx} data={data} />
          )}
        </motion.div>
      )}
    </section>
  );
};

export default RecommendedSection;
