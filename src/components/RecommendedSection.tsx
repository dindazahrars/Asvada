'use client';

import { motion } from 'framer-motion';
import { Clock, Users, Star, Bookmark, ChefHat } from 'lucide-react';
import Image from 'next/image';

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

const RecommendedSection = () => {
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

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 mt-20 relative z-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Rekomendasi Resep
          </h2>
          <p className="text-gray-600">
            Resep pilihan yang mungkin kamu suka
          </p>
        </div>
      </div>

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
    </section>
  );
};

export default RecommendedSection;
