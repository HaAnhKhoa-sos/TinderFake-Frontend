import React from 'react'
import dayjs from 'dayjs'

export default function MessageBubble({ msg, currentUserId }) {
  const isMe = msg.sender_id === currentUserId

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg text-sm break-words ${
          isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p>{msg.content}</p>
        <div className="text-xs text-gray-500 text-right mt-1">
          {dayjs(msg.created_at).format('HH:mm')}
        </div>
      </div>
    </div>
  )
}
