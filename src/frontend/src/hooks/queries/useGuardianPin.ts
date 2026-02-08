import { useMutation } from '@tanstack/react-query';
import { useActor } from '../useActor';

export function useSetGuardianPin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (pin: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setGuardianPin(pin);
    },
  });
}

export function useVerifyGuardianPin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (pin: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyGuardianPin(pin);
    },
  });
}
