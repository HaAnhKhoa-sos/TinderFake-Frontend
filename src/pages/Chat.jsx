import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import MessageBubble from '../components/MessageBubble'
import { debounce } from 'lodash'

export default function Chat({ session }) {
  const { userId: otherUserId } = useParams()
  const currentUserId = session?.user?.id

  const [matchId, setMatchId] = useState(null)
  const [otherProfile, setOtherProfile] = useState(null)

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)

  // 🔹 Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  // 🔹 Lấy profile người kia để hiển thị trên header
  useEffect(() => {
    const fetchOtherProfile = async () => {
      if (!otherUserId) return
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', otherUserId)
        .maybeSingle()

      if (error) {
        console.error('Lỗi lấy profile người kia:', error.message)
      } else {
        setOtherProfile(data)
      }
    }

    fetchOtherProfile()
  }, [otherUserId])

  // 🔹 Check user kia tồn tại + tìm match giữa 2 người
  useEffect(() => {
    if (!currentUserId || !otherUserId) return

    const init = async () => {
      setLoading(true)
      setError(null)

      // 1. Check user kia tồn tại
      const { data: target, error: targetErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', otherUserId)
        .maybeSingle()

      if (targetErr || !target) {
        setError('Tài khoản không tồn tại hoặc đã bị xóa.')
        setLoading(false)
        return
      }

      // 2. Tìm match giữa 2 người (a-b hoặc b-a)
      const { data: match, error: matchErr } = await supabase
        .from('matches')
        .select('id, user_a, user_b')
        .or(
          `and(user_a.eq.${currentUserId},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${currentUserId})`
        )
        .maybeSingle()

      if (matchErr) {
        console.error('Lỗi lấy match:', matchErr.message)
        setError('Không thể tải phòng chat.')
        setLoading(false)
        return
      }

      if (!match) {
        setError('Hai bạn chưa match nên chưa thể chat với nhau.')
        setLoading(false)
        return
      }

      setMatchId(match.id)
      setLoading(false)
    }

    init()
  }, [currentUserId, otherUserId])

  // 🔹 Lấy lịch sử tin nhắn khi đã có matchId
  useEffect(() => {
    if (!matchId) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, match_id, sender_id, content, created_at')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) {
        console.error('Lỗi lấy messages:', error.message)
        setError('Không thể tải tin nhắn.')
        return
      }

      setMessages(data || [])
    }

    fetchMessages()
  }, [matchId])

  // 🔹 Realtime: tin nhắn mới + trạng thái đang nhập
  useEffect(() => {
    if (!matchId || !currentUserId) return

    const channel = supabase
      .channel(`chat-${matchId}`)
      // nghe tin nhắn mới
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
       payload => {
    const newRow = payload.new
    // 🚫 BỎ QUA tin nhắn chính mình (đã add qua optimistic update)
    if (newRow.sender_id === currentUserId) return

    console.log('📥 Realtime message (other user):', newRow)
    setMessages(prev => [...prev, newRow])
  }
      )
      // nghe cập nhật typing
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing',
          filter: `match_id=eq.${matchId}`
        },
        payload => {
          const row = payload.new
          if (!row) return
          if (row.user_id !== currentUserId && row.typing) {
            setIsTyping(true)
            setTimeout(() => setIsTyping(false), 3000)
          }
        }
      )
      .subscribe(status => {
        console.log('📡 Realtime chat status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, currentUserId])

  // 🔹 Đánh dấu "đang nhập"
  const handleTyping = useCallback(
    debounce(async () => {
      if (!matchId || !currentUserId) return
      try {
        await supabase.from('typing').upsert({
          match_id: matchId,
          user_id: currentUserId,
          typing: true,
          updated_at: new Date().toISOString()
        })
      } catch (e) {
        console.error('Lỗi update typing:', e.message)
      }
    }, 500),
    [matchId, currentUserId]
  )

  // 🔹 Gửi tin nhắn (có optimistic update)
  const sendMessage = async () => {
    if (!newMessage.trim() || !matchId) return

    const content = newMessage.trim()
    setSending(true)

    // 1. Insert vào messages + lấy lại row vừa insert
    const { data, error: msgErr } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: currentUserId,
        content
      })
      .select()
      .single()

    if (msgErr) {
      console.error('Lỗi gửi tin nhắn:', msgErr.message)
      alert('Không gửi được tin nhắn.')
      setSending(false)
      return
    }

    // 👉 Optimistic: đẩy luôn vào state (nếu realtime chậm)
    if (data) {
      setMessages(prev => [...prev, data])
    }

    setNewMessage('')

    // 2. Cập nhật typing = false
    await supabase.from('typing').upsert({
      match_id: matchId,
      user_id: currentUserId,
      typing: false,
      updated_at: new Date().toISOString()
    })

    // 3. Notification (optional)
    try {
      await supabase.from('notifications').insert({
        user_id: otherUserId,
        type: 'new_message',
        data: {
          from_user_id: currentUserId,
          match_id: matchId,
          preview: content.slice(0, 80)
        }
      })
    } catch (e) {
      console.warn('⚠️ Không thể tạo notification, nhưng tin nhắn vẫn gửi ok:', e.message)
    }

    setSending(false)
  }

  // 🔹 Nếu chưa đăng nhập
  if (!session || !session.user) {
    return <p className="text-center text-gray-500 mt-10">Bạn chưa đăng nhập.</p>
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white shadow p-4 rounded-2xl text-center text-gray-500">
        ⏳ Đang tải phòng chat...
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white shadow p-4 rounded-2xl text-center">
        <p className="text-red-500 mb-3">{error}</p>
        <Link
          to="/matches"
          className="inline-block px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          🔙 Quay lại danh sách match
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white shadow p-4 rounded-2xl max-w-2xl mx-auto mt-6 flex flex-col h-[80vh]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-3 mb-3">
        <Link to="/matches" className="text-xl">
          ←
        </Link>
        {otherProfile && (
          <>
            <img
              src={
                otherProfile.avatar_url ||
                'https://placehold.co/40x40?text=?'
              }
              alt={otherProfile.display_name}
              className="w-9 h-9 rounded-full object-cover border"
            />
            <div>
              <div className="font-semibold">
                {otherProfile.display_name || 'Người dùng'}
              </div>
              <div className="text-xs text-gray-500">
                💬 Đang trò chuyện
              </div>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 h-0 overflow-y-auto border rounded p-3 bg-gray-50 mb-4 space-y-2">
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId} />
        ))}
        {isTyping && (
          <div className="text-sm text-gray-500 italic">Đang nhắn...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={newMessage}
          onChange={e => {
            setNewMessage(e.target.value)
            if (e.target.value.trim()) {
              handleTyping()
            }
          }}
          className="flex-1 p-2 border rounded-full text-sm"
          placeholder="Nhập tin nhắn..."
        />
        <button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          className={`px-4 py-2 rounded-full text-white text-sm ${
            sending || !newMessage.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Gửi
        </button>
      </div>
    </div>
  )
}
