'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import ChatRoom from '../../components/ChatRoom';
import Modal from '../../components/Modal';

interface User {
  id: number;
  name: string;
  bio?: string;
  profileImage?: string;
}

export default function MessagesPage() {
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [chatWithUserId, setChatWithUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchChatUsers();
  }, []);

  const fetchChatUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(decoded.id);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/chat-users/${decoded.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setChatUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load chat users', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading conversations...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Your Conversations</h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-900 dark:text-white dark:border-gray-700"
        />
      </div>

      <div className="space-y-4">
        {chatUsers
          .filter((user) => user.name.toLowerCase().includes(search.toLowerCase()))
          .map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm"
            >
              <div className="flex items-center space-x-4">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    className="w-14 h-14 rounded-full object-cover border border-gray-300"
                    alt={user.name}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-400 text-white flex items-center justify-center text-lg font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.bio || 'No bio available'}</p>
                </div>
              </div>
              <button
                onClick={() => setChatWithUserId(user.id)}
                className="flex items-center gap-2 text-sm px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:opacity-90 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
            </div>
          ))}
      </div>

      {/* Chat Modal */}
      <Modal isOpen={!!chatWithUserId} onClose={() => setChatWithUserId(null)}>
        {chatWithUserId && currentUserId && (
          <ChatRoom currentUserId={currentUserId} otherUserId={chatWithUserId} />
        )}
      </Modal>
    </div>
  );
}
