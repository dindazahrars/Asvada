// components/RecommendedSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, Heart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Recipe, getRandomRecipes } from '@/lib/recipeData';

export default function RecommendedSection() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Get random 4 recipes on component mount
    setRecipes(getRandomRecipes(4));

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteRecipes');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      
      // Save to localStorage
      localStorage.setItem('favoriteRecipes', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                Resep Rekomendasi
              </h2>
            </div>
            <p className="text-gray-600">
              Resep pilihan yang mungkin Anda suka
            </p>
          </div>

          <Link
            href="/my-recipes"
            className="hidden md:block px-5 py-2 bg-orange-50 text-orange-600 font-semibold rounded-lg hover:bg-orange-100 transition-colors"
          >
            Lihat Semua
          </Link>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favorites.has(recipe.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/my-recipes"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-md"
          >
            Lihat Semua Resep
          </Link>
        </div>
      </div>
    </section>
  );
}

// Recipe Card Component
interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

function RecipeCard({ recipe, isFavorite, onToggleFavorite }: RecipeCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <ChefHat className="w-16 h-16 text-gray-400" />
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(recipe.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all z-10 group/fav"
          aria-label="Toggle favorite"
        >
          <Heart
            className={`w-4 h-4 transition-all ${
              isFavorite
                ? 'fill-red-500 text-red-500 scale-110'
                : 'text-gray-600 group-hover/fav:text-red-500 group-hover/fav:scale-110'
            }`}
          />
        </button>

        {/* Difficulty Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
          <span className={`text-xs font-semibold ${
            recipe.difficulty === 'Mudah' ? 'text-green-600' :
            recipe.difficulty === 'Sedang' ? 'text-orange-600' :
            'text-red-600'
          }`}>
            {recipe.difficulty}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <span className="inline-block px-2 py-1 text-xs font-medium text-orange-600 bg-orange-50 rounded-md mb-2">
          {recipe.category}
        </span>

        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[3rem]">
          {recipe.title}
        </h3>

        {/* Recipe Info */}
        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{recipe.servings}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-orange-600 font-semibold">
              {recipe.calories} kal
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/resep/${recipe.id}`}
          className="block w-full py-2 text-center text-sm bg-orange-50 text-orange-600 font-semibold rounded-lg hover:bg-orange-100 transition-colors"
        >
          Lihat Resep
        </Link>
      </div>
    </div>
  );
}
