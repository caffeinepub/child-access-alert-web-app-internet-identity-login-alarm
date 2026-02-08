import { useGetCallerUserRole } from '../hooks/queries/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertCircle } from 'lucide-react';
import ChildProfilesManager from '../components/Guardian/ChildProfilesManager';
import PrincipalLinkingPanel from '../components/Guardian/PrincipalLinkingPanel';
import GuardianPinSettings from '../components/Guardian/GuardianPinSettings';
import AlarmEventLog from '../components/Guardian/AlarmEventLog';
import BiometricRecordsManager from '../components/Guardian/BiometricRecordsManager';

export default function Dashboard() {
  const { data: userRole, isLoading } = useGetCallerUserRole();
  const isGuardian = userRole === 'admin';

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isGuardian) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Access Denied
              </CardTitle>
              <CardDescription>Only guardians can access the dashboard.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-destructive" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Guardian Dashboard</h1>
            <p className="text-muted-foreground">Manage child profiles, view logs, and configure settings</p>
          </div>
        </div>

        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="linking">Link Accounts</TabsTrigger>
            <TabsTrigger value="logs">Event Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-6">
            <ChildProfilesManager />
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <BiometricRecordsManager />
          </TabsContent>

          <TabsContent value="linking" className="space-y-6">
            <PrincipalLinkingPanel />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <AlarmEventLog />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <GuardianPinSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
