import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import selectSound from '../assets/sounds/select.mp3'
import completeSound from '../assets/sounds/complete.mp3'

/**
 * props:
 * - onComplete(traits)  // callback khi xong game
 * - onCancel()          // đóng popup
 */
export default function LoveStyleGamePopup({ onComplete, onCancel, name }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // audio refs
  const selectAudioRef = useRef(null)
  const completeAudioRef = useRef(null)
  const submittingRef = useRef(false) // lock chống double submit

  const playSound = (type) => {
    try {
      let audio
      if (type === 'select') audio = selectAudioRef.current
      else if (type === 'complete') audio = completeAudioRef.current

      if (!audio) return
      audio.currentTime = 0
      const p = audio.play()
      if (p && typeof p.then === 'function') {
        p.catch((err) => {
          console.warn('⚠️ Audio play error:', err)
        })
      }
    } catch (e) {
      console.warn('⚠️ Audio error:', e)
    }
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const steps = [
    {
      id: 'first_date_vibe',
      title: 'Buổi hẹn đầu trong mơ',
      question: `Nếu hẹn hò với ${name || 'người ấy'} lần đầu, bạn thích kiểu buổi hẹn nào nhất?`,
      options: [
        {
          value: 'coffee_chat',
          label: '☕ Quán cafe chill',
          desc: 'Ngồi nói chuyện, tìm hiểu nhau từ từ.'
        },
        {
          value: 'adventure_date',
          label: '🏞️ Đi chơi / khám phá',
          desc: 'Đi dạo, leo núi, công viên, hoạt động ngoài trời.'
        },
        {
          value: 'fancy_dinner',
          label: '🍷 Dinner sang trọng',
          desc: 'Không gian xịn xò, nói chuyện sâu hơn.'
        },
        {
          value: 'chill_home',
          label: '🎬 Ở nhà xem phim',
          desc: 'Không khí thoải mái, gần gũi.'
        }
      ]
    },
    {
      id: 'conflict_style',
      title: 'Khi có mâu thuẫn',
      question: 'Nếu hai người xảy ra cãi vã, bạn thường:',
      options: [
        {
          value: 'talk_immediately',
          label: '🗣 Nói rõ ngay lập tức',
          desc: 'Thích giải quyết thẳng thắn, không để lâu.'
        },
        {
          value: 'cool_down',
          label: '🧊 Im lặng để bình tĩnh',
          desc: 'Cần thời gian để hạ nhiệt trước khi nói chuyện.'
        },
        {
          value: 'avoid_conflict',
          label: '🙈 Né tránh cho qua',
          desc: 'Không thích tranh cãi, thường nhường cho xong.'
        }
      ]
    },
    {
      id: 'love_language',
      title: 'Ngôn ngữ tình yêu',
      question: 'Điều gì khiến bạn cảm nhận rõ nhất rằng “mình được yêu”?',
      options: [
        {
          value: 'quality_time',
          label: '🕰 Dành thời gian cho nhau',
          desc: 'Ở cạnh nhau, cùng làm việc nhỏ nhặt cũng vui.'
        },
        {
          value: 'words',
          label: '💬 Lời nói dễ thương',
          desc: 'Những câu khen, động viên, nói ra cảm xúc.'
        },
        {
          value: 'acts',
          label: '🤲 Hành động chăm sóc',
          desc: 'Làm giúp bạn việc gì đó, quan tâm âm thầm.'
        },
        {
          value: 'gifts',
          label: '🎁 Quà tặng nhỏ',
          desc: 'Những món quà bất ngờ dù nhỏ cũng làm bạn vui.'
        },
        {
          value: 'touch',
          label: '🤍 Đụng chạm cơ thể',
          desc: 'Ôm, nắm tay, dựa vai…'
        }
      ]
    },
    {
      id: 'texting_style',
      title: 'Phong cách nhắn tin',
      question: 'Bạn thích kiểu nhắn tin như thế nào?',
      options: [
        {
          value: 'fast_short',
          label: '⚡ Trả lời nhanh, tin nhắn ngắn',
          desc: 'Chat liên tục, kiểu messenger.'
        },
        {
          value: 'slow_long',
          label: '📜 Trả lời chậm nhưng dài',
          desc: 'Ít nhắn hơn nhưng mỗi lần nói rất nhiều.'
        },
        {
          value: 'balanced',
          label: '⚖️ Vừa phải, tùy cảm xúc',
          desc: 'Không quá nhanh cũng không quá lâu.'
        }
      ]
    },
    {
      id: 'relationship_goal',
      title: 'Mục tiêu tình cảm',
      question: 'Ngay lúc này, bạn mong muốn điều gì nhất?',
      options: [
        {
          value: 'serious',
          label: '💍 Một mối quan hệ nghiêm túc',
          desc: 'Muốn tìm người phù hợp để gắn bó lâu dài.'
        },
        {
          value: 'explore',
          label: '✨ Tìm hiểu, trải nghiệm',
          desc: 'Cởi mở làm quen, xem hợp ai rồi tính tiếp.'
        },
        {
          value: 'friendship_first',
          label: '🤝 Bạn trước, yêu sau',
          desc: 'Thoải mái như bạn bè, nếu hợp rồi tiến xa hơn.'
        }
      ]
    }
  ]

  const currentStep = steps[stepIndex]

  // chọn xong → play select → auto sang câu tiếp theo sau 350ms
  const handleSelect = (traitKey, value) => {
    setAnswers(prev => ({ ...prev, [traitKey]: value }))
    playSound('select')

    const isLastStep = stepIndex === steps.length - 1

    if (!isLastStep) {
      setTimeout(() => {
        setStepIndex(prev => Math.min(prev + 1, steps.length - 1))
      }, 350)
    } else {
      setTimeout(() => {
        handleFinish()
      }, 350)
    }
  }

  const handleFinish = () => {
    const answeredCount = Object.keys(answers).length
    const baseScore = Math.min(100, answeredCount * 20)
    setScore(baseScore)
    setFinished(true)
  }

  const handleComplete = async () => {
    if (submittingRef.current || isSubmitting) return
    submittingRef.current = true

    const traits = {
      ...answers,
      love_style_score: score
    }

    try {
      setIsSubmitting(true)
      playSound('complete')
      await sleep(400) // cho âm complete vang chút rồi mới onComplete
      await Promise.resolve(onComplete(traits))
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Glow nền */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 0% 0%, rgba(236,72,153,0.45), transparent 55%), radial-gradient(circle at 100% 100%, rgba(129,140,248,0.6), transparent 55%)'
          }}
        />

        <motion.div
          className="
            relative w-full max-w-md mx-4
            rounded-3xl
            bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
            border border-white/10
            shadow-[0_20px_70px_rgba(0,0,0,0.85)]
            p-6
            text-slate-50
          "
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <div className="pointer-events-none absolute inset-px rounded-3xl border border-white/5" />

          {/* Nút đóng */}
          <button
            onClick={onCancel}
            className="absolute top-3 right-4 text-slate-400 hover:text-slate-100 text-lg"
          >
            ✕
          </button>

          {!finished ? (
            <>
              {/* Header nhỏ */}
              <div className="text-center mb-3 mt-1 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-pink-500/40 shadow-[0_0_18px_rgba(244,114,182,0.45)]">
                  <span className="text-[11px]">💘</span>
                  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-pink-200">
                    Love Style Story
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Câu hỏi{' '}
                  <span className="text-pink-300 font-semibold">
                    {stepIndex + 1}
                  </span>{' '}
                  / {steps.length}
                </p>
              </div>

              {/* Câu hỏi */}
              <div className="mb-4 text-center relative z-10">
                <h3 className="font-semibold text-[15px] text-slate-50 mb-1">
                  {currentStep.title}
                </h3>
                <p className="text-[12px] text-slate-300 leading-relaxed">
                  {currentStep.question}
                </p>
                <p className="mt-2 text-[11px] text-slate-500">
                  Chọn một đáp án để tự động sang câu tiếp theo ✨
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2.5 mb-1 relative z-10">
                {currentStep.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(currentStep.id, opt.value)}
                    className={`w-full text-left px-4 py-3 rounded-2xl border text-[13px] transition-all flex flex-col
                      ${
                        answers[currentStep.id] === opt.value
                          ? 'bg-slate-900/90 border-pink-400/80 shadow-[0_0_22px_rgba(244,114,182,0.65)]'
                          : 'bg-slate-900/70 border-slate-700/80 hover:border-pink-400/70 hover:bg-slate-900/90 hover:shadow-[0_0_18px_rgba(244,114,182,0.45)]'
                      }`}
                  >
                    <div className="font-semibold text-slate-50">
                      {opt.label}
                    </div>
                    {opt.desc && (
                      <div className="text-[11px] text-slate-400 mt-1">
                        {opt.desc}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center relative z-10 mt-2">
              <div className="mx-auto mb-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-pink-400 to-indigo-400 flex items=center justify-center shadow-[0_0_40px_rgba(52,211,153,0.7)]">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-50 mb-2">
                Bạn đã hoàn thành Love Style Story!
              </h3>
              <p className="text-[12px] text-slate-300 mb-3">
                Chúng tôi đã hiểu rõ hơn phong cách yêu của bạn.
              </p>
              <p className="mb-4">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Love Style Score
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-rose-300 to-indigo-300 bg-clip-text text-transparent drop-shadow">
                  {score}%
                </span>
              </p>

              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className={`
                  w-full
                  bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500
                  text-white py-2.5 rounded-2xl
                  hover:shadow-[0_12px_32px_rgba(217,70,239,0.95)]
                  hover:translate-y-0.5
                  active:scale-95
                  transition-all text-[13px] font-semibold
                  ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
                `}
              >
                {isSubmitting
                  ? 'Đang lưu thông tin...'
                  : 'Xác nhận & lưu thông tin 💾'}
              </button>

              <p className="mt-3 text-[10px] text-slate-500">
                Bạn có thể chơi lại mini game này trong tương lai.
              </p>
            </div>
          )}
        </motion.div>

        {/* Audio elements */}
        <audio ref={selectAudioRef} preload="auto">
          <source src={selectSound} type="audio/mpeg" />
        </audio>

        <audio ref={completeAudioRef} preload="auto">
          <source src={completeSound} type="audio/mpeg" />
        </audio>
      </motion.div>
    </AnimatePresence>
  )
}
