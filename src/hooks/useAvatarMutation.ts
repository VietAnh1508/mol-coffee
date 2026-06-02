import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '../types';
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

      if (updateError) {
        // DB write failed — remove the just-uploaded file so Storage and DB
        // don't end up out of sync.
        await supabase.storage.from('avatars').remove([storagePath]);
        throw updateError;
      }

      return avatarUrl;
    },
    onMutate: async (file: File) => {
      if (!supabaseUser) return;
      const queryKey = ['user-profile', supabaseUser.id];
      await queryClient.cancelQueries({ queryKey });
      const previousUser = queryClient.getQueryData<User>(queryKey);
      // Show a local blob URL immediately so the avatar updates before the
      // upload round-trip completes.
      const previewUrl = URL.createObjectURL(file);
      queryClient.setQueryData<User>(queryKey, (old) =>
        old ? { ...old, avatar_url: previewUrl } : old,
      );
      return { previousUser, previewUrl };
    },
    onSuccess: (avatarUrl, _file, context) => {
      if (context?.previewUrl) URL.revokeObjectURL(context.previewUrl);
      // Replace the blob URL with the real persisted URL.
      if (supabaseUser) {
        queryClient.setQueryData<User>(
          ['user-profile', supabaseUser.id],
          (old) => (old ? { ...old, avatar_url: avatarUrl } : old),
        );
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (_err, _file, context) => {
      if (context?.previewUrl) URL.revokeObjectURL(context.previewUrl);
      if (supabaseUser && context?.previousUser) {
        queryClient.setQueryData(
          ['user-profile', supabaseUser.id],
          context.previousUser,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
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

      // Update DB first — if this fails, Storage is untouched and the user
      // still sees their avatar (consistent state).
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Storage delete is best-effort: if it fails the file is orphaned but
      // the DB already shows no avatar, so the user experience is correct.
      await supabase.storage.from('avatars').remove([storagePath]);
    },
    onMutate: async () => {
      if (!supabaseUser) return;
      const queryKey = ['user-profile', supabaseUser.id];
      await queryClient.cancelQueries({ queryKey });
      const previousUser = queryClient.getQueryData<User>(queryKey);
      queryClient.setQueryData<User>(queryKey, (old) =>
        old ? { ...old, avatar_url: null } : old,
      );
      return { previousUser };
    },
    onError: (_err, _vars, context) => {
      if (supabaseUser && context?.previousUser) {
        queryClient.setQueryData(
          ['user-profile', supabaseUser.id],
          context.previousUser,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
