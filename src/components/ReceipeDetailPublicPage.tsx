'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, Users, ChefHat, ArrowLeft, Share2, Bookmark, Heart, Star, Utensils, Timer } from 'lucide-react';
import Image from 'next/image';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { motion } from 'framer-motion';

interface Recipe {
  id: number;
  user_id: string;
  title: string;
  description: string;
  image_url: string | null;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  category: string | null;
  ingredients: string[];
  steps: string[];
  status: 'draft' | 'published';
  created_at: string;
}

interface UserInfo {
  name: string;
  email: string;
}

export default function RecipeDetailPublicPage() {
  const router = useRouter();
  const params = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    if (params.id) {
      loadRecipe();
    }
  }, [params.id]);

  const loadRecipe = async () => {
    setLoading(true);

    try {
      const { data: recipeData, error: recipeError } = await supabase
        .from('resep')
        .select('*')
        .eq('id', params.id)
        .single();

      if (recipeError || !recipeData) {
        alert('❌ Resep tidak ditemukan!');
        router.push('/');
        return;
      }

      setRecipe(recipeData);

      if (recipeData.user_id) {
        const { data: userData } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', recipeData.user_id)
          .single();

        if (userData) {
          setUserInfo(userData);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Terjadi kesalahan saat memuat resep!');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: recipe?.title || 'Resep',
        text: recipe?.description || '',
        url: url,
      }).catch(() => {
        navigator.clipboard.writeText(url);
        alert('✅ Link berhasil disalin!');
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('✅ Link berhasil disalin!');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-500';
      case 'medium': return 'bg-amber-500';
      case 'hard': return 'bg-rose-500';
      default: return 'bg-gray-500';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FE9412] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Memuat resep lezat...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold mb-4">Resep tidak ditemukan</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white rounded-xl hover:shadow-lg transition font-medium"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Hero Section with Image */}
      <div className="relative h-[60vh] min-h-[500px]">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-300 via-amber-300 to-red-300 flex items-center justify-center">
            <ChefHat className="w-32 h-32 text-white/50" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition z-10"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-3 z-10">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-3 backdrop-blur-sm rounded-full shadow-lg transition ${
              isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-900 hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-3 backdrop-blur-sm rounded-full shadow-lg transition ${
              isBookmarked ? 'bg-[#FE9412] text-white' : 'bg-white/90 text-gray-900 hover:bg-white'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition"
          >
            <Share2 className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Title & Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-4 py-2 ${getDifficultyColor(recipe.difficulty)} text-white rounded-full text-sm font-bold shadow-lg`}>
                {getDifficultyText(recipe.difficulty)}
              </span>
              {recipe.category && (
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-bold shadow-lg">
                  {recipe.category}
                </span>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold">4.8</span>
                <span className="text-sm text-white/80">(128 reviews)</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">{recipe.title}</h1>
            <p className="text-xl text-white/90 mb-6 max-w-3xl">{recipe.description}</p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <Timer className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Prep Time</p>
                  <p className="font-bold text-lg">{recipe.prep_time} min</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Cook Time</p>
                  <p className="font-bold text-lg">{recipe.cook_time} min</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Servings</p>
                  <p className="font-bold text-lg">{recipe.servings} orang</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8 sticky top-8 border-2 border-orange-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-[#FE9412] to-[#902E2B] rounded-2xl">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Bahan-Bahan</h2>
              </div>
              
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-orange-50 transition group"
                  >
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-orange-400 to-red-400 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md group-hover:scale-110 transition">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 leading-relaxed flex-1">{ingredient}</span>
                  </motion.div>
                ))}
              </div>

              {/* Author Info */}
              {userInfo && (
                <div className="mt-8 pt-8 border-t-2 border-orange-100">
                  <p className="text-sm font-semibold text-gray-500 mb-3">DIBUAT OLEH</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FE9412] to-[#902E2B] rounded-full flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{userInfo.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(recipe.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Steps Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8 border-2 border-orange-100"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-[#FE9412] to-[#902E2B] rounded-2xl">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Cara Memasak</h2>
              </div>

              <div className="space-y-8">
                {recipe.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-6 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#FE9412] to-[#902E2B] text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 group-hover:shadow-md transition">
                        <p className="text-gray-800 leading-relaxed text-lg">{step}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tips Section */}
              <div className="mt-12 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  💡 Tips Memasak
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FE9412] font-bold">•</span>
                    <span>Pastikan semua bahan sudah disiapkan sebelum mulai memasak</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FE9412] font-bold">•</span>
                    <span>Ikuti langkah-langkah dengan urutan yang benar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FE9412] font-bold">•</span>
                    <span>Sesuaikan tingkat kepedasan sesuai selera</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}