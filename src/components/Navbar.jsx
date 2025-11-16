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

  // ================== NAVBAR KHI CHƯA LOGIN ==================
  if (!session) {
    return (
      <header className="relative z-20">
        {/* Nền gradient lấp lánh */}
        <div
          className="pointer-events-none fixed inset-x-0 top-0 h-32 -z-10 opacity-80 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.6), transparent 55%), radial-gradient(circle at 100% 0%, rgba(129,140,248,0.7), transparent 55%)'
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0"
        >
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/50 shadow-[0_0_22px_rgba(248,113,181,0.6)]">
              {/* Glow viền logo */}
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 shadow-[0_0_18px_rgba(244,114,182,0.95)] flex items-center justify-center text-sm text-white">
                💘
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-extrabold text-slate-900 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
                  DatingApp
                </span>
                <span className="text-[10px] text-slate-600 uppercase tracking-[0.18em]">
                  LOGIN TO FIND YOUR VIBE
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Spacer để nội dung không bị che */}
        <div className="h-[64px]" />
      </header>
    )
  }

  // ================== NAVBAR KHI ĐÃ LOGIN ==================
  return (
    <header className="relative z-20">
      {/* Nền gradient glow phía sau */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-32 -z-10 opacity-90 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.65), transparent 55%), radial-gradient(circle at 100% 0%, rgba(56,189,248,0.55), transparent 55%)'
        }}
      />

      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0"
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
          {/* Khung glassmorphism lấp lánh */}
          <div className="relative rounded-2xl bg-slate-950/55 backdrop-blur-2xl border border-white/15 shadow-[0_0_30px_rgba(15,23,42,0.9)] px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
            {/* Viền neon bên ngoài */}
            <div className="pointer-events-none absolute inset-px rounded-2xl border border-transparent [background:linear-gradient(120deg,rgba(244,114,182,0.9),rgba(129,140,248,0.9),rgba(56,189,248,0.9))_border-box] opacity-60" />

            {/* Logo + text */}
            <div className="relative flex items-center gap-2 min-w-0">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 blur-lg opacity-70" />
                <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 flex items-center justify-center text-base text-white shadow-[0_0_20px_rgba(244,114,182,0.9)]">
                  💘
                </div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm sm:text-[15px] font-extrabold text-white drop-shadow-[0_0_10px_rgba(244,114,182,0.9)]">
                  DatingApp
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-200/85 uppercase tracking-[0.2em]">
                  FIND YOUR VIBE
                </span>
              </div>
            </div>

            {/* Menu buttons */}
            <div className="relative flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs flex-wrap justify-end">
              {/* Discover */}
              <Link
                to="/discover"
                className={`
                  relative px-2.5 sm:px-3 py-1.5 rounded-full
                  flex items-center gap-1
                  transition-all duration-200
                  ${
                    isActive('/discover')
                      ? 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white shadow-[0_0_18px_rgba(244,114,182,0.9)]'
                      : 'bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white'
                  }
                `}
              >
                <span className="text-base sm:text-sm">🔍</span>
                <span className="hidden sm:inline">Discover</span>
                <span className="sm:hidden">Tìm</span>
                {isActive('/discover') && (
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                )}
              </Link>

              {/* Matches */}
              <Link
                to="/matches"
                className={`
                  relative px-2.5 sm:px-3 py-1.5 rounded-full
                  flex items-center gap-1
                  transition-all duration-200
                  ${
                    isActive('/matches')
                      ? 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-400 text-white shadow-[0_0_18px_rgba(248,113,113,0.9)]'
                      : 'bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white'
                  }
                `}
              >
                <span className="text-base sm:text-sm">❤️</span>
                <span className="hidden sm:inline">Matches</span>
                <span className="sm:hidden">Match</span>
                {isActive('/matches') && (
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-pink-300 shadow-[0_0_8px_rgba(244,114,182,0.9)]" />
                )}
              </Link>

              {/* Profile */}
              <Link
                to="/profile"
                className={`
                  relative px-2.5 sm:px-3 py-1.5 rounded-full
                  flex items-center gap-1
                  transition-all duration-200
                  ${
                    isActive('/profile')
                      ? 'bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 text-white shadow-[0_0_18px_rgba(59,130,246,0.9)]'
                      : 'bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white'
                  }
                `}
              >
                <span className="text-base sm:text-sm">👤</span>
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Hồ sơ</span>
                {isActive('/profile') && (
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
                )}
              </Link>

              {/* Logout – luôn hiện, nổi màu đỏ neon nhẹ */}
              <button
                onClick={handleLogout}
                className="
                  relative ml-0 sm:ml-1 px-2.5 sm:px-3 py-1.5 rounded-full
                  flex items-center gap-1
                  bg-rose-500/80 text-white
                  border border-rose-300/70
                  hover:bg-rose-500
                  shadow-[0_0_16px_rgba(248,113,113,0.9)]
                  hover:shadow-[0_0_22px_rgba(248,113,113,1)]
                  transition-all duration-200
                  active:scale-95
                "
              >
                <span className="text-base sm:text-sm">🚪</span>
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Thoát</span>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Spacer để nội dung không bị che bởi navbar fixed */}
      <div className="h-[72px]" />
    </header>
  )
}
