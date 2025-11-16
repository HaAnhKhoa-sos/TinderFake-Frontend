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
    // Nếu chưa login: chỉ logo, vẫn đẹp
    return (
      <header className="relative z-20">
        <div className="fixed top-0 left-0 right-0 backdrop-blur-xl bg-white/10 border-b border-white/20">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2"
            >
              <span className="w-7 h-7 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 shadow-[0_0_20px_rgba(244,114,182,0.7)] flex items-center justify-center text-xs">
                💘
              </span>
              <span className="text-sm font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
                TinderFake
              </span>
            </motion.div>
          </div>
        </div>
        <div className="h-[56px]" /> {/* chừa khoảng cho navbar fixed */}
      </header>
    )
  }

  return (
    <header className="relative z-20">
      {/* Glow background phía sau navbar */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-40 -z-10 opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.55), transparent 55%), radial-gradient(circle at 100% 0%, rgba(129,140,248,0.6), transparent 55%)'
        }}
      />

      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 backdrop-blur-2xl bg-white/10 border-b border-white/20 shadow-[0_12px_30px_rgba(15,23,42,0.3)]"
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 shadow-[0_0_25px_rgba(244,114,182,0.8)] flex items-center justify-center text-sm">
              💘
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">
                TinderFake
              </span>
              <span className="text-[10px] text-white/70 uppercase tracking-[0.16em]">
                FIND YOUR VIBE
              </span>
            </div>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              to="/discover"
              className={`
                px-3 py-1.5 rounded-full
                flex items-center gap-1
                transition-all
                ${
                  isActive('/discover')
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-[0_0_18px_rgba(244,114,182,0.7)]'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }
              `}
            >
              <span>🔍</span>
              <span>Discover</span>
            </Link>

            <Link
              to="/matches"
              className={`
                px-3 py-1.5 rounded-full
                flex items-center gap-1
                transition-all
                ${
                  isActive('/matches')
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_18px_rgba(248,113,113,0.7)]'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }
              `}
            >
              <span>❤️</span>
              <span>Matches</span>
            </Link>

            <Link
              to="/profile"
              className={`
                px-3 py-1.5 rounded-full
                flex items-center gap-1
                transition-all
                ${
                  isActive('/profile')
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_18px_rgba(129,140,248,0.7)]'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }
              `}
            >
              <span>👤</span>
              <span>Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="
                ml-1 px-3 py-1.5 rounded-full
                flex items-center gap-1
                text-[11px]
                bg-white/5 text-red-200
                border border-red-300/40
                hover:bg-red-500/80 hover:text-white
                hover:shadow-[0_0_18px_rgba(248,113,113,0.7)]
                transition-all
              "
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* spacer để nội dung ko bị che bởi navbar fixed */}
      <div className="h-[64px]" />
    </header>
  )
}
