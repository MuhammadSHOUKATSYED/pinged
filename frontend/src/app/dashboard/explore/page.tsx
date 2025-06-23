'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, MoreVertical, ArrowLeft, MessageSquare, UserPlus } from 'lucide-react';
import { Menu } from '@headlessui/react';
import Modal from '../../components/Modal';
import ChatRoom from '../../components/ChatRoom';

interface User {
  id: number;
  name: string;
  bio?: string;
  profileImage?: string;
}

export default function AllUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [following, setFollowing] = useState<number[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [chatWithUserId, setChatWithUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsersAndFollowing();
  }, []);

  const fetchUsersAndFollowing = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(decoded.id);

      const [usersRes, followingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/follow/${decoded.id}/following`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const usersData = await usersRes.json();
      const followingData = await followingRes.json();

      setUsers(usersData);
      setFollowing(followingData.following.map((f: any) => f.id));
    } catch (err) {
      console.error('Failed to fetch users or following list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number) => {
    const token = localStorage.getItem('token');
    if (!token || !currentUserId) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/follow/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          followerId: currentUserId,
          followingId: userId,
        }),
      });

      if (!res.ok) throw new Error('Failed to follow');
      setFollowing((prev) => [...prev, userId]);
      toast.success('Followed user');
    } catch (err) {
      console.error('Follow error', err);
      toast.error('Could not follow');
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading users...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
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
        {users
          .filter((u) => u.id !== currentUserId && u.name.toLowerCase().includes(search.toLowerCase()))
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
                  {!following.includes(user.id) && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleFollow(user.id)}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-white`}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </button>
                      )}
                    </Menu.Item>
                  )}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setChatWithUserId(user.id)}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-white`}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                  {({ active, close }) => (
                          <button
                            onClick={() => close()} // Only closes the menu
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-700' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-white`}
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                          </button>
                        )}

                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </div>
          ))}
      </div>

      <Modal isOpen={!!chatWithUserId} onClose={() => setChatWithUserId(null)}>
        {chatWithUserId && currentUserId && (
          <ChatRoom currentUserId={currentUserId} otherUserId={chatWithUserId} />
        )}
      </Modal>
    </div>
  );
}
