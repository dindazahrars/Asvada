'use client';

import { motion } from 'framer-motion';
import { Clock, Users, Star, Bookmark, ChefHat } from 'lucide-react';
import Image from 'next/image';
import { log } from 'node:console';
import { useEffect } from 'react';
import CardRecipe from './CardRecipe';

interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  cookTime: string;
  difficulty: string;
  servings: number;
  rating: number;
  author: string;
  tags: string[];
}

const RecommendedSection = ({ searchData }) => {
  const recommendedRecipes: Recipe[] = [
    {
      id: 1,
      title: 'Nasi Goreng Spesial',
      description: 'Nasi goreng hangat dengan bumbu rempah pilihan, telur, dan sayuran segar yang menggugah selera',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
      cookTime: '20 menit',
      difficulty: 'Mudah',
      servings: 2,
      rating: 4.8,
      author: 'Chef Maria',
      tags: ['Makanan Berat', 'Gurih', 'Mudah']
    },
    {
      id: 2,
      title: 'Pancake Madu Fluffy',
      description: 'Pancake super fluffy dengan siraman madu manis dan butter yang lumer di mulut',
      image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop',
      cookTime: '15 menit',
      difficulty: 'Mudah',
      servings: 4,
      rating: 4.9,
      author: 'Chef Sarah',
      tags: ['Sarapan', 'Manis', 'Mudah']
    },
    {
      id: 3,
      title: 'Soto Ayam Kuning',
      description: 'Soto ayam dengan kuah kuning yang segar, hangat, dan penuh rempah',
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
      cookTime: '45 menit',
      difficulty: 'Sedang',
      servings: 4,
      rating: 4.7,
      author: 'Chef Budi',
      tags: ['Makanan Berat', 'Berkuah', 'Tradisional']
    },
    {
      id: 4,
      title: 'Smoothie Bowl Tropis',
      description: 'Smoothie bowl segar dengan topping buah tropis dan granola renyah',
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
      cookTime: '10 menit',
      difficulty: 'Mudah',
      servings: 1,
      rating: 4.6,
      author: 'Chef Dina',
      tags: ['Sarapan', 'Sehat', 'Vegan']
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  console.log("Render:", searchData);
  useEffect(() => {
    console.log("DARI :" , searchData);
  }, [searchData])
  
  const isEmptyObj = Object.keys(searchData).length === 0;

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

      {
        isEmptyObj ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {recommendedRecipes.map((recipe) => (
              <motion.article
                key={recipe.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group relative z-0"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-[#902E2B] hover:text-white transition-colors">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="px-3 py-1 bg-[#FE9412] text-white text-xs font-semibold rounded-full">
                      {recipe.difficulty}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-[#FE9412] transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-orange-50 text-[#FE9412] text-xs font-medium rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.cookTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings} porsi</span>
                    </div>
                  </div>

                  {/* Rating & Author */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">{recipe.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{recipe.author}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {searchData.data.slice(0, 15).map((data, idx) => (
              data.image_url  && <CardRecipe key={idx} data={data}/>
            ))
            }

          </motion.div>
        )
      }
    </section>
  );
};

export default RecommendedSection;

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
