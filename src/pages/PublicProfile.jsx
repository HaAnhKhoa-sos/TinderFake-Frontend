import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'

export default function PublicProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url, city, gender')
        .eq('id', id)
        .limit(1)

      if (!mounted) return

      if (error) {
        console.error('Lỗi fetch public profile:', error.message)
        setError('Không thể tải hồ sơ. Vui lòng thử lại sau.')
      } else if (!data || data.length === 0) {
        setError('Không tìm thấy hồ sơ người dùng này.')
      } else {
        setProfile(data[0])
      }

      setLoading(false)
    }

    fetchProfile()

    return () => {
      mounted = false
    }
  }, [id])

  // Loading state đẹp hơn
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        <div className="max-w-md w-full px-4">
          <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-slate-200/40 mx-auto mb-4" />
            <div className="h-4 bg-slate-200/60 rounded w-32 mx-auto mb-2" />
            <div className="h-3 bg-slate-200/50 rounded w-48 mx-auto mb-1" />
            <div className="h-3 bg-slate-200/40 rounded w-40 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 px-4">
        <div className="max-w-md w-full text-center text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-2xl px-4 py-3">
          {error}
        </div>
      </div>
    )
  }

  if (!profile) return null

  const avatar =
    profile.avatar_url || 'https://placehold.co/200x200?text=No+Avatar'
  const name = profile.display_name || 'Ẩn danh'
  const bio = profile.bio || 'Người này vẫn còn là một bí ẩn ✨'
  const city = profile.city
  const gender = profile.gender

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 px-4 py-6">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="
            relative rounded-3xl
            bg-white/10 border border-white/20
            backdrop-blur-2xl
            shadow-[0_24px_60px_rgba(15,23,42,0.9)]
            px-6 pt-7 pb-6
            overflow-hidden
            text-center
          "
        >
          {/* Glow nền */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-70"
            style={{
              background:
                'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.45), transparent 55%), radial-gradient(circle at 100% 100%, rgba(129,140,248,0.6), transparent 55%)'
            }}
          />

          {/* Avatar gradient */}
          <div className="relative mb-4 flex justify-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 p-[3px] shadow-[0_0_26px_rgba(244,114,182,0.85)]">
              <img
                src={avatar}
                alt={name}
                className="w-full h-full rounded-full object-cover bg-slate-200"
              />
            </div>

            {/* chấm "online" trái tim */}
            <div className="absolute bottom-2 right-[28%] w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 to-red-500 animate-pulse flex items-center justify-center text-[10px] text-white">
                ♥
              </div>
            </div>
          </div>

          {/* Tên */}
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200 bg-clip-text text-transparent drop-shadow-sm mb-1">
            {name}
          </h1>

          {/* Tag nhỏ */}
          <div className="flex justify-center gap-2 mb-3 flex-wrap">
            {gender && (
              <span className="px-3 py-1 rounded-full text-[11px] bg-white/15 text-white border border-white/20">
                {gender === 'male'
                  ? '👨 Nam'
                  : gender === 'female'
                  ? '👩 Nữ'
                  : '🌈 Khác'}
              </span>
            )}
            {city && (
              <span className="px-3 py-1 rounded-full text-[11px] bg-white/15 text-white border border-white/20 flex items-center gap-1">
                <span>📍</span>
                <span>{city}</span>
              </span>
            )}
          </div>

          {/* Bio */}
          <p className="text-[13px] text-slate-50/90 leading-relaxed mb-4">
            {bio}
          </p>

          {/* Thanh gradient nhẹ */}
          <div className="h-px w-20 mx-auto bg-gradient-to-r from-transparent via-pink-300/80 to-transparent mb-4" />

          {/* CTA */}
          <div className="flex justify-center">
            <Link
              to={`/chat/${id}`}
              className="
                inline-flex items-center gap-2
                px-4 py-2 rounded-full text-xs font-semibold
                bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500
                text-white shadow-[0_0_20px_rgba(244,114,182,0.7)]
                hover:shadow-[0_0_26px_rgba(244,114,182,0.9)]
                hover:translate-y-[1px]
                transition-all
              "
            >
              <span>💬</span>
              <span>Mở khung chat</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
