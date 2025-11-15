import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MiniGamePopup({ onComplete, onCancel, name }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)

  // 🎨 Bộ câu hỏi có hình ảnh minh họa (có thể đổi link ảnh theo ý bạn)
  const questions = [
    {
      id: 'activity',
      text: 'Cuối tuần bạn thường thích làm gì nhất?',
      options: [
        {
          value: 'outdoor',
          label: 'Hoạt động ngoài trời',
          img: 'https://images.pexels.com/photos/450035/pexels-photo-450035.jpeg?auto=compress&cs=tinysrgb&w=800'
        },
        {
          value: 'home',
          label: 'Ở nhà thư giãn',
          img: 'https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg?auto=compress&cs=tinysrgb&w=800'
        },
        {
          value: 'social',
          label: 'Gặp gỡ bạn bè',
          img: 'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=800'
        }
      ]
    },
    {
      id: 'music',
      text: 'Loại nhạc bạn yêu thích nhất?',
      options: [
        {
          value: 'pop',
          label: 'Nhạc Pop',
          img: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=800'
        },
        {
          value: 'lofi',
          label: 'Lofi / Chill',
          img: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=800'
        },
        {
          value: 'rock',
          label: 'Rock / EDM',
          img: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=800'
        }
      ]
    },
    {
      id: 'travel',
      text: 'Nếu được đi du lịch, bạn sẽ chọn?',
      options: [
        {
          value: 'sea',
          label: 'Biển xanh nắng vàng',
          img: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800'
        },
        {
          value: 'mountain',
          label: 'Leo núi khám phá',
          img: 'https://images.pexels.com/photos/547114/pexels-photo-547114.jpeg?auto=compress&cs=tinysrgb&w=800'
        },
        {
          value: 'city',
          label: 'Thành phố sôi động',
          img: 'https://images.pexels.com/photos/2304434/pexels-photo-2304434.jpeg?auto=compress&cs=tinysrgb&w=800'
        }
      ]
    }
  ]

  const handleSelect = (value) => {
    setAnswers({ ...answers, [questions[step].id]: value })
    setTimeout(() => {
      if (step < questions.length - 1) setStep(step + 1)
      else handleFinish()
    }, 250)
  }

  const handleFinish = () => {
    setFinished(true)
  }

  const handleComplete = () => {
    const traits = {
      favorite_activity: answers.activity,
      favorite_music: answers.music,
      favorite_travel: answers.travel,
      compatibility_score: 1 // backend sẽ tính thật
    }
    onComplete(traits)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div
            key={step}
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full text-center relative border border-pink-100"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* nút đóng */}
            <button
              onClick={onCancel}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-lg"
            >
              ✖
            </button>

            <h2 className="text-xl font-bold text-pink-600 mb-1">
              💞 Khám phá sự tương hợp với {name}
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Câu hỏi {step + 1} / {questions.length}
            </p>

            <h3 className="font-semibold mb-4 text-gray-800">
              {questions[step].text}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {questions[step].options.map(opt => (
                <motion.div
                  key={opt.value}
                  className={`
                    group p-2 rounded-2xl cursor-pointer transition border-2 
                    bg-gradient-to-b from-pink-50 to-white
                    hover:shadow-lg
                    ${
                      answers[questions[step].id] === opt.value
                        ? 'border-pink-500 shadow-pink-200'
                        : 'border-gray-200 hover:border-pink-300'
                    }
                  `}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelect(opt.value)}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={opt.img}
                      alt={opt.label}
                      className="w-full h-24 object-cover transform group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-70" />
                    <span className="absolute bottom-2 left-2 text-[11px] font-semibold text-white drop-shadow">
                      {opt.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            className="bg-white rounded-3xl p-6 shadow-2xl text-center max-w-md w-full border border-emerald-100"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl font-bold text-green-600 mb-3">
              🎉 Hoàn tất!
            </h2>
            <p className="text-gray-700 mb-5 text-sm">
              Bạn và {name} vừa hoàn thành bài kiểm tra tương hợp!
              <br />
              Sẵn sàng để thích người này chứ? 💘
            </p>
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 font-semibold transition shadow-lg shadow-pink-300/70"
            >
              Xác nhận & Thích ❤️
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
