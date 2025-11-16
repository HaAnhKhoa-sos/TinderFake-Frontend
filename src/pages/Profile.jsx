import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import IntroGamePopup from '../components/IntroGamePopup' // 👈 game onboarding
import { API_BASE } from "../lib/api"
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

  // ✅ NEW: trạng thái để control game
  const [hasPlayedGame, setHasPlayedGame] = useState(false)
  const [showIntroGame, setShowIntroGame] = useState(false)
  const [hasSavedProfile, setHasSavedProfile] = useState(false)

  // 🔹 Lấy profile từ DB + cache localStorage
  useEffect(() => {
    let mounted = true
    const cacheKey = `profile_${user.id}`

    // 1. Lấy từ cache (nếu có) để hiển thị nhanh
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (mounted) {
          setProfile(prev => ({ ...prev, ...parsed }))
          setHasSavedProfile(true) // đã từng lưu rồi
          setInitialLoading(false)
        }
      } catch (e) {
        console.warn('⚠️ Lỗi parse profile cache:', e)
      }
    }

    // 2. Fetch từ Supabase (dù có cache vẫn sync mới)
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
        setHasSavedProfile(true) // ✅ đã có row trên DB
      }

      setInitialLoading(false)
    }

    fetchProfile()

    return () => {
      mounted = false
    }
  }, [user.id])

  // 🔹 Kiểm tra user đã từng chơi game onboarding chưa
  useEffect(() => {
    const checkPlayedGame = async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('user_id', user.id)
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
    setSaving(true)

    // Có thể bắt buộc một số field:
    if (!profile.username || !profile.display_name) {
      alert('Vui lòng nhập ít nhất Tên người dùng và Tên hiển thị trước khi lưu.')
      setSaving(false)
      return
    }

    const updates = {
      ...profile,
      id: user.id
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: 'id' })
      .select()
      .single()

    setSaving(false)

    if (error) {
      alert('❌ Lỗi khi lưu hồ sơ: ' + error.message)
    } else {
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(data))
      setHasSavedProfile(true) // ✅ Từ đây trở đi cho phép chơi game
      alert('✅ Hồ sơ đã được cập nhật thành công!')
    }
  }

  // 🔹 Khi hoàn thành game intro (chỉ cho phép sau khi đã lưu profile)
  const handleIntroGameComplete = async (traits) => {
    try {
      const res = await fetch(`${API_BASE}/api/games/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          gameId: '00000000-0000-0000-0000-000000000003', // 👈 game onboarding
          traits,
          score: traits.compatibility_score || traits.intro_score || 1
        })
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || 'Không thể lưu kết quả game')
      }

      setHasPlayedGame(true)
      setShowIntroGame(false)
      alert('✅ Cảm ơn bạn! Chúng tôi đã cập nhật thông tin để gợi ý phù hợp hơn.')
    } catch (err) {
      console.error('❌ Lỗi lưu game onboarding:', err)
      alert('Lưu kết quả game thất bại.')
    }
  }

  // 🔹 Upload avatar (base64)
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
      <div className="max-w-md mx-auto mt-10 bg-white shadow-lg p-6 rounded-2xl text-center text-gray-500">
        ⏳ Đang tải hồ sơ...
      </div>
    )
  }

  // ✅ Điều kiện để được chơi game intro:
  // 1. ĐÃ LƯU PROFILE ÍT NHẤT 1 LẦN (hasSavedProfile === true)
  // 2. CHƯA TỪNG CHƠI GAME INTRO (hasPlayedGame === false)

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg p-6 rounded-2xl relative">
      <h2 className="text-xl font-bold mb-4 text-center">🧑 Hồ sơ cá nhân</h2>

      {/* Banner game chỉ xuất hiện khi đã lưu profile + chưa chơi game */}
      {hasSavedProfile && !hasPlayedGame && (
        <div className="mb-4 p-4 bg-pink-50 border border-pink-200 rounded-2xl">
          <p className="font-semibold text-pink-600 mb-1">
            🎮 Hãy cho chúng tôi biết thêm về bạn
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Chơi nhanh một mini game để hệ thống hiểu sở thích & tính cách của bạn,
            từ đó gợi ý người phù hợp hơn.
          </p>
          <button
            onClick={() => {
              if (!hasSavedProfile) {
                alert('Hãy nhấn "Lưu thông tin" trước khi chơi game nhé!')
                return
              }
              setShowIntroGame(true)
            }}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm"
          >
            Bắt đầu chơi game
          </button>
        </div>
      )}

      <div className="flex flex-col items-center mb-6">
        <img
          src={profile.avatar_url || 'https://placehold.co/100x100?text=Avatar'}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <input
          type="file"
          accept="image/*"
          className="mt-2 text-sm"
          onChange={handleAvatarUpload}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Tên người dùng (username)</label>
        <input
          value={profile.username || ''}
          onChange={e => setProfile({ ...profile, username: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="vd: ha17"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Tên hiển thị</label>
        <input
          value={profile.display_name || ''}
          onChange={e => setProfile({ ...profile, display_name: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="vd: Hà Nguyễn"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Giới tính</label>
        <select
          value={profile.gender || ''}
          onChange={e => setProfile({ ...profile, gender: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Chọn giới tính --</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Ngày sinh</label>
        <input
          type="date"
          value={profile.birthday || ''}
          onChange={e => setProfile({ ...profile, birthday: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Thành phố</label>
        <input
          value={profile.city || ''}
          onChange={e => setProfile({ ...profile, city: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="vd: Hà Nội"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Giới thiệu bản thân</label>
        <textarea
          value={profile.bio || ''}
          onChange={e => setProfile({ ...profile, bio: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Sở thích, tính cách, mong muốn..."
          rows="3"
        />
      </div>

      <button
        onClick={saveProfile}
        disabled={saving}
        className={`w-full py-2 rounded text-white font-semibold ${
          saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {saving ? '💾 Đang lưu...' : '💾 Lưu thông tin'}
      </button>

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
