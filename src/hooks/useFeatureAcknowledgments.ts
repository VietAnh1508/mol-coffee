import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FEATURE_ANNOUNCEMENTS,
  type FeatureAnnouncement,
} from '../constants/featureAnnouncements';
import { supabase } from '../lib/supabase';

const QUERY_KEY = (userId: string) => ['feature-acknowledgments', userId];

export function useFeatureAcknowledgments(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEY(userId ?? ''),
    enabled: !!userId,
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase
        .from('feature_acknowledgments')
        .select('feature_key')
        .eq('user_id', userId);

      if (error) throw error;
      return new Set((data ?? []).map((r) => r.feature_key));
    },
  });
}

export function useNextUnacknowledgedFeature(
  userId: string | null,
): FeatureAnnouncement | null {
  const { data: acknowledged, isLoading } = useFeatureAcknowledgments(userId);

  if (!userId || isLoading || !acknowledged) return null;

  return FEATURE_ANNOUNCEMENTS.find((f) => !acknowledged.has(f.key)) ?? null;
}

export function useAcknowledgeFeature(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (featureKey: string) => {
      const { error } = await supabase
        .from('feature_acknowledgments')
        .insert({ user_id: userId, feature_key: featureKey });

      if (error) throw error;
    },
    onMutate: async (featureKey) => {
      const queryKey = QUERY_KEY(userId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Set<string>>(queryKey);

      queryClient.setQueryData<Set<string>>(queryKey, (old) => {
        const next = new Set(old ?? []);
        next.add(featureKey);
        return next;
      });

      return { previous };
    },
    onError: (_err, _featureKey, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(QUERY_KEY(userId), context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(userId) });
    },
  });
}
