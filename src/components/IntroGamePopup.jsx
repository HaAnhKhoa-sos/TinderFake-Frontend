import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function IntroGamePopup({ onComplete, onCancel, name }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // 👈 chống double-click

  const questions = [
    {
      id: 1,
      text: 'Bạn là người hướng nội hay hướng ngoại?',
      options: [
        { value: 'introvert', label: '🧘 Hướng nội' },
        { value: 'extrovert', label: '🎉 Hướng ngoại' },
        { value: 'ambivert', label: '⚖️ Cân bằng' }
      ]
    },
    {
      id: 2,
      text: 'Trong tình yêu, bạn ưu tiên điều gì nhất?',
      options: [
        { value: 'trust', label: '🤝 Niềm tin' },
        { value: 'fun', label: '😂 Vui vẻ' },
        { value: 'growth', label: '🌱 Cùng phát triển' }
      ]
    },
    {
      id: 3,
      text: 'Bạn thích kiểu hẹn hò nào?',
      options: [
        { value: 'coffee', label: '☕ Ngồi cà phê tâm sự' },
        { value: 'activity', label: '🏸 Cùng chơi một hoạt động' },
        { value: 'walk', label: '🚶 Đi dạo nói chuyện' }
      ]
    }
  ]

  const handleSelect = (value) => {
    setAnswers(prev => ({ ...prev, [step]: value }))
  }

  const handleNext = () => {
    if (!answers[step]) return alert('Hãy chọn một đáp án nhé 💬')
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      setFinished(true)
    }
  }

  const handleFinish = async () => {
    if (isSubmitting) return // 👈 đang gửi thì bỏ qua click tiếp theo

    const traits = {
      personality_type: answers[0],
      love_priority: answers[1],
      date_style: answers[2],
      intro_score: 80 // tuỳ bạn sau này tính phức tạp hơn
    }

    try {
      setIsSubmitting(true)
      // Hỗ trợ onComplete async hoặc sync
      await Promise.resolve(onComplete(traits))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700"
          disabled={isSubmitting}
        >
          ✖
        </button>

        {!finished ? (
          <>
            <h2 className="text-xl font-semibold text-pink-600 mb-3">
              💕 Chào {name || 'bạn'}!
            </h2>
            <p className="text-gray-700 mb-2">
              Câu hỏi {step + 1} / {questions.length}
            </p>
            <p className="font-medium mb-4">{questions[step].text}</p>

            <div className="flex flex-col gap-2 mb-5">
              {questions[step].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-4 py-2 rounded-lg border text-sm transition ${
                    answers[step] === opt.value
                      ? 'bg-pink-200 border-pink-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
            >
              {step === questions.length - 1 ? 'Hoàn thành 🎯' : 'Tiếp tục ➜'}
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-green-600 mb-3">
              🎉 Cảm ơn bạn!
            </h3>
            <p className="text-gray-700 mb-4">
              Chúng tôi sẽ dùng thông tin này để gợi ý những người phù hợp hơn với bạn 💖
            </p>
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className={`bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin & tiếp tục'}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
