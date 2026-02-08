import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';

export function useIsAlarmActive() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['alarmActive'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAlarmActive();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 2000,
  });
}

export function useTriggerAlarm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.triggerAlarm();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarmActive'] });
      queryClient.invalidateQueries({ queryKey: ['alarmEvents'] });
    },
  });
}

export function useAcknowledgeAlarm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.acknowledgeAlarm();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarmActive'] });
      queryClient.invalidateQueries({ queryKey: ['alarmEvents'] });
    },
  });
}
