'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Clock, Users, ChefHat, Trash2 } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  image: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  savedAt: string;
}

export default function FavoritesPage() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi fetch data dari localStorage atau API
    const loadFavorites = () => {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
      setLoading(false);
    };

    loadFavorites();
  }, []);

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((recipe) => recipe.id !== id);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resep Favorit</h1>
              <p className="text-gray-600">
                {favorites.length} resep tersimpan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Belum Ada Resep Favorit
            </h2>
            <p className="text-gray-500 mb-6">
              Mulai simpan resep favoritmu untuk akses cepat
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition"
            >
              <ChefHat className="w-5 h-5" />
              Cari Resep
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group"
              >
                <div className="relative h-48">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                  <button
                    onClick={() => removeFavorite(recipe.id)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recipe.cookTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {recipe.servings} porsi
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                      {recipe.difficulty}
                    </span>
                    <Link
                      href={`/recipe/${recipe.id}`}
                      className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                    >
                      Lihat Resep →
                    </Link>
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
