import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// Layout
import Navbar from '../components/Navbar'

// Pages
import Auth from './Auth'
import Profile from './Profile'
import Discover from './Discover'
import Matches from './Matches'
import Chat from './Chat'
import PublicProfile from './PublicProfile'
import Maintenance from './Maintenance'

// ⚙️ Bật/tắt chế độ bảo trì
const isMaintenanceMode = false

export default function App() {
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    let mounted = true

    // 🔹 Lấy session hiện tại
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) {
        console.error('❌ Lỗi getSession:', error)
      }
      setSession(data?.session ?? null)
      setAuthChecked(true)
    })

    // 🔹 Lắng nghe login/logout
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return
      setSession(newSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // 🔄 Loading trạng thái đăng nhập
  if (!authChecked && !isMaintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="w-12 h-12 rounded-full border-4 border-pink-500 border-t-transparent animate-spin mb-3" />
        <p className="text-slate-200 text-sm animate-pulse">
          Đang kiểm tra phiên đăng nhập...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      {/* 🔝 Navbar luôn hiển thị, tự responsive */}
      <Navbar session={session} />

      {/* 🧱 Phần nội dung chính, để từng page tự quyết định layout / max-width */}
      <main className="min-h-[calc(100vh-64px)] pt-4 pb-6 px-3 sm:px-4">
        <Routes>
          {/* ================= MAINTENANCE MODE ================= */}
          {isMaintenanceMode ? (
            <Route path="*" element={<Maintenance />} />
          ) : !session ? (
            <>
              {/* =========== CHƯA ĐĂNG NHẬP =========== */}
              <Route path="/login" element={<Auth />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              {/* =========== ĐÃ ĐĂNG NHẬP =========== */}

              {/* Profile: cho tự full theo layout bên trong Profile.jsx */}
              <Route path="/profile" element={<Profile session={session} />} />

              {/* Hồ sơ công khai */}
              <Route path="/profile/:id" element={<PublicProfile />} />

              {/* Discover full quyền tự thiết kế (đã glassmorphism, neon...) */}
              <Route path="/discover" element={<Discover session={session} />} />

              {/* Matches & Chat để pages tự canh giữa / max-w */}
              <Route path="/matches" element={<Matches session={session} />} />
              <Route path="/chat/:userId" element={<Chat session={session} />} />

              {/* Trang bảo trì vẫn vào được nếu cần */}
              <Route path="/maintenance" element={<Maintenance />} />

              {/* Default route → đưa về profile */}
              <Route path="*" element={<Navigate to="/profile" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  )
}
