'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Clock, Users, Bookmark, ChefHat } from 'lucide-react';
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

        if (data) setCurrentUserId(data.id);
      }
    };

    fetchUserId();
  }, [session]);

  useEffect(() => {
    if (!currentUserId) return;

    const loadFavorites = async () => {
      const { data } = await supabase
        .from('favorite')
        .select('id_recipe')
        .eq('id_user', currentUserId);

      if (data) setFavoriteIds(new Set(data.map(f => f.id_recipe)));
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

    if (!session) return alert('Silakan login terlebih dahulu!');
    if (!currentUserId) return alert('Gagal mendapatkan data user!');

    const isFavorited = favoriteIds.has(recipeId);

    if (isFavorited) {
      await supabase.from('favorite').delete().eq('id_user', currentUserId).eq('id_recipe', recipeId);
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
    } else {
      await supabase.from('favorite').insert({ id_user: currentUserId, id_recipe: recipeId });
      setFavoriteIds(prev => new Set(prev).add(recipeId));
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 mt-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-1">
          {isEmptyObj ? 'Rekomendasi Resep' : 'Hasil Pencarian'}
        </h2>
        <p className="text-gray-600">
          {isEmptyObj ? 'Resep pilihan yang mungkin kamu suka' : 'Resep hasil pencarianmu'}
        </p>
      </div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(isEmptyObj ? randomRecipes : searchData.data.slice(0, 15)).map((recipe) => {
          const isFavorited = favoriteIds.has(recipe.id);

          return (
            <motion.article
              key={recipe.id}
              whileHover={{ y: -8 }}
              onClick={() => handleRecipeClick(recipe.id)}
              className="bg-white rounded-2xl shadow-md overflow-hidden border hover:shadow-xl cursor-pointer"
            >
              <div className="relative h-48">
                <Image
                  src={recipe.image_url}
                  alt={recipe.title}
                  fill
                  unoptimized   // 🔥 FIX UTAMA
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />

                <button
                  onClick={(e) => toggleFavorite(e, recipe.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full shadow-md ${
                    isFavorited ? 'bg-red-600 text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{recipe.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>

                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {recipe.cook_time} menit
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {recipe.servings || 1} porsi
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                  <ChefHat className="w-4 h-4" /> {recipe.user_id ?? 'Anon'}
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
};

export default RecommendedSection;
