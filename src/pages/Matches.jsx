import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Matches({ session }) {
  const currentUserId = session?.user?.id
  const [matchedProfiles, setMatchedProfiles] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUserId) {
      loadMatchedProfiles()
    }
  }, [currentUserId])

  const loadMatchedProfiles = async () => {
    // 1. Lấy danh sách match liên quan đến currentUser
    const { data: matches } = await supabase
      .from('matches')
      .select('user_a, user_b')
      .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`)

    if (!matches || matches.length === 0) {
      setMatchedProfiles([])
      return
    }

    // 2. Lấy danh sách ID người đã match với currentUser
    const matchedIds = matches.map(m =>
      m.user_a === currentUserId ? m.user_b : m.user_a
    )

    // 3. Lấy thông tin hồ sơ của những người đó
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', matchedIds)

    setMatchedProfiles(profiles || [])
  }

  const handleChat = (targetId) => {
    navigate(`/chat/${targetId}`)
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-3 gap-6">
      {matchedProfiles.map(user => (
        <div key={user.id} className="bg-white shadow rounded p-4 text-center">
          <img
            src={user.avatar_url || 'https://placehold.co/100'}
            alt="avatar"
            className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
          />
          <h3 className="text-lg font-semibold mb-2">{user.display_name}</h3>
          <button
            onClick={() => handleChat(user.id)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            💬 Chat Love
          </button>
        </div>
      ))}

      {matchedProfiles.length === 0 && (
        <p className="col-span-full text-center text-gray-500 mt-10">
          Bạn chưa match với ai cả 😢
        </p>
      )}
    </div>
  )
}
