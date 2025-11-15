import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { Link } from 'react-router-dom'
import ProfileCard from '../components/ProfileCard'
import MiniGamePopup from '../components/MiniGamePopup'
import MatchPopup from '../components/MatchPopup'
import LoveStyleGamePopup from '../components/LoveStyleGamePopup' // 👈 game mới
import { API_BASE } from '../lib/api';
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

  const currentProfile = profiles[currentIndex]

  // 🔹 Kiểm tra đã từng chơi game LIKE 001 chưa
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
        setHasPlayedLikeGame(true) // đã từng chơi game 001
      }
    }

    checkLikeGame()
  }, [userId])

  // 🔹 Fetch danh sách người tương hợp từ backend
  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `${API_BASE}/api/match/recommendations?userId=${userId}`
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setProfiles(data.results || [])
      setCurrentIndex(0) // reset về người đầu trong list mới
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

    try {
      // Gọi backend để lưu traits + game_sessions
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

      // Sau khi lưu → cập nhật lại gợi ý
      await fetchRecommendations()

      // Và like người hiện tại
      await handleLike(current)
      setShowLikeGame(false)
    } catch (err) {
      console.error('❌ Lỗi khi lưu game LIKE:', err)
      alert('Lỗi khi lưu dữ liệu game!')
    }
  }

  // 🔹 Khi user chơi xong Love Style Game (nút “Đừng click vào đây”)
  const handleLoveGameComplete = async (traits) => {
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

      // traits vừa cập nhật → gọi lại recommendations
      await fetchRecommendations()
    } catch (err) {
      console.error('❌ Lỗi lưu Love Style game:', err)
      alert('Lưu kết quả game thất bại.')
    }
  }

  // 🔹 Khi người dùng nhấn “Thích”
  const handleLike = async (targetProfile) => {
    const current = targetProfile || profiles[currentIndex]
    if (!current) return

    // Kiểm tra đã like chưa
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

    // Thêm lượt like
    await supabase.from('likes').insert({
      from_user: userId,
      to_user: current.id
    })

    // Kiểm tra người kia có like lại không
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
      // Nếu chưa match thì sang người tiếp theo
      setCurrentIndex(prev => prev + 1)
    }
  }

  // 🔹 Swipe trái/phải để chuyển người
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex(prev => prev + 1),
    onSwipedRight: () => setCurrentIndex(prev => prev + 1),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-10">
        ⏳ Đang tải gợi ý...
      </p>
    )
  }

  if (error) {
    return (
      <p className="text-center text-red-500 mt-10">
        {error}
      </p>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 relative">
      <h2 className="text-xl font-bold text-center mb-6">
        💘 Gợi ý người dùng tương hợp
      </h2>

      {/* 🔴 Nút troll “Đừng click vào đây” */}
      <button
  onClick={() => setShowLoveGame(true)}
  className="
    absolute -top-4 right-0
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

        {/* Love Style Game (nút “đừng click”) */}
        {showLoveGame && (
          <LoveStyleGamePopup
            name={currentProfile?.display_name}
            onComplete={handleLoveGameComplete}
            onCancel={() => setShowLoveGame(false)}
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
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white shadow-lg rounded-2xl p-6"
          >
            <ProfileCard profile={currentProfile} currentUserId={userId} />

            {currentProfile.compatibility !== undefined && (
              <p className="text-center mt-3 text-pink-600 font-semibold text-lg">
                💞 Độ tương hợp: {currentProfile.compatibility}%
              </p>
            )}

            <div className="flex justify-between items-center mt-6 gap-2">
              {/* Bỏ qua */}
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                ⏭ Bỏ qua
              </button>

              {/* Xem hồ sơ */}
              <Link
                to={`/profile/${currentProfile.id}`}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-center text-sm"
              >
                👀 Xem hồ sơ
              </Link>

              {/* Thích */}
              <button
                onClick={async () => {
                  if (!currentProfile) return

                  if (hasPlayedLikeGame) {
                    // đã từng chơi game LIKE → like thẳng
                    await handleLike(currentProfile)
                  } else {
                    // chưa chơi → mở MiniGamePopup
                    setShowLikeGame(true)
                  }
                }}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition text-sm"
              >
                ❤️ Thích
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="no-more"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-500 mt-10"
          >
            Bạn đã xem hết danh sách gợi ý rồi 😅
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
