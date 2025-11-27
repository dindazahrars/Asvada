// components/ProfilePage.tsx
'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { User, Mail, Calendar, Award, Heart, BookOpen, Camera } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);

  const stats = [
    { icon: BookOpen, label: 'Resep Dibuat', value: '12' },
    { icon: Heart, label: 'Resep Favorit', value: '45' },
    { icon: Award, label: 'Pencapaian', value: '8' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <Image
                  src={session?.user?.image || '/default-avatar.png'}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {session?.user?.name || 'User'}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {session?.user?.email}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
                >
                  {isEditing ? 'Simpan' : 'Edit Profil'}
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
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
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
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

        {/* Achievements */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pencapaian</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '🏆', title: 'First Recipe', desc: 'Buat resep pertama' },
              { emoji: '❤️', title: 'Loved Chef', desc: '100+ likes' },
              { emoji: '⭐', title: 'Rising Star', desc: '50+ followers' },
              { emoji: '🔥', title: 'Hot Streak', desc: '7 hari berturut-turut' },
            ].map((achievement, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 text-center"
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
