import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { useSetGuardianPin } from '../../hooks/queries/useGuardianPin';
import { toast } from 'sonner';

export default function GuardianPinSettings() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const setGuardianPin = useSetGuardianPin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin || !confirmPin) {
      toast.error('Please enter and confirm your PIN');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    if (pin.length < 4) {
      toast.error('PIN must be at least 4 characters');
      return;
    }

    try {
      await setGuardianPin.mutateAsync(pin);
      toast.success('Guardian PIN set successfully');
      setPin('');
      setConfirmPin('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to set PIN');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-destructive" />
          Guardian PIN
        </CardTitle>
        <CardDescription>
          Set or change your guardian PIN. This PIN is required to stop alarms and must be kept secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">New PIN</Label>
            <Input
              id="pin"
              type="password"
              placeholder="Enter a secure PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              placeholder="Re-enter your PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={setGuardianPin.isPending}>
            {setGuardianPin.isPending ? 'Setting PIN...' : 'Set Guardian PIN'}
          </Button>

          <p className="text-xs text-muted-foreground">
            Your PIN is stored securely and verified server-side. It cannot be bypassed from the client.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
