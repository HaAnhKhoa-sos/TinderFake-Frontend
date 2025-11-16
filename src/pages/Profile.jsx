import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import IntroGamePopup from '../components/IntroGamePopup'
import { API_BASE } from "../lib/api"

export default function Profile({ session }) {
  const user = session.user

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showIntroGame, setShowIntroGame] = useState(false)
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false)

  // 🔥 1. Load profile + check game_sessions (song song)
  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      const profileReq = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      const gameReq = supabase
        .from('game_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_id', '00000000-0000-0000-0000-000000000003') // onboarding game
        .limit(1)

      const [{ data: prof }, { data: game }] = await Promise.all([profileReq, gameReq])

      if (!mounted) return

      // nếu chưa có profile → tạo object mặc định
      setProfile(
        prof || {
          id: user.id,
          username: "",
          display_name: "",
          bio: "",
          avatar_url: "",
          city: "",
          gender: "",
          birthday: ""
        }
      )

      setHasPlayedIntro(game?.length > 0)
      setLoading(false)
    }

    loadData()
    return () => (mounted = false)
  }, [user.id])

  // 🔥 2. Save profile cực nhẹ
  const saveProfile = async () => {
    if (!profile.username || !profile.display_name) {
      alert("Vui lòng nhập Username và Tên hiển thị.")
      return
    }

    setSaving(true)

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profile, { onConflict: "id" })
      .select()
      .single()

    setSaving(false)

    if (error) return alert("❌ Lỗi khi lưu hồ sơ: " + error.message)

    setProfile(data)
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(data))

    alert("✅ Hồ sơ đã được lưu!")
  }

  // 🔥 3. Upload avatar nhanh - không block UI
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setProfile((p) => ({ ...p, avatar_url: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  // 🔥 4. Lưu game intro (TỐI ƯU)
  const handleIntroComplete = async (traits) => {
    try {
      // tránh nghẽn sau khi render UI popup
      await new Promise((r) => setTimeout(r, 250))

      const res = await fetch(`${API_BASE}/api/games/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          gameId: "00000000-0000-0000-0000-000000000003",
          traits,
          score: traits.intro_score || 1
        })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      setHasPlayedIntro(true)
      setShowIntroGame(false)

      alert("🎉 Đã lưu dữ liệu game! Gợi ý sẽ chính xác hơn.")

    } catch (err) {
      console.error("❌ Lỗi lưu game:", err)
      alert("Lưu kết quả game thất bại.")
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center text-gray-500">
        ⏳ Đang tải hồ sơ...
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg p-6 rounded-2xl">

      <h2 className="text-xl font-bold mb-4 text-center">🧑 Hồ sơ cá nhân</h2>

      {/* 🔥 Chỉ hiện game khi lần đầu & đã có profile */}
      {!hasPlayedIntro && (
        <div className="bg-pink-50 p-4 mb-5 rounded-xl border border-pink-200">
          <p className="font-semibold text-pink-600">
            🎮 Hãy chơi 1 mini game nhanh!
          </p>
          <p className="text-sm text-gray-600">
            Giúp hệ thống hiểu tính cách của bạn để gợi ý chuẩn hơn.
          </p>
          <button
            onClick={() => setShowIntroGame(true)}
            className="mt-3 px-4 py-2 bg-pink-500 text-white rounded-lg"
          >
            Bắt đầu ngay
          </button>
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={profile.avatar_url || "https://placehold.co/100x100?text=Avatar"}
          className="w-24 h-24 rounded-full object-cover border"
        />
        <input type="file" accept="image/*" className="mt-2" onChange={handleAvatarUpload} />
      </div>

      {/* Form */}
      <ProfileField label="Tên người dùng" value={profile.username} onChange={(v) => setProfile(p => ({ ...p, username: v }))} />
      <ProfileField label="Tên hiển thị" value={profile.display_name} onChange={(v) => setProfile(p => ({ ...p, display_name: v }))} />
      <ProfileField label="Giới thiệu" textarea value={profile.bio} onChange={(v) => setProfile(p => ({ ...p, bio: v }))} />
      <ProfileField label="Thành phố" value={profile.city} onChange={(v) => setProfile(p => ({ ...p, city: v }))} />

      <button
        onClick={saveProfile}
        disabled={saving}
        className="w-full py-2 mt-2 bg-green-600 text-white rounded-lg"
      >
        {saving ? "💾 Đang lưu..." : "💾 Lưu thông tin"}
      </button>

      {showIntroGame && (
        <IntroGamePopup
          name={profile.display_name}
          onComplete={handleIntroComplete}
          onCancel={() => setShowIntroGame(false)}
        />
      )}

    </div>
  )
}

const ProfileField = ({ label, value, onChange, textarea }) => (
  <div className="mb-4">
    <label className="block font-medium mb-1">{label}</label>
    {textarea ? (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded"
        rows="3"
      />
    ) : (
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded"
      />
    )}
  </div>
)
