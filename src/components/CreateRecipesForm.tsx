'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Upload, ChefHat, Clock, Users } from 'lucide-react';
import Image from 'next/image';

export default function CreateRecipeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'medium',
    category: '',
  });

  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    setLoading(true);
    
    if (!formData.title || !formData.description) {
      alert('Judul dan deskripsi harus diisi!');
      setLoading(false);
      return;
    }

    const filteredIngredients = ingredients.filter(i => i.trim() !== '');
    const filteredSteps = steps.filter(s => s.trim() !== '');

    if (filteredIngredients.length === 0 || filteredSteps.length === 0) {
      alert('Bahan dan langkah-langkah harus diisi!');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      alert(`Resep berhasil ${status === 'published' ? 'dipublikasikan' : 'disimpan sebagai draft'}!`);
      router.push('/my-recipes');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <ChefHat className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Buat Resep Baru</h1>
              <p className="text-gray-600">Bagikan resep favoritmu dengan komunitas</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Foto Resep
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-4 border-2 border-dashed border-gray-300">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Upload className="w-12 h-12 mb-2" />
                    <p className="font-medium">Upload foto resep</p>
                    <p className="text-sm">PNG, JPG hingga 5MB</p>
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition font-medium inline-flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview ? 'Ganti Foto' : 'Pilih Foto'}
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Informasi Dasar
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Resep <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  placeholder="Contoh: Nasi Goreng Spesial"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none outline-none text-gray-900 bg-white"
                  placeholder="Ceritakan tentang resep ini..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Waktu Persiapan (menit)
                  </label>
                  <input
                    type="number"
                    name="prepTime"
                    value={formData.prepTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Waktu Memasak (menit)
                  </label>
                  <input
                    type="number"
                    name="cookTime"
                    value={formData.cookTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Jumlah Porsi
                  </label>
                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                    placeholder="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tingkat Kesulitan
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                  >
                    <option value="easy">Mudah</option>
                    <option value="medium">Sedang</option>
                    <option value="hard">Sulit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="main-course">Makanan Utama</option>
                  <option value="appetizer">Pembuka</option>
                  <option value="dessert">Dessert</option>
                  <option value="beverage">Minuman</option>
                  <option value="snack">Camilan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Bahan-Bahan <span className="text-red-500">*</span>
            </h2>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-gray-400 font-medium w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                    placeholder="Contoh: 2 cup beras putih"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium px-4 py-2 hover:bg-blue-50 rounded-xl"
              >
                <Plus className="w-5 h-5" />
                Tambah Bahan
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Langkah-Langkah <span className="text-red-500">*</span>
            </h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <textarea
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                      rows={3}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none outline-none text-gray-900 bg-white"
                      placeholder={`Jelaskan langkah ${index + 1}...`}
                    />
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl h-fit"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium px-4 py-2 hover:bg-blue-50 rounded-xl"
              >
                <Plus className="w-5 h-5" />
                Tambah Langkah
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end bg-white p-4 rounded-2xl shadow-lg border border-gray-100 sticky bottom-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 font-medium disabled:opacity-50"
              disabled={loading}
            >
              Simpan sebagai Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Publikasikan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
