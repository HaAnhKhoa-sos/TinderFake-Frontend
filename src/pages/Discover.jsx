import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { Link } from 'react-router-dom'
import ProfileCard from '../components/ProfileCard'
import MiniGamePopup from '../components/MiniGamePopup'
import MatchPopup from '../components/MatchPopup'
import LoveStyleGamePopup from '../components/LoveStyleGamePopup'
import { API_BASE } from '../lib/api'

export default function Discover({ session }) {
  const LIKE_GAME_ID = '00000000-0000-0000-0000-000000000001'
  const LOVE_GAME_ID = '00000000-0000-0000-0000-000000000004'

  const userId = session.user.id

  const [profiles, setProfiles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchProfile, setMatchProfile] = useState(null)

  const [showLikeGame, setShowLikeGame] = useState(false)
  const [hasPlayedLikeGame, setHasPlayedLikeGame] = useState(false)

  const [showLoveGame, setShowLoveGame] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [savingLikeGame, setSavingLikeGame] = useState(false)
  const [savingLoveGame, setSavingLoveGame] = useState(false)
  const [liking, setLiking] = useState(false)

  const currentProfile = profiles[currentIndex]

  // 🔹 Kiểm tra đã từng chơi game LIKE chưa
  useEffect(() => {
    const checkLikeGame = async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('game_id', LIKE_GAME_ID)
        .limit(1)

      if (error) {
        console.error('Lỗi check like-game_sessions:', error.message)
        return
      }

      if (data && data.length > 0) {
        setHasPlayedLikeGame(true)
      }
    }

    checkLikeGame()
  }, [userId])

  // 🔹 Fetch danh sách người tương hợp từ backend
  const fetchRecommendations = async () => {
    try {
      setError(null)
      setLoading(true)
      const res = await fetch(
        `${API_BASE}/api/match/recommendations?userId=${userId}`
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setProfiles(data.results || [])
      setCurrentIndex(0)
    } catch (err) {
      console.error('❌ Lỗi khi tải gợi ý:', err)
      setError('Không thể tải danh sách người dùng tương hợp 😢')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // 🔹 Khi user chơi xong game LIKE lần đầu
  const handleLikeGameComplete = async (traits) => {
    const current = profiles[currentIndex]
    if (!current) return
    if (savingLikeGame) return
    setSavingLikeGame(true)

    try {
      const res = await fetch(`${API_BASE}/api/games/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          gameId: LIKE_GAME_ID,
          traits,
          score: traits.compatibility_score || 1
        })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Không thể lưu kết quả game')

      console.log('✅ Game LIKE saved:', result)
      setHasPlayedLikeGame(true)

      await fetchRecommendations()
      await handleLike(current)
      setShowLikeGame(false)
    } catch (err) {
      console.error('❌ Lỗi khi lưu game LIKE:', err)
      alert('Lỗi khi lưu dữ liệu game!')
    } finally {
      setSavingLikeGame(false)
    }
  }

  // 🔹 Khi user chơi xong Love Style Game
  const handleLoveGameComplete = async (traits) => {
    if (savingLoveGame) return
    setSavingLoveGame(true)

    try {
      const res = await fetch(`${API_BASE}/api/games/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          gameId: LOVE_GAME_ID,
          traits,
          score: traits.love_style_score || traits.compatibility_score || 1
        })
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || 'Không thể lưu kết quả Love Style Game')
      }

      console.log('✅ Love Style game saved:', result)
      alert('✅ Đã lưu phong cách yêu của bạn, gợi ý sẽ chuẩn hơn nữa!')
      setShowLoveGame(false)

      await fetchRecommendations()
    } catch (err) {
      console.error('❌ Lỗi lưu Love Style game:', err)
      alert('Lưu kết quả game thất bại.')
    } finally {
      setSavingLoveGame(false)
    }
  }

  // 🔹 Khi người dùng nhấn “Thích”
  const handleLike = async (targetProfile) => {
    const current = targetProfile || profiles[currentIndex]
    if (!current) return
    if (liking) return
    setLiking(true)

    try {
      const { data: existing } = await supabase
        .from('likes')
        .select('*')
        .eq('from_user', userId)
        .eq('to_user', current.id)
        .maybeSingle()

      if (existing) {
        alert('Bạn đã thích người này rồi ❤️')
        setCurrentIndex(prev => prev + 1)
        return
      }

      await supabase.from('likes').insert({
        from_user: userId,
        to_user: current.id
      })

      const { data: reverseLike } = await supabase
        .from('likes')
        .select('*')
        .eq('from_user', current.id)
        .eq('to_user', userId)
        .maybeSingle()

      if (reverseLike) {
        const { data: newMatch } = await supabase
          .from('matches')
          .insert({
            user_a: userId,
            user_b: current.id
          })
          .select()
          .single()

        setMatchProfile({
          id: current.id,
          name: current.display_name,
          matchId: newMatch.id
        })
      } else {
        setCurrentIndex(prev => prev + 1)
      }
    } catch (err) {
      console.error('❌ Lỗi handleLike:', err)
      alert('Không thể gửi lượt thích, thử lại sau nhé.')
    } finally {
      setLiking(false)
    }
  }

  // 🔹 Swipe trái/phải để chuyển người
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex(prev => prev + 1),
    onSwipedRight: () => setCurrentIndex(prev => prev + 1),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  // =================== UI LOADING / ERROR ===================
  if (loading) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-pink-400 border-t-transparent animate-spin mb-3" />
        <p className="text-pink-500 text-sm animate-pulse">
          Đang tìm những người hợp gu bạn...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-16 text-center">
        <p className="text-red-500 mb-3">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm shadow-md hover:opacity-90 transition"
        >
          Thử tải lại
        </button>
      </div>
    )
  }

  // =================== UI CHÍNH ===================
  return (
    <div className="relative max-w-md mx-auto mt-10 px-2">
      {/* Glow background */}
      <div
        className="pointer-events-none absolute -inset-10 -z-10 opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.6), transparent 55%), radial-gradient(circle at 100% 100%, rgba(129,140,248,0.7), transparent 55%)'
        }}
      />

      <motion.h2
        className="text-2xl font-extrabold text-center mb-2 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        💘 Gợi ý người dùng tương hợp
      </motion.h2>

      <p className="text-center text-xs text-gray-500 mb-6">
        Vuốt để khám phá – mỗi lượt thích đều có thể là một câu chuyện mới ✨
      </p>

      {/* 🔴 Nút troll “Đừng click vào đây” */}
      <button
        onClick={() => setShowLoveGame(true)}
        className="
          absolute -top-3 right-3
          px-3 py-1.5
          text-[11px] font-semibold
          rounded-full
          bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400
          text-white
          shadow-lg shadow-pink-300/50
          border border-white/40
          flex items-center gap-1
          hover:from-yellow-400 hover:via-pink-500 hover:to-red-500
          hover:shadow-pink-400/70
          transition-all duration-300
          hover:scale-110 hover:-translate-y-0.5 hover:rotate-1
          animate-pulse
        "
      >
        <span className="text-xs">🚫</span>
        <span>Đừng click vào đây</span>
      </button>

      <AnimatePresence mode="wait">
        {/* Game LIKE lần đầu */}
        {showLikeGame && currentProfile && (
          <MiniGamePopup
            onComplete={handleLikeGameComplete}
            onCancel={() => setShowLikeGame(false)}
            name={currentProfile.display_name}
          />
        )}

        {/* Love Style Game */}
        {showLoveGame && (
          <LoveStyleGamePopup
            name={currentProfile?.display_name}
            onComplete={handleLoveGameComplete}
            onCancel={() => setShowLoveGame(false)}
            saving={savingLoveGame}
          />
        )}

        {/* Popup match */}
        {matchProfile && (
          <MatchPopup
            matchProfile={matchProfile}
            onClose={() => setMatchProfile(null)}
          />
        )}

        {/* Nội dung chính */}
        {currentProfile ? (
          <motion.div
            key={currentProfile.id}
            {...swipeHandlers}
            initial={{ x: 80, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -80, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="
              backdrop-blur-2xl bg-white/70
              border border-white/60
              rounded-3xl
              shadow-[0_18px_45px_rgba(244,114,182,0.45)]
              p-5
            "
          >
            <ProfileCard profile={currentProfile} currentUserId={userId} />

            {currentProfile.compatibility !== undefined && (
              <div className="mt-4">
                <p className="text-center text-pink-500 font-semibold text-sm mb-1">
                  💞 Độ tương hợp: {currentProfile.compatibility}%
                </p>
                <div className="w-full h-2 rounded-full bg-pink-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                    style={{ width: `${Math.min(currentProfile.compatibility, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-6 gap-2">
              {/* Bỏ qua */}
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-xs font-medium shadow-sm transition"
              >
                ⏭ Bỏ qua
              </button>

              {/* Xem hồ sơ */}
              <Link
                to={`/profile/${currentProfile.id}`}
                className="flex-1 px-3 py-2 bg-white/80 text-gray-800 rounded-xl hover:bg-white shadow-sm text-center text-xs font-medium transition"
              >
                👀 Xem hồ sơ
              </Link>

              {/* Thích */}
              <button
                onClick={async () => {
                  if (!currentProfile) return

                  if (hasPlayedLikeGame) {
                    await handleLike(currentProfile)
                  } else {
                    setShowLikeGame(true)
                  }
                }}
                disabled={liking}
                className={`
                  px-4 py-2 rounded-xl text-xs font-semibold text-white 
                  bg-gradient-to-r from-pink-500 to-rose-500
                  shadow-md shadow-pink-300/60
                  hover:shadow-pink-400/80
                  hover:scale-[1.03]
                  active:scale-95
                  transition-all
                  ${liking ? 'opacity-60 cursor-not-allowed' : ''}
                `}
              >
                ❤️ Thích
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="no-more"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-500 mt-10 text-sm"
          >
            Bạn đã xem hết danh sách gợi ý rồi 😅  
            Hãy quay lại sau, biết đâu sẽ có thêm người mới ✨
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
