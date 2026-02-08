import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Bell, Users, Lock, AlertTriangle } from 'lucide-react';
import { useGetLinkedChildProfile } from '../hooks/queries/usePrincipalLinks';
import { useTriggerAlarm } from '../hooks/queries/useAlarm';
import { toast } from 'sonner';
import { useGetCallerUserRole } from '../hooks/queries/useCurrentUser';

export default function Landing() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: linkedProfile } = useGetLinkedChildProfile();
  const { data: userRole } = useGetCallerUserRole();
  const triggerAlarm = useTriggerAlarm();

  const isGuardian = userRole === 'admin';
  const isLinkedChild = !!linkedProfile && !linkedProfile.isArchived;

  const handleSimulateAccess = async () => {
    try {
      await triggerAlarm.mutateAsync();
      toast.success('Alarm triggered!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to trigger alarm');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Protect Your Family with Smart Alerts
                </h2>
                <p className="text-lg text-muted-foreground">
                  Get instant notifications when your child accesses this device. Secure, private, and easy to manage.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-destructive shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Secure Sign-in (Internet Identity)</h3>
                    <p className="text-sm text-muted-foreground">
                      Privacy-preserving authentication with device-level security
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bell className="w-6 h-6 text-destructive shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Instant Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      Loud alarm when a linked child profile accesses the app
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-destructive shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Manage Multiple Profiles</h3>
                    <p className="text-sm text-muted-foreground">Create and manage profiles for all your children</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-6 h-6 text-destructive shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">PIN Protection</h3>
                    <p className="text-sm text-muted-foreground">Only guardians can stop alarms with a secure PIN</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in with Internet Identity to get started as a guardian.
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src="/assets/generated/phone-alert-illustration.dim_1200x600.png"
                alt="Phone Alert Illustration"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground">Manage your child access alerts and profiles</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {isGuardian && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-destructive" />
                  Guardian Dashboard
                </CardTitle>
                <CardDescription>Manage child profiles, view logs, and configure settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate({ to: '/dashboard' })} className="w-full">
                  Open Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {isLinkedChild && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Child Profile Active
                </CardTitle>
                <CardDescription>
                  You are linked to: <span className="font-semibold">{linkedProfile.name}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSimulateAccess}
                  variant="destructive"
                  className="w-full"
                  disabled={triggerAlarm.isPending}
                >
                  {triggerAlarm.isPending ? 'Triggering...' : 'Simulate Access (Trigger Alarm)'}
                </Button>
              </CardContent>
            </Card>
          )}

          {!isGuardian && !isLinkedChild && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>No Profile Linked</CardTitle>
                <CardDescription>
                  Your account is not linked to any child profile. Contact your guardian to link your account.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Guardian Setup</h4>
                  <p className="text-sm text-muted-foreground">
                    Create child profiles and set a guardian PIN for alarm control
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Link Child Accounts</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect Internet Identity principals to child profiles
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Automatic Alerts</h4>
                  <p className="text-sm text-muted-foreground">
                    When a linked child accesses the app, an alarm triggers immediately
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Guardian Control</h4>
                  <p className="text-sm text-muted-foreground">
                    Only guardians can stop the alarm by entering the correct PIN
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
