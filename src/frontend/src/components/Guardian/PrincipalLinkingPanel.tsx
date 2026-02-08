import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Link, Unlink, AlertCircle, Loader2 } from 'lucide-react';
import { useGetChildProfiles } from '../../hooks/queries/useChildProfiles';
import { useLinkPrincipalToChild, useUnlinkPrincipalFromChild } from '../../hooks/queries/usePrincipalLinks';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PrincipalLinkingPanel() {
  const { data: profiles, isLoading } = useGetChildProfiles();
  const linkPrincipal = useLinkPrincipalToChild();
  const unlinkPrincipal = useUnlinkPrincipalFromChild();

  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [principalInput, setPrincipalInput] = useState('');
  const [unlinkPrincipalInput, setUnlinkPrincipalInput] = useState('');

  const activeProfiles = profiles?.filter((p) => !p.isArchived) || [];

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId) {
      toast.error('Please select a child profile');
      return;
    }
    if (!principalInput.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(principalInput.trim());
      await linkPrincipal.mutateAsync({ principal, childId: selectedProfileId });
      toast.success('Principal linked successfully');
      setPrincipalInput('');
      setSelectedProfileId('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to link principal');
    }
  };

  const handleUnlink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlinkPrincipalInput.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(unlinkPrincipalInput.trim());
      await unlinkPrincipal.mutateAsync(principal);
      toast.success('Principal unlinked successfully');
      setUnlinkPrincipalInput('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to unlink principal');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> No biometric data is collected or stored. Internet Identity uses device
          authentication (like Face ID or Touch ID) locally on the user's device. We only receive a cryptographic
          principal ID.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-destructive" />
            Link Principal to Child Profile
          </CardTitle>
          <CardDescription>
            Have the child sign in with Internet Identity, then copy their principal ID and link it to their profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="childProfile">Select Child Profile</Label>
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger id="childProfile">
                  <SelectValue placeholder="Choose a profile" />
                </SelectTrigger>
                <SelectContent>
                  {activeProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="principalId">Principal ID</Label>
              <Input
                id="principalId"
                placeholder="e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                value={principalInput}
                onChange={(e) => setPrincipalInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The child must sign in first. You can find their principal ID in the browser console or by having them
                check their Internet Identity.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={linkPrincipal.isPending}>
              {linkPrincipal.isPending ? 'Linking...' : 'Link Principal to Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlink className="w-5 h-5 text-destructive" />
            Unlink Principal
          </CardTitle>
          <CardDescription>Remove the link between a principal ID and its child profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnlink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unlinkPrincipalId">Principal ID to Unlink</Label>
              <Input
                id="unlinkPrincipalId"
                placeholder="e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                value={unlinkPrincipalInput}
                onChange={(e) => setUnlinkPrincipalInput(e.target.value)}
              />
            </div>

            <Button type="submit" variant="destructive" className="w-full" disabled={unlinkPrincipal.isPending}>
              {unlinkPrincipal.isPending ? 'Unlinking...' : 'Unlink Principal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
