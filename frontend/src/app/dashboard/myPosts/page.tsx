'use client';

import { useEffect, useState } from 'react';
import { MoreVertical, Pencil, Trash2, ArrowLeft, MessageCircle, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '../../../../lib/supabaseClient';
import { formatDistanceToNow, format } from 'date-fns';

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

interface Author {
  id: number;
  name: string;
  profileImage: string;
}

interface Comment {
  id: number;
  content: string;
}

interface Like {
  id: number;
  userId: number;
}

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: Author;
  likes: Like[];
  comments: Comment[];
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenuPostId, setActiveMenuPostId] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [editedImage, setEditedImage] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [commentsByPostId, setCommentsByPostId] = useState<{ [key: number]: any[] }>(() => {
    return posts.reduce((acc, post) => ({ ...acc, [post.id]: [] }), {});
  });  
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
const [activeMenuCommentId, setActiveMenuCommentId] = useState<number | null>(null);




  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return toast.error('Not authenticated');

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const id = payload.id;
      setUserId(id);
      fetchUserPosts(id);
    } catch (err) {
      console.error('Invalid token', err);
      toast.error('Invalid token');
    }
  }, []);

  const fetchUserPosts = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load posts');
  
      const allPosts: Post[] = await res.json();
      const userPosts = allPosts.filter((post) => post.author.id === id);
      setPosts(userPosts);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching your posts');
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleDeletePost = async (postId: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete post');

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete');
    }
  };

  const handleEditPost = async (postId: number) => {
    if (!editedContent.trim()) return;
  
    const token = localStorage.getItem('token');
    let imageUrl: string | undefined = undefined;
  
    try {
      if (editedImage) {
        const fileExt = editedImage.name.split('.').pop();
        const filePath = `post-images/${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('pinged')
          .upload(filePath, editedImage);
  
        if (error) throw error;
  
        const { data: publicUrlData } = supabase
          .storage
          .from('pinged')
          .getPublicUrl(filePath);
  
        imageUrl = publicUrlData?.publicUrl;
      }
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editedContent,
          ...(imageUrl && { imageUrl }),
        }),
      });
  
      if (!res.ok) throw new Error('Failed to update post');
  
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, content: editedContent, imageUrl: imageUrl || p.imageUrl }
            : p
        )
      );
      setEditingPostId(null);
      setEditedContent('');
      setEditedImage(null);
      toast.success('Post updated');
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    }
  };

  async function handleUpdateComment(commentId: number, postId: number) {
  if (!editedContent.trim()) return;

  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: editedContent }),
    });

    if (!res.ok) throw new Error('Failed to update comment');

    // Update post state
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map((c: any) =>
                c.id === commentId ? { ...c, content: editedContent } : c
              ),
            }
          : p
      )
    );

    toast.success('Comment updated');
    setEditingCommentId(null);
    setEditedContent('');
  } catch (error) {
    console.error('Update error:', error);
    toast.error('Could not update comment');
  }
}

  async function handleDeleteComment(commentId: number, postId: number) {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) throw new Error('Failed to delete comment');
  
      // Optimistically remove comment from state
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments?.filter((c: any) => c.id !== commentId),
              }
            : p
        )
      );
  
      toast.success('Comment deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete comment');
    }
  }
  
  async function handleCommentSubmit(postId: number) {
    const content = commentInputs[postId];
    if (!content?.trim() || !userId) return;
  
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, authorId: userId, content }),
      });
  
      const newComment = await res.json();
  
      if (!res.ok) throw new Error(newComment.error || 'Failed to post comment');
  
      // Clear input
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  
      // Optimistically update post's comment array
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [...(p.comments || []), newComment],
              }
            : p
        )
      );
  
      // Show success message
      toast('Comment posted!', { duration: 2000 });
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error('Failed to post comment');
    }
  }  
  
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
  

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        My Posts
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-400">You haven't posted anything yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-700 rounded-xl relative"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.profileImage}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                   {post.author?.name || 'Unknown'} · {getFormattedDate(post.createdAt)}
                      </p>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)
                    }
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {activeMenuPostId === post.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-10">
                      <button
                        onClick={() => {
                          setEditingPostId(post.id);
                          setEditedContent(post.content);
                          setActiveMenuPostId(null);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-700"
                      >
                        <Pencil size={14} className="mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDeletePost(post.id);
                          setActiveMenuPostId(null);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700"
                      >
                        <Trash2 size={14} className="mr-2" /> Delete
                      </button>
                      <button
                        onClick={() => setActiveMenuPostId(null)}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ArrowLeft size={14} className="mr-2" /> Back
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editingPostId === post.id ? (
                <div className="mt-2">
  <textarea
    value={editedContent}
    onChange={(e) => setEditedContent(e.target.value)}
    rows={3}
    className="w-full p-2 mt-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
  />
<input
  type="file"
  accept="image/*"
  onChange={(e) => setEditedImage(e.target.files?.[0] || null)}
  className="mt-2"
/>

  {post.imageUrl && (
    <img
      src={post.imageUrl}
      alt="Old Post"
      className="mt-2 max-h-[200px] object-contain rounded"
    />
  )}
  <div className="flex gap-2 mt-2">
    <button
      onClick={() => handleEditPost(post.id)}
      className="px-4 py-2 bg-black text-white rounded hover:opacity-90 dark:bg-white dark:text-black"
    >
      Save
    </button>
    <button
      onClick={() => setEditingPostId(null)}
      className="px-4 py-2 border rounded text-gray-600 dark:text-gray-300"
    >
      Cancel
    </button>
  </div>
</div>

              ) : (
                <>
                  <p className="mt-3 text-gray-800 dark:text-white">{post.content}</p>
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
                  <div
                  className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition"
                  onClick={() =>
                    setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                  }
                >
                  <MessageCircle size={18} />
                  <span>
                    {Array.isArray(commentsByPostId[post.id])
                      ? commentsByPostId[post.id].length
                      : post.comments?.length || 0}
                  </span>
                </div>
                </div>
                          {/* Comment Input */}
            <div className="mt-3">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInputs[post.id] || ''}
                onChange={(e) =>
                  setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCommentSubmit(post.id);
                  }
                }}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm p-2 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
              />
                {expandedComments[post.id] && (
                  <div className="mt-2 space-y-2 text-sm">
                        {(post.comments || []).map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-xl"
                            >
                              <div className="flex-1 text-sm">
                                <p className="text-gray-900 dark:text-white font-medium">
                                  {comment.author?.name || 'User'}
                                </p>

                                {editingCommentId === comment.id ? (
                                  <input
                                    type="text"
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleUpdateComment(comment.id, post.id);
                                    }}
                                    className="w-full mt-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                  />
                                ) : (
                                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                                )}

                                <p className="text-xs text-gray-500 mt-1">
                                  {getFormattedDate(comment.createdAt)}
                                </p>
                              </div>

                              {comment.author?.id === userId && (
                                <div className="relative self-start ml-auto">
                                  <button
                                    onClick={() =>
                                      setActiveMenuCommentId(activeMenuCommentId === comment.id ? null : comment.id)
                                    }
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition"
                                  >
                                    <MoreVertical size={18} />
                                  </button>

                                  {/* Dropdown Menu */}
                                  {activeMenuCommentId === comment.id && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-10 border border-gray-200 dark:border-gray-700">
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(comment.id);
                                          setEditedContent(comment.content);
                                          setActiveMenuCommentId(null);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-700"
                                      >
                                        <Pencil size={14} className="mr-2" /> Edit
                                      </button>

                                      <button
                                        onClick={() => {
                                          handleDeleteComment(comment.id, post.id);
                                          setActiveMenuCommentId(null);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700"
                                      >
                                        <Trash2 size={14} className="mr-2" /> Delete
                                      </button>

                                      <button
                                        onClick={() => setActiveMenuCommentId(null)}
                                        className="flex items-center w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        <ArrowLeft size={14} className="mr-2" /> Back
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                  </div>
                )}
            </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
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
