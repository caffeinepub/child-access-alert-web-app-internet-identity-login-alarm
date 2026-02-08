import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import {
  useGetBiometricRecordsForChild,
  useAddBiometricRecord,
  useDeleteBiometricRecord,
} from '../../hooks/queries/useBiometricRecords';
import { useGetChildProfiles } from '../../hooks/queries/useChildProfiles';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function BiometricRecordsManager() {
  const { data: profiles, isLoading: profilesLoading } = useGetChildProfiles();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const { data: records, isLoading: recordsLoading } = useGetBiometricRecordsForChild(selectedChildId);
  const addRecord = useAddBiometricRecord();
  const deleteRecord = useDeleteBiometricRecord();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [dataType, setDataType] = useState<'biometric' | 'touch-sensing'>('biometric');
  const [dataInput, setDataInput] = useState('');
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const activeProfiles = profiles?.filter((p) => !p.isArchived) || [];
  const selectedProfile = activeProfiles.find((p) => p.id === selectedChildId);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) {
      toast.error('Please select a child profile');
      return;
    }
    if (!dataInput.trim()) {
      toast.error('Please enter data for the record');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(dataInput.trim());
      await addRecord.mutateAsync({
        childId: selectedChildId,
        dataType,
        data: dataBytes,
      });
      toast.success('Record added successfully');
      setDataInput('');
      setAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add record');
    }
  };

  const handleDeleteRecord = async (recordId: bigint) => {
    if (!selectedChildId) return;

    try {
      await deleteRecord.mutateAsync({ recordId, childId: selectedChildId });
      toast.success('Record deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete record');
    }
  };

  const handleDeleteAll = async () => {
    if (!selectedChildId || !records || records.length === 0) return;

    setDeletingAll(true);
    try {
      for (const record of records) {
        await deleteRecord.mutateAsync({ recordId: record.id, childId: selectedChildId });
      }
      toast.success('All records deleted successfully');
      setDeleteAllDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete all records');
    } finally {
      setDeletingAll(false);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  if (profilesLoading) {
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
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-destructive" />
            Biometric & Touch-Sensing Records
          </CardTitle>
          <CardDescription>
            Manage guardian-entered biometric or touch-sensing data records for child profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="childSelect">Select Child Profile</Label>
            <Select value={selectedChildId || ''} onValueChange={(value) => setSelectedChildId(value || null)}>
              <SelectTrigger id="childSelect">
                <SelectValue placeholder="Choose a child profile" />
              </SelectTrigger>
              <SelectContent>
                {activeProfiles.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No active profiles available</div>
                ) : (
                  activeProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedChildId && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Records for: <span className="text-destructive">{selectedProfile?.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {records?.length || 0} record{records?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  {records && records.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAllDialogOpen(true)}
                      disabled={deleteRecord.isPending || deletingAll}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All
                    </Button>
                  )}
                  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Biometric/Touch-Sensing Record</DialogTitle>
                        <DialogDescription>
                          Enter data for {selectedProfile?.name}. This data is stored as guardian-managed records.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddRecord} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Data Type</Label>
                          <RadioGroup value={dataType} onValueChange={(v) => setDataType(v as any)}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="biometric" id="biometric" />
                              <Label htmlFor="biometric" className="font-normal cursor-pointer">
                                Biometric
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="touch-sensing" id="touch-sensing" />
                              <Label htmlFor="touch-sensing" className="font-normal cursor-pointer">
                                Touch-Sensing
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dataInput">Data</Label>
                          <Input
                            id="dataInput"
                            placeholder="Enter data (text representation)"
                            value={dataInput}
                            onChange={(e) => setDataInput(e.target.value)}
                            autoFocus
                          />
                          <p className="text-xs text-muted-foreground">
                            Note: This is a text representation stored by the guardian. No actual device biometrics are
                            captured.
                          </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={addRecord.isPending}>
                          {addRecord.isPending ? 'Adding...' : 'Add Record'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="border border-border rounded-lg">
                {recordsLoading ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading records...
                  </div>
                ) : records && records.length > 0 ? (
                  <div className="divide-y divide-border">
                    {records.map((record) => (
                      <div key={record.id.toString()} className="p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={record.dataType === 'biometric' ? 'default' : 'secondary'}>
                                {record.dataType}
                              </Badge>
                              <span className="text-xs text-muted-foreground">ID: {record.id.toString()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Created: {formatTimestamp(record.timestamp)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Data size: {record.data.length} bytes
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.id)}
                            disabled={deleteRecord.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Fingerprint className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No records yet for this profile.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {!selectedChildId && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a child profile to view and manage records.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Records?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {records?.length || 0} record{records?.length !== 1 ? 's' : ''} for{' '}
              {selectedProfile?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} disabled={deletingAll} className="bg-destructive">
              {deletingAll ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
