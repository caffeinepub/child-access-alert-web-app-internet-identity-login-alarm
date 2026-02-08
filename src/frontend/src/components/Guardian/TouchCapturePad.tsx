import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TouchSample } from '../../backend';

interface TouchCapturePadProps {
  onSamplesCollected: (samples: TouchSample[]) => void;
  isCapturing: boolean;
}

export default function TouchCapturePad({ onSamplesCollected, isCapturing }: TouchCapturePadProps) {
  const [samples, setSamples] = useState<TouchSample[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isCapturing) {
      setSamples([]);
      startTimeRef.current = Date.now();
    }
  }, [isCapturing]);

  useEffect(() => {
    onSamplesCollected(samples);
  }, [samples, onSamplesCollected]);

  const handlePointerEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isCapturing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates to 0-1 range
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    const sample: TouchSample = {
      x: normalizedX,
      y: normalizedY,
      force: e.pressure || 0.5,
      radiusX: (e as any).width || 10,
      radiusY: (e as any).height || 10,
      rotationAngle: (e as any).tiltX || 0,
      timestamp: BigInt(Date.now() - startTimeRef.current) * BigInt(1_000_000),
    };

    setSamples((prev) => [...prev, sample]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Touch Capture Area</p>
        <Badge variant={isCapturing ? 'default' : 'secondary'}>
          {isCapturing ? `${samples.length} samples` : 'Ready'}
        </Badge>
      </div>
      <Card
        ref={canvasRef}
        className="relative h-64 bg-accent/20 border-2 border-dashed border-border cursor-crosshair touch-none"
        onPointerDown={handlePointerEvent}
        onPointerMove={handlePointerEvent}
        onPointerUp={handlePointerEvent}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {isCapturing ? 'Touch, drag, or tap to capture samples' : 'Start capturing to enable'}
            </p>
            {samples.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Last: x={samples[samples.length - 1].x.toFixed(3)}, y={samples[samples.length - 1].y.toFixed(3)},
                force={samples[samples.length - 1].force.toFixed(3)}
              </p>
            )}
          </div>
        </div>
      </Card>
      <p className="text-xs text-muted-foreground">
        Captures raw numeric touch data: position (x, y), pressure/force, radius, and rotation angle. All values are
        stored as numbers, not text.
      </p>
    </div>
  );
}
