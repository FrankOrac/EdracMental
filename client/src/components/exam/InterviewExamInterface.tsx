import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  Clock,
  User,
  MessageSquare,
  FileText,
  Code,
  Brain,
  Target,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  SkipForward
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  type: 'multiple_choice' | 'essay' | 'code_submission' | 'technical_discussion';
  options?: string[];
  correctAnswer?: string;
  timeLimit?: number; // in minutes
  points: number;
  category: 'technical' | 'behavioral' | 'problem_solving' | 'communication';
  followUpQuestions?: string[];
}

interface InterviewExamInterfaceProps {
  examId: string;
  questions: Question[];
  duration: number; // total exam duration in minutes
  settings: {
    interview: {
      recordVideo: boolean;
      recordAudio: boolean;
      saveScreenshots: boolean;
      behavioralAnalysis: boolean;
      stressDetection: boolean;
      confidenceMetrics: boolean;
      communicationSkills: boolean;
      problemSolvingTracking: boolean;
    };
    exam: {
      allowNotes: boolean;
      extendedTime: boolean;
      interviewMode: boolean;
    };
  };
  onSubmit: (answers: Record<string, any>, metrics: any) => void;
}

export default function InterviewExamInterface({ 
  examId, 
  questions, 
  duration, 
  settings, 
  onSubmit 
}: InterviewExamInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert to seconds
  const [isRecording, setIsRecording] = useState(false);
  const [interviewMetrics, setInterviewMetrics] = useState({
    confidenceScore: 0,
    communicationScore: 0,
    stressLevel: 0,
    engagementLevel: 0,
    responseTime: [] as number[],
    verbalFluency: 0,
    eyeContact: 0
  });
  
  const [audioLevel, setAudioLevel] = useState(0);
  const [faceDetected, setFaceDetected] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Initialize interview recording systems
  useEffect(() => {
    initializeRecording();
    setQuestionStartTime(new Date());
    
    return () => cleanupRecording();
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Audio analysis for voice metrics
  useEffect(() => {
    if (isRecording && analyserRef.current) {
      analyzeAudio();
    }
  }, [isRecording]);

  const initializeRecording = async () => {
    try {
      // Initialize camera
      if (settings.interview.recordVideo) {
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
          await videoRef.current.play();
        }

        // Setup recording
        const mediaRecorder = new MediaRecorder(videoStream, {
          mimeType: 'video/webm;codecs=vp8,opus'
        });
        mediaRecorderRef.current = mediaRecorder;
        
        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          uploadInterviewRecording(blob);
        };
      }

      // Initialize audio analysis
      if (settings.interview.recordAudio) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(audioStream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        source.connect(analyserRef.current);
        
        analyserRef.current.fftSize = 256;
      }

      setIsRecording(true);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.start();
      }

    } catch (error) {
      console.error('Recording initialization failed:', error);
    }
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioMetrics = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      setAudioLevel(average);
      
      // Update voice metrics
      setInterviewMetrics(prev => ({
        ...prev,
        verbalFluency: Math.min(100, prev.verbalFluency + (average > 50 ? 0.5 : -0.1)),
        communicationScore: calculateCommunicationScore(average, prev.communicationScore)
      }));
      
      if (isRecording) {
        requestAnimationFrame(updateAudioMetrics);
      }
    };
    
    updateAudioMetrics();
  };

  const calculateCommunicationScore = (audioLevel: number, currentScore: number): number => {
    // Simple algorithm to assess communication quality based on audio patterns
    const clarity = audioLevel > 30 && audioLevel < 150 ? 1 : 0; // Clear speaking range
    const consistency = Math.abs(audioLevel - 80) < 30 ? 1 : 0; // Consistent volume
    
    return Math.min(100, currentScore + (clarity + consistency) * 0.1);
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        answer: value,
        timestamp: new Date(),
        timeSpent: questionStartTime ? Date.now() - questionStartTime.getTime() : 0,
        audioMetrics: {
          averageLevel: audioLevel,
          clarity: audioLevel > 30 && audioLevel < 150
        }
      }
    }));
  };

  const handleNextQuestion = () => {
    if (questionStartTime) {
      const responseTime = Date.now() - questionStartTime.getTime();
      setInterviewMetrics(prev => ({
        ...prev,
        responseTime: [...prev.responseTime, responseTime]
      }));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(new Date());
      
      // Take screenshot for behavioral analysis
      if (settings.interview.saveScreenshots) {
        takeScreenshot();
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(new Date());
    }
  };

  const takeScreenshot = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append('screenshot', blob);
            formData.append('examId', examId);
            formData.append('questionId', currentQuestion.id.toString());
            
            try {
              await fetch('/api/interview/screenshot', {
                method: 'POST',
                body: formData
              });
            } catch (error) {
              console.error('Screenshot upload failed:', error);
            }
          }
        });
      }
    }
  };

  const uploadInterviewRecording = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('recording', blob);
      formData.append('examId', examId);
      formData.append('metrics', JSON.stringify(interviewMetrics));
      
      await fetch('/api/interview/upload-recording', {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Recording upload failed:', error);
    }
  };

  const handleSubmit = () => {
    // Calculate final metrics
    const finalMetrics = {
      ...interviewMetrics,
      averageResponseTime: interviewMetrics.responseTime.length > 0 
        ? interviewMetrics.responseTime.reduce((a, b) => a + b, 0) / interviewMetrics.responseTime.length 
        : 0,
      completionRate: (Object.keys(answers).length / questions.length) * 100,
      totalTimeSpent: (duration * 60) - timeRemaining
    };

    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    onSubmit(answers, finalMetrics);
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const cleanupRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return <Target className="h-5 w-5" />;
      case 'essay': return <FileText className="h-5 w-5" />;
      case 'code_submission': return <Code className="h-5 w-5" />;
      case 'technical_discussion': return <MessageSquare className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-500';
      case 'behavioral': return 'bg-green-500';
      case 'problem_solving': return 'bg-purple-500';
      case 'communication': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header with Timer and Progress */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-6 w-6 text-blue-500" />
                  <h1 className="text-2xl font-bold">Interview Assessment</h1>
                </div>
                <Badge variant="secondary" className="text-sm">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="text-xl font-mono">{formatTime(timeRemaining)}</span>
                </div>
                
                {isRecording && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-600">Recording</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <Progress 
                value={(currentQuestionIndex / questions.length) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Question */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getQuestionIcon(currentQuestion.type)}
                    <span>Question {currentQuestionIndex + 1}</span>
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(currentQuestion.category)}`}></div>
                    <Badge variant="outline" className="capitalize">
                      {currentQuestion.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <Badge variant="secondary">
                    {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-lg font-medium leading-relaxed">
                  {currentQuestion.text}
                </div>
                
                {currentQuestion.timeLimit && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Recommended time limit: {currentQuestion.timeLimit} minutes
                    </AlertDescription>
                  </Alert>
                )}

                {/* Answer Input Based on Question Type */}
                <div className="mt-6">
                  {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <label 
                          key={index} 
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={option}
                            checked={answers[currentQuestion.id]?.answer === option}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {(currentQuestion.type === 'essay' || currentQuestion.type === 'technical_discussion') && (
                    <Textarea
                      placeholder="Type your detailed answer here..."
                      value={answers[currentQuestion.id]?.answer || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="min-h-[200px]"
                    />
                  )}
                  
                  {currentQuestion.type === 'code_submission' && (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Write your code solution here..."
                        value={answers[currentQuestion.id]?.answer || ''}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                      />
                      <Alert>
                        <Code className="h-4 w-4" />
                        <AlertDescription>
                          Explain your approach and reasoning in the code comments
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>

                {/* Follow-up Questions */}
                {currentQuestion.followUpQuestions && currentQuestion.followUpQuestions.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Follow-up Questions to Consider:
                    </h4>
                    <ul className="space-y-2">
                      {currentQuestion.followUpQuestions.map((followUp, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          • {followUp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {settings.exam.allowNotes && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>Notes Allowed</span>
                      </Badge>
                    )}
                  </div>
                  
                  {isLastQuestion ? (
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Interview
                    </Button>
                  ) : (
                    <Button onClick={handleNextQuestion}>
                      Next
                      <SkipForward className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Monitoring and Metrics */}
          <div className="space-y-6">
            
            {/* Video Feed */}
            {settings.interview.recordVideo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Video Monitor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <video 
                    ref={videoRef}
                    className="w-full rounded-lg border"
                    muted
                    playsInline
                  />
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className={faceDetected ? "text-green-600" : "text-red-600"}>
                      {faceDetected ? "Face detected" : "Face not detected"}
                    </span>
                    <span className="text-gray-500">
                      Audio: {Math.round(audioLevel)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interview Metrics */}
            {settings.interview.behavioralAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence</span>
                      <span>{Math.round(interviewMetrics.confidenceScore)}%</span>
                    </div>
                    <Progress value={interviewMetrics.confidenceScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Communication</span>
                      <span>{Math.round(interviewMetrics.communicationScore)}%</span>
                    </div>
                    <Progress value={interviewMetrics.communicationScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Verbal Fluency</span>
                      <span>{Math.round(interviewMetrics.verbalFluency)}%</span>
                    </div>
                    <Progress value={interviewMetrics.verbalFluency} className="h-2" />
                  </div>
                  
                  <div className="pt-2 border-t text-xs text-gray-500">
                    <div>Avg. Response Time: {
                      interviewMetrics.responseTime.length > 0 
                        ? Math.round(interviewMetrics.responseTime.reduce((a, b) => a + b, 0) / interviewMetrics.responseTime.length / 1000) 
                        : 0
                    }s</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Question Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`flex items-center justify-between p-2 rounded-lg border ${
                        index === currentQuestionIndex 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : answers[question.id] 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{index + 1}</span>
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(question.category)}`}></div>
                      </div>
                      
                      <div className="text-xs">
                        {answers[question.id] ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : index === currentQuestionIndex ? (
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}