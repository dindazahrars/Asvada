'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { ArrowLeft, Flame, Zap, Award, ChefHat, TrendingUp, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DatasetRecipeDetail() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    loadRecipe();
  }, [params.slug]);

  const loadRecipe = async () => {
    try {
      setLoading(true);

      const decodedSlug = decodeURIComponent(params.slug as string);
      console.log('🔍 Loading recipe with slug:', decodedSlug);

      // Ambil data dari dataset dengan SEMUA kolom
      let { data: recipeData, error: recipeError } = await supabase
        .from('dataset')
        .select('*')
        .eq('slug', decodedSlug)
        .single();

      if (recipeError || !recipeData) {
        console.log('⚠️ Exact match not found, trying LIKE search...');
        
        const { data: likeData, error: likeError } = await supabase
          .from('dataset')
          .select('*')
          .ilike('slug', decodedSlug)
          .limit(1)
          .single();

        if (likeError || !likeData) {
          console.error('❌ Recipe not found:', likeError);
          alert('Resep tidak ditemukan!');
          router.push('/');
          return;
        }

        recipeData = likeData;
      }

      console.log('✅ Recipe data:', recipeData);

      // Get image from datasetimg
      const { data: imageData } = await supabase
        .from('datasetimg')
        .select('image')
        .eq('slug', recipeData.slug)
        .single();

      console.log('🖼️ Image data:', imageData);

      let imageUrl = imageData?.image;
      
      if (!imageUrl && recipeData.title_cleaned) {
        console.log('📸 No image found, using placeholder');
        imageUrl = '/images/placeholder-food.jpg';
      }

      setRecipe({
        ...recipeData,
        image: imageUrl
      });

    } catch (error) {
      console.error('❌ Error loading recipe:', error);
      alert('Terjadi kesalahan saat memuat resep');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-gray-300 mb-4 mx-auto" />
          <p className="text-gray-600 text-xl">Resep tidak ditemukan</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Helper functions
  const cleanNutritionValue = (value: any): number => {
    if (!value) return 0;
    const str = String(value);
    if (str.includes('E+') || str.includes('e+')) return 0;
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.round(num);
  };

  const getCalorieStatus = () => {
    const cal = cleanNutritionValue(recipe.kalori);
    if (cal < 300) return { text: '✅ Rendah Kalori', color: 'text-green-600', bg: 'bg-green-50' };
    if (cal < 500) return { text: '⚠️ Kalori Sedang', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: '🔥 Tinggi Kalori', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getProteinStatus = () => {
    const prot = cleanNutritionValue(recipe.protein);
    if (prot > 20) return { text: '💪 Tinggi Protein', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (prot > 10) return { text: '⚡ Protein Sedang', color: 'text-cyan-600', bg: 'bg-cyan-50' };
    return { text: '📊 Protein Rendah', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const getDietType = () => {
    const prot = cleanNutritionValue(recipe.protein);
    const cal = cleanNutritionValue(recipe.kalori);
    if (prot > 15 && cal < 500) return { text: '💪 Diet Protein', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (cal < 300) return { text: '🔥 Diet Kalori', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: '🍽️ Menu Sehat', color: 'text-green-600', bg: 'bg-green-50' };
  };

  // Parse ingredients (prioritas: bahan > ingredients_cleaned)
  const parseIngredients = () => {
    if (recipe.bahan) {
      if (typeof recipe.bahan === 'string') {
        return recipe.bahan.split('\n').filter((b: string) => b.trim());
      }
      if (Array.isArray(recipe.bahan)) {
        return recipe.bahan;
      }
    }
    
    if (recipe.ingredients_cleaned) {
      if (typeof recipe.ingredients_cleaned === 'string') {
        return recipe.ingredients_cleaned
          .split(',')
          .map((b: string) => b.trim())
          .filter((b: string) => b);
      }
      if (Array.isArray(recipe.ingredients_cleaned)) {
        return recipe.ingredients_cleaned;
      }
    }
    
    return [];
  };

  // Parse steps
  const parseSteps = () => {
    if (recipe.langkah || recipe.steps) {
      const stepsData = recipe.langkah || recipe.steps;
      if (typeof stepsData === 'string') {
        return stepsData.split('\n').filter((s: string) => s.trim());
      }
      if (Array.isArray(stepsData)) {
        return stepsData;
      }
    }
    return [];
  };

  // Check taste profile
  const hasTasteProfile = () => {
    return recipe.manis === '1' || recipe.asam === '1' || recipe.asin === '1' || 
           recipe.pahit === '1' || recipe.umami === '1' || recipe.pedas === '1' || 
           recipe.sepat === '1' || recipe.lemak === '1';
  };

  const calorieStatus = getCalorieStatus();
  const proteinStatus = getProteinStatus();
  const dietType = getDietType();
  const ingredients = parseIngredients();
  const steps = parseSteps();

  const calories = cleanNutritionValue(recipe.kalori);
  const proteins = cleanNutritionValue(recipe.protein);
  const fats = cleanNutritionValue(recipe.fat);
  const carbs = cleanNutritionValue(recipe.karbo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Kembali</span>
        </motion.button>

        {/* Recipe Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Image */}
          <div className="relative h-96 bg-gray-200">
            <img
              src={recipe.image}
              alt={recipe.title_cleaned}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-food.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-6 left-6 flex gap-3 flex-wrap">
              <span className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
                📊 Dataset Recipe
              </span>
              {calories > 0 && (
                <span className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {calories} kal
                </span>
              )}
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white capitalize drop-shadow-lg">
                {recipe.title_cleaned}
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Nutrition Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Kalori</p>
                <p className="text-3xl font-bold text-orange-600">{calories}</p>
                <p className="text-xs text-gray-500">kkal</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Protein</p>
                <p className="text-3xl font-bold text-blue-600">{proteins}</p>
                <p className="text-xs text-gray-500">gram</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Lemak</p>
                <p className="text-3xl font-bold text-yellow-600">{fats}</p>
                <p className="text-xs text-gray-500">gram</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <ChefHat className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Karbohidrat</p>
                <p className="text-3xl font-bold text-green-600">{carbs}</p>
                <p className="text-xs text-gray-500">gram</p>
              </motion.div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-orange-500" />
                Tentang Resep Ini
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Menu sehat dengan kandungan gizi seimbang. Cocok untuk diet dan gaya hidup sehat Anda. 
                Resep ini mengandung <span className="font-semibold text-orange-600">{calories} kalori</span> dengan{' '}
                <span className="font-semibold text-blue-600">{proteins}g protein</span>,{' '}
                <span className="font-semibold text-yellow-600">{fats}g lemak</span>, dan{' '}
                <span className="font-semibold text-green-600">{carbs}g karbohidrat</span>.
              </p>
            </motion.div>

            {/* Profil Rasa */}
            {hasTasteProfile() && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 mb-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  👅 Profil Rasa
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recipe.manis === '1' && (
                    <span className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-semibold shadow-md">
                      🍬 Manis
                    </span>
                  )}
                  {recipe.asam === '1' && (
                    <span className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm font-semibold shadow-md">
                      🍋 Asam
                    </span>
                  )}
                  {recipe.asin === '1' && (
                    <span className="px-4 py-2 bg-gray-600 text-white rounded-full text-sm font-semibold shadow-md">
                      🧂 Asin
                    </span>
                  )}
                  {recipe.pahit === '1' && (
                    <span className="px-4 py-2 bg-green-700 text-white rounded-full text-sm font-semibold shadow-md">
                      🌿 Pahit
                    </span>
                  )}
                  {recipe.umami === '1' && (
                    <span className="px-4 py-2 bg-orange-600 text-white rounded-full text-sm font-semibold shadow-md">
                      🍄 Umami
                    </span>
                  )}
                  {recipe.pedas === '1' && (
                    <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold shadow-md">
                      🌶️ Pedas
                    </span>
                  )}
                  {recipe.sepat === '1' && (
                    <span className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold shadow-md">
                      🍇 Sepat
                    </span>
                  )}
                  {recipe.lemak === '1' && (
                    <span className="px-4 py-2 bg-amber-600 text-white rounded-full text-sm font-semibold shadow-md">
                      🧈 Lemak
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Bahan-Bahan */}
            {ingredients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 mb-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🥘 Bahan-Bahan
                </h2>
                <ul className="space-y-2">
                  {ingredients.map((ingredient: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <span className="text-orange-500 font-bold mt-1">•</span>
                      <span className="capitalize">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Langkah-Langkah */}
            {steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 mb-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  👨‍🍳 Cara Membuat
                </h2>
                <ol className="space-y-4">
                  {steps.map((step: string, index: number) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}

            {/* Nutritional Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                Analisis Nutrisi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`${proteinStatus.bg} rounded-xl p-5 border-2 border-transparent hover:border-blue-300 transition-all`}>
                  <p className="text-sm text-gray-600 mb-2">Status Protein</p>
                  <p className={`text-lg font-bold ${proteinStatus.color}`}>
                    {proteinStatus.text}
                  </p>
                  <div className="mt-3 bg-white/50 rounded-lg p-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>0g</span>
                      <span>30g</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.min((proteins / 30) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className={`${calorieStatus.bg} rounded-xl p-5 border-2 border-transparent hover:border-orange-300 transition-all`}>
                  <p className="text-sm text-gray-600 mb-2">Status Kalori</p>
                  <p className={`text-lg font-bold ${calorieStatus.color}`}>
                    {calorieStatus.text}
                  </p>
                  <div className="mt-3 bg-white/50 rounded-lg p-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>0</span>
                      <span>600 kal</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-red-600 rounded-full transition-all"
                        style={{ width: `${Math.min((calories / 600) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className={`${dietType.bg} rounded-xl p-5 border-2 border-transparent hover:border-green-300 transition-all`}>
                  <p className="text-sm text-gray-600 mb-2">Cocok Untuk</p>
                  <p className={`text-lg font-bold ${dietType.color}`}>
                    {dietType.text}
                  </p>
                  <div className="mt-3 bg-white/50 rounded-lg p-3">
                    <ul className="text-xs text-gray-600 space-y-1">
                      {proteins > 15 && <li>✓ Program pembentukan otot</li>}
                      {calories < 400 && <li>✓ Program penurunan berat badan</li>}
                      <li>✓ Gaya hidup sehat</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
