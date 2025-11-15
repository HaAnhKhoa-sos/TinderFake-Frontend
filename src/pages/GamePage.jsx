import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function GamePage({ session }) {
  const { id } = useParams()
  const [game, setGame] = useState(null)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE}/api/games/${id}`)
      .then(res => res.json())
      .then(data => setGame(data.game))
      .catch(() => alert('Không thể tải thông tin game'))
  }, [id])

  const handleSelect = (q, v) => setAnswers({ ...answers, [q]: v })

  const handleSubmit = async () => {
    // 👇 Dữ liệu traits giả lập từ câu trả lời
    const traits = Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v]))

    const { error } = await supabase.from('game_sessions').insert({
      game_id: id,
      user_id: session.user.id,
      extracted_traits: traits,
      score: 1
    })

    if (error) return alert('❌ Lưu thất bại: ' + error.message)
    alert('🎯 Đã lưu kết quả game!')
    navigate('/discover')
  }

  if (!game) return <p className="text-center mt-10 text-gray-500">Đang tải...</p>

  const questions = [
    { q: 'Cuối tuần bạn thích làm gì?', opts: ['outdoor', 'home', 'social'] },
    { q: 'Bạn thích loại nhạc nào nhất?', opts: ['pop', 'lofi', 'rock'] },
    { q: 'Nếu đi du lịch, bạn chọn?', opts: ['sea', 'mountain', 'city'] },
  ]

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow p-6 rounded-xl">
      <h2 className="text-xl font-bold text-pink-600 mb-6">{game.name}</h2>

      {!finished ? (
        <>
          {questions.map((q, i) => (
            <div key={i} className="mb-4">
              <p className="font-medium mb-2">{q.q}</p>
              <div className="flex flex-wrap gap-2">
                {q.opts.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(q.q, opt)}
                    className={`px-3 py-1 border rounded-lg text-sm ${
                      answers[q.q] === opt ? 'bg-pink-200 border-pink-500' : 'bg-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={() => setFinished(true)}
            className="w-full mt-4 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition"
          >
            Hoàn thành 🎮
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg text-green-600 font-semibold mb-3">🎉 Hoàn tất!</h3>
          <p className="text-gray-700 mb-4">Lưu lại để hệ thống hiểu bạn hơn 💞</p>
          <button
            onClick={handleSubmit}
            className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition"
          >
            Lưu kết quả
          </button>
        </>
      )}
    </div>
  )
}
