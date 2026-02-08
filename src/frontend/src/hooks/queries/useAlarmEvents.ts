import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { AlarmEvent } from '../../backend';

export function useGetAlarmEvents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AlarmEvent[]>({
    queryKey: ['alarmEvents'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAlarmEvents();
    },
    enabled: !!actor && !actorFetching,
  });
}
