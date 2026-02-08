import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Plus, Trash2, Loader2, AlertTriangle, Hand } from 'lucide-react';
import {
  useGetBiometricRecordsForChild,
  useAddBiometricRecord,
  useDeleteBiometricRecord,
} from '../../hooks/queries/useBiometricRecords';
import {
  useGetTouchRecordsForChild,
  useAddTouchRecord,
  useDeleteTouchRecord,
} from '../../hooks/queries/useTouchRecords';
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
import TouchCapturePad from './TouchCapturePad';
import type { TouchSample } from '../../backend';

type RecordType = 'biometric' | 'touch-sensing';

interface UnifiedRecord {
  id: bigint;
  type: RecordType;
  timestamp: bigint;
  dataSize: number;
}

export default function BiometricRecordsManager() {
  const { data: profiles, isLoading: profilesLoading } = useGetChildProfiles();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  
  const { data: biometricRecords, isLoading: biometricLoading } = useGetBiometricRecordsForChild(selectedChildId);
  const { data: touchRecords, isLoading: touchLoading } = useGetTouchRecordsForChild(selectedChildId);
  
  const addBiometricRecord = useAddBiometricRecord();
  const deleteBiometricRecord = useDeleteBiometricRecord();
  const addTouchRecord = useAddTouchRecord();
  const deleteTouchRecord = useDeleteTouchRecord();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [recordType, setRecordType] = useState<RecordType>('biometric');
  const [biometricInput, setBiometricInput] = useState('');
  const [touchSamples, setTouchSamples] = useState<TouchSample[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const activeProfiles = profiles?.filter((p) => !p.isArchived) || [];
  const selectedProfile = activeProfiles.find((p) => p.id === selectedChildId);

  // Combine and sort records
  const unifiedRecords: UnifiedRecord[] = [
    ...(biometricRecords || []).map((r) => ({
      id: r.id,
      type: 'biometric' as RecordType,
      timestamp: r.timestamp,
      dataSize: r.data.length,
    })),
    ...(touchRecords || []).map((r) => ({
      id: r.id,
      type: 'touch-sensing' as RecordType,
      timestamp: r.recordTimestamp,
      dataSize: r.samples.length,
    })),
  ].sort((a, b) => Number(b.timestamp - a.timestamp));

  const recordsLoading = biometricLoading || touchLoading;

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) {
      toast.error('Please select a child profile');
      return;
    }

    try {
      if (recordType === 'biometric') {
        if (!biometricInput.trim()) {
          toast.error('Please enter biometric data');
          return;
        }
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(biometricInput.trim());
        await addBiometricRecord.mutateAsync({
          childId: selectedChildId,
          dataType: 'biometric',
          data: dataBytes,
        });
      } else {
        if (touchSamples.length === 0) {
          toast.error('Please capture touch samples first');
          return;
        }
        await addTouchRecord.mutateAsync({
          childId: selectedChildId,
          samples: touchSamples,
        });
      }
      toast.success('Record added successfully');
      setBiometricInput('');
      setTouchSamples([]);
      setIsCapturing(false);
      setAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add record');
    }
  };

  const handleDeleteRecord = async (record: UnifiedRecord) => {
    if (!selectedChildId) return;

    try {
      if (record.type === 'biometric') {
        await deleteBiometricRecord.mutateAsync({ recordId: record.id, childId: selectedChildId });
      } else {
        await deleteTouchRecord.mutateAsync({ recordId: record.id, childId: selectedChildId });
      }
      toast.success('Record deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete record');
    }
  };

  const handleDeleteAll = async () => {
    if (!selectedChildId || unifiedRecords.length === 0) return;

    setDeletingAll(true);
    try {
      for (const record of unifiedRecords) {
        if (record.type === 'biometric') {
          await deleteBiometricRecord.mutateAsync({ recordId: record.id, childId: selectedChildId });
        } else {
          await deleteTouchRecord.mutateAsync({ recordId: record.id, childId: selectedChildId });
        }
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

  const handleDialogOpenChange = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      setBiometricInput('');
      setTouchSamples([]);
      setIsCapturing(false);
    }
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
            Manage guardian-entered biometric data or capture raw numeric touch samples for child profiles
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
                    {unifiedRecords.length} record{unifiedRecords.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  {unifiedRecords.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAllDialogOpen(true)}
                      disabled={deleteBiometricRecord.isPending || deleteTouchRecord.isPending || deletingAll}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All
                    </Button>
                  )}
                  <Dialog open={addDialogOpen} onOpenChange={handleDialogOpenChange}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add Biometric/Touch-Sensing Record</DialogTitle>
                        <DialogDescription>
                          {recordType === 'biometric'
                            ? `Enter biometric data for ${selectedProfile?.name}. This data is stored as guardian-managed records.`
                            : `Capture raw numeric touch samples for ${selectedProfile?.name} by interacting with the capture pad below.`}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddRecord} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Record Type</Label>
                          <RadioGroup
                            value={recordType}
                            onValueChange={(v) => {
                              setRecordType(v as RecordType);
                              setIsCapturing(false);
                              setTouchSamples([]);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="biometric" id="biometric" />
                              <Label htmlFor="biometric" className="font-normal cursor-pointer flex items-center gap-2">
                                <Fingerprint className="w-4 h-4" />
                                Biometric (text-based)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="touch-sensing" id="touch-sensing" />
                              <Label
                                htmlFor="touch-sensing"
                                className="font-normal cursor-pointer flex items-center gap-2"
                              >
                                <Hand className="w-4 h-4" />
                                Touch-Sensing (numeric samples)
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {recordType === 'biometric' ? (
                          <div className="space-y-2">
                            <Label htmlFor="biometricInput">Biometric Data</Label>
                            <Input
                              id="biometricInput"
                              placeholder="Enter biometric data"
                              value={biometricInput}
                              onChange={(e) => setBiometricInput(e.target.value)}
                              autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                              Note: This is a text representation stored by the guardian. No actual device biometrics
                              are captured.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <TouchCapturePad onSamplesCollected={setTouchSamples} isCapturing={isCapturing} />
                            <Button
                              type="button"
                              variant={isCapturing ? 'destructive' : 'secondary'}
                              className="w-full"
                              onClick={() => setIsCapturing(!isCapturing)}
                            >
                              {isCapturing ? 'Stop Capturing' : 'Start Capturing'}
                            </Button>
                          </div>
                        )}

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={addBiometricRecord.isPending || addTouchRecord.isPending}
                        >
                          {addBiometricRecord.isPending || addTouchRecord.isPending ? 'Adding...' : 'Add Record'}
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
                ) : unifiedRecords.length > 0 ? (
                  <div className="divide-y divide-border">
                    {unifiedRecords.map((record) => (
                      <div key={`${record.type}-${record.id.toString()}`} className="p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={record.type === 'biometric' ? 'default' : 'secondary'}>
                                {record.type === 'biometric' ? (
                                  <span className="flex items-center gap-1">
                                    <Fingerprint className="w-3 h-3" />
                                    Biometric
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Hand className="w-3 h-3" />
                                    Touch-Sensing
                                  </span>
                                )}
                              </Badge>
                              <span className="text-xs text-muted-foreground">ID: {record.id.toString()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Created: {formatTimestamp(record.timestamp)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {record.type === 'biometric'
                                ? `Data size: ${record.dataSize} bytes`
                                : `Samples: ${record.dataSize}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecord(record)}
                            disabled={deleteBiometricRecord.isPending || deleteTouchRecord.isPending}
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
              This will permanently delete all {unifiedRecords.length} record{unifiedRecords.length !== 1 ? 's' : ''}{' '}
              for {selectedProfile?.name}. This action cannot be undone.
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
