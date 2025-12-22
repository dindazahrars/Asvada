'use client';

import { X, Heart, Loader, ShoppingBasket, ChefHat } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  recipe: any; // Menggunakan any agar fleksibel dengan format data model Anda
}

export default function ModalRecipeDetail({ open, onClose, recipe }: ModalProps) {
  if (!open || !recipe) return null;

  // Fallback values agar tidak error jika data kosong
  const stepCount = recipe["Total Steps"] || 0;
  
  let difficulty;
  if (stepCount < 5) {
    difficulty = 'easy';
  } else if (stepCount >= 5 && stepCount < 10) {
    difficulty = 'medium';
  } else {
    difficulty = 'hard';
  }

  // Parsing Ingredients (Handle jika string atau array)
  const ingredients = typeof recipe["Ingredients Cleaned"] === 'string'
    ? recipe["Ingredients Cleaned"].split(',').map((item: string) => item.trim())
    : (Array.isArray(recipe["Ingredients Cleaned"]) ? recipe["Ingredients Cleaned"] : []);

  // Parsing Steps (Handle jika string atau array)
  const steps = typeof recipe.Steps === 'string'
    ? recipe.Steps.split('\n').map((item: string) => item.trim())
    : (Array.isArray(recipe.Steps) ? recipe.Steps : []);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 pt-[2%] z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="flex justify-center items-start py-8 px-4">
        
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-300">

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-500 transition z-10"
          >
            <X size={20} />
          </button>

          {/* HERO IMAGE */}
          <div className="relative h-80 rounded-2xl overflow-hidden mb-6 shadow-md bg-gray-100">
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.Title || 'Recipe Image'}
                fill
                className="object-cover"
                unoptimized={true}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-200 to-red-200">
                <ChefHat className="w-20 h-20 text-white opacity-60"/>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute bottom-0 p-6 text-white w-full">
              <div className="flex gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getDifficultyColor(difficulty)}`}>
                  {difficulty}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/30">
                  {recipe.Category || 'Dataset AI'}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold mb-1">{recipe.Title}</h1>
              {recipe.URL && (
                 <p className="text-white/80 text-sm truncate max-w-md">
                   Source: <Link href={recipe.URL} target="_blank" className="hover:underline text-blue-300">{recipe.URL}</Link>
                 </p>
              )}
            </div>
          </div>

          {/* CONTENT GRID */}
          <div className="grid lg:grid-cols-3 gap-8">

            {/* KOLOM KIRI: INFO & BAHAN */}
            <div className="space-y-6">
              {/* Stats Box */}
              <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                <h3 className="font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Loader size={18} /> Statistik
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-2"><Heart size={14} className="text-red-500"/> Likes</span>
                    <span className="font-bold">{recipe.Loves || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-2"><Loader size={14} className="text-blue-500"/> Langkah</span>
                    <span className="font-bold">{stepCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-2"><ShoppingBasket size={14} className="text-green-500"/> Bahan</span>
                    <span className="font-bold">{recipe['Total Ingredients'] || ingredients.length}</span>
                  </div>
                </div>
              </div>

              {/* Ingredients Box */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <ShoppingBasket size={18} className="text-[#FE9412]"/> Bahan-bahan
                </h3>
                <ul className="space-y-3">
                  {ingredients.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="font-bold text-[#FE9412] min-w-[1.5rem]">{i + 1}.</span>
                      <span className="capitalize">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* KOLOM KANAN: LANGKAH-LANGKAH */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                <h3 className="font-bold mb-6 text-gray-900 flex items-center gap-2">
                    <ChefHat size={18} className="text-[#FE9412]"/> Cara Memasak
                </h3>
                <div className="space-y-6">
                  {steps.map((step: string, i: number) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-[#FE9412] rounded-full flex items-center justify-center font-bold text-sm group-hover:bg-[#FE9412] group-hover:text-white transition-colors">
                        {i + 1}
                      </div>
                      <p className="pt-1 text-gray-700 text-sm leading-relaxed border-b border-gray-50 pb-4 w-full">
                        {step.replace(/^\d+\)\s*/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}