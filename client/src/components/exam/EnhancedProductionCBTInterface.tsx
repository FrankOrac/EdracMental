import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  SkipForward, 
  SkipBack,
  Shield,
  Eye,
  Camera,
  Monitor,
  Mic,
  Volume2,
  BookOpen,
  Target,
  Brain,
  MessageSquare
} from "lucide-react";
import ProctoringSuite from "./ProctoringSuit";
import InterviewExamInterface from "./InterviewExamInterface";

interface Question {
  id: number;
  text: string;
  type: 'multiple_choice' | 'essay' | 'code_submission' | 'technical_discussion';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category?: 'technical' | 'behavioral' | 'problem_solving' | 'communication';
  timeLimit?: number;
}

interface ExamSettings {
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
    allowReview: boolean;
    showCorrectAnswers: boolean;
    randomizeQuestions: boolean;
    timeWarnings: number[];
    autoSubmit?: boolean;
    preventCopyPaste?: boolean;
    disableRightClick?: boolean;
    fullscreenRequired?: boolean;
    questionTypes?: string[];
    interviewMode?: boolean;
    allowNotes?: boolean;
    extendedTime?: boolean;
  };
  interview?: {
    recordVideo: boolean;
    recordAudio: boolean;
    saveScreenshots: boolean;
    behavioralAnalysis: boolean;
    stressDetection: boolean;
    confidenceMetrics: boolean;
    communicationSkills: boolean;
    problemSolvingTracking: boolean;
  };
  security?: {
    browserLockdown?: boolean;
    minimumBandwidth?: string;
    requireSecureBrowser?: boolean;
    allowedApplications?: string[];
    blockedWebsites?: string[];
  };
}

interface EnhancedProductionCBTInterfaceProps {
  examId: string;
  practiceMode?: boolean;
  onComplete: () => void;
}

export default function EnhancedProductionCBTInterface({ 
  examId, 
  practiceMode = false, 
  onComplete 
}: EnhancedProductionCBTInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [proctorViolations, setProctorViolations] = useState<Array<{ type: string; severity: string; time: Date }>>([]);
  const [proctorStatus, setProctorStatus] = useState<'checking' | 'ready' | 'monitoring' | 'violation' | 'error'>('checking');
  
  const queryClient = useQueryClient();

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: [`/api/exams/${examId}`],
    enabled: !!examId
  });

  // Fetch questions for the exam
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: [`/api/questions`, { exam: examId }],
    enabled: !!examId
  });

  // Start exam session mutation
  const startExamMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/exams/${examId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to start exam');
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setTimeRemaining(data.timeRemaining);
      setExamStarted(true);
    }
  });

  // Submit exam mutation
  const submitExamMutation = useMutation({
    mutationFn: async (data: { answers: Record<string, string>, proctorViolations: any[], interviewMetrics?: any }) => {
      const response = await fetch(`/api/exam-sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to submit exam');
      return response.json();
    },
    onSuccess: () => {
      onComplete();
    }
  });

  // Timer countdown
  useEffect(() => {
    if (!examStarted || timeRemaining <= 0) return;

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
  }, [examStarted, timeRemaining]);

  // Setup fullscreen if required
  useEffect(() => {
    if (exam?.settings?.exam?.fullscreenRequired && examStarted) {
      document.documentElement.requestFullscreen().catch(console.error);
    }
  }, [exam, examStarted]);

  const examSettings: ExamSettings = exam?.settings || {
    proctoring: { enabled: false, webcamRequired: false, screenRecording: false, tabSwitchDetection: false, aiMonitoring: false, microphoneMonitoring: false },
    exam: { allowReview: true, showCorrectAnswers: true, randomizeQuestions: false, timeWarnings: [] }
  };

  const handleStartExam = () => {
    startExamMutation.mutate();
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleProctorViolation = (violation: string, severity: 'low' | 'medium' | 'high') => {
    const newViolation = { type: violation, severity, time: new Date() };
    setProctorViolations(prev => [...prev, newViolation]);
    
    // Handle severe violations
    if (severity === 'high') {
      setProctorStatus('violation');
      // Could potentially auto-submit or warn user
    }
  };

  const handleProctorStatusChange = (status: 'checking' | 'ready' | 'monitoring' | 'violation' | 'error') => {
    setProctorStatus(status);
  };

  const handleSubmitExam = () => {
    const submissionData = {
      answers,
      proctorViolations: examSettings.proctoring.enabled ? proctorViolations : [],
      interviewMetrics: examSettings.exam.interviewMode ? {
        completionRate: (Object.keys(answers).length / (questions?.length || 1)) * 100,
        avgResponseTime: 120, // Mock data
        confidenceScore: 75 // Mock data
      } : undefined
    };
    
    submitExamMutation.mutate(submissionData);
  };

  const handleAutoSubmit = () => {
    if (examSettings.exam.autoSubmit) {
      handleSubmitExam();
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = (): number => {
    return Object.keys(answers).length;
  };

  const getFlaggedCount = (): number => {
    return flaggedQuestions.size;
  };

  const getQuestionStatus = (index: number, questionId: number) => {
    if (answers[questionId]) return 'answered';
    if (flaggedQuestions.has(questionId)) return 'flagged';
    if (index === currentQuestionIndex) return 'current';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500';
      case 'flagged': return 'bg-orange-500';
      case 'current': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  // Show loading while fetching exam data
  if (examLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-lg font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Show exam not found
  if (!exam || !questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Exam Not Found</h2>
            <p className="text-red-600">The requested exam could not be loaded.</p>
            <Button className="mt-4" onClick={onComplete}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If exam uses interview mode, show interview interface
  if (examSettings.exam.interviewMode && examStarted) {
    return (
      <InterviewExamInterface
        examId={examId}
        questions={questions.map((q: any) => ({
          ...q,
          category: q.category || 'technical'
        }))}
        duration={exam.duration}
        settings={examSettings}
        onSubmit={(answers, metrics) => {
          submitExamMutation.mutate({
            answers,
            proctorViolations: examSettings.proctoring.enabled ? proctorViolations : [],
            interviewMetrics: metrics
          });
        }}
      />
    );
  }

  // Pre-exam screen with proctoring setup
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Exam Information */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-blue-500" />
                <span>{exam.title}</span>
                {!practiceMode && (
                  <Badge variant="destructive" className="ml-auto">
                    <Shield className="h-3 w-3 mr-1" />
                    Proctored Exam
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">{exam.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{exam.totalQuestions}</div>
                  <div className="text-sm text-gray-500">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{exam.duration}</div>
                  <div className="text-sm text-gray-500">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{exam.passingScore || 50}%</div>
                  <div className="text-sm text-gray-500">Pass Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{exam.difficulty}</div>
                  <div className="text-sm text-gray-500">Difficulty</div>
                </div>
              </div>

              {exam.instructions && (
                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>{exam.instructions}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Proctoring Setup */}
          {examSettings.proctoring.enabled && !practiceMode && (
            <ProctoringSuite
              examId={examId}
              settings={examSettings}
              onViolation={handleProctorViolation}
              onStatusChange={handleProctorStatusChange}
            />
          )}

          {/* Start Exam Button */}
          <Card>
            <CardContent className="p-6 text-center">
              <Button
                onClick={handleStartExam}
                disabled={examSettings.proctoring.enabled && proctorStatus !== 'ready'}
                className="px-8 py-3 text-lg"
                size="lg"
              >
                {startExamMutation.isPending ? "Starting..." : "Start Exam"}
              </Button>
              
              {examSettings.proctoring.enabled && proctorStatus !== 'ready' && (
                <p className="mt-3 text-sm text-gray-500">
                  Please complete the proctoring setup before starting the exam
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Main exam interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        
        {/* Header with Timer and Progress */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold">{exam.title}</h1>
                <Badge variant="secondary">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Badge>
                {!practiceMode && examSettings.proctoring.enabled && (
                  <Badge 
                    variant={proctorStatus === 'monitoring' ? 'default' : 'destructive'}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Proctored</span>
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="text-xl font-mono">{formatTime(timeRemaining)}</span>
                </div>
                
                {proctorViolations.length > 0 && (
                  <Badge variant="destructive">
                    {proctorViolations.length} Violation{proctorViolations.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <Progress 
                value={(getAnsweredCount() / questions.length) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{getAnsweredCount()} answered</span>
                <span>{getFlaggedCount()} flagged</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5" />
                    <span>Question {currentQuestionIndex + 1}</span>
                    <Badge variant="outline" className="capitalize">
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlagQuestion(currentQuestion.id)}
                      className={flaggedQuestions.has(currentQuestion.id) ? "bg-orange-100 border-orange-500" : ""}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg leading-relaxed">
                  {currentQuestion.text}
                </div>
                
                {/* Answer Options */}
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
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
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
                    <SkipBack className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {examSettings.exam.allowReview && (
                      <Badge variant="secondary" className="text-sm">Review Allowed</Badge>
                    )}
                  </div>
                  
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button onClick={handleSubmitExam} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Exam
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

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Question Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Question Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question: any, index: number) => {
                    const status = getQuestionStatus(index, question.id);
                    return (
                      <button
                        key={question.id}
                        onClick={() => handleQuestionSelect(index)}
                        className={`w-8 h-8 rounded text-xs font-medium text-white ${getStatusColor(status)} hover:opacity-80 transition-opacity`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Answered ({getAnsweredCount()})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span>Flagged ({getFlaggedCount()})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 rounded"></div>
                    <span>Unanswered</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exam Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion</span>
                    <span>{Math.round((getAnsweredCount() / questions.length) * 100)}%</span>
                  </div>
                  <Progress value={(getAnsweredCount() / questions.length) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Time Used</span>
                    <span>{Math.round(((exam.duration * 60 - timeRemaining) / (exam.duration * 60)) * 100)}%</span>
                  </div>
                  <Progress value={((exam.duration * 60 - timeRemaining) / (exam.duration * 60)) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card>
              <CardContent className="p-4">
                <Button 
                  onClick={handleSubmitExam} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={submitExamMutation.isPending}
                >
                  {submitExamMutation.isPending ? "Submitting..." : "Submit Exam"}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {getAnsweredCount()} of {questions.length} questions answered
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}