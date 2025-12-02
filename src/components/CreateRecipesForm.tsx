'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Upload, ChefHat, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { createSupabaseBrowser } from '@/lib/supabase_client';
import { useSession } from 'next-auth/react';

export default function CreateRecipeForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowser();
  
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

  const uploadImage = async () => {
    const fileInput = document.getElementById("recipe-image") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return null;

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: form,
      });

      // Cek content type response
      const contentType = res.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", await res.text());
        throw new Error("Server returned invalid response");
      }

      const data = await res.json();

      if (!res.ok) {
        console.error("Upload failed:", data.error);
        throw new Error(data.error || "Gagal upload gambar");
      }

      console.log("✅ Upload success:", data);
      return data.url;

    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setLoading(true);

    // --------------------------
    // VALIDASI WAJIB
    // --------------------------

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("❌ Judul dan deskripsi wajib diisi!");
      setLoading(false);
      return;
    }

    const validIngredients = ingredients.filter(i => i.trim() !== '');
    const validSteps = steps.filter(s => s.trim() !== '');

    if (validIngredients.length === 0) {
      alert("❌ Minimal 1 bahan harus diisi!");
      setLoading(false);
      return;
    }

    if (validSteps.length === 0) {
      alert("❌ Minimal 1 langkah memasak harus diisi!");
      setLoading(false);
      return;
    }

    if (!session?.user?.email) {
      alert("❌ Kamu harus login dulu!");
      setLoading(false);
      return;
    }

    // --------------------------
    // UPLOAD GAMBAR (OPSIONAL)
    // --------------------------
    let imageUrl = null;
    
    const fileInput = document.getElementById("recipe-image") as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      try {
        imageUrl = await uploadImage();
        
        if (!imageUrl) {
          alert("❌ Gagal upload gambar. Coba lagi!");
          setLoading(false);
          return;
        }
        
        console.log("✅ Gambar berhasil diupload:", imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("❌ Terjadi kesalahan saat upload gambar!");
        setLoading(false);
        return;
      }
    }

    // --------------------------
    // DAPATKAN USER UUID DARI EMAIL
    // --------------------------
    console.log("🔍 Mencari user dengan email:", session.user.email);
    
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      console.error("❌ User not found:", userError);
      alert("❌ User tidak ditemukan di database! Pastikan akun sudah terdaftar.");
      setLoading(false);
      return;
    }

    console.log("✅ User UUID ditemukan:", userData.id);

    // --------------------------
    // INSERT DATA KE SUPABASE
    // --------------------------
    const { data, error } = await supabase.from("resep").insert([
      {
        user_id: userData.id, // ← Gunakan UUID dari database
        title: formData.title,
        description: formData.description,
        prep_time: parseInt(formData.prepTime || "0"),
        cook_time: parseInt(formData.cookTime || "0"),
        servings: parseInt(formData.servings || "1"),
        difficulty: formData.difficulty,
        category: formData.category || null,
        ingredients: validIngredients,
        steps: validSteps,
        status,
        image_url: imageUrl,
      },
    ]).select();

    if (error) {
      console.error("❌ SUPABASE ERROR:", error);
      alert(`❌ Gagal menyimpan resep! Error: ${error.message}`);
      setLoading(false);
      return;
    }

    console.log("✅ Resep berhasil disimpan:", data);

    alert(status === "published"
      ? "✅ Resep berhasil dipublikasikan!"
      : "✅ Resep disimpan sebagai draft!"
    );

    setLoading(false);
    router.push('/my-recipes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-[#FE9412] to-[#902E2B] rounded-xl shadow-lg">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#902E2B] to-[#FE9412] bg-clip-text text-transparent">
                Buat Resep Baru
              </h1>
              <p className="text-gray-600">Bagikan resep favoritmu dengan komunitas</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-[#FE9412] to-[#902E2B] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                1
              </span>
              Foto Resep
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative w-full h-64 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl overflow-hidden mb-4 border-2 border-dashed border-orange-300">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-orange-400">
                    <Upload className="w-12 h-12 mb-2" />
                    <p className="font-medium">Upload foto resep</p>
                    <p className="text-sm">PNG, JPG hingga 5MB</p>
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white px-6 py-3 rounded-full hover:shadow-lg transition font-medium inline-flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <input id="recipe-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview ? 'Ganti Foto' : 'Pilih Foto'}
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-[#FE9412] to-[#902E2B] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                2
              </span>
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
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-[#FE9412] outline-none text-gray-900 bg-white"
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
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-[#FE9412] focus:border-[#FE9412] resize-none outline-none text-gray-900 bg-white"
                  placeholder="Ceritakan tentang resep ini..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1 text-[#FE9412]" />
                    Waktu Persiapan (menit)
                  </label>
                  <input
                    type="number"
                    name="prepTime"
                    value={formData.prepTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-[#FE9412] outline-none text-gray-900 bg-white"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1 text-[#FE9412]" />
                    Waktu Memasak (menit)
                  </label>
                  <input
                    type="number"
                    name="cookTime"
                    value={formData.cookTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-[#FE9412] outline-none text-gray-900 bg-white"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1 text-[#FE9412]" />
                    Jumlah Porsi
                  </label>
                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-[#FE9412] outline-none text-gray-900 bg-white"
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
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-[#FE9412] outline-none bg-white text-gray-900"
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
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-[#FE9412] outline-none bg-white text-gray-900"
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
          <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-[#FE9412] to-[#902E2B] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                3
              </span>
              Bahan-Bahan <span className="text-red-500">*</span>
            </h2>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-[#FE9412] font-bold w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-[#FE9412] outline-none text-gray-900 bg-white"
                    placeholder="Contoh: 2 cup beras putih"
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
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-2 text-[#FE9412] hover:text-[#902E2B] font-medium px-4 py-2 hover:bg-orange-50 rounded-xl transition"
              >
                <Plus className="w-5 h-5" />
                Tambah Bahan
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-[#FE9412] to-[#902E2B] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                4
              </span>
              Langkah-Langkah <span className="text-red-500">*</span>
            </h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#FE9412] to-[#902E2B] text-white rounded-full flex items-center justify-center font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <textarea
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                      rows={3}
                      className="flex-1 px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-[#FE9412] resize-none outline-none text-gray-900 bg-white"
                      placeholder={`Jelaskan langkah ${index + 1}...`}
                    />
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl h-fit transition"
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
                className="flex items-center gap-2 text-[#FE9412] hover:text-[#902E2B] font-medium px-4 py-2 hover:bg-orange-50 rounded-xl transition"
              >
                <Plus className="w-5 h-5" />
                Tambah Langkah
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end bg-white p-4 rounded-2xl shadow-lg border border-orange-100 sticky bottom-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 font-medium transition"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 font-medium disabled:opacity-50 transition shadow-md"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan sebagai Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              className="px-6 py-3 bg-gradient-to-r from-[#FE9412] to-[#902E2B] text-white rounded-full hover:shadow-xl font-medium disabled:opacity-50 transition"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Publikasikan 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
