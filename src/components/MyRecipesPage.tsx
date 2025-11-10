'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Plus, BookOpen, Edit, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Tambahkan ini

export default function MyRecipesPage() {
  const { data: session } = useSession();
  const router = useRouter(); // Tambahkan ini
  const [recipes, setRecipes] = useState([
    {
      id: '1',
      title: 'Nasi Goreng Spesial',
      image: '/placeholder-recipe.jpg',
      status: 'published',
      views: 245,
      createdAt: '2025-01-15',
    },
  ]);

  return (
    <div className="min-h-screen">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {recipes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Belum Ada Resep
            </h2>
            <p className="text-gray-500 mb-6">
              Mulai berbagi resep favoritmu dengan dunia
            </p>
            <button 
              onClick={() => router.push('/recipes/create')} 
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition"
            >
              <Plus className="w-5 h-5" />
              Buat Resep Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition border border-gray-100"
              >
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {recipe.views} views
                      </span>
                      <span>Dibuat: {recipe.createdAt}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          recipe.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {recipe.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                    </div>
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
