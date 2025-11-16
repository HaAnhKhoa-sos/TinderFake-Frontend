import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'

export default function Navbar({ session }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname.startsWith(path)

  if (!session) {
    // Nếu chưa login: chỉ logo, nền sáng dễ đọc
    return (
      <header className="relative z-20">
        <div className="fixed top-0 left-0 right-0 bg-white/90 border-b border-slate-200 backdrop-blur">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2"
            >
              <span className="w-7 h-7 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 shadow-[0_0_14px_rgba(244,114,182,0.6)] flex items-center justify-center text-xs text-white">
                💘
              </span>
              <span className="text-sm font-semibold text-slate-900">
                DattingApp
              </span>
            </motion.div>
          </div>
        </div>
        <div className="h-[56px]" />
      </header>
    )
  }

  return (
    <header className="relative z-20">
      {/* Glow nhẹ phía sau */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-32 -z-10 opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.35), transparent 55%), radial-gradient(circle at 100% 0%, rgba(129,140,248,0.4), transparent 55%)'
        }}
      />

      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm"
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 shadow-[0_0_18px_rgba(244,114,182,0.7)] flex items-center justify-center text-sm text-white">
              💘
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold text-slate-900">
                DattingApp
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.16em]">
                FIND YOUR VIBE
              </span>
            </div>
          </div>

          {/* Menu (responsive) */}
          <div className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs flex-wrap justify-end">
            {/* Discover */}
            <Link
              to="/discover"
              className={`
                px-2.5 sm:px-3 py-1.5 rounded-full
                flex items-center gap-1
                transition-all
                ${
                  isActive('/discover')
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-[0_0_16px_rgba(244,114,182,0.6)]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }
              `}
            >
              <span className="text-base sm:text-sm">🔍</span>
              <span className="hidden sm:inline">Discover</span>
              <span className="sm:hidden">Tìm</span>
            </Link>

            {/* Matches */}
            <Link
              to="/matches"
              className={`
                px-2.5 sm:px-3 py-1.5 rounded-full
                flex items-center gap-1
                transition-all
                ${
                  isActive('/matches')
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_16px_rgba(248,113,113,0.6)]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }
              `}
            >
              <span className="text-base sm:text-sm">❤️</span>
              <span className="hidden sm:inline">Matches</span>
              <span className="sm:hidden">Match</span>
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              className={`
                px-2.5 sm:px-3 py-1.5 rounded-full
                flex items-center gap-1
                transition-all
                ${
                  isActive('/profile')
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_16px_rgba(129,140,248,0.6)]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }
              `}
            >
              <span className="text-base sm:text-sm">👤</span>
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Hồ sơ</span>
            </Link>

            {/* Logout luôn hiển thị */}
            <button
              onClick={handleLogout}
              className="
                ml-0 sm:ml-1 px-2.5 sm:px-3 py-1.5 rounded-full
                flex items-center gap-1
                bg-rose-50 text-rose-600
                border border-rose-200
                hover:bg-rose-100 hover:text-rose-700
                hover:shadow-[0_0_14px_rgba(248,113,113,0.5)]
                transition-all
              "
            >
              <span className="text-base sm:text-sm">🚪</span>
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Thoát</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* spacer để nội dung không bị che bởi navbar fixed */}
      <div className="h-[64px]" />
    </header>
  )
}
