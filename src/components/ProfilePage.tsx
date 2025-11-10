'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { User, Mail, Calendar, Award, Heart, BookOpen, Save, X } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State untuk bio
  const [bio, setBio] = useState(
    'Saya seorang food enthusiast yang suka bereksperimen dengan resep-resep baru. Spesialisasi saya adalah masakan Indonesia modern dengan sentuhan fusion.'
  );
  const [tempBio, setTempBio] = useState(bio);

  const stats = [
    { icon: BookOpen, label: 'Resep Dibuat', value: '12', color: 'text-blue-500' },
    { icon: Heart, label: 'Resep Favorit', value: '45', color: 'text-pink-500' },
    { icon: Award, label: 'Pencapaian', value: '8', color: 'text-yellow-500' },
  ];

  const handleEdit = () => {
    setTempBio(bio);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempBio(bio);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulasi API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update bio
    setBio(tempBio);
    
    setIsSaving(false);
    setIsEditing(false);
    
    // Show success message
    alert('Bio berhasil diperbarui! ✅');
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

        {/* Achievements - READ ONLY */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Pencapaian
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '🏆', title: 'First Recipe', desc: 'Buat resep pertama', unlocked: true },
              { emoji: '❤️', title: 'Loved Chef', desc: '100+ likes', unlocked: true },
              { emoji: '⭐', title: 'Rising Star', desc: '50+ followers', unlocked: false },
              { emoji: '🔥', title: 'Hot Streak', desc: '7 hari berturut-turut', unlocked: true },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`rounded-xl p-4 text-center transition-all hover:scale-105 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md'
                    : 'bg-gray-100 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.emoji}</div>
                <div className="font-semibold text-gray-900 text-sm">{achievement.title}</div>
                <div className="text-xs text-gray-600 mt-1">{achievement.desc}</div>
                {achievement.unlocked && (
                  <div className="mt-2 text-xs text-green-600 font-semibold">✓ Terbuka</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
