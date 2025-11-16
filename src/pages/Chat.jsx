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

  // 🔹 Check user kia + tìm match
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

      // 2. Tìm match giữa 2 người
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
        .limit(200)

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
          // 🚫 Bỏ qua tin nhắn chính mình (đã add qua insert)
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

  // 🔹 Gửi tin nhắn (Enter hoặc nút)
  const sendMessage = async () => {
    if (!newMessage.trim() || !matchId) return
    if (sending) return

    const content = newMessage.trim()
    setSending(true)

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

    if (data) {
      setMessages(prev => [...prev, data])
    }

    setNewMessage('')

    // set typing = false
    await supabase.from('typing').upsert({
      match_id: matchId,
      user_id: currentUserId,
      typing: false,
      updated_at: new Date().toISOString()
    })

    // Notification (optional)
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 🔹 Nếu chưa đăng nhập
  if (!session || !session.user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-center text-sm text-slate-500">
          Bạn chưa đăng nhập.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute -inset-6 blur-3xl opacity-60 bg-gradient-to-br from-pink-400/40 via-purple-400/40 to-sky-400/40" />
          <div className="relative rounded-3xl bg-slate-900/90 border border-white/10 px-6 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.9)]">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-pink-400 border-t-transparent animate-spin mb-3" />
            <p className="text-[13px] text-slate-200">
              Đang mở phòng chat cho bạn...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute -inset-6 blur-3xl opacity-60 bg-gradient-to-br from-red-400/40 via-pink-400/40 to-orange-400/40" />
          <div className="relative rounded-3xl bg-slate-900/95 border border-red-400/40 px-6 py-7 text-center shadow-[0_20px_60px_rgba(127,29,29,0.85)]">
            <p className="text-sm text-red-100 mb-4">{error}</p>
            <Link
              to="/matches"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl text-xs font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white shadow-[0_12px_32px_rgba(248,113,113,0.9)] hover:translate-y-0.5 active:scale-95 transition-all"
            >
              🔙 Quay lại danh sách match
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-2 py-4">
      <div className="relative w-full max-w-2xl">
        {/* Glow nền chat */}
        <div
          className="pointer-events-none absolute -inset-8 blur-3xl opacity-70 -z-10"
          style={{
            background:
              'radial-gradient(circle at 0% 0%, rgba(244,114,182,0.65), transparent 55%), radial-gradient(circle at 100% 100%, rgba(59,130,246,0.65), transparent 55%)'
          }}
        />

        {/* Card chat glassmorphism */}
        <div className="relative flex flex-col h-[72vh] sm:h-[78vh] rounded-3xl bg-slate-950/90 border border-white/10 shadow-[0_22px_70px_rgba(15,23,42,0.95)] overflow-hidden">
          {/* header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95">
            <Link
              to="/matches"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-900/80 border border-slate-600/70 text-slate-200 text-lg hover:border-pink-400 hover:text-pink-300 hover:scale-105 transition-all"
            >
              ←
            </Link>

            {otherProfile && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-pink-400 via-purple-400 to-sky-400">
                    <img
                      src={
                        otherProfile.avatar_url ||
                        'https://placehold.co/80x80?text=?'
                      }
                      alt={otherProfile.display_name}
                      className="w-full h-full rounded-full object-cover border border-slate-900"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-900 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-50 leading-tight">
                    {otherProfile.display_name || 'Người dùng'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    💬 Đang trò chuyện với bạn
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* messages */}
          <div className="flex-1 h-0 overflow-y-auto px-3 sm:px-4 py-3 space-y-2 bg-gradient-to-b from-slate-950/90 via-slate-950/95 to-slate-950/98">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId} />
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400 italic pl-1">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
                <span>Đang nhắn...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* input */}
          <div className="border-t border-white/10 bg-slate-950/95 px-3 sm:px-4 py-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <div className="relative">
                  <input
                    value={newMessage}
                    onChange={e => {
                      setNewMessage(e.target.value)
                      if (e.target.value.trim()) {
                        handleTyping()
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    className="
                      w-full
                      rounded-2xl
                      bg-slate-900/80
                      border border-slate-700
                      px-3.5 py-2.5
                      text-sm
                      text-slate-50
                      placeholder:text-slate-500
                      outline-none
                      focus:border-pink-400/90
                      focus:ring-2 focus:ring-pink-500/60
                      shadow-[0_10px_30px_rgba(15,23,42,0.9)]
                      transition-all
                    "
                    placeholder="Nhập tin nhắn ngọt ngào của bạn..."
                  />
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                    Nhấn Enter để gửi
                  </div>
                </div>
              </div>

              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className={`
                  inline-flex items-center justify-center
                  px-4 py-2.5
                  rounded-2xl
                  text-[12px] font-semibold
                  text-white
                  bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500
                  shadow-[0_12px_34px_rgba(236,72,153,0.9)]
                  hover:shadow-[0_16px_42px_rgba(236,72,153,1)]
                  hover:translate-y-0.5
                  active:scale-95
                  transition-all
                  ${
                    sending || !newMessage.trim()
                      ? 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
                      : ''
                  }
                `}
              >
                {sending ? 'Đang gửi…' : 'Gửi 💌'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
