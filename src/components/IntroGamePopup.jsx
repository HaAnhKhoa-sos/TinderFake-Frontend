import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import selectSound from '../assets/sounds/select.mp3'
import nextSound from '../assets/sounds/next.mp3'
import completeSound from '../assets/sounds/complete.mp3'

export default function IntroGamePopup({ onComplete, onCancel, name }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🔊 refs audio gắn trực tiếp vào DOM
  const selectAudioRef = useRef(null)
  const nextAudioRef = useRef(null)
  const completeAudioRef = useRef(null)

  const playSound = (type) => {
    try {
      let audio
      if (type === 'select') audio = selectAudioRef.current
      else if (type === 'next') audio = nextAudioRef.current
      else if (type === 'complete') audio = completeAudioRef.current

      if (!audio) return

      audio.currentTime = 0
      const p = audio.play()
      if (p && typeof p.then === 'function') {
        p.catch((err) => {
          console.warn('⚠️ Audio play bị chặn / lỗi:', err)
        })
      }
    } catch (e) {
      console.warn('⚠️ Audio error:', e)
    }
  }

  const questions = [
    {
      id: 'personality',
      traitKey: 'personality_type',
      text: 'Chọn “vibe” của bạn trong đám đông 🔍',
      subtitle: 'Nếu vào một buổi tiệc đông người, bạn sẽ là kiểu người nào?',
      options: [
        {
          value: 'introvert',
          icon: '🧘',
          title: 'Hướng nội chill',
          desc: 'Thích góc yên tĩnh, nói chuyện 1-1, nạp năng lượng một mình.'
        },
        {
          value: 'extrovert',
          icon: '🎉',
          title: 'Hướng ngoại nhiệt',
          desc: 'Chủ động bắt chuyện, cực vui trong các group đông người.'
        },
        {
          value: 'ambivert',
          icon: '⚖️',
          title: 'Linh hoạt tùy mood',
          desc: 'Lúc cần chill vẫn chill, lúc cần quẩy vẫn quẩy cực sung.'
        }
      ]
    },
    {
      id: 'priority',
      traitKey: 'love_priority',
      text: 'Trong tình yêu, điều gì là “core” với bạn nhất? ❤️',
      subtitle: 'Chọn yếu tố mà bạn không thể thiếu trong một mối quan hệ.',
      options: [
        {
          value: 'trust',
          icon: '🤝',
          title: 'Niềm tin & an toàn',
          desc: 'Cần cảm giác được tôn trọng, chân thành và tin tưởng lẫn nhau.'
        },
        {
          value: 'fun',
          icon: '😂',
          title: 'Niềm vui & tiếng cười',
          desc: 'Một mối quan hệ phải vui, thoải mái, không quá nặng nề.'
        },
        {
          value: 'growth',
          icon: '🌱',
          title: 'Cùng nhau phát triển',
          desc: 'Muốn cả hai cùng tiến bộ, hỗ trợ nhau trên hành trình riêng.'
        }
      ]
    },
    {
      id: 'date_style',
      traitKey: 'date_style',
      text: 'Buổi hẹn hoàn hảo với bạn trông như thế nào? ✨',
      subtitle: 'Hình dung một buổi hẹn đầu tiên thật đúng gu bạn.',
      options: [
        {
          value: 'coffee',
          icon: '☕',
          title: 'Cà phê tâm sự',
          desc: 'Ngồi nói chuyện thật lâu, tìm hiểu nhau qua từng câu chuyện.'
        },
        {
          value: 'activity',
          icon: '🏸',
          title: 'Hoạt động / trò chơi',
          desc: 'Làm gì đó cùng nhau: bowling, boardgame, workshop, v.v.'
        },
        {
          value: 'walk',
          icon: '🚶',
          title: 'Đi dạo chill',
          desc: 'Đi bộ, ngắm phố xá, nói chuyện nhẹ nhàng không áp lực.'
        }
      ]
    }
  ]

  const totalSteps = questions.length
  const currentQuestion = questions[step]
  const progressPercent = ((step + (finished ? 1 : 0)) / totalSteps) * 100

  const handleSelect = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.traitKey]: value
    }))
    playSound('select')
  }

  const handleNext = () => {
    if (!answers[currentQuestion.traitKey]) {
      alert('Hãy chọn một đáp án trước khi tiếp tục nhé 💬')
      return
    }
    playSound('next')

    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      setFinished(true)
    }
  }

  const handleFinish = async () => {
    if (isSubmitting) return

    const traits = {
      personality_type: answers.personality_type,
      love_priority: answers.love_priority,
      date_style: answers.date_style,
      intro_score: 80
    }

    try {
      setIsSubmitting(true)
      playSound('complete')
      await Promise.resolve(onComplete(traits))
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <div className="pointer-events-none absolute inset-px rounded-3xl border border-white/5" />

        {/* Header */}
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
              Một mini game nhỏ để TinderFake hiểu gu tình yêu & vibe của bạn hơn.
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

        {/* Progress */}
        <div className="relative px-5 pb-3">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[11px] text-slate-400">
              Câu hỏi{' '}
              <span className="font-semibold text-pink-300">
                {Math.min(step + 1, totalSteps)}
              </span>{' '}
              / {totalSteps}
            </p>
            <p className="text-[10px] text-slate-400">
              {finished ? 'Sẵn sàng lưu thông tin ✨' : 'Trả lời thật lòng nha 💖'}
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
                    const isActive =
                      answers[currentQuestion.traitKey] === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`
                          w-full text-left px-3.5 py-2.5 rounded-2xl border
                          flex items-center gap-3
                          shadow-[0_10px_25px_rgba(15,23,42,0.8)]
                          transition-all
                          ${
                            isActive
                              ? 'border-pink-400/80 bg-slate-900/80 text-pink-50 shadow-[0_0_24px_rgba(244,114,182,0.7)]'
                              : 'border-slate-700/80 bg-slate-900/70 text-slate-200 hover:border-pink-500/60 hover:bg-slate-900/90 hover:shadow-[0_0_18px_rgba(248,113,113,0.45)]'
                          }
                        `}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-800/90 border border-slate-600/70 text-2xl">
                          {opt.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-slate-50">
                            {opt.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
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
                  Chúng tôi sẽ dùng thông tin này để ưu tiên gợi ý những người có{' '}
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
                  Bạn có thể chơi lại & thay đổi câu trả lời trong tương lai.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 👇 3 audio element thực tế trong DOM */}
{/* 👇 3 audio element thực tế trong DOM */}
<audio
  ref={selectAudioRef}
  preload="auto"
  onError={() => console.log('Lỗi load selectSound', selectAudioRef.current?.error)}
>
  <source src={selectSound} type="audio/mpeg" />
</audio>

<audio
  ref={nextAudioRef}
  preload="auto"
  onError={() => console.log('Lỗi load nextSound', nextAudioRef.current?.error)}
>
  <source src={nextSound} type="audio/mpeg" />
</audio>

<audio
  ref={completeAudioRef}
  preload="auto"
  onError={() => console.log('Lỗi load completeSound', completeAudioRef.current?.error)}
>
  <source src={completeSound} type="audio/mpeg" />
</audio>
    </motion.div>
  )
}
