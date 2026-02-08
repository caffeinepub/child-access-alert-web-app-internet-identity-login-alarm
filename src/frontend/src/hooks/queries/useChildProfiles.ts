import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { ChildProfile } from '../../backend';

export function useGetChildProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ChildProfile[]>({
    queryKey: ['childProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getChildProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateChildProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createChildProfile(id, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['childProfiles'] });
    },
  });
}

export function useRenameChildProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.renameChildProfile(id, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['childProfiles'] });
    },
  });
}

export function useArchiveChildProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.archiveChildProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['childProfiles'] });
    },
  });
}
