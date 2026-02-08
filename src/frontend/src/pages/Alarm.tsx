import { useIsAlarmActive } from '../hooks/queries/useAlarm';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import PinAcknowledgeForm from '../components/Alarm/PinAcknowledgeForm';

export default function Alarm() {
  const { data: alarmActive, isLoading } = useIsAlarmActive();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (alarmActive) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        oscillator.start();

        audioRef.current.addEventListener('ended', () => {
          oscillator.stop();
        });

        const interval = setInterval(() => {
          oscillator.frequency.value = oscillator.frequency.value === 800 ? 1000 : 800;
        }, 500);

        return () => {
          clearInterval(interval);
          oscillator.stop();
          audioContext.close();
        };
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      navigate({ to: '/' });
    }
  }, [alarmActive, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted-foreground">Checking alarm status...</p>
      </div>
    );
  }

  if (!alarmActive) {
    return null;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-destructive/5 animate-pulse">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center animate-bounce">
                <AlertTriangle className="w-16 h-16 text-destructive" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-destructive">CHILD ACCESS DETECTED</h1>
            <p className="text-xl text-muted-foreground">A linked child profile has accessed this device</p>
          </div>

          <Card className="border-destructive shadow-2xl">
            <CardHeader className="bg-destructive/10">
              <CardTitle>Guardian PIN Required</CardTitle>
              <CardDescription>Enter your guardian PIN to acknowledge and stop the alarm</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PinAcknowledgeForm />
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              This alarm will continue until a guardian enters the correct PIN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
