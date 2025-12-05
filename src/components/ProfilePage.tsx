'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { User, Mail, Calendar, Award, Heart, BookOpen, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase_client';

// ⬇️ Interface untuk stats
interface Stats {
  totalResep: number;
  totalLikes: number;
  streakDays: number;
}

// ⬇️ Interface untuk Achievement yang ditampilkan
interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  unlocked: boolean;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const supabase = createSupabaseBrowser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Bio
  const [bio, setBio] = useState('');
  const [tempBio, setTempBio] = useState('');

  // Stats Supabase
  const [totalResep, setTotalResep] = useState(0);
  const [totalFavorite, setTotalFavorite] = useState(0);
  const [achievement, setAchievement] = useState(0);

  // Achievements
  const [achievementList, setAchievementList] = useState<AchievementItem[]>([]);

  useEffect(() => {
  if (!session?.user?.email) return;

  const loadData = async () => {

    // Ambil UUID Supabase berdasarkan email
    const { data: userRow, error } = await supabase
      .from("users")
      .select("id, bio, achievement")
      .eq("email", session.user.email)
      .single();

    if (!userRow) {
      console.error("User tidak ditemukan:", error);
      return;
    }

    const userId = userRow.id;

    // Set BIO dari Supabase
    setBio(userRow.bio || "");
    setTempBio(userRow.bio || "");
    setAchievement(userRow.achievement || 0);

    // Hitung total resep
    const { count: resepCount } = await supabase
      .from("resep")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Hitung total favorite
    const { count: favCount } = await supabase
      .from("favorite")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    setTotalResep(resepCount || 0);
    setTotalFavorite(favCount || 0);

    // Ambil total likes dari semua resep user
    const { data: resepUserRaw } = await supabase
      .from("resep")
      .select("like, created_at")
      .eq("user_id", userId);

    const resepUser = resepUserRaw ?? []; // ALWAYS array

    const totalLikes = resepUser?.reduce((sum, r) => sum + (r.like || 0), 0) || 0;

    // Hitung streak upload resep 7 hari berturut-turut
    let streakDays = 1;

    if (resepUser?.length > 0) {
      // Urutkan tanggal upload resep
      const dates = resepUser
        .map(r => new Date(r.created_at))
        .sort((a, b) => b.getTime() - a.getTime());

      for (let i = 0; i < dates.length - 1; i++) {
        const diff =
          (dates[i].getTime() - dates[i + 1].getTime()) / (1000 * 60 * 60 * 24);

        if (diff <= 1.2) { // toleransi timezone
          streakDays++;
        } else {
          break;
        }
      }
    }

    const stats: Stats = {
    totalResep: resepCount || 0,
    totalLikes,
    streakDays
    };

    // Jalankan rules
      await checkAchievements(userId, stats);

    // Update UI achievement list
    generateAchievementList(stats);
  };

  loadData();
  }, [session]);

  const stats = [
    { icon: BookOpen, label: 'Resep Dibuat', value: totalResep, color: 'text-blue-500' },
    { icon: Heart, label: 'Resep Favorit', value: totalFavorite, color: 'text-pink-500' },
    { icon: Award, label: 'Pencapaian', value: achievement, color: 'text-yellow-500' },
  ];

  // RULES BASE
  const achievementRules = [
    {
      id: "first_recipe",
      condition: (s: Stats) => s.totalResep >= 1,
      title: "First Recipe",
      description: "Buat resep pertama",
      icon: "🏆",
    },
    {
      id: "liked10",
      condition: (s: Stats) => s.totalLikes >= 10,
      title: "Loved Chef",
      description: "10+ likes",
      icon: "❤️",
    },
    {
      id: "liked50",
      condition: (s: Stats) => s.totalLikes >= 50,
      title: "Master Chef",
      description: "50+ likes",
      icon: "⭐",
    },
    {
      id: "streak7",
      condition: (s: Stats) => s.streakDays >= 7,
      title: "Hot Streak",
      description: "7 hari berturut-turut",
      icon: "🔥",
    },
  ];

  // ⬇️ Convert rules → UI item
  const generateAchievementList = (stats: Stats) => {
    const list: AchievementItem[] = achievementRules.map(rule => ({
      id: rule.id,
      title: rule.title,
      description: rule.description,
      icon: rule.icon,
      unlocked: rule.condition(stats),
    }));

    setAchievementList(list);
  };

  // ⬇️ Insert achievements ke DB
  const checkAchievements = async (userId: string, stats: Stats) => {
    const { data: existing } = await supabase
      .from('achievements')
      .select('title')
      .eq('user_id', userId);

    const existingTitles = existing?.map(a => a.title) || [];

    for (const rule of achievementRules) {
      if (!existingTitles.includes(rule.title) && rule.condition(stats)) {
        await supabase.from('achievements').insert({
          user_id: userId,
          title: rule.title,
          description: rule.description,
          icon: rule.icon,
        });
      }
    }
  };

  // Save Bio
  const handleSave = async () => {
  if (!session?.user?.email) return;

  setIsSaving(true);

  // 🔍 ambil UUID Supabase berdasarkan email
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (userError || !userData) {
    console.error("User tidak ditemukan:", userError);
    alert("❌ User tidak ditemukan di database!");
    setIsSaving(false);
    return;
  }

  // 🔥 update bio pakai ID Supabase
  const { error: updateError } = await supabase
    .from("users")
    .update({ bio: tempBio })
    .eq("id", userData.id);

  if (updateError) {
    console.error("Gagal update bio:", updateError);
    alert("Gagal menyimpan Bio!");
  } else {
    setBio(tempBio);
    alert("Bio berhasil diperbarui! ✅");
  }

  setIsEditing(false);
  setIsSaving(false);
  };

  const handleCancel = () => {
    setTempBio(bio);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setTempBio(bio);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#902E2B] to-[#6b2220] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <Image
                  src={session?.user?.image || '/default-avatar.png'}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {session?.user?.name || 'User'}
              </h1>
              <p className="text-purple-100 flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4" />
                {session?.user?.email}
              </p>
              <div className="flex items-center gap-2 text-sm text-purple-100">
                <Calendar className="w-4 h-4" />
                Bergabung sejak Januari 2025
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition"
              >
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-purple-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bio Section - EDITABLE */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-purple-500" />
              Tentang Saya
            </h2>
            
            {/* Edit/Save/Cancel Buttons */}
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {/* Bio Content */}
          {isEditing ? (
            <textarea
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-700"
              rows={5}
              placeholder="Ceritakan tentang dirimu dan passion memasak..."
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {bio}
            </p>
          )}
        </div>

        {/* ACHIEVEMENTS */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Pencapaian
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievementList.map((a, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 text-center transition-all ${
                  a.unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md hover:scale-105'
                    : 'bg-gray-100 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{a.icon}</div>
                <div className="font-semibold text-gray-900 text-sm">{a.title}</div>
                <div className="text-xs text-gray-600 mt-1">{a.description}</div>

                {a.unlocked && (
                  <div className="mt-2 text-xs text-green-600 font-semibold">
                    ✓ Terbuka
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}