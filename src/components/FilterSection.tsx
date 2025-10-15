'use client';

import { ChevronDown } from 'lucide-react';

const filters = [
  { label: 'Kategori', options: ['Semua', 'Makanan', 'Minuman', 'Dessert'] },
  { label: 'Rasa', options: ['Semua', 'Manis', 'Asin', 'Pedas', 'Asam'] },
  { label: 'Gula', options: ['Semua', 'Rendah Gula', 'Tanpa Gula'] },
  { label: 'Kalori', options: ['Semua', '<200', '200-500', '>500'] },
  { label: 'Tingkat Kesulitan', options: ['Semua', 'Mudah', 'Sedang', 'Sulit'] },
  { label: 'Waktu Memasak', options: ['Semua', '<30 menit', '30-60 menit', '>60 menit'] },
  { label: 'Diet', options: ['Semua', 'Vegetarian', 'Vegan', 'Keto', 'Halal'] },
];

export default function FilterSection() {
  return (
    <section className="bg-white border-b border-gray-100 py-4 px-4 sticky top-16 z-20">
      <div className="max-w-7xl mx-auto">
        {/* Filter Buttons */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.label}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#FE9412] hover:text-[#FE9412] transition whitespace-nowrap text-sm font-medium text-gray-700"
            >
              {filter.label}
              <ChevronDown className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Cari Resep Impian Button */}
        <div className="flex justify-center mt-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#FE9412] text-white rounded-lg hover:bg-[#e58510] transition font-medium shadow-md">
            <span className="text-lg">🔍</span>
            <span>Cari Resep Impian</span>
          </button>
        </div>
      </div>
    </section>
  );
}