import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Ảnh không được vượt quá 2 MB';
  }
  return null;
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { user, supabaseUser } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) throw new Error(validationError);
      if (!user || !supabaseUser) throw new Error('Chưa đăng nhập');

      // Storage path uses the auth uid so RLS policy can match auth.uid()
      const storagePath = `${supabaseUser.id}/avatar`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(storagePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(storagePath);

      // Cache-bust so the browser fetches the new image even though the path
      // is the same (public URL string would otherwise be unchanged).
      const avatarUrl = `${urlData.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();
  const { user, supabaseUser } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user || !supabaseUser) throw new Error('Chưa đăng nhập');

      const storagePath = `${supabaseUser.id}/avatar`;

      const { error: removeError } = await supabase.storage
        .from('avatars')
        .remove([storagePath]);

      if (removeError) throw removeError;

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
