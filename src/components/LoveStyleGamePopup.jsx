import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

  const handleSelect = (traitKey, value) => {
    setAnswers(prev => ({ ...prev, [traitKey]: value }))
  }

  const handleNext = () => {
    if (!answers[currentStep.id]) {
      alert('Hãy chọn 1 lựa chọn nhé 💖')
      return
    }

    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1)
    } else {
      // Hoàn tất → tính score
      handleFinish()
    }
  }

  const handleFinish = () => {
    // Ví dụ: mỗi câu trả lời = 20 điểm, tối đa 100
    const answeredCount = Object.keys(answers).length
    const baseScore = Math.min(100, answeredCount * 20)
    setScore(baseScore)
    setFinished(true)
  }

  const handleComplete = () => {
    const traits = {
      ...answers,
      love_style_score: score
    }
    onComplete(traits)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          {/* Nút đóng */}
          <button
            onClick={onCancel}
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-lg"
          >
            ✖
          </button>

          {!finished ? (
            <>
              <h2 className="text-xl font-bold text-pink-600 mb-2 text-center">
                💘 Love Style Story
              </h2>
              <p className="text-xs text-gray-500 text-center mb-4">
                Câu hỏi {stepIndex + 1} / {steps.length}
              </p>

              <h3 className="font-semibold text-base mb-1 text-center">
                {currentStep.title}
              </h3>
              <p className="text-sm text-gray-700 mb-4 text-center">
                {currentStep.question}
              </p>

              <div className="flex flex-col gap-2 mb-5">
                {currentStep.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(currentStep.id, opt.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${
                      answers[currentStep.id] === opt.value
                        ? 'bg-pink-50 border-pink-500 shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-pink-500 text-white py-2 rounded-xl hover:bg-pink-600 transition text-sm font-semibold"
              >
                {stepIndex === steps.length - 1 ? 'Hoàn thành 🎯' : 'Tiếp tục ➜'}
              </button>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-green-600 mb-2 text-center">
                🎉 Xong rồi!
              </h3>
              <p className="text-gray-700 mb-4 text-center">
                Chúng tôi đã hiểu rõ hơn phong cách yêu của bạn.
                {' '}
                <br />
                <span className="text-pink-600 font-bold text-xl">
                  Love Style Score: {score}%
                </span>
              </p>
              <button
                onClick={handleComplete}
                className="w-full bg-pink-500 text-white py-2 rounded-xl hover:bg-pink-600 transition text-sm font-semibold"
              >
                Xác nhận & lưu thông tin 💾
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
