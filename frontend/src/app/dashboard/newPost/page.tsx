'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function CreatePostPage() {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    try {
      setUploading(true);
      let imageUrl = '';

      // Upload image to Supabase
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;
        const filePath = `public/${fileName}`;

        const { error } = await supabase.storage
          .from('pinged')
          .upload(filePath, imageFile, { upsert: false });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('pinged')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData?.publicUrl || '';
      }

      // Send post data to backend
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content, imageUrl }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success('Post created!');
      router.push('/dashboard/myPosts'); // Redirect to my posts page
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Create a New Post</h1>

      <form onSubmit={handlePostSubmit} className="bg-gray-100 dark:bg-gray-900 p-6 rounded-2xl shadow space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={4}
          className="w-full resize-none bg-white dark:bg-black text-gray-900 dark:text-white p-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700"
        />

        <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-600">
          <ImageIcon size={20} />
          <span className="text-sm">Add Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>

        {imageFile && (
          <div>
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="w-full max-h-64 object-contain rounded-lg"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-black text-white dark:bg-white dark:text-black px-5 py-3 rounded-full hover:opacity-90 transition disabled:opacity-50"
        >
          {uploading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
