import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Brain, Zap } from 'lucide-react';

interface EdracPreloaderProps {
  onComplete?: () => void;
  duration?: number;
}

export default function EdracPreloader({ onComplete, duration = 3000 }: EdracPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [showIcons, setShowIcons] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const loadingTexts = [
    'Initializing AI System...',
    'Loading Question Bank...',
    'Preparing Exam Engine...',
    'Activating Smart Tutor...',
    'Ready to Learn!'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true);
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + 1;
      });
    }, duration / 100);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  useEffect(() => {
    const textInterval = setInterval(() => {
      const textIndex = Math.floor(progress / 20);
      setCurrentText(loadingTexts[textIndex] || loadingTexts[loadingTexts.length - 1]);
    }, 200);

    return () => clearInterval(textInterval);
  }, [progress]);

  useEffect(() => {
    setTimeout(() => setShowIcons(true), 500);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo Animation */}
        <div className="mb-12">
          <div className="relative">
            {/* Rotating Icons */}
            {showIcons && (
              <div className="absolute inset-0 w-32 h-32 mx-auto">
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
                  <GraduationCap className="absolute top-0 left-1/2 transform -translate-x-1/2 text-blue-500 w-6 h-6" />
                  <BookOpen className="absolute right-0 top-1/2 transform -translate-y-1/2 text-purple-500 w-6 h-6" />
                  <Brain className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-indigo-500 w-6 h-6" />
                  <Zap className="absolute left-0 top-1/2 transform -translate-y-1/2 text-green-500 w-6 h-6" />
                </div>
              </div>
            )}
            
            {/* Central Logo */}
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <GraduationCap className="text-white w-16 h-16" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-800" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Name with Animated Letters */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-2">
            {['E', 'd', 'r', 'a', 'c'].map((letter, index) => (
              <span
                key={index}
                className="inline-block animate-bounce"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '1s',
                  background: index % 2 === 0 
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                    : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            AI-Powered Learning Platform.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 w-80 mx-auto">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-100 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
            <span>0%</span>
            <span className="font-medium">{progress}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium animate-pulse">
            {currentText}
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
          {[
            { icon: Brain, text: 'AI Tutor', color: 'bg-blue-500' },
            { icon: BookOpen, text: 'Smart CBT', color: 'bg-purple-500' },
            { icon: Zap, text: 'Real-time', color: 'bg-green-500' },
            { icon: GraduationCap, text: 'JAMB Ready', color: 'bg-indigo-500' }
          ].map((feature, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full ${feature.color} text-white text-sm font-medium shadow-lg transform hover:scale-105 transition-transform duration-200 animate-fade-in-up`}
              style={{
                animationDelay: `${index * 0.1 + 1}s`
              }}
            >
              <feature.icon className="w-4 h-4" />
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Completion Animation */}
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-ping">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}