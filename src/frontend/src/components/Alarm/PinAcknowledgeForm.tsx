import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVerifyGuardianPin } from '../../hooks/queries/useGuardianPin';
import { useAcknowledgeAlarm } from '../../hooks/queries/useAlarm';
import { toast } from 'sonner';

export default function PinAcknowledgeForm() {
  const [pin, setPin] = useState('');
  const verifyPin = useVerifyGuardianPin();
  const acknowledgeAlarm = useAcknowledgeAlarm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin) {
      toast.error('Please enter your PIN');
      return;
    }

    try {
      const isValid = await verifyPin.mutateAsync(pin);
      if (isValid) {
        await acknowledgeAlarm.mutateAsync();
        toast.success('Alarm acknowledged');
        setPin('');
      } else {
        toast.error('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify PIN');
      setPin('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="guardianPin">Guardian PIN</Label>
        <Input
          id="guardianPin"
          type="password"
          placeholder="Enter your guardian PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          autoFocus
          autoComplete="off"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={verifyPin.isPending || acknowledgeAlarm.isPending}
      >
        {verifyPin.isPending || acknowledgeAlarm.isPending ? 'Verifying...' : 'Stop Alarm'}
      </Button>
    </form>
  );
}
