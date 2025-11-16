import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { Link } from 'react-router-dom'
import ProfileCard from '../components/ProfileCard'
import MiniGamePopup from '../components/MiniGamePopup'
import MatchPopup from '../components/MatchPopup'
import LoveStyleGamePopup from '../components/LoveStyleGamePopup'
import { API_BASE } from '../lib/api'

/**
 * Discover.jsx
 * Trang “Discover” phiên bản TinderFake Premium:
 * - Avatar viền gradient sống động
 * - Card glassmorphism
 * - Nút neon hover
 * - Banner game sinh động
 * - Animation xuất hiện mượt như iOS
 *
 * Lưu ý: Logic backend / Supabase giữ nguyên, chỉ nâng cấp UI + UX.
 */

const LIKE_GAME_ID = '00000000-0000-0000-0000-000000000001'
const LOVE_GAME_ID = '00000000-0000-0000-0000-000000000004'

/* ----------------------------- UI Helpers ----------------------------- */

const gradientBg = {
  background:
    'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.55), transparent 55%), radial-gradient(circle at 100% 100%, rgba(129,140,248,0.7), transparent 55%)'
}

const shimmerBaseClass =
  'relative overflow-hidden before:content-[\'\'] before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.55),transparent)] before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-[1200ms] before:ease-out'

function formatCompatibilityLabel(value) {
  if (value >= 90) return 'Linh hồn tri kỷ 🔥'
  if (value >= 75) return 'Rất hợp gu 💘'
  if (value >= 50) return 'Khá tiềm năng ✨'
  if (value > 0) return 'Cần nói chuyện thêm 😌'
  return 'Chưa có dữ liệu, cứ thử xem 😉'
}

/* -------------------------- Sub Components --------------------------- */

const DiscoverHeader = ({ count, onRefresh, refreshing }) => {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between gap-3 mb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(244,114,182,0.65)]">
            Khám phá người hợp gu 💘
          </h1>
          <p className="text-[11px] text-slate-200 mt-1">
            Vuốt sang trái / phải để xem những người mà thuật toán nghĩ là hợp với bạn.
          </p>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRefresh}
          disabled={refreshing}
          className={`
            flex items-center gap-1 px-3 py-1.5 rounded-full
            text-[11px] font-medium
            border border-white/20
            bg-white/10 backdrop-blur
            shadow-[0_0_18px_rgba(148,163,184,0.45)]
            hover:bg-white/20 hover:shadow-[0_0_22px_rgba(148,163,184,0.65)]
            transition-all
            ${refreshing ? 'opacity-60 cursor-wait' : ''}
          `}
        >
          <span className={refreshing ? 'animate-spin' : ''}>⟳</span>
          <span>{refreshing ? 'Đang làm mới' : 'Làm mới'}</span>
        </motion.button>
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        <span className="px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/60 text-pink-50 flex items-center gap-1 shadow-[0_0_14px_rgba(244,114,182,0.7)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {count > 0
              ? `${count} người đang chờ bạn vuốt 💫`
              : 'Hiện chưa có thêm gợi ý mới, thử lại sau nhé ✨'}
          </span>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-900/60 border border-white/10 text-slate-200 hidden sm:inline">
          Gợi ý dựa trên traits, like & lịch sử tương tác
        </span>
      </div>
    </div>
  )
}

const LoveGameFloatingButton = ({ onClick, saving }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08, rotate: 1 }}
      whileTap={{ scale: 0.95 }}
      className="
        fixed bottom-20 right-4 z-30
        px-3.5 py-1.5
        text-[11px] font-semibold
        rounded-full
        bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400
        text-white
        shadow-[0_0_22px_rgba(248,113,113,0.85)]
        border border-white/40
        flex items-center gap-1.5
        hover:from-yellow-400 hover:via-pink-500 hover:to-red-500
        hover:shadow-[0_0_26px_rgba(244,114,182,1)]
        transition-all duration-300
      "
      disabled={saving}
    >
      <span className="text-xs">🚫</span>
      <span>{saving ? 'Đang lưu game...' : 'Đừng click vào đây'}</span>
    </motion.button>
  )
}

const CompatibilityBadge = ({ value }) => {
  if (value === undefined || value === null) return null

  const safeValue = Math.max(0, Math.min(100, value))
  const label = formatCompatibilityLabel(safeValue)

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-pink-50 font-medium flex items-center gap-1">
          <span>💞 Độ tương hợp</span>
          <span className="px-2 py-[2px] rounded-full text-[10px] bg-pink-500/20 border border-pink-300/60">
            {safeValue}%
          </span>
        </p>
        <span className="text-[10px] text-pink-100/90">{label}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-pink-100/10 overflow-hidden border border-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 transition-all duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}

