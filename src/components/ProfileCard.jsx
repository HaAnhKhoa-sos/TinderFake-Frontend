import React from 'react'

export default function ProfileCard({ profile }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Ảnh đại diện */}
      <img
        src={profile.avatar_url || 'https://placehold.co/150x150?text=No+Avatar'}
        alt={profile.display_name}
        className="w-32 h-32 rounded-full object-cover border-4 border-pink-200 shadow-md mb-3"
      />

      {/* Tên hiển thị */}
      <h3 className="text-xl font-semibold text-pink-600">
        {profile.display_name || 'Ẩn danh'}
      </h3>

      {/* Giới thiệu */}
      {profile.bio && (
        <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>
      )}

      {/* Thành phố */}
      {profile.city && (
        <p className="text-gray-500 text-xs mt-1">📍 {profile.city}</p>
      )}
    </div>
  )
}
