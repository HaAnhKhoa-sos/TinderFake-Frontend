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

// ⚠️ Bật/tắt chế độ bảo trì
const isMaintenanceMode = false

export default function App() {
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    let mounted = true

    // 🔹 Lấy session hiện tại
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-purple-200">
        <p className="text-gray-600 text-sm animate-pulse">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">

      {/* 💡 Navbar luôn hiển thị */}
      <Navbar session={session} />

      {/* 🧩 Layout động:  
          - Profile → FULLSCREEN 
          - Các trang khác → wrap nhẹ để đẹp hơn */}
      <main className="w-full">

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

              {/* FULLSCREEN PAGES */}
              <Route path="/profile" element={<Profile session={session} fullscreen />} />
              <Route path="/profile/:id" element={<PublicProfile />} />

              {/* WRAPPED PAGES */}
              <Route path="/discover" element={
                <div className="max-w-xl mx-auto p-4">
                  <Discover session={session} />
                </div>
              }/>

              <Route path="/matches" element={
                <div className="max-w-xl mx-auto p-4">
                  <Matches session={session} />
                </div>
              }/>

              <Route path="/chat/:userId" element={
                <div className="max-w-xl mx-auto p-4">
                  <Chat session={session} />
                </div>
              }/>

              {/* Default route */}
              <Route path="*" element={<Navigate to="/profile" replace />} />
            </>
          )}
        </Routes>

      </main>
    </div>
  )
}
