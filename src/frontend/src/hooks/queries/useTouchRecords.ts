import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { TouchRecord, TouchSample } from '../../backend';

export function useGetTouchRecordsForChild(childId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TouchRecord[]>({
    queryKey: ['touchRecords', childId],
    queryFn: async () => {
      if (!actor || !childId) return [];
      return actor.getTouchRecordsForChild(childId);
    },
    enabled: !!actor && !actorFetching && !!childId,
  });
}

export function useAddTouchRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, samples }: { childId: string; samples: TouchSample[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTouchRecord(childId, samples);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['touchRecords', variables.childId] });
      queryClient.invalidateQueries({ queryKey: ['unifiedRecords'] });
    },
  });
}

export function useDeleteTouchRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, childId }: { recordId: bigint; childId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTouchRecord(recordId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['touchRecords', variables.childId] });
      queryClient.invalidateQueries({ queryKey: ['unifiedRecords'] });
    },
  });
}
