import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import IntroGamePopup from '../components/IntroGamePopup'
import { API_BASE } from '../lib/api'

export default function Profile({ session }) {
  const user = session.user

  const [profile, setProfile] = useState({
    id: user.id,
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    city: '',
    gender: '',
    birthday: ''
  })

  const [initialLoading, setInitialLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [hasSavedProfile, setHasSavedProfile] = useState(false)
  const [hasPlayedGame, setHasPlayedGame] = useState(false)
  const [showIntroGame, setShowIntroGame] = useState(false)
  const [gameSaving, setGameSaving] = useState(false)

  // 🔹 Lấy profile từ DB + cache localStorage
  useEffect(() => {
    let mounted = true
    const cacheKey = `profile_${user.id}`

    // 1. Lấy cache để hiển thị nhanh
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (mounted) {
          setProfile(prev => ({ ...prev, ...parsed }))
          setHasSavedProfile(true)
          setInitialLoading(false)
        }
      } catch (e) {
        console.warn('⚠️ Lỗi parse profile cache:', e)
      }
    }

    // 2. Lấy từ Supabase để sync mới nhất
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, avatar_url, city, gender, birthday')
        .eq('id', user.id)
        .maybeSingle()

      if (!mounted) return

      if (error) {
        console.error('Lỗi fetch profile:', error.message)
      }

      if (data) {
        setProfile(prev => ({ ...prev, ...data }))
        localStorage.setItem(cacheKey, JSON.stringify(data))
        setHasSavedProfile(true)
      }

      setInitialLoading(false)
    }

    fetchProfile()

    return () => {
      mounted = false
    }
  }, [user.id])

  // 🔹 Kiểm tra đã từng chơi game intro chưa
  useEffect(() => {
    const checkPlayedGame = async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_id', '00000000-0000-0000-0000-000000000003') // game onboarding
        .limit(1)

      if (error) {
        console.error('Lỗi kiểm tra game_sessions:', error.message)
        return
      }

      if (data && data.length > 0) {
        setHasPlayedGame(true)
      }
    }

    checkPlayedGame()
  }, [user.id])

  // 🔹 Lưu hoặc cập nhật hồ sơ
  const saveProfile = async () => {
    if (saving) return
    setSaving(true)

    if (!profile.username || !profile.display_name) {
      alert('Vui lòng nhập Tên người dùng và Tên hiển thị trước khi lưu.')
      setSaving(false)
      return
    }

    const updates = {
      ...profile,
      id: user.id
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        alert('❌ Lỗi khi lưu hồ sơ: ' + error.message)
      } else {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(data))
        setHasSavedProfile(true)
        alert('✅ Hồ sơ đã được cập nhật!')
      }
    } catch (err) {
      console.error('Lỗi lưu profile:', err)
      alert('Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      // 🔥 Tắt trạng thái ngay khi xong để không bị cảm giác lag
      setSaving(false)
    }
  }

  // 🔹 Khi hoàn thành game intro
  const handleIntroGameComplete = async (traits) => {
    if (gameSaving) return
    setGameSaving(true)

    // Tắt popup ngay cho đỡ cảm giác lag
    setShowIntroGame(false)

    try {
      const res = await fetch(`${API_BASE}/api/games/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          gameId: '00000000-0000-0000-0000-000000000003',
          traits,
          score: traits.compatibility_score || traits.intro_score || 1
        })
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || 'Không thể lưu kết quả game')
      }

      setHasPlayedGame(true)
      alert('✅ Đã lưu thông tin game, gợi ý sẽ chuẩn hơn nữa!')
    } catch (err) {
      console.error('❌ Lỗi lưu game onboarding:', err)
      alert('Lưu kết quả game thất bại.')
    } finally {
      setGameSaving(false)
    }
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result
      setProfile(p => ({ ...p, avatar_url: base64 }))
    }
    reader.readAsDataURL(file)
  }

  if (initialLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        <div className="max-w-md w-full px-4">
          <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-slate-300/40 mx-auto mb-4" />
            <div className="h-4 bg-slate-300/70 rounded w-32 mx-auto mb-2" />
            <div className="h-3 bg-slate-300/50 rounded w-48 mx-auto mb-1" />
            <div className="h-3 bg-slate-300/40 rounded w-40 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  const avatar =
    profile.avatar_url || 'https://placehold.co/200x200?text=Avatar'

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Banner game intro */}
        {hasSavedProfile && !hasPlayedGame && (
          <div className="mb-4 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 p-[1px] shadow-[0_18px_40px_rgba(244,114,182,0.8)]">
            <div className="rounded-3xl bg-slate-950/90 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-300 via-pink-400 to-purple-500 flex items-center justify-center text-lg shadow-[0_0_18px_rgba(248,250,252,0.7)]">
                🎮
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-white">
                  Mini game tính cách dành riêng cho bạn
                </p>
                <p className="text-[11px] text-slate-300 mt-[2px]">
                  Chơi nhanh vài câu hỏi để hệ thống hiểu bạn hơn & gợi ý chuẩn hơn.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!hasSavedProfile) {
                    alert('Hãy nhấn "Lưu thông tin" trước khi chơi game nhé!')
                    return
                  }
                  setShowIntroGame(true)
                }}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white text-pink-600 hover:bg-pink-50 transition"
              >
                Bắt đầu
              </button>
            </div>
          </div>
        )}

        {/* Card profile chính */}
        <div
          className="
            relative rounded-3xl
            bg-white/10 border border-white/20
            backdrop-blur-2xl
            shadow-[0_24px_60px_rgba(15,23,42,0.95)]
            px-5 pt-7 pb-6
            overflow-hidden
          "
        >
          {/* Glow nền đậm hơn */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-80"
            style={{
              background:
                'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.55), transparent 55%), radial-gradient(circle at 100% 100%, rgba(79,70,229,0.7), transparent 55%)'
            }}
          />

          {/* Avatar + tên */}
          <div className="flex flex-col items-center mb-5">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 p-[3px] shadow-[0_0_30px_rgba(244,114,182,0.9)]">
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover bg-slate-200"
                />
              </div>
              <div className="absolute -bottom-1 right-0 px-2 py-[2px] rounded-full bg-emerald-500 text-[10px] text-white shadow-md">
                Hồ sơ của bạn ✨
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              className="text-[11px] text-slate-200 file:mr-2 file:px-2 file:py-1 file:rounded-full file:border-0 file:text-[11px] file:bg-white/80 file:text-slate-800 hover:file:bg-white cursor-pointer"
              onChange={handleAvatarUpload}
            />

            <p className="mt-2 text-[11px] text-slate-200/80">
              Hãy chọn một bức ảnh thật xịn — ấn tượng đầu tiên rất quan trọng 💖
            </p>
          </div>

          {/* Form fields */}
          <div className="space-y-3 text-[13px]">
            <div>
              <label className="block text-xs font-medium text-slate-100 mb-1">
                Tên người dùng (username)
              </label>
              <input
                value={profile.username || ''}
                onChange={e => setProfile({ ...profile, username: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/15 text-slate-50 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70"
                placeholder="vd: ha17"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-100 mb-1">
                Tên hiển thị
              </label>
              <input
                value={profile.display_name || ''}
                onChange={e =>
                  setProfile({ ...profile, display_name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/15 text-slate-50 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70"
                placeholder="vd: Hà Nguyễn"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-100 mb-1">
                  Giới tính
                </label>
                <select
                  value={profile.gender || ''}
                  onChange={e =>
                    setProfile({ ...profile, gender: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/15 text-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70"
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-100 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={profile.birthday || ''}
                  onChange={e =>
                    setProfile({ ...profile, birthday: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/15 text-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-100 mb-1">
                Thành phố
              </label>
              <input
                value={profile.city || ''}
                onChange={e => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/15 text-slate-50 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70"
                placeholder="vd: Hà Nội"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-100 mb-1">
                Giới thiệu bản thân
              </label>
              <textarea
                value={profile.bio || ''}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl bg-slate-950/60 border border-white/15 text-slate-50 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70"
                placeholder="Sở thích, tính cách, mong muốn..."
                rows="3"
              />
            </div>
          </div>

          {/* Nút lưu */}
          <button
            onClick={saveProfile}
            disabled={saving}
            className={`
              mt-5 w-full py-2.5 rounded-full text-xs font-semibold
              flex items-center justify-center gap-2
              transition-all
              ${
                saving
                  ? 'bg-slate-500 text-slate-200 cursor-wait'
                  : 'bg-gradient-to-r from-emerald-400 via-pink-400 to-purple-500 text-slate-900 shadow-[0_0_24px_rgba(52,211,153,0.7)] hover:shadow-[0_0_30px_rgba(244,114,182,0.9)] hover:translate-y-[1px]'
              }
            `}
          >
            {saving ? (
              <>
                <span className="inline-block w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Lưu thông tin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Popup game intro */}
      {showIntroGame && (
        <IntroGamePopup
          name={profile.display_name}
          onComplete={handleIntroGameComplete}
          onCancel={() => setShowIntroGame(false)}
        />
      )}
    </div>
  )
}
