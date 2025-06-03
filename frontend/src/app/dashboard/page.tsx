'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Heart, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient'; // Adjust path if needed
import { formatDistanceToNow, format } from 'date-fns';
import { MdRepeat } from 'react-icons/md';

function getFormattedDate(createdAt: string) {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return formatDistanceToNow(date, { addSuffix: true }); // e.g., "3 hours ago"
  } else if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'MMM d'); // e.g., "Mar 10"
  } else {
    return format(date, 'MMM d, yyyy'); // e.g., "Apr 5, 2023"
  }
}


export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded JWT payload:', payload); // optional debug
      setUserId(payload.id); // ✅ fix here
    }
  }, []);
  

  
  useEffect(() => {
    fetchPosts();
  }, []);


  const toggleLike = async (postId: number) => {
    const token = localStorage.getItem('token');
  
    if (!token || !userId) {
      console.error('No token or userId, cannot toggle like');
      return;
    }
  
    const post = posts.find((p) => p.id === postId);
    const alreadyLiked = post?.likes?.some((like: any) => like.userId === userId);
  
    const method = alreadyLiked ? 'DELETE' : 'POST';
    const endpoint = alreadyLiked
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/likes/post/${postId}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/likes/post/${postId}`;
  
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to toggle like');
  
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: alreadyLiked
                  ? p.likes.filter((like: any) => like.userId !== userId)
                  : [...p.likes, { userId }],
              }
            : p
        )
      );
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };
  
  
  
  
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowModal(false);
      setSelectedImage(null);
    }
  }, []);

  useEffect(() => {
    if (showModal) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, handleKeyDown]);

  async function fetchPosts() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setPosts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePostSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPostContent.trim() && !newPostImage) return;

    try {
      setPosting(true);
      let imageUrl = '';

      if (newPostImage) {
        const fileExt = newPostImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error } = await supabase.storage
          .from('pinged')
          .upload(filePath, newPostImage, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('pinged')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData?.publicUrl || '';
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: newPostContent, imageUrl }),
      });

      if (!res.ok) throw new Error(`Post failed: ${await res.text()}`);
      setNewPostContent('');
      setNewPostImage(null);
      fetchPosts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-black px-4 sm:px-8 py-8">
      <div className="w-full max-w-2xl">
        {/* Post Composer */}
        <form
          onSubmit={handlePostSubmit}
          className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 shadow mb-6"
        >
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full resize-none bg-white dark:bg-black text-gray-900 dark:text-white p-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700"
          />

          <div className="flex justify-between items-center mt-3">
            <label className="cursor-pointer flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
              <ImageIcon size={20} />
              <span className="text-sm hidden sm:inline">Add Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewPostImage(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={posting}
              className="bg-black text-white dark:bg-white dark:text-black px-5 py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>

          {newPostImage && (
            <div className="mt-3">
              <img
                src={URL.createObjectURL(newPostImage)}
                alt="Preview"
                className="w-full h-auto max-h-60 object-cover rounded-lg"
              />
            </div>
          )}
        </form>

        {/* Posts Section */}
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading posts...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts found.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <div className="flex items-center gap-2 mb-1">
                  {post.author?.profileImage ? (
                    <img
                      src={post.author.profileImage}
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white flex items-center justify-center font-semibold">
                      {post.author?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {post.author?.name || 'Unknown'} · {getFormattedDate(post.createdAt)}
                  </div>
                </div>
                </div>
                <p className="text-gray-900 dark:text-white">{post.content}</p>
                {post.imageUrl && (
                          <img
                      src={post.imageUrl}
                      alt="Post"
                      className="mt-2 w-full h-auto max-h-[500px] object-contain rounded-lg cursor-pointer hover:opacity-80 transition"
                      onClick={() => {
                        setSelectedImage(post.imageUrl);
                        setShowModal(true);
                      }}
                    />
                )}

                <div className="mt-4 flex items-center gap-6 text-gray-500 dark:text-gray-400 text-sm">
                <div
                className={`flex items-center gap-1 cursor-pointer transition ${
                  post.likes?.some((like: any) => like.userId === userId) ? 'text-gray-500' : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => toggleLike(post.id)}
                >
                <Heart
                  size={18}
                  fill={
                    post.likes?.some((like: any) => like.userId === userId)
                      ? 'red'
                      : 'none'
                  }
                  stroke={
                    post.likes?.some((like: any) => like.userId === userId)
                      ? 'red'
                      : 'currentColor'
                  }
                />
                  <span>{post.likes?.length || 0}</span>
                </div>
                  <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition">
                    <MessageCircle size={18} /> <span>{post.comments?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-green-500 cursor-pointer transition">
                  < MdRepeat size={18} /> <span>Share</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {showModal && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => {
            setShowModal(false);
            setSelectedImage(null);
          }}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
