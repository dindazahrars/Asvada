'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { useSession } from 'next-auth/react';

interface Recipe {
  id: number;
  user_id: string;
  title: string;
  description: string;
  image_url: string | null;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  category: string | null;
  ingredients: string[];
  steps: string[];
  status: 'draft' | 'published';
}

export default function EditRecipeForm() {
  const router = useRouter();
  const params = useParams(); // 👈 Ambil ID dari URL
  const { data: session } = useSession();
  const supabase = createSupabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState(30);
  const [cookTime, setCookTime] = useState(30);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState('medium');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  useEffect(() => {
    if (params.id) {
      loadRecipe();
    }
  }, [params.id]); // 👈 Trigger saat ID berubah

  const loadRecipe = async () => {
    try {
      const recipeId = params.id as string; // 👈 Ambil ID dari params

      const { data, error } = await supabase
        .from('resep')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error || !data) {
        alert('❌ Resep tidak ditemukan!');
        router.push('/my-recipes');
        return;
      }

      // Check if user is owner
      if (session?.user?.email) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (!userData || userData.id !== data.user_id) {
          alert('❌ Anda tidak memiliki akses untuk mengedit resep ini!');
          router.push('/my-recipes');
          return;
        }
      }

      setRecipe(data);
      setTitle(data.title);
      setDescription(data.description);
      setImageUrl(data.image_url || '');
      setPrepTime(data.prep_time);
      setCookTime(data.cook_time);
      setServings(data.servings);
      setDifficulty(data.difficulty);
      setCategory(data.category || '');
      setIngredients(data.ingredients.length > 0 ? data.ingredients : ['']);
      setSteps(data.steps.length > 0 ? data.steps : ['']);
      setStatus(data.status);
    } catch (error) {
      console.error('Error loading recipe:', error);
      alert('❌ Terjadi kesalahan!');
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent, saveStatus: 'draft' | 'published') => {
    e.preventDefault();
    setSaving(true);

    try {
      const recipeId = params.id as string; // 👈 Ambil ID dari params

      // Validation
      if (!title.trim()) {
        alert('❌ Judul resep harus diisi!');
        setSaving(false);
        return;
      }

      const filteredIngredients = ingredients.filter(i => i.trim() !== '');
      const filteredSteps = steps.filter(s => s.trim() !== '');

      if (filteredIngredients.length === 0) {
        alert('❌ Minimal 1 bahan harus diisi!');
        setSaving(false);
        return;
      }

      if (filteredSteps.length === 0) {
        alert('❌ Minimal 1 langkah harus diisi!');
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('resep')
        .update({
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl.trim() || null,
          prep_time: prepTime,
          cook_time: cookTime,
          servings: servings,
          difficulty: difficulty,
          category: category.trim() || null,
          ingredients: filteredIngredients,
          steps: filteredSteps,
          status: saveStatus,
        })
        .eq('id', recipeId);

      if (error) {
        console.error('Error updating recipe:', error);
        alert('❌ Gagal menyimpan resep!');
        return;
      }

      alert(`✅ Resep berhasil ${saveStatus === 'published' ? 'dipublikasikan' : 'disimpan sebagai draft'}!`);
      router.push('/my-recipes');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Terjadi kesalahan!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FE9412] mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat resep...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-orange-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ✏️ Edit Resep
        </h1>

        <form className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Judul Resep *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-transparent"
                placeholder="Contoh: Nasi Goreng Spesial"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-transparent"
                placeholder="Ceritakan tentang resep ini..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL Gambar
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {imageUrl && (
                <div className="mt-4 relative h-48 rounded-xl overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Time & Servings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Waktu Persiapan (menit)
              </label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Waktu Memasak (menit)
              </label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Porsi
              </label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-transparent"
              />
            </div>
          </div>

          {/* Difficulty & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tingkat Kesulitan
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-transparent"
              >
                <option value="easy">Mudah</option>
                <option value="medium">Sedang</option>
                <option value="hard">Sulit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kategori
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-transparent"
                placeholder="Contoh: Makanan Utama, Dessert, dll"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Bahan-Bahan *
            </label>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-transparent"
                    placeholder={`Bahan ${index + 1}`}
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredient}
              className="mt-3 flex items-center gap-2 text-[#FE9412] hover:text-[#e58410] font-medium"
            >
              <Plus className="w-5 h-5" />
              Tambah Bahan
            </button>
          </div>

          {/* Steps */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Langkah-Langkah *
            </label>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#FE9412] text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    rows={2}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-transparent"
                    placeholder={`Langkah ${index + 1}`}
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStep}
              className="mt-3 flex items-center gap-2 text-[#FE9412] hover:text-[#e58410] font-medium"
            >
              <Plus className="w-5 h-5" />
              Tambah Langkah
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={saving}
              className="flex-1 px-6 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                '📝 Simpan sebagai Draft'
              )}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'published')}
              disabled={saving}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white rounded-xl hover:shadow-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                '🚀 Publikasikan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
