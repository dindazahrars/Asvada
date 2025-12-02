'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, Users, ChefHat, ArrowLeft, Edit, Trash2, Share2 } from 'lucide-react';
import Image from 'next/image';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { useSession } from 'next-auth/react';

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
  users?: {
    name: string;
    email: string;
  };
}

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    if (params.id) {
      loadRecipe();
    }
  }, [params.id, session]);

  const loadRecipe = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('resep')
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error loading recipe:', error);
        alert('❌ Resep tidak ditemukan!');
        router.push('/my-recipes');
        return;
      }

      setRecipe(data);

      // Check if current user is the owner
      if (session?.user?.email) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (userData && userData.id === data.user_id) {
          setIsOwner(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus resep ini?')) return;

    try {
      const { error } = await supabase
        .from('resep')
        .delete()
        .eq('id', params.id);

      if (error) {
        console.error('Error deleting recipe:', error);
        alert('❌ Gagal menghapus resep!');
        return;
      }

      alert('✅ Resep berhasil dihapus!');
      router.push('/my-recipes');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Terjadi kesalahan!');
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FE9412] mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat resep...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center py-16">
            <p className="text-gray-600">Resep tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#FE9412] mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>

        {/* Hero Image */}
        <div className="relative h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-200 to-red-200">
              <ChefHat className="w-32 h-32 text-white opacity-50" />
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
                {getDifficultyText(recipe.difficulty)}
              </span>
              {recipe.status === 'draft' && (
                <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-500 text-white">
                  📝 Draft
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-2">{recipe.title}</h1>
            <p className="text-white/90 text-lg">{recipe.description}</p>
          </div>
        </div>

        {/* Action Buttons (Only for Owner) */}
        {isOwner && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => router.push(`/recipes/edit/${recipe.id}`)}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium flex items-center justify-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Edit Resep
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Hapus
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('✅ Link berhasil disalin!');
              }}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition font-medium flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info & Ingredients */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Clock className="w-5 h-5 text-[#FE9412]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Waktu Persiapan</p>
                    <p className="font-semibold text-gray-900">{recipe.prep_time} menit</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Clock className="w-5 h-5 text-[#FE9412]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Waktu Memasak</p>
                    <p className="font-semibold text-gray-900">{recipe.cook_time} menit</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Users className="w-5 h-5 text-[#FE9412]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Porsi</p>
                    <p className="font-semibold text-gray-900">{recipe.servings} orang</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-[#FE9412] to-[#902E2B] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  🥘
                </span>
                Bahan-Bahan
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-[#FE9412] rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 flex-1">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-[#FE9412] to-[#902E2B] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  👨‍🍳
                </span>
                Langkah-Langkah
              </h2>
              <div className="space-y-6">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FE9412] to-[#902E2B] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-gray-700 leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Author Info */}
            {recipe.users && (
              <div className="mt-6 bg-white rounded-2xl shadow-md p-6 border border-orange-100">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Dibuat oleh</h3>
                <p className="text-lg font-bold text-gray-900">{recipe.users.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(recipe.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
