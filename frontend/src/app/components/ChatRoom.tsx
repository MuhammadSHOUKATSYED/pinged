'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatRoomProps {
  currentUserId: number;
  otherUserId: number;
}

interface Message {
  id?: number; // Optional before saving in DB
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
}

let socket: Socket | null = null;

export default function ChatRoom({ currentUserId, otherUserId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchMessages();
    setupSocket();

    return () => {
      socket?.disconnect();
    };
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_API_BASE_URL!, {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('Connected to socket:', socket?.id);
        socket?.emit('join', currentUserId);
      });

      socket.on('receiveMessage', (msg: Message) => {
        if (
          (msg.senderId === otherUserId && msg.receiverId === currentUserId) ||
          (msg.senderId === currentUserId && msg.receiverId === otherUserId)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      });
    }
  };

  const sendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !socket) return;

    const msg: Message = {
      content: trimmed,
      senderId: currentUserId,
      receiverId: otherUserId,
      createdAt: new Date().toISOString(),
    };

    // Emit to socket
    socket.emit('sendMessage', msg);

    // Save to DB via API (optional but recommended)
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(msg),
      });

      const savedMsg = await res.json();
      setMessages((prev) => [...prev, savedMsg]);
    } catch (err) {
      console.error('Failed to save message to DB', err);
    }

    setNewMessage('');
  };

  if (loading) {
    return <div className="text-center mt-4">Loading chat...</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Messages Area */}
      <div className="h-72 overflow-y-auto flex flex-col gap-3 mb-4 px-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`w-fit max-w-[75%] px-4 py-2 rounded-xl text-sm shadow-sm ${
              msg.senderId === currentUserId
                ? 'ml-auto bg-black text-white rounded-br-none'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none'
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 border-t pt-4">
        <input
          type="text"
          className="flex-1 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full hover:opacity-90 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
