'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2, Clock, Users, ChefHat } from 'lucide-react';
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
}

export default function MyRecipesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    if (session?.user?.email) {
      loadRecipes();
    }
  }, [session, filter]);

  const loadRecipes = async () => {
    setLoading(true);

    try {
      // Get user ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', session!.user!.email!)
        .single();

      if (!userData) {
        console.error('User not found');
        setLoading(false);
        return;
      }

      // Get recipes
      let query = supabase
        .from('resep')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading recipes:', error);
        return;
      }

      setRecipes(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus resep ini?')) return;

    try {
      const { error } = await supabase
        .from('resep')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting recipe:', error);
        alert('❌ Gagal menghapus resep!');
        return;
      }

      alert('✅ Resep berhasil dihapus!');
      loadRecipes();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#FE9412] to-[#902E2B] rounded-2xl shadow-lg">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#902E2B] to-[#FE9412] bg-clip-text text-transparent">
                  Resep Saya
                </h1>
                <p className="text-gray-600">Kelola semua resep yang kamu buat</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/my-recipes/create')}
              className="px-6 py-3 bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white rounded-xl hover:shadow-lg transition font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Buat Resep Baru
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 bg-white rounded-xl p-2 shadow-md border border-orange-100">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-6 py-2.5 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white shadow-md'
                  : 'text-gray-600 hover:bg-orange-50'
              }`}
            >
              Semua ({recipes.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`flex-1 px-6 py-2.5 rounded-lg font-medium transition ${
                filter === 'published'
                  ? 'bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white shadow-md'
                  : 'text-gray-600 hover:bg-orange-50'
              }`}
            >
              Dipublikasi ({recipes.filter(r => r.status === 'published').length})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`flex-1 px-6 py-2.5 rounded-lg font-medium transition ${
                filter === 'draft'
                  ? 'bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white shadow-md'
                  : 'text-gray-600 hover:bg-orange-50'
              }`}
            >
              Draft ({recipes.filter(r => r.status === 'draft').length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FE9412] mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat resep...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && recipes.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6">
              <ChefHat className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                {filter === 'all' ? 'Belum Ada Resep' : `Belum Ada Resep ${filter === 'published' ? 'Dipublikasi' : 'Draft'}`}
              </h3>
              <p className="text-gray-500 mb-6">
                Mulai berbagi resep favoritmu dengan dunia!
              </p>
              <button
                onClick={() => router.push('/my-recipes/create')}
                className="px-8 py-3 bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white rounded-xl hover:shadow-lg transition font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Buat Resep Pertama
              </button>
            </div>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition border border-orange-100 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-orange-200 to-red-200 overflow-hidden">
                  {recipe.image_url ? (
                    <Image
                      src={recipe.image_url}
                      alt={recipe.title}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ChefHat className="w-20 h-20 text-white opacity-50" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {recipe.status === 'draft' ? (
                      <span className="px-3 py-1.5 bg-gray-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        📝 Draft
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        ✓ Published
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#FE9412]" />
                      <span>{recipe.prep_time + recipe.cook_time} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#FE9412]" />
                      <span>{recipe.servings} porsi</span>
                    </div>
                  </div>

                  {/* Difficulty Badge */}
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyText(recipe.difficulty)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/my-recipes/${recipe.id}`)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white rounded-xl hover:shadow-lg transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat
                    </button>
                    <button
                      onClick={() => router.push(`/my-recipes/edit/${recipe.id}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
