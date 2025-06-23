'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    profileImage: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUserId(payload.id);
    fetchProfile(payload.id, token);
  }, []);

  const fetchProfile = async (id: number, token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = await res.json();
      setProfile(user);
      setFormData({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        profileImage: user.profileImage || '',
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token || !userId) return;

    let imageUrl = formData.profileImage;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pinged')
        .upload(filePath, imageFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        toast.error('Image upload failed');
        return;
      }

      const { data: publicData } = supabase.storage.from('pinged').getPublicUrl(filePath);
      imageUrl = publicData?.publicUrl || '';
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          profileImage: imageUrl,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      toast.success('Profile updated');
      setEditing(false);
      fetchProfile(userId, token); // Refresh profile
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profile update failed');
    }
  };

  if (!profile) return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-gray-900 shadow rounded-2xl p-6 space-y-6">
            <div className="flex flex-col items-center justify-center mb-6">
        <img
          src={formData.profileImage || '/default-avatar.png'}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600 shadow-md"
        />
        {editing && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="mt-3 text-sm text-gray-600 dark:text-gray-300"
          />
        )}
      </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              disabled={!editing}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>

          <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="mt-1 block w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-700"
              />
          </div>


          <div>
            <label className="text-sm text-gray-500">Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              disabled={!editing}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
