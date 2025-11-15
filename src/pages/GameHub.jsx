import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function GameHub() {
  const [games, setGames] = useState([])

  useEffect(() => {
    fetch('http://localhost:4000/api/games')
      .then(res => res.json())
      .then(data => setGames(data.games || []))
      .catch(() => alert('Không thể tải danh sách game 😢'))
  }, [])

  return (
    <div className="max-w-md mx-auto mt-10 text-center">
      <h2 className="text-2xl font-bold text-pink-600 mb-6">🎮 Chọn trò chơi để khám phá bản thân</h2>

      <div className="grid gap-4">
        {games.map(game => (
          <Link
            key={game.id}
            to={`/game/${game.id}`}
            className="block bg-white p-4 rounded-xl shadow hover:bg-pink-50 transition"
          >
            <h3 className="text-lg font-semibold">{game.name}</h3>
            <p className="text-sm text-gray-500">{game.description || 'Không có mô tả'}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
