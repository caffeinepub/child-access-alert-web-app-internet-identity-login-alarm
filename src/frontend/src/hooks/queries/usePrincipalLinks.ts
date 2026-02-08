import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { ChildProfile } from '../../backend';
import type { Principal } from '@dfinity/principal';

export function useGetLinkedChildProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ChildProfile | null>({
    queryKey: ['linkedChildProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLinkedChildProfile();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLinkPrincipalToChild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, childId }: { principal: Principal; childId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkPrincipalToChild(principal, childId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedChildProfile'] });
    },
  });
}

export function useUnlinkPrincipalFromChild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlinkPrincipalFromChild(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedChildProfile'] });
    },
  });
}