const SwipeHint = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-200/90"
  >
    <div className="flex items-center gap-1">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 border border-white/20 text-xs">
        ←
      </span>
      <span>Bỏ qua</span>
    </div>
    <span className="opacity-40 text-[9px]">•</span>
    <div className="flex items-center gap-1">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 border border-white/20 text-xs">
        →
      </span>
      <span>Tiếp theo / Like</span>
    </div>
  </motion.div>
)

const DiscoverSkeleton = () => (
  <div className="mt-16 flex flex-col items-center justify-center">
    <div className="w-14 h-14 rounded-full border-4 border-pink-400 border-t-transparent animate-spin mb-4" />
    <p className="text-pink-200 text-sm mb-1">
      Đang tìm những người hợp vibe với bạn...
    </p>
    <p className="text-[11px] text-pink-100/80">
      Đừng tắt tab nhé, match xịn đáng để chờ đợi 🔍
    </p>
  </div>
)

const DiscoverErrorBlock = ({ message, onRetry }) => (
  <div className="mt-16 flex flex-col items-center justify-center px-4 text-center">
    <div className="w-12 h-12 rounded-3xl bg-red-500/10 border border-red-400/60 flex items-center justify-center text-2xl mb-3 shadow-[0_0_20px_rgba(248,113,113,0.6)]">
      😢
    </div>
    <p className="text-red-200 text-sm mb-2">{message}</p>
    <p className="text-[11px] text-red-100/80 mb-4">
      Có vẻ hệ thống đang hơi quá tải. Thử lại một chút nữa nhé.
    </p>
    <button
      onClick={onRetry}
      className={`
        px-4 py-2 rounded-full text-xs font-semibold
        bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500
        text-white
        shadow-[0_0_20px_rgba(244,114,182,0.7)]
        hover:shadow-[0_0_26px_rgba(244,114,182,1)]
        transition-all
      `}
    >
      Thử tải lại
    </button>
  </div>
)

const EmptyDiscoverBlock = () => (
  <motion.div
    key="no-more"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="mt-10 text-center text-sm text-slate-100/90"
  >
    <p className="mb-1">Bạn đã xem hết danh sách gợi ý rồi 😅</p>
    <p className="text-[11px] text-slate-300">
      Thử cập nhật hồ sơ, chơi thêm mini game hoặc quay lại sau để tìm người mới nhé ✨
    </p>
  </motion.div>
)

