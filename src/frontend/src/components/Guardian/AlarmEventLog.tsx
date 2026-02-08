import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useGetAlarmEvents } from '../../hooks/queries/useAlarmEvents';
import { useGetChildProfiles } from '../../hooks/queries/useChildProfiles';

export default function AlarmEventLog() {
  const { data: events, isLoading: eventsLoading } = useGetAlarmEvents();
  const { data: profiles } = useGetChildProfiles();

  const getChildName = (childId: string) => {
    const profile = profiles?.find((p) => p.id === childId);
    return profile?.name || childId;
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  if (eventsLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading event logs...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-destructive" />
          Access Event Log
        </CardTitle>
        <CardDescription>History of all child access events and alarms</CardDescription>
      </CardHeader>
      <CardContent>
        {!events || events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No access events recorded yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {events
                .slice()
                .reverse()
                .map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.acknowledged ? 'bg-muted' : 'bg-destructive/10'
                        }`}
                      >
                        {event.acknowledged ? (
                          <CheckCircle className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{getChildName(event.childProfileId)}</p>
                        <p className="text-sm text-muted-foreground">{formatTimestamp(event.timestamp)}</p>
                      </div>
                    </div>
                    <Badge variant={event.acknowledged ? 'secondary' : 'destructive'}>
                      {event.acknowledged ? 'Acknowledged' : 'Active'}
                    </Badge>
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
