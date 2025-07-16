import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Eye, 
  Monitor, 
  AlertTriangle, 
  Shield, 
  Maximize2, 
  Volume2,
  Mic,
  WifiOff,
  Activity
} from 'lucide-react';

interface ProctorEvent {
  id: string;
  type: 'tab_switch' | 'focus_loss' | 'fullscreen_exit' | 'suspicious_activity' | 'network_change' | 'audio_detected';
  timestamp: Date;
  description: string;
  severity: 'low' | 'medium' | 'high';
  metadata?: any;
}

interface ProctorSystemProps {
  examId: string;
  userId: string;
  onViolation: (event: ProctorEvent) => void;
  enableWebcam?: boolean;
  enableAudio?: boolean;
  enableTabMonitoring?: boolean;
  enableFocusDetection?: boolean;
  onProctorReady?: () => void;
}

export default function ProctorSystem({
  examId,
  userId,
  onViolation,
  enableWebcam = true,
  enableAudio = false,
  enableTabMonitoring = true,
  enableFocusDetection = true,
  onProctorReady
}: ProctorSystemProps) {
  const [isActive, setIsActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [violations, setViolations] = useState<ProctorEvent[]>([]);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateViolation = useCallback((
    type: ProctorEvent['type'],
    description: string,
    severity: ProctorEvent['severity'] = 'medium',
    metadata?: any
  ) => {
    const violation: ProctorEvent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date(),
      description,
      severity,
      metadata
    };
    
    setViolations(prev => [...prev, violation]);
    onViolation(violation);
  }, [onViolation]);

  // Initialize webcam
  const initializeWebcam = useCallback(async () => {
    if (!enableWebcam) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      setWebcamStream(stream);
      setWebcamError(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error: any) {
      setWebcamError(error.message || 'Failed to access webcam');
      generateViolation('suspicious_activity', 'Webcam access denied or unavailable', 'high');
    }
  }, [enableWebcam, generateViolation]);

  // Initialize audio monitoring
  const initializeAudio = useCallback(async () => {
    if (!enableAudio) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      
      // Monitor audio levels
      const monitorAudio = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        if (average > 50) { // Threshold for suspicious audio
          generateViolation('audio_detected', 'Suspicious audio activity detected', 'medium', { level: average });
        }
      };
      
      intervalRef.current = setInterval(monitorAudio, 1000);
    } catch (error: any) {
      generateViolation('suspicious_activity', 'Audio monitoring failed', 'medium');
    }
  }, [enableAudio, generateViolation]);

  // Tab monitoring
  useEffect(() => {
    if (!enableTabMonitoring || !isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        generateViolation('tab_switch', 'User switched to another tab or window', 'high');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      generateViolation('tab_switch', 'User attempted to leave the page', 'high');
      e.preventDefault();
      e.returnValue = '';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect common tab switching shortcuts
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 'Tab' || e.key === 'w' || e.key === 'r' || e.key === 't')
      ) {
        e.preventDefault();
        generateViolation('suspicious_activity', 'Suspicious keyboard shortcut detected', 'high');
      }
      
      // Detect F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        generateViolation('suspicious_activity', 'Developer tools access attempted', 'high');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableTabMonitoring, isActive, generateViolation]);

  // Focus detection
  useEffect(() => {
    if (!enableFocusDetection || !isActive) return;

    const handleFocus = () => {
      // Window regained focus
    };

    const handleBlur = () => {
      generateViolation('focus_loss', 'Browser window lost focus', 'medium');
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enableFocusDetection, isActive, generateViolation]);

  // Fullscreen monitoring
  useEffect(() => {
    if (!isActive) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && isActive) {
        generateViolation('fullscreen_exit', 'User exited fullscreen mode', 'high');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isActive, generateViolation]);

  // Network monitoring
  useEffect(() => {
    if (!isActive) return;

    const handleOnline = () => {
      setConnectionStatus('online');
    };

    const handleOffline = () => {
      setConnectionStatus('offline');
      generateViolation('network_change', 'Network connection lost', 'high');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isActive, generateViolation]);

  // Initialize proctoring system
  const startProctoring = useCallback(async () => {
    setIsActive(true);
    
    // Request fullscreen
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      generateViolation('fullscreen_exit', 'Failed to enter fullscreen mode', 'high');
    }
    
    // Initialize monitoring systems
    await initializeWebcam();
    await initializeAudio();
    
    onProctorReady?.();
  }, [initializeWebcam, initializeAudio, generateViolation, onProctorReady]);

  // Stop proctoring
  const stopProctoring = useCallback(() => {
    setIsActive(false);
    
    // Clean up media streams
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [webcamStream, audioStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProctoring();
    };
  }, [stopProctoring]);

  const getSeverityColor = (severity: ProctorEvent['severity']) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getViolationIcon = (type: ProctorEvent['type']) => {
    switch (type) {
      case 'tab_switch': return <Monitor className="h-4 w-4" />;
      case 'focus_loss': return <Eye className="h-4 w-4" />;
      case 'fullscreen_exit': return <Maximize2 className="h-4 w-4" />;
      case 'audio_detected': return <Volume2 className="h-4 w-4" />;
      case 'network_change': return <WifiOff className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Proctor Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Proctor System
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Camera className={`h-4 w-4 ${webcamStream ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm">Webcam</span>
            </div>
            <div className="flex items-center gap-2">
              <Mic className={`h-4 w-4 ${audioStream ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm">Audio</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className={`h-4 w-4 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm">Tab Monitor</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className={`h-4 w-4 ${connectionStatus === 'online' ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm">Network</span>
            </div>
          </div>
          
          {!isActive && (
            <Button onClick={startProctoring} className="w-full">
              Start Proctoring
            </Button>
          )}
          
          {isActive && (
            <Button onClick={stopProctoring} variant="destructive" className="w-full">
              Stop Proctoring
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Webcam Feed */}
      {isActive && enableWebcam && (
        <Card>
          <CardHeader>
            <CardTitle>Webcam Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            {webcamError ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{webcamError}</AlertDescription>
              </Alert>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                  LIVE
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Violations Log */}
      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Security Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {violations.slice(-10).reverse().map((violation) => (
                <div key={violation.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getViolationIcon(violation.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSeverityColor(violation.severity)}>
                        {violation.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {violation.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {violation.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for potential image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}