import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { BiometricRecord } from '../../backend';

export function useGetBiometricRecordsForChild(childId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BiometricRecord[]>({
    queryKey: ['biometricRecords', childId],
    queryFn: async () => {
      if (!actor || !childId) return [];
      return actor.getBiometricRecordsForChild(childId);
    },
    enabled: !!actor && !actorFetching && !!childId,
  });
}

export function useAddBiometricRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      childId,
      dataType,
      data,
    }: {
      childId: string;
      dataType: string;
      data: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBiometricRecord(childId, dataType, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['biometricRecords', variables.childId] });
    },
  });
}

export function useDeleteBiometricRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, childId }: { recordId: bigint; childId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBiometricRecord(recordId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['biometricRecords', variables.childId] });
    },
  });
}
