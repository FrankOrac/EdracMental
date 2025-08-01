import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  Mic, 
  Monitor, 
  Shield, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Volume2,
  Wifi,
  Battery,
  Clock
} from "lucide-react";

interface ProctoringSuiteProps {
  examId: string;
  settings: {
    proctoring: {
      enabled: boolean;
      webcamRequired: boolean;
      screenRecording: boolean;
      tabSwitchDetection: boolean;
      aiMonitoring: boolean;
      microphoneMonitoring: boolean;
      faceDetection?: boolean;
      eyeTracking?: boolean;
      environmentScan?: boolean;
      voiceAnalysis?: boolean;
    };
    exam: {
      fullscreenRequired?: boolean;
      preventCopyPaste?: boolean;
      disableRightClick?: boolean;
    };
    security?: {
      browserLockdown?: boolean;
      blockedWebsites?: string[];
    };
  };
  onViolation: (violation: string, severity: 'low' | 'medium' | 'high') => void;
  onStatusChange: (status: 'checking' | 'ready' | 'monitoring' | 'violation' | 'error') => void;
}

export default function ProctoringSuite({ 
  examId, 
  settings, 
  onViolation, 
  onStatusChange 
}: ProctoringSuiteProps) {
  const [proctorStatus, setProctorStatus] = useState<'checking' | 'ready' | 'monitoring' | 'violation' | 'error'>('checking');
  const [violations, setViolations] = useState<Array<{ type: string; time: Date; severity: 'low' | 'medium' | 'high' }>>([]);
  const [systemChecks, setSystemChecks] = useState({
    camera: false,
    microphone: false,
    screen: false,
    network: false,
    fullscreen: false
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const tabSwitchCountRef = useRef(0);
  const faceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize proctoring systems
  useEffect(() => {
    initializeProctoring();
    return () => cleanupProctoring();
  }, []);

  const initializeProctoring = async () => {
    try {
      setProctorStatus('checking');
      
      // System checks
      await performSystemChecks();
      
      // Initialize camera if required
      if (settings.proctoring.webcamRequired) {
        await initializeCamera();
      }
      
      // Initialize microphone if required
      if (settings.proctoring.microphoneMonitoring) {
        await initializeMicrophone();
      }
      
      // Initialize screen recording if required
      if (settings.proctoring.screenRecording) {
        await initializeScreenRecording();
      }
      
      // Setup event listeners
      setupEventListeners();
      
      // Start monitoring
      setProctorStatus('ready');
      onStatusChange('ready');
      
    } catch (error) {
      console.error('Proctoring initialization failed:', error);
      setProctorStatus('error');
      onStatusChange('error');
    }
  };

  const performSystemChecks = async () => {
    const checks = { ...systemChecks };
    
    // Camera check
    if (settings.proctoring.webcamRequired) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        checks.camera = true;
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        checks.camera = false;
      }
    }
    
    // Microphone check
    if (settings.proctoring.microphoneMonitoring) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        checks.microphone = true;
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        checks.microphone = false;
      }
    }
    
    // Screen recording check
    if (settings.proctoring.screenRecording) {
      try {
        // @ts-ignore
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        checks.screen = true;
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        checks.screen = false;
      }
    }
    
    // Network check
    checks.network = navigator.onLine;
    
    // Fullscreen check
    checks.fullscreen = !settings.exam.fullscreenRequired || document.fullscreenElement !== null;
    
    setSystemChecks(checks);
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Setup face detection if enabled
      if (settings.proctoring.faceDetection) {
        startFaceDetection();
      }

      // Setup recording if needed
      if (settings.proctoring.aiMonitoring) {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            // Send data for AI analysis
            analyzeVideoFrame(event.data);
          }
        };
        
        mediaRecorder.start(5000); // Record in 5-second chunks
      }
      
    } catch (error) {
      console.error('Camera initialization failed:', error);
      throw error;
    }
  };

  const initializeMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (settings.proctoring.voiceAnalysis) {
        // Setup audio analysis
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        
        // Monitor audio levels for voice detection
        startVoiceAnalysis(analyser);
      }
      
    } catch (error) {
      console.error('Microphone initialization failed:', error);
      throw error;
    }
  };

  const initializeScreenRecording = async () => {
    try {
      // @ts-ignore
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: true 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      screenRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        // Upload screen recording
        uploadScreenRecording(blob);
      };
      
      mediaRecorder.start();
      
    } catch (error) {
      console.error('Screen recording initialization failed:', error);
      throw error;
    }
  };

  const setupEventListeners = () => {
    // Tab switch detection
    if (settings.proctoring.tabSwitchDetection) {
      document.addEventListener('visibilitychange', handleTabSwitch);
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('focus', handleWindowFocus);
    }
    
    // Copy/paste prevention
    if (settings.exam.preventCopyPaste) {
      document.addEventListener('copy', preventCopyPaste);
      document.addEventListener('paste', preventCopyPaste);
      document.addEventListener('cut', preventCopyPaste);
    }
    
    // Right-click prevention
    if (settings.exam.disableRightClick) {
      document.addEventListener('contextmenu', preventRightClick);
    }
    
    // Fullscreen monitoring
    if (settings.exam.fullscreenRequired) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }
    
    // Network monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
  };

  const handleTabSwitch = () => {
    if (document.hidden) {
      tabSwitchCountRef.current++;
      const violation = `Tab switch detected (${tabSwitchCountRef.current} times)`;
      recordViolation('tab_switch', 'medium');
    }
  };

  const handleWindowBlur = () => {
    recordViolation('window_blur', 'low');
  };

  const handleWindowFocus = () => {
    // Reset monitoring when window regains focus
    setProctorStatus('monitoring');
  };

  const preventCopyPaste = (e: Event) => {
    e.preventDefault();
    recordViolation('copy_paste_attempt', 'high');
  };

  const preventRightClick = (e: Event) => {
    e.preventDefault();
    recordViolation('right_click_attempt', 'low');
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && settings.exam.fullscreenRequired) {
      recordViolation('fullscreen_exit', 'high');
    }
  };

  const handleNetworkChange = () => {
    if (!navigator.onLine) {
      recordViolation('network_disconnection', 'high');
    }
  };

  const startFaceDetection = () => {
    faceDetectionIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const video = videoRef.current;
        
        if (context && video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0);
          
          // Simple face detection logic (in production, use a proper face detection library)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const faceDetected = detectFace(imageData);
          
          if (!faceDetected) {
            recordViolation('face_not_detected', 'medium');
          }
        }
      }
    }, 2000); // Check every 2 seconds
  };

  const detectFace = (imageData: ImageData): boolean => {
    // Simplified face detection - in production, use a proper library like MediaPipe
    // This is just a placeholder that always returns true
    return Math.random() > 0.1; // 90% chance of face detection
  };

  const startVoiceAnalysis = (analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      // Detect unusual audio patterns
      if (average > 100) {
        recordViolation('unusual_audio_detected', 'low');
      }
      
      requestAnimationFrame(checkAudioLevel);
    };
    
    checkAudioLevel();
  };

  const analyzeVideoFrame = async (data: Blob) => {
    // Send video frame to AI analysis endpoint
    try {
      const formData = new FormData();
      formData.append('video', data);
      formData.append('examId', examId);
      
      const response = await fetch('/api/proctoring/analyze', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.violations) {
        result.violations.forEach((violation: any) => {
          recordViolation(violation.type, violation.severity);
        });
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  };

  const uploadScreenRecording = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('recording', blob);
      formData.append('examId', examId);
      
      await fetch('/api/proctoring/upload-recording', {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Screen recording upload failed:', error);
    }
  };

  const recordViolation = (type: string, severity: 'low' | 'medium' | 'high') => {
    const violation = { type, time: new Date(), severity };
    setViolations(prev => [...prev, violation]);
    setProctorStatus('violation');
    onViolation(type, severity);
    
    // Auto-reset status after 3 seconds for low severity violations
    if (severity === 'low') {
      setTimeout(() => setProctorStatus('monitoring'), 3000);
    }
  };

  const cleanupProctoring = () => {
    // Stop camera
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Stop media recorders
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (screenRecorderRef.current) {
      screenRecorderRef.current.stop();
    }
    
    // Clear intervals
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
    }
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', handleTabSwitch);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('focus', handleWindowFocus);
    document.removeEventListener('copy', preventCopyPaste);
    document.removeEventListener('paste', preventCopyPaste);
    document.removeEventListener('cut', preventCopyPaste);
    document.removeEventListener('contextmenu', preventRightClick);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    window.removeEventListener('online', handleNetworkChange);
    window.removeEventListener('offline', handleNetworkChange);
  };

  const getStatusColor = () => {
    switch (proctorStatus) {
      case 'checking': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'monitoring': return 'bg-blue-500';
      case 'violation': return 'bg-red-500';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (proctorStatus) {
      case 'checking': return <Clock className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'monitoring': return <Eye className="h-4 w-4" />;
      case 'violation': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (!settings.proctoring.enabled) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              {getStatusIcon()}
              <span className="font-medium">Proctoring Status: {proctorStatus.charAt(0).toUpperCase() + proctorStatus.slice(1)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {Object.entries(systemChecks).map(([key, status]) => (
                <Badge 
                  key={key} 
                  variant={status ? "default" : "destructive"}
                  className="text-xs"
                >
                  {key}: {status ? "✓" : "✗"}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Feed (if enabled) */}
      {settings.proctoring.webcamRequired && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Camera Monitor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video 
                ref={videoRef}
                className="w-full max-w-sm rounded-lg border"
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              {settings.proctoring.faceDetection && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">
                    <Eye className="h-3 w-3 mr-1" />
                    Face Detection
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Violations Alert */}
      {violations.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {violations.length} violation(s) detected. Latest: {violations[violations.length - 1].type}
          </AlertDescription>
        </Alert>
      )}

      {/* Security Features Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {settings.proctoring.tabSwitchDetection && (
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Tab Switch Detection</span>
              </div>
            )}
            
            {settings.proctoring.microphoneMonitoring && (
              <div className="flex items-center space-x-2">
                <Mic className="h-4 w-4 text-green-500" />
                <span className="text-sm">Audio Monitoring</span>
              </div>
            )}
            
            {settings.proctoring.screenRecording && (
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4 text-red-500" />
                <span className="text-sm">Screen Recording</span>
              </div>
            )}
            
            {settings.proctoring.aiMonitoring && (
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span className="text-sm">AI Monitoring</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}