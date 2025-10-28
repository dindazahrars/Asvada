'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Clock, ChefHat, Star, Bookmark, Search } from 'lucide-react';

interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  cookTime: string;
  difficulty: string;
}

interface ResultsSectionProps {
  recipes: Recipe[];
  searchQuery: string;
}

const ResultsSection = ({ recipes, searchQuery }: ResultsSectionProps) => {
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
    <section className="max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Search className="w-6 h-6 text-[#FE9412]" />
          <h2 className="text-3xl font-bold text-gray-900">
            Hasil Pencarian
          </h2>
        </div>
        <p className="text-gray-600">
          Ditemukan <span className="font-semibold text-[#902E2B]">{recipes.length}</span> resep
          {searchQuery && (
            <span> untuk  &quot;{searchQuery}&quot;</span>
          )}
        </p>
      </div>

      {/* Results Grid */}
      {recipes.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {recipes.map((recipe) => (
            <motion.article
              key={recipe.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-[#902E2B] hover:text-white transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 bg-[#FE9412] text-white text-xs font-semibold rounded-full shadow-md">
                    {recipe.difficulty}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-[#FE9412] transition-colors">
                  {recipe.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {recipe.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-[#FE9412]" />
                    <span className="text-sm font-medium">{recipe.cookTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900">4.5</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      ) : (
        // Empty State
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="text-7xl mb-6">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Tidak ada resep ditemukan
          </h3>
          <p className="text-gray-600 mb-6">
            Coba kata kunci lain atau ubah filter pencarian
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#FE9412] text-white rounded-xl hover:bg-[#e58510] transition-colors font-medium shadow-md"
          >
            Kembali ke Beranda
          </button>
        </motion.div>
      )}
    </section>
  );
};

export default ResultsSection;