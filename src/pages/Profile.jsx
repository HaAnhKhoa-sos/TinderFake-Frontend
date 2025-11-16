import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import IntroGamePopup from '../components/IntroGamePopup'
import { API_BASE } from "../lib/api"
import { motion } from "framer-motion"

export default function Profile({ session }) {

  const user = session.user

  // ===========================
  // ⭐ STATE CHÍNH
  // ===========================
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

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [hasSavedProfile, setHasSavedProfile] = useState(false)
  const [hasPlayedGame, setHasPlayedGame] = useState(false)

  const [showIntroGame, setShowIntroGame] = useState(false)
  const savingGameRef = useRef(false) // Fix gửi game 2 lần

  // ===========================
  // ⭐ LẤY PROFILE + CACHE
  // ===========================
  useEffect(() => {
    let mounted = true
    const cacheKey = `profile_${user.id}`

    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (mounted) {
          setProfile(prev => ({ ...prev, ...parsed }))
          setHasSavedProfile(true)
        }
      } catch {}
    }

    // Fetch từ DB
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (!mounted) return
      if (data) {
        setProfile(prev => ({ ...prev, ...data }))
        localStorage.setItem(cacheKey, JSON.stringify(data))
        setHasSavedProfile(true)
      }
      setLoading(false)
    }

    fetchProfile()

    return () => { mounted = false }
  }, [user.id])

  // ===========================
  // ⭐ KIỂM TRA ĐÃ CHƠI GAME CHƯA
  // ===========================
  useEffect(() => {
    supabase
      .from("game_sessions")
      .select("id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data && data.length > 0) setHasPlayedGame(true)
      })
  }, [user.id])

  // ===========================
  // ⭐ LƯU PROFILE
  // ===========================
  const saveProfile = async () => {
    if (saving) return
    setSaving(true)

    if (!profile.username || !profile.display_name) {
      alert("Vui lòng nhập username và tên hiển thị!")
      setSaving(false)
      return
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profile, { onConflict: "id" })
      .select()
      .single()

    setSaving(false)

    if (error) {
      alert("❌ Lỗi lưu hồ sơ!")
      return
    }

    localStorage.setItem(`profile_${user.id}`, JSON.stringify(data))
    setHasSavedProfile(true)
    alert("🎉 Hồ sơ đã lưu thành công!")
  }

  // ===========================
  // ⭐ LƯU GAME INTRO
  // ===========================
  const handleIntroGameComplete = async (traits) => {

    if (savingGameRef.current) return
    savingGameRef.current = true

    try {
      const res = await fetch(`${API_BASE}/api/games/play`, {
        method: 'POST',
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

      alert("💖 Đã lưu game giới thiệu – gợi ý sẽ chuẩn hơn!")
      setHasPlayedGame(true)
      setShowIntroGame(false)

    } catch {
      alert("❌ Lưu kết quả game thất bại!")
    }

    savingGameRef.current = false
  }

  // ===========================
  // ⭐ UPLOAD AVATAR
  // ===========================
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setProfile(p => ({ ...p, avatar_url: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        ⏳ Đang tải hồ sơ...
      </div>
    )
  }

  // ===========================
  // 🌈 UI HIỆU ỨNG LUNG LINH
  // ===========================
  return (
    <motion.div
      className="max-w-md mx-auto mt-10 p-6 rounded-3xl shadow-lg relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .5 }}
      style={{
        background: "linear-gradient(135deg, #ffe6f2, #fff)",
        boxShadow: "0 0 30px rgba(255,105,180,0.3)"
      }}
    >

      {/* Glow background */}
      <div className="absolute inset-0 -z-10 blur-2xl opacity-40"
        style={{ background: "radial-gradient(circle, #ff7eb3, #ff758c, transparent)" }}
      />

      <h2 className="text-2xl font-bold text-center mb-6 text-pink-600 drop-shadow">
        🌟 Hồ sơ cá nhân 🌟
      </h2>

      {/* Banner Game */}
      {hasSavedProfile && !hasPlayedGame && (
        <motion.div
          className="mb-5 p-4 rounded-xl bg-white bg-opacity-70 backdrop-blur border border-pink-300 shadow-md"
          initial={{ opacity: 0, scale: .9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="font-semibold text-pink-600 text-center">
            🎮 Mini Game – Giúp hệ thống hiểu bạn hơn
          </p>
          <p className="text-sm text-gray-600 text-center mt-1">
            Trả lời nhanh 3 câu hỏi để cá nhân hoá gợi ý.
          </p>

          <button
            onClick={() => setShowIntroGame(true)}
            className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow hover:opacity-90 transition"
          >
            Bắt đầu ngay
          </button>
        </motion.div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={profile.avatar_url || "https://placehold.co/100x100?text=Avatar"}
          className="w-28 h-28 rounded-full border-4 border-pink-300 shadow-xl object-cover"
        />
        <input
          type="file"
          className="mt-3 text-sm"
          accept="image/*"
          onChange={handleAvatarUpload}
        />
      </div>

      {/* INPUT FIELDS */}
      <div className="space-y-4">
        {[
          ["username", "Tên người dùng"],
          ["display_name", "Tên hiển thị"],
          ["city", "Thành phố"],
        ].map(([field, label]) => (
          <div key={field}>
            <label className="font-medium">{label}</label>
            <input
              className="w-full p-2 mt-1 border rounded-xl shadow-sm"
              value={profile[field] || ""}
              onChange={e => setProfile({ ...profile, [field]: e.target.value })}
            />
          </div>
        ))}

        {/* GIỚI TÍNH */}
        <div>
          <label className="font-medium">Giới tính</label>
          <select
            className="w-full p-2 mt-1 border rounded-xl"
            value={profile.gender || ""}
            onChange={e => setProfile({ ...profile, gender: e.target.value })}
          >
            <option value="">-- Chọn --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {/* NGÀY SINH */}
        <div>
          <label className="font-medium">Ngày sinh</label>
          <input
            type="date"
            className="w-full p-2 mt-1 border rounded-xl"
            value={profile.birthday || ""}
            onChange={e => setProfile({ ...profile, birthday: e.target.value })}
          />
        </div>

        {/* MÔ TẢ */}
        <div>
          <label className="font-medium">Giới thiệu</label>
          <textarea
            className="w-full p-2 mt-1 border rounded-xl"
            rows="3"
            value={profile.bio || ""}
            onChange={e => setProfile({ ...profile, bio: e.target.value })}
          />
        </div>
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={saveProfile}
        className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:opacity-90 transition"
        disabled={saving}
      >
        {saving ? "💾 Đang lưu..." : "💾 Lưu hồ sơ"}
      </button>

      {/* Popup game intro */}
      {showIntroGame && (
        <IntroGamePopup
          name={profile.display_name}
          onComplete={handleIntroGameComplete}
          onCancel={() => setShowIntroGame(false)}
        />
      )}
    </motion.div>
  )
}
