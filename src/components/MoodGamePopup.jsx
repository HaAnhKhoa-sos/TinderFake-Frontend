import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function MoodGamePopup({ onComplete, onCancel }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)

  const questions = [
    {
      id: 1,
      text: 'Buổi sáng bạn thường cảm thấy thế nào?',
      options: [
        { value: 'energetic', label: '⚡ Tràn đầy năng lượng' },
        { value: 'calm', label: '☕ Bình tĩnh, chậm rãi' },
        { value: 'lazy', label: '😴 Lười biếng và chán nản' },
      ]
    },
    {
      id: 2,
      text: 'Bạn thích môi trường làm việc như thế nào?',
      options: [
        { value: 'social', label: '👫 Năng động, nhiều người' },
        { value: 'quiet', label: '📚 Yên tĩnh, tập trung' },
        { value: 'creative', label: '🎨 Thoải mái, sáng tạo' },
      ]
    },
  ]

  const handleSelect = (val) => setAnswers({ ...answers, [step]: val })

  const handleNext = () => {
    if (!answers[step]) return alert('Hãy chọn một đáp án nhé 💬')
    if (step < questions.length - 1) setStep(step + 1)
    else setFinished(true)
  }

  const handleFinish = async () => {
    const traits = {
      morning_mood: answers[0],
      work_preference: answers[1],
      mood_score: Math.floor(Math.random() * 100)
    }
    onComplete(traits)
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-5 text-gray-400 hover:text-gray-700 text-lg"
        >
          ✖
        </button>

        {!finished ? (
          <>
            <h2 className="text-xl font-bold text-pink-600 mb-4">🌈 Trò chơi tâm trạng</h2>
            <p className="text-gray-700 mb-2">
              {questions[step].text}
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {questions[step].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-4 py-2 rounded-lg border transition ${
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
              {step === questions.length - 1 ? 'Hoàn tất 🎯' : 'Tiếp tục ➜'}
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-green-600 mb-3">✨ Hoàn tất trò chơi!</h3>
            <p className="text-gray-700 mb-4">Cảm ơn bạn đã chia sẻ tâm trạng hôm nay 💖</p>
            <button
              onClick={handleFinish}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
            >
              Lưu kết quả 💾
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
