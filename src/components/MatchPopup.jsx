import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

export default function MatchPopup({ matchProfile, onClose }) {
  const [step, setStep] = useState('intro')
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const currentUserId = supabase.auth.getUser()?.id // đảm bảo đúng user đang đăng nhập

  // 👉 Bắt đầu trò chơi
  const handleStartGame = () => setStep('question')

  // 👉 Khi chọn 1 đáp án
  const handleChoice = async (choice) => {
    setSelected(choice)

    // Giả lập traits đơn giản
    const traits = {
      favorite_activity:
        choice === 'outdoor'
          ? 'Thích hoạt động ngoài trời 🌳'
          : 'Thích ở nhà thư giãn 🏠'
    }

    // Lưu vào bảng game_sessions (người CHƠI hiện tại, không phải người match)
    await supabase.from('game_sessions').insert({
      game_id: '00000000-0000-0000-0000-000000000001', // ID mẫu (tạm)
      user_id: currentUserId, // người đang chơi
      extracted_traits: traits,
      score: 1
    })

    setResult(traits.favorite_activity)
    setStep('result')
  }

  // 👉 Bắt đầu chat sau khi hoàn tất
  const handleChat = () => {
    onClose() // đóng popup
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <motion.div
        className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        {/* 🎉 GIAO DIỆN KHI MỚI MATCH */}
        {step === 'intro' && (
          <>
            <h2 className="text-2xl font-bold text-pink-600 mb-3">
              🎉 Bạn đã match với {matchProfile.name}!
            </h2>
            <p className="text-gray-600 mb-5">
              Cùng chơi mini game nhỏ để hiểu nhau hơn nhé 💕
            </p>
            <button
              onClick={handleStartGame}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
            >
              Bắt đầu trò chơi 🎮
            </button>
          </>
        )}

        {/* 🎮 CÂU HỎI MINI GAME */}
        {step === 'question' && (
          <>
            <h3 className="text-lg font-semibold mb-4">
              Nếu có một ngày rảnh, bạn chọn:
            </h3>
            <div className="flex justify-around">
              <button
                onClick={() => handleChoice('outdoor')}
                className={`px-4 py-2 rounded-lg border ${
                  selected === 'outdoor'
                    ? 'bg-pink-200 border-pink-500'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🏞️ Ra ngoài chơi
              </button>
              <button
                onClick={() => handleChoice('home')}
                className={`px-4 py-2 rounded-lg border ${
                  selected === 'home'
                    ? 'bg-pink-200 border-pink-500'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                📺 Ở nhà thư giãn
              </button>
            </div>
          </>
        )}

        {/* 💬 KẾT QUẢ */}
        {step === 'result' && (
          <>
            <h3 className="text-lg font-semibold text-green-600 mb-3">
              💬 Kết quả của bạn:
            </h3>
            <p className="text-gray-700 mb-5">{result}</p>
            <button
              onClick={handleChat}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
            >
              Bắt đầu chat 💬
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
