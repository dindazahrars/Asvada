'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, Users, ChefHat, ArrowLeft, Share2, Bookmark, Heart, Timer, X, Utensils } from 'lucide-react';
import Image from 'next/image';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

// --- Interfaces ---
interface Recipe {
  id: number;
  user_id?: string;
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
  status?: 'draft' | 'published';
  created_at: string;
  // Field optional untuk handling dataset/modal
  Title?: string;
  Loves?: number;
  is_dataset?: boolean; // Flag untuk menandai sumber data
}

interface UserInfo {
  name: string;
  email: string;
}

interface Props {
  recipe?: any;
  onClose?: () => void;
  open?: boolean;
}

export default function RecipeDetailPublicPage({ recipe: propRecipe, onClose }: Props) {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const supabase = createSupabaseBrowser();
  const isModal = !!propRecipe; // Deteksi apakah sedang dalam mode Modal

  // 1. SETUP DATA
  useEffect(() => {
    const initData = async () => {
      setLoading(true);

      if (propRecipe) {
        // A. MODE MODAL (Data dilempar via props)
        const normalizedRecipe: any = {
          ...propRecipe,
          id: propRecipe.id,
          title: propRecipe.title || propRecipe.Title,
          description: propRecipe.description || 'Deskripsi tidak tersedia',
          image_url: propRecipe.image_url || propRecipe.image,
          prep_time: propRecipe.prep_time || 15,
          cook_time: propRecipe.cook_time || 30,
          servings: propRecipe.servings || 2,
          difficulty: propRecipe.difficulty || 'Medium',
          category: propRecipe.category || propRecipe.Category || 'Umum',
          
          // Handling ingredients string vs array
          ingredients: Array.isArray(propRecipe.ingredients) 
            ? propRecipe.ingredients 
            : (propRecipe.ingredients ? propRecipe.ingredients.split(',') : ['Bahan tidak tersedia']),
            
          // Handling steps string vs array
          steps: Array.isArray(propRecipe.steps) 
            ? propRecipe.steps 
            : (propRecipe.steps ? propRecipe.steps.split('\n') : ['Langkah tidak tersedia']),
            
          created_at: propRecipe.created_at || new Date().toISOString(),
          is_dataset: propRecipe.is_dataset || false
        };
        
        setRecipe(normalizedRecipe);
        if (normalizedRecipe.user_id) fetchUserInfo(normalizedRecipe.user_id);
        setLoading(false);

      } else if (params.id) {
        // B. MODE HALAMAN (Fetch dari DB berdasarkan URL ID)
        await loadRecipeFromDb(params.id as string);
      }
    };

    initData();
  }, [params.id, propRecipe]);

  // 2. TRIGGER HISTORY
  useEffect(() => {
      if (recipe?.id && status === 'authenticated' && !recipe.is_dataset) {
      addToHistory(recipe.id);
    }
  }, [recipe, status]);

  const fetchUserInfo = async (userId: string) => {
    const { data } = await supabase.from('users').select('name, email').eq('id', userId).single();
    if (data) setUserInfo(data);
  };

  // --- LOGIKA UTAMA PERBAIKAN FETCH DB ---
  const loadRecipeFromDb = async (id: string) => {
    try {
      const { data: appData, error: appError } = await supabase
        .from('resep')
        .select('*')
        .eq('id', id)
        .single();

      if (appData) {
        setRecipe({ ...appData, is_dataset: false });
        if (appData.user_id) fetchUserInfo(appData.user_id);
      } else {
              console.log("Mencari di dataset...");
        const { data: dsData, error: dsError } = await supabase
          .from('dataset')
          .select('*')
          .eq('id', id)
          .single();

        if (dsError || !dsData) throw new Error('Not found in both tables');

        // Mapping Data Dataset ke format Recipe UI
        const mappedRecipe: any = {
          id: dsData.id,
          title: dsData.title_cleaned || 'Tanpa Judul',
          description: `Resep Dataset AI. Kalori: ${dsData.calories || '-'}`,
          image_url: dsData.image_url,
          prep_time: dsData.prep_time || 15,
          cook_time: dsData.cook_time || 30,
          servings: dsData.servings || 4,
          difficulty: 'Medium',
          category: 'Dataset AI',
          
          ingredients: dsData.ingredients_cleaned ? dsData.ingredients_cleaned.split(',') : [],
          steps: dsData.steps ? dsData.steps.split('\n') : ['Lihat detail pada sumber asli.'],
          
          created_at: new Date().toISOString(),
          is_dataset: true,
          user_id: null
        };

        setRecipe(mappedRecipe);
        setUserInfo({ name: "Asvada AI", email: "ai@system" });
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      alert('❌ Resep tidak ditemukan!');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };
const addToHistory = async (recipeId: number) => {
    if (!session?.user) return;

    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId })
      });
      // ... handling response
    } catch (error) {
      console.error('🔥 Fetch Error:', error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: recipe?.title || 'Resep',
        text: recipe?.description || '',
        url: url,
      }).catch(() => navigator.clipboard.writeText(url));
    } else {
      navigator.clipboard.writeText(url);
      alert('✅ Link disalin!');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || 'medium';
    switch (d) {
      case 'easy': return 'bg-emerald-500';
      case 'medium': return 'bg-amber-500';
      case 'hard': return 'bg-rose-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || 'medium';
    switch (d) {
      case 'easy': return 'Mudah';
      case 'medium': return 'Sedang';
      case 'hard': return 'Sulit';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-white ${isModal ? 'h-96' : 'min-h-screen'}`}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FE9412] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  const Content = (
    <div className={`bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 ${isModal ? 'min-h-full pb-10' : 'min-h-screen'}`}>
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px]">
        <Image
          src={recipe.image_url || '/logo.png'}
          alt={recipe.title}
          unoptimized
          fill
          className="object-cover"
          priority
          unoptimized={recipe.is_dataset}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Navigation / Close Button */}
        <button
          onClick={() => isModal ? onClose?.() : router.back()}
          className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition z-20"
        >
           {isModal ? <X className="w-5 h-5 text-gray-900" /> : <ArrowLeft className="w-5 h-5 text-gray-900" />}
        </button>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-3 z-20">
          <button onClick={() => setIsLiked(!isLiked)} className={`p-3 rounded-full shadow-lg transition ${isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-900'}`}>
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button onClick={() => setIsBookmarked(!isBookmarked)} className={`p-3 rounded-full shadow-lg transition ${isBookmarked ? 'bg-[#FE9412] text-white' : 'bg-white/90 text-gray-900'}`}>
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button onClick={handleShare} className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition">
            <Share2 className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Title & Meta Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-4 py-2 ${getDifficultyColor(recipe.difficulty)} text-white rounded-full text-sm font-bold shadow-lg`}>
                {getDifficultyText(recipe.difficulty)}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-bold shadow-lg">
                {recipe.category || 'Umum'}
              </span>
              {recipe.is_dataset && (
                 <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    AI Dataset
                 </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg capitalize">{recipe.title}</h1>
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl line-clamp-2">{recipe.description}</p>
            
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl"><Timer className="w-6 h-6" /></div>
                <div><p className="text-sm text-white/80">Prep</p><p className="font-bold text-lg">{recipe.prep_time}m</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl"><Clock className="w-6 h-6" /></div>
                <div><p className="text-sm text-white/80">Cook</p><p className="font-bold text-lg">{recipe.cook_time}m</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl"><Users className="w-6 h-6" /></div>
                <div><p className="text-sm text-white/80">Servings</p><p className="font-bold text-lg">{recipe.servings}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Ingredients & Author */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl shadow-xl p-8 sticky top-8 border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-[#FE9412] to-[#902E2B] rounded-2xl"><Utensils className="w-6 h-6 text-white" /></div>
                <h2 className="text-2xl font-bold text-gray-900">Bahan-Bahan</h2>
              </div>
              
              <div className="space-y-3">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-orange-50 transition">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-orange-400 to-red-400 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">{i + 1}</div>
                    <span className="text-gray-700 leading-relaxed capitalize">{ing}</span>
                  </div>
                ))}
              </div>

              {userInfo && (
                <div className="mt-8 pt-8 border-t-2 border-orange-100">
                  <p className="text-sm font-semibold text-gray-500 mb-3">SUMBER RESEP</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FE9412] to-[#902E2B] rounded-full flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{userInfo.name}</p>
                      <p className="text-sm text-gray-500">{new Date(recipe.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Steps */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl p-8 border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-[#FE9412] to-[#902E2B] rounded-2xl"><ChefHat className="w-6 h-6 text-white" /></div>
                <h2 className="text-2xl font-bold text-gray-900">Cara Memasak</h2>
              </div>

              <div className="space-y-8">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#FE9412] to-[#902E2B] text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition">{i + 1}</div>
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
                        <p className="text-gray-800 leading-relaxed text-lg">{step.replace(/^\d+\)\s*/, '')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
                <h3 className="font-bold text-lg text-gray-900 mb-3">💡 Tips Memasak</h3>
                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                  <li>Siapkan semua bahan sebelum mulai.</li>
                  <li>Sesuaikan rasa (garam/gula) di akhir proses memasak.</li>
                  <li>Gunakan api sedang agar matang merata.</li>
                </ul>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );


  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="min-h-full w-full bg-white md:rounded-t-3xl md:mt-20 overflow-hidden relative shadow-2xl">
            {Content}
        </div>
      </div>
    );
  }

  return Content;
}
