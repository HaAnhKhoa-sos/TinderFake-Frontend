import React from 'react'
import { motion } from 'framer-motion'

export default function ProfileCard({ profile }) {
  const avatar =
    profile?.avatar_url || 'https://placehold.co/200x200?text=No+Avatar'

  const name = profile?.display_name || 'Ẩn danh'
  const bio = profile?.bio || ''
  const city = profile?.city || ''

  return (
    <motion.div
      className="
        relative w-full
        flex flex-col items-center text-center
        rounded-3xl
        bg-white/10
        backdrop-blur-xl
        border border-white/30
        shadow-[0_18px_45px_rgba(244,114,182,0.45)]
        px-6 pb-6 pt-8
        overflow-hidden
      "
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Glow nền phía sau */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.45), transparent 55%), radial-gradient(circle at 100% 100%, rgba(129,140,248,0.5), transparent 55%)'
        }}
      />

      {/* Avatar viền gradient + glow */}
      <div className="relative mb-4">
        <div
          className="
            w-28 h-28
            rounded-full
            bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500
            p-[3px]
            shadow-[0_0_25px_rgba(244,114,182,0.7)]
          "
        >
          <img
            src={avatar}
            alt={name}
            className="
              w-full h-full rounded-full object-cover
              bg-gray-200
            "
          />
        </div>

        {/* Chấm online / nhịp tim ở góc avatar */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 to-red-500 animate-pulse flex items-center justify-center text-[10px] text-white">
            ♥
          </div>
        </div>
      </div>

      {/* Tên hiển thị */}
      <h3
        className="
          text-lg font-extrabold mb-1
          bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500
          bg-clip-text text-transparent
          drop-shadow-sm
        "
      >
        {name}
      </h3>

      {/* Thành phố */}
      {city && (
        <p className="text-[11px] text-white/80 bg-white/10 px-3 py-1 rounded-full inline-flex items-center gap-1 mb-2">
          <span>📍</span>
          <span>{city}</span>
        </p>
      )}

      {/* Bio */}
      {bio && (
        <p className="mt-2 text-xs text-white/85 leading-relaxed max-w-xs">
          {bio}
        </p>
      )}
    </motion.div>
  )
}
