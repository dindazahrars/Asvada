'use client';

import { Clock, Users, ChefHat, X, Heart, Loader, ShoppingBasket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ModalRecipeDetail({ open, onClose, recipe }) {
  if (!open) return null;

  const stepCount = recipe["Total Steps"];
  let difficulty;

  if (stepCount < 5) {
    difficulty = 'easy'
  } else if (stepCount >= 5 && stepCount < 10) {
    difficulty = 'medium'
  } else {
    difficulty = 'hard'
  }

  const ingredients = recipe["Ingredients Cleaned"]
  .split(',')
  .map(item => item.trim());

  const steps = recipe.Steps.split('\n').map(item => item.trim());;


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  console.log(steps);
  

  return (
    <div className="fixed inset-0 pt-[5%] z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className=" flex justify-center items-start py-8 px-4">
        
        <div className="w-full max-w-5xl bg-gradient-to-br from-orange-50 via-white to-red-50 rounded-3xl shadow-xl p-4">

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="flex gap-2 items-center text-gray-600 hover:text-red-500 mb-4"
          >
            <X /> Tutup
          </button>

          {/* HERO */}
          <div className="relative h-[30rem] rounded-2xl overflow-hidden mb-6 shadow-lg">
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-200 to-red-200">
                <ChefHat className="w-20 h-20 text-white opacity-60"/>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-0 p-6 text-white">
              <div className="flex gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(difficulty)}`}>
                  {difficulty}
                </span>

                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  {recipe.Category}
                </span>
              </div>

              <h1 className="text-3xl font-bold">{recipe.Title}</h1>
              <p className="text-white/90">
                Link : <Link href={recipe.URL}>{recipe.URL}</Link>
              </p>
            </div>
          </div>

          {/* CONTENT */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* INFO + BAHAN */}
            <div className="space-y-5">

              <div className="bg-white p-5 rounded-xl shadow border">
                <h3 className="font-bold mb-3 text-gray-900">Informasi</h3>

                <div className="space-y-3">
                  <div className="flex gap-3 items-center text-gray-900">
                    <Heart  className="text-[#FE9412]" />
                    <p>{recipe.Loves} Likes</p>
                  </div>

                  <div className="flex gap-3 items-center text-gray-900">
                    <Loader className="text-[#FE9412]" />
                    <p>{recipe['Total Steps']} Tahapan Memasak</p>
                  </div>

                  <div className="flex gap-3 items-center text-gray-900">
                    <ShoppingBasket className="text-[#FE9412]" />
                    <p>{recipe['Total Ingredients']} Bahan Utama</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow border">
                <h3 className="font-bold mb-3 text-gray-900">Bahan-bahan</h3>

                <ul className="space-y-2">
                  {ingredients.map((item, i) => (
                    <li key={i} className="flex gap-2 text-gray-900">
                      <span className="font-bold ">{i + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* LANGKAH */}
            <div className="bg-white p-5 rounded-xl shadow border lg:col-span-2">
              <h3 className="font-bold mb-4 text-gray-900">Langkah-langkah</h3>

              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FE9412] to-[#902E2B] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {i + 1}
                    </div>
                    <p className="pt-2 text-gray-900">{step.replace(/^\d+\)\s*/, '')}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
