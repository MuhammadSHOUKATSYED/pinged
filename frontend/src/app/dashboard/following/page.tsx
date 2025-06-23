'use client';

import { useEffect, useState } from 'react';
import { Search, MoreVertical, MessageCircle, UserX, ArrowLeft } from 'lucide-react';
import { Menu } from '@headlessui/react';
import ChatRoom from '../../components/ChatRoom';
import Modal from '../../components/Modal';

interface User {
  id: number;
  name: string;
  bio?: string;
  profileImage?: string;
}

export default function FollowingPage() {
  const [following, setFollowing] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [chatWithUserId, setChatWithUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchFollowing();
  }, []);

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(decoded.id);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/follow/${decoded.id}/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setFollowing(data.following || []);
    } catch (err) {
      console.error('Failed to fetch following', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/follow/unfollow/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await res.json();
      console.log('Unfollow response:', res.status, data);
  
      if (!res.ok) throw new Error('Failed to unfollow');
  
      setFollowing(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to unfollow user', err);
    }
  };
  

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading following...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Your Following</h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search following..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-900 dark:text-white dark:border-gray-700"
        />
      </div>

      <div className="space-y-4">
        {following
          .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
          .map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm"
            >
              <div className="flex items-center space-x-4">
                {user.profileImage && user.profileImage.trim() !== '' ? (
                  <img
                    src={user.profileImage}
                    className="w-14 h-14 rounded-full object-cover border border-gray-300"
                    alt={user.name}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-400 text-white flex items-center justify-center text-lg font-bold border border-gray-300">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.bio || 'No bio available'}</p>
                </div>
              </div>

              {/* Three Dots Menu */}
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="text-gray-500 hover:text-gray-800">
                  <MoreVertical className="w-5 h-5" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 z-50 mt-2 w-40 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setChatWithUserId(user.id)}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-white`}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleUnfollow(user.id)}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Unfollow
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active, close }) => (
                        <button
                          onClick={() => close()}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-white`}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
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