const ActionBar = ({
  onSkip,
  onViewProfile,
  onLike,
  liking,
  disabled
}) => {
  return (
    <div className="flex justify-between items-center mt-6 gap-2">
      <button
        onClick={onSkip}
        disabled={disabled}
        className="
          px-3 py-2
          bg-slate-900/60 text-slate-100
          rounded-xl border border-white/5
          hover:bg-slate-800/80 hover:border-white/20
          text-[11px] font-medium
          shadow-sm
          transition-all
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        ⏭ Bỏ qua
      </button>

      <button
        onClick={onViewProfile}
        disabled={disabled}
        className={`
          flex-1 px-3 py-2
          rounded-xl
          text-[11px] font-medium
          bg-white/90 text-slate-900
          shadow-[0_10px_24px_rgba(15,23,42,0.45)]
          hover:bg-white
          transition-all
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
      >
        👀 Xem hồ sơ
      </button>

      <button
        onClick={onLike}
        disabled={liking || disabled}
        className={`
          px-4 py-2 rounded-xl text-[11px] font-semibold text-white
          bg-gradient-to-r from-pink-500 via-rose-500 to-red-500
          shadow-[0_12px_28px_rgba(244,114,182,0.9)]
          hover:shadow-[0_14px_32px_rgba(244,114,182,1)]
          hover:scale-[1.03]
          active:scale-95
          transition-all
          ${liking || disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        {liking ? '⏳ Đang gửi...' : '❤️ Thích'}
      </button>
    </div>
  )
}

const DiscoverStatsStrip = ({ index, total }) => {
  if (!total) return null
  const current = index + 1
  const ratio = Math.max(0, Math.min(1, current / total))

  return (
    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-200/85">
      <span>
        Thẻ {current} / {total}
      </span>
      <div className="flex-1 mx-2 h-1.5 rounded-full bg-slate-900/70 overflow-hidden border border-white/10">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-pink-400 to-purple-500 transition-all duration-500"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-300/90">
        {ratio === 1 ? 'Gần hết list rồi' : 'Còn vài người nữa ✨'}
      </span>
    </div>
  )
}

/* ----------------------------- Main Page ----------------------------- */

export default function Discover({ session }) {
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
  const [refreshing, setRefreshing] = useState(false)

  const currentProfile = profiles[currentIndex] || null

  /* ------------------------- Effects & Data -------------------------- */

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

  const fetchRecommendations = async (opts = { fromRefresh: false }) => {
    const { fromRefresh } = opts
    try {
      setError(null)
      if (fromRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

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
      if (fromRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const totalProfiles = useMemo(() => profiles.length || 0, [profiles])

  /* ------------------------ Game: LIKE lần đầu ----------------------- */

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

      await fetchRecommendations({ fromRefresh: true })
      await handleLike(current)
      setShowLikeGame(false)
    } catch (err) {
      console.error('❌ Lỗi khi lưu game LIKE:', err)
      alert('Lỗi khi lưu dữ liệu game!')
    } finally {
      setSavingLikeGame(false)
    }
  }

  /* --------------------- Game: Love Style Game ----------------------- */

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

      await fetchRecommendations({ fromRefresh: true })
    } catch (err) {
      console.error('❌ Lỗi lưu Love Style game:', err)
      alert('Lưu kết quả game thất bại.')
    } finally {
      setSavingLoveGame(false)
    }
  }

  /* --------------------------- Like logic ----------------------------- */

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
        setCurrentIndex((prev) => prev + 1)
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
        setCurrentIndex((prev) => prev + 1)
      }
    } catch (err) {
      console.error('❌ Lỗi handleLike:', err)
      alert('Không thể gửi lượt thích, thử lại sau nhé.')
    } finally {
      setLiking(false)
    }
  }

  /* ---------------------------- Swipe hook ---------------------------- */

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((prev) => prev + 1),
    onSwipedRight: () => {
      if (currentProfile && hasPlayedLikeGame) {
        handleLike(currentProfile)
      } else {
        setCurrentIndex((prev) => prev + 1)
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  /* ----------------------------- Rendering ----------------------------- */

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50 px-4 py-6">
        <div className="max-w-md mx-auto">
          <DiscoverSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50 px-4 py-6">
        <div className="max-w-md mx-auto">
          <DiscoverErrorBlock message={error} onRetry={() => fetchRecommendations()} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50 px-4 py-6 relative">
      {/* Glow nền toàn trang */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-80 blur-3xl"
        style={gradientBg}
      />

      <div className="max-w-md mx-auto relative">
        {/* Header */}
        <DiscoverHeader
          count={totalProfiles}
          onRefresh={() => fetchRecommendations({ fromRefresh: true })}
          refreshing={refreshing}
        />

        {/* Nút Love Style Game (floating) */}
        <LoveGameFloatingButton
          onClick={() => setShowLoveGame(true)}
          saving={savingLoveGame}
        />

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
              initial={{ x: 80, opacity: 0, scale: 0.96 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -80, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`
                ${shimmerBaseClass}
                rounded-3xl
                backdrop-blur-2xl
                bg-white/15
                border border-white/30
                shadow-[0_24px_70px_rgba(15,23,42,0.95)]
                p-5
              `}
            >
              {/* Card nội dung chính */}
              <ProfileCard profile={currentProfile} currentUserId={userId} />

              <CompatibilityBadge value={currentProfile.compatibility} />

              <DiscoverStatsStrip index={currentIndex} total={totalProfiles} />

              <SwipeHint />

              <ActionBar
                onSkip={() => setCurrentIndex((prev) => prev + 1)}
                onViewProfile={() => {}}
                onLike={async () => {
                  if (!currentProfile) return
                  if (hasPlayedLikeGame) {
                    await handleLike(currentProfile)
                  } else {
                    setShowLikeGame(true)
                  }
                }}
                liking={liking}
                disabled={savingLikeGame || savingLoveGame}
              />

              {/* Link xem hồ sơ chi tiết (nút riêng, nhỏ) */}
              <div className="mt-3 text-[11px] text-slate-200 flex justify-center">
                <Link
                  to={`/profile/${currentProfile.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/60 border border-white/10 hover:border-pink-300/60 hover:bg-slate-900/90 transition-all"
                >
                  <span>🔎</span>
                  <span>Xem hồ sơ chi tiết</span>
                </Link>
              </div>
            </motion.div>
          ) : (
            <EmptyDiscoverBlock />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
