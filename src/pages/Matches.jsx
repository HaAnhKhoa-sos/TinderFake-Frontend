import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'

export default function Matches({ session }) {
  const currentUserId = session?.user?.id
  const [matchedProfiles, setMatchedProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUserId) return

    let mounted = true

    const loadMatchedProfiles = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1️⃣ Lấy danh sách match liên quan đến currentUser
        const { data: matches, error: matchErr } = await supabase
          .from('matches')
          .select('user_a, user_b')
          .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`)

        if (matchErr) throw matchErr

        if (!matches || matches.length === 0) {
          if (mounted) setMatchedProfiles([])
          return
        }

        // 2️⃣ Lấy danh sách ID người đã match với currentUser
        const matchedIds = matches.map(m =>
          m.user_a === currentUserId ? m.user_b : m.user_a
        )

        // 3️⃣ Lấy thông tin hồ sơ của những người đó
        const { data: profiles, error: profileErr } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, city, bio')
          .in('id', matchedIds)

        if (profileErr) throw profileErr

        if (mounted) {
          setMatchedProfiles(profiles || [])
        }
      } catch (err) {
        console.error('Lỗi load matched profiles:', err)
        if (mounted) {
          setError('Không thể tải danh sách match. Vui lòng thử lại sau.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadMatchedProfiles()

    return () => {
      mounted = false
    }
  }, [currentUserId])

  const handleChat = (targetId) => {
    navigate(`/chat/${targetId}`)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200 bg-clip-text text-transparent">
              Những người đã “match” với bạn 💞
            </h1>
            <p className="text-[12px] text-slate-300 mt-1">
              Hãy mở lời trước — cơ hội không chờ ai đâu 😉
            </p>
          </div>
          <span className="text-[11px] text-slate-400 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            {matchedProfiles.length} match
          </span>
        </div>

        {loading && (
          <div className="mt-10 text-center text-sm text-slate-300">
            ⏳ Đang tải danh sách match...
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 text-center text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && matchedProfiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center text-slate-300 text-sm"
          >
            <p className="mb-2">Bạn chưa match với ai cả 😢</p>
            <p className="text-[12px] text-slate-400">
              Hãy tích cực khám phá ở mục Discover để tăng cơ hội nhé!
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {matchedProfiles.map((user) => {
              const avatar =
                user.avatar_url ||
                'https://placehold.co/200x200?text=No+Avatar'

              return (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="
                    relative
                    rounded-2xl
                    bg-white/8 border border-white/15
                    backdrop-blur-xl
                    shadow-[0_16px_40px_rgba(15,23,42,0.85)]
                    px-3 pt-4 pb-3
                    flex flex-col items-center text-center
                    overflow-hidden
                    hover:shadow-[0_18px_50px_rgba(244,114,182,0.75)]
                    hover:-translate-y-[2px]
                    transition-all
                  "
                >
                  {/* glow nền nhẹ mỗi card */}
                  <div
                    className="pointer-events-none absolute inset-0 -z-10 opacity-70"
                    style={{
                      background:
                        'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.4), transparent 55%), radial-gradient(circle at 100% 100%, rgba(129,140,248,0.55), transparent 55%)'
                    }}
                  />

                  {/* avatar + badge */}
                  <div className="relative mb-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 p-[2.5px] shadow-[0_0_18px_rgba(244,114,182,0.8)]">
                      <img
                        src={avatar}
                        alt={user.display_name}
                        className="w-full h-full rounded-full object-cover bg-slate-200"
                      />
                    </div>
                    <div className="absolute -bottom-1 right-0 px-2 py-[2px] rounded-full bg-emerald-500 text-[10px] text-white shadow-md">
                      Match 💘
                    </div>
                  </div>

                  {/* tên + info */}
                  <div className="mb-2">
                    <h3 className="text-[13px] font-semibold text-white truncate max-w-[110px] mx-auto">
                      {user.display_name || 'Ẩn danh'}
                    </h3>
                    {user.city && (
                      <p className="text-[11px] text-slate-200 mt-0.5 truncate max-w-[120px] mx-auto">
                        📍 {user.city}
                      </p>
                    )}
                  </div>

                  {/* nút chat */}
                  <button
                    onClick={() => handleChat(user.id)}
                    className="
                      inline-flex items-center justify-center gap-1
                      w-full
                      text-[11px] font-medium
                      px-3 py-1.5
                      rounded-full
                      bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500
                      text-white
                      shadow-[0_0_18px_rgba(244,114,182,0.8)]
                      hover:shadow-[0_0_24px_rgba(244,114,182,1)]
                      hover:translate-y-[1px]
                      transition-all
                    "
                  >
                    <span>💬</span>
                    <span>Chat Love</span>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}
