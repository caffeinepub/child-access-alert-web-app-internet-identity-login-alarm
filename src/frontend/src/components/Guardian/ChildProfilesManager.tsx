import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit2, Archive, Loader2 } from 'lucide-react';
import {
  useGetChildProfiles,
  useCreateChildProfile,
  useRenameChildProfile,
  useArchiveChildProfile,
} from '../../hooks/queries/useChildProfiles';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ChildProfilesManager() {
  const { data: profiles, isLoading } = useGetChildProfiles();
  const createProfile = useCreateChildProfile();
  const renameProfile = useRenameChildProfile();
  const archiveProfile = useArchiveChildProfile();

  const [newProfileName, setNewProfileName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{ id: string; name: string } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const activeProfiles = profiles?.filter((p) => !p.isArchived) || [];
  const archivedProfiles = profiles?.filter((p) => p.isArchived) || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) {
      toast.error('Please enter a profile name');
      return;
    }

    try {
      const id = `child_${Date.now()}`;
      await createProfile.mutateAsync({ id, name: newProfileName.trim() });
      toast.success('Child profile created successfully');
      setNewProfileName('');
      setCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editingProfile.name.trim()) {
      toast.error('Please enter a profile name');
      return;
    }

    try {
      await renameProfile.mutateAsync({ id: editingProfile.id, newName: editingProfile.name.trim() });
      toast.success('Profile renamed successfully');
      setEditingProfile(null);
      setEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to rename profile');
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive "${name}"? This profile will no longer trigger alarms.`)) {
      return;
    }

    try {
      await archiveProfile.mutateAsync(id);
      toast.success('Profile archived successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to archive profile');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading profiles...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-destructive" />
                Child Profiles
              </CardTitle>
              <CardDescription>Create and manage profiles for your children</CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Child Profile</DialogTitle>
                  <DialogDescription>Enter a name for the new child profile</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileName">Profile Name</Label>
                    <Input
                      id="profileName"
                      placeholder="e.g., Emma, Alex"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createProfile.isPending}>
                    {createProfile.isPending ? 'Creating...' : 'Create Profile'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {activeProfiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No child profiles yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {profile.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProfile({ id: profile.id, name: profile.name });
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(profile.id, profile.name)}
                      disabled={archiveProfile.isPending}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {archivedProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Archived Profiles</CardTitle>
            <CardDescription>These profiles no longer trigger alarms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {archivedProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{profile.name}</p>
                      <Badge variant="secondary" className="mt-1">
                        Archived
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Profile</DialogTitle>
            <DialogDescription>Enter a new name for this profile</DialogDescription>
          </DialogHeader>
          {editingProfile && (
            <form onSubmit={handleRename} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editProfileName">Profile Name</Label>
                <Input
                  id="editProfileName"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={renameProfile.isPending}>
                {renameProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
