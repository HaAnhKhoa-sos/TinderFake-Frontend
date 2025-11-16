import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroGamePopup({ onComplete, onCancel, name }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // chống double-click

  const questions = [
    {
      id: 1,
      text: 'Bạn là người hướng nội hay hướng ngoại?',
      subtitle: 'Chỉ mất 3 câu, hệ thống sẽ hiểu gu vibe của bạn hơn ✨',
      options: [
        { value: 'introvert', label: '🧘 Hướng nội, thích không gian riêng' },
        { value: 'extrovert', label: '🎉 Hướng ngoại, mê chỗ đông vui' },
        { value: 'ambivert', label: '⚖️ Cân bằng, tùy mood' }
      ]
    },
    {
      id: 2,
      text: 'Trong tình yêu, bạn ưu tiên điều gì nhất?',
      subtitle: 'Một mối quan hệ vững chắc luôn cần một điểm tựa chính.',
      options: [
        { value: 'trust', label: '🤝 Niềm tin & chân thành' },
        { value: 'fun', label: '😂 Tiếng cười & niềm vui' },
        { value: 'growth', label: '🌱 Cùng phát triển & nâng nhau lên' }
      ]
    },
    {
      id: 3,
      text: 'Bạn thích kiểu hẹn hò nào?',
      subtitle: 'Một buổi hẹn hoàn hảo với bạn sẽ trông như thế nào?',
      options: [
        { value: 'coffee', label: '☕ Ngồi cà phê tâm sự lâu thật lâu' },
        { value: 'activity', label: '🏸 Cùng chơi một hoạt động / trò chơi' },
        { value: 'walk', label: '🚶 Đi dạo, nói chuyện nhẹ nhàng' }
      ]
    }
  ]

  const totalSteps = questions.length
  const currentQuestion = questions[step]

  const handleSelect = (value) => {
    setAnswers(prev => ({ ...prev, [step]: value }))
  }

  const handleNext = () => {
    if (!answers[step]) {
      alert('Hãy chọn một đáp án nhé 💬')
      return
    }
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      setFinished(true)
    }
  }

  const handleFinish = async () => {
    if (isSubmitting) return

    const traits = {
      personality_type: answers[0],
      love_priority: answers[1],
      date_style: answers[2],
      intro_score: 80 // sau này bạn muốn tính phức tạp hơn thì sửa ở backend
    }

    try {
      setIsSubmitting(true)
      await Promise.resolve(onComplete(traits))
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercent = ((step + (finished ? 1 : 0)) / totalSteps) * 100

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Glow nền */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 0% 0%, rgba(236,72,153,0.55), transparent 55%), radial-gradient(circle at 100% 100%, rgba(129,140,248,0.75), transparent 55%)'
        }}
      />

      <motion.div
        className="
          relative w-full max-w-md mx-4
          rounded-3xl
          bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90
          border border-white/10
          shadow-[0_20px_70px_rgba(0,0,0,0.85)]
          overflow-hidden
        "
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        {/* Viền sáng trên card */}
        <div className="pointer-events-none absolute inset-px rounded-3xl border border-white/5" />

        {/* Header + nút close */}
        <div className="relative px-5 pt-4 pb-2 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-pink-500/40 shadow-[0_0_18px_rgba(244,114,182,0.5)]">
              <span className="text-[10px]">🎮</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pink-200">
                Love Onboarding
              </span>
            </div>
            <h2 className="mt-3 text-lg font-semibold bg-gradient-to-r from-pink-400 via-rose-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-md">
              Chào {name || 'bạn'} 💕
            </h2>
            <p className="mt-1 text-[11px] text-slate-300/80">
              Một vài câu hỏi nhỏ để TinderFake hiểu bạn và gợi ý chuẩn gu hơn.
            </p>
          </div>

          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className={`
              ml-3 inline-flex items-center justify-center
              w-8 h-8 rounded-full
              border border-slate-700
              bg-slate-900/70
              text-slate-300 text-xs
              hover:text-white hover:border-pink-400 hover:bg-slate-800
              shadow-sm
              transition-all
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            ✕
          </button>
        </div>

        {/* Thanh progress */}
        <div className="relative px-5 pb-3">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[11px] text-slate-400">
              Câu hỏi <span className="font-semibold text-pink-300">{Math.min(step + 1, totalSteps)}</span> / {totalSteps}
            </p>
            <p className="text-[10px] text-slate-400">
              {finished ? 'Sẵn sàng lưu thông tin ✨' : 'Trả lời thật lòng nhé 💖'}
            </p>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-indigo-400 transition-all duration-500"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Nội dung game */}
        <div className="relative px-5 pb-5 pt-1">
          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.div
                key={currentQuestion.id}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="mt-2"
              >
                <div className="mb-4 text-left">
                  <h3 className="text-[15px] font-semibold text-slate-50 leading-snug">
                    {currentQuestion.text}
                  </h3>
                  {currentQuestion.subtitle && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {currentQuestion.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 mb-5">
                  {currentQuestion.options.map((opt) => {
                    const isActive = answers[step] === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`
                          w-full text-left px-3.5 py-2.5 rounded-2xl border
                          text-[13px] leading-snug
                          flex items-center gap-2
                          transition-all
                          shadow-[0_10px_25px_rgba(15,23,42,0.8)]
                          ${
                            isActive
                              ? 'border-pink-400/80 bg-slate-900/80 text-pink-50 shadow-[0_0_24px_rgba(244,114,182,0.7)]'
                              : 'border-slate-700/80 bg-slate-900/70 text-slate-200 hover:border-pink-500/60 hover:bg-slate-900/90 hover:shadow-[0_0_18px_rgba(248,113,113,0.45)]'
                          }
                        `}
                      >
                        <span className="text-lg">{opt.label.slice(0, 2)}</span>
                        <span className="flex-1 text-[12px]">
                          {opt.label.slice(2)}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="
                      inline-flex items-center justify-center
                      px-4 py-2.5 rounded-2xl text-[12px] font-semibold
                      bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500
                      text-white
                      shadow-[0_10px_30px_rgba(236,72,153,0.7)]
                      hover:shadow-[0_14px_40px_rgba(236,72,153,0.85)]
                      hover:translate-y-0.5
                      active:scale-95
                      transition-all
                    "
                  >
                    {step === totalSteps - 1 ? 'Hoàn thành 🎯' : 'Tiếp tục ➜'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="finished"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-3 text-center"
              >
                <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-pink-400 to-indigo-400 flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.7)]">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-base font-semibold text-slate-50 mb-1">
                  Tuyệt vời! Bạn đã hoàn thành mini game 🎉
                </h3>
                <p className="text-[11px] text-slate-300 mb-4 px-4">
                  Chúng tôi sẽ dùng thông tin này để ưu tiên gợi ý những người có{" "}
                  <span className="text-pink-300 font-medium">vibe hợp với bạn</span> hơn.
                </p>

                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className={`
                    inline-flex items-center justify-center
                    px-5 py-2.5 rounded-2xl text-[12px] font-semibold
                    bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500
                    text-white
                    shadow-[0_12px_32px_rgba(217,70,239,0.85)]
                    hover:shadow-[0_16px_40px_rgba(217,70,239,1)]
                    hover:translate-y-0.5
                    active:scale-95
                    transition-all
                    ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  {isSubmitting ? 'Đang lưu thông tin...' : 'Lưu thông tin & tiếp tục 💖'}
                </button>

                <p className="mt-3 text-[10px] text-slate-500">
                  Bạn có thể thay đổi câu trả lời bất cứ lúc nào trong tương lai.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
