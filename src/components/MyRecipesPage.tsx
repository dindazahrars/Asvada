'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Clock, Users, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: string;
  category: string;
  ingredients: string[];
  steps: string[];
  status: 'draft' | 'published';
  createdAt: string;
  rating: number;
  reviews: number;
}

export default function MyRecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Load recipes from localStorage
  useEffect(() => {
    loadRecipes();
    
    // Listen for updates
    const handleUpdate = () => loadRecipes();
    window.addEventListener('recipesUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    return () => {
      window.removeEventListener('recipesUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const loadRecipes = () => {
    const saved = localStorage.getItem('myRecipes');
    if (saved) {
      setRecipes(JSON.parse(saved));
    }
  };

  const deleteRecipe = (id: number) => {
    if (confirm('Yakin ingin menghapus resep ini?')) {
      const updated = recipes.filter(r => r.id !== id);
      setRecipes(updated);
      localStorage.setItem('myRecipes', JSON.stringify(updated));
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (filter === 'all') return true;
    return recipe.status === filter;
  });

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#902E2B] to-[#FE9412] bg-clip-text text-transparent mb-2">
              Resep Saya
            </h1>
            <p className="text-gray-600">
              Kelola dan bagikan resep favoritmu
            </p>
          </div>
          <button 
          onClick={() => router.push('/recipes/create')} 
          className="px-6 py-3 bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white rounded-full hover:shadow-xl transition font-medium flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Buat Resep Baru
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-md w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              filter === 'all'
                ? 'bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white shadow-md'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            Semua ({recipes.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              filter === 'published'
                ? 'bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white shadow-md'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            Dipublikasi ({recipes.filter(r => r.status === 'published').length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              filter === 'draft'
                ? 'bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white shadow-md'
                : 'text-gray-600 hover:bg-orange-50'
            }`}
          >
            Draft ({recipes.filter(r => r.status === 'draft').length})
          </button>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Belum ada resep
            </h3>
            <p className="text-gray-600 mb-6">
              Mulai buat resep pertamamu sekarang!
            </p>
            <button 
            onClick={() => router.push('/recipes/create')} 
            className="px-6 py-3 bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white rounded-full hover:shadow-xl transition font-medium inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Buat Resep
              </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100 hover:shadow-xl transition group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                      recipe.status === 'published'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {recipe.status === 'published' ? '✓ Published' : '📝 Draft'}
                    </span>
                  </div>
                  {/* Difficulty Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyText(recipe.difficulty)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#FE9412]" />
                      <span>{parseInt(recipe.prepTime) + parseInt(recipe.cookTime)} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#FE9412]" />
                      <span>{recipe.servings} porsi</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/recipe/${recipe.id}`)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white rounded-xl hover:shadow-lg transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat
                    </button>
                    <button
                      onClick={() => router.push(`/edit-recipe/${recipe.id}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
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
