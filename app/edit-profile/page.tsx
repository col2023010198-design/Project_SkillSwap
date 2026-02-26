'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import UpperNav from '@/components/UpperNav';
import BottomNav from '@/components/BottomNav';
import { updateProfile, fetchProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    skillsToTeach: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch current profile data on mount
  useEffect(() => {
    fetchProfile().then(({ profile, error: fetchError }) => {
      if (fetchError) {
        setError(fetchError);
      } else if (profile) {
        setFormData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          username: profile.username || '',
          bio: profile.bio || '',
          skillsToTeach: profile.skills_to_teach?.join(', ') || '',
        });
        setCurrentAvatarUrl(profile.avatar_url);
      }
      setFetching(false);
    });
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      
      // Create preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setError(null);
    }
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let avatarUrl = currentAvatarUrl;

    // Upload avatar to Supabase storage if a new file was selected
    if (avatarFile) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const userId = session.user.id;
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        // Upload file to avatars bucket
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          setError(`Upload failed: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = urlData.publicUrl;
      } catch (err) {
        setError('Failed to upload avatar');
        setLoading(false);
        return;
      }
    }

    // Update profile with avatar URL
    const { error: updateError } = await updateProfile({
      first_name: formData.firstName,
      last_name: formData.lastName,
      username: formData.username,
      bio: formData.bio,
      skills_to_teach_raw: formData.skillsToTeach,
      avatar_url: avatarUrl,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError);
      return;
    }

    router.push('/app/profile');
  };

  return (
    <div className="min-h-screen bg-[#1a2c36] pb-28">
      <UpperNav />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="bg-[#2d3f47] border-b border-[#3a4f5a] p-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Edit Profile</h1>
        </header>

        {fetching ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-[#5fa4c3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center mb-6">
            {/* Avatar Preview */}
            {previewUrl || currentAvatarUrl ? (
              <img
                src={previewUrl || currentAvatarUrl || ''}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5fa4c3] to-[#4a7a8d] mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                {formData.firstName && formData.lastName
                  ? `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
                  : 'U'}
              </div>
            )}
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              id="avatar-input"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={handleChangePhotoClick}
              className="text-[#5fa4c3] text-sm font-medium hover:underline"
            >
              Change Photo
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
              required
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
              required
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
              required
            />

            <textarea
              name="bio"
              placeholder="Tell others about yourself..."
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3] resize-none"
            />

            <input
              type="text"
              name="skillsToTeach"
              placeholder="Skills you can teach (comma-separated)"
              value={formData.skillsToTeach}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-[#2d3f47] text-white placeholder-gray-500 border border-[#3a4f5a] focus:outline-none focus:border-[#5fa4c3]"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center pt-2">{error}</p>
          )}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-full font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#5fa4c3] text-white rounded-full font-medium hover:bg-[#4a8fb5] transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
