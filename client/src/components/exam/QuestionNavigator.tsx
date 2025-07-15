import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Send, Flag, CheckCircle, Circle } from "lucide-react";

interface QuestionNavigatorProps {
  questions: any[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  flaggedQuestions: string[];
  onQuestionSelect: (index: number) => void;
  onSubmit: () => void;
  timeRemaining: number;
  isSubmitting: boolean;
}

export default function QuestionNavigator({
  questions,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  onQuestionSelect,
  onSubmit,
  timeRemaining,
  isSubmitting
}: QuestionNavigatorProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionId: string, index: number) => {
    const isAnswered = answers[questionId];
    const isFlagged = flaggedQuestions.includes(questionId);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) {
      return { color: "bg-blue-500 border-blue-500 text-white", icon: null };
    }
    if (isAnswered && isFlagged) {
      return { color: "bg-green-500 border-green-500 text-white", icon: <Flag className="h-3 w-3" /> };
    }
    if (isAnswered) {
      return { color: "bg-green-500 border-green-500 text-white", icon: <CheckCircle className="h-3 w-3" /> };
    }
    if (isFlagged) {
      return { color: "bg-orange-400 border-orange-400 text-white", icon: <Flag className="h-3 w-3" /> };
    }
    return { color: "bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500", icon: <Circle className="h-3 w-3" /> };
  };

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.length;
  const completionPercentage = (answeredCount / questions.length) * 100;

  const getTimerClass = () => {
    if (timeRemaining < 300) return "text-red-500"; // Last 5 minutes
    if (timeRemaining < 900) return "text-orange-500"; // Last 15 minutes
    return "text-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Timer Card */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Time Remaining
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold text-center mb-4 ${getTimerClass()}`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{answeredCount}/{questions.length}</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question Grid */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {questions.map((question, index) => {
              const status = getQuestionStatus(question.id, index);
              return (
                <button
                  key={question.id}
                  onClick={() => onQuestionSelect(index)}
                  className={`
                    relative w-10 h-10 rounded-lg border-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center
                    ${status.color}
                  `}
                  title={`Question ${index + 1}${answers[question.id] ? ' - Answered' : ''}${flaggedQuestions.includes(question.id) ? ' - Flagged' : ''}`}
                >
                  {status.icon ? (
                    <div className="flex items-center justify-center">
                      {status.icon}
                    </div>
                  ) : (
                    index + 1
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2 flex items-center justify-center">
                <CheckCircle className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-gray-600 dark:text-gray-400">Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-400 rounded mr-2 flex items-center justify-center">
                <Flag className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-gray-600 dark:text-gray-400">Flagged ({flaggedCount})</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded mr-2 flex items-center justify-center">
                <Circle className="h-2.5 w-2.5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-gray-600 dark:text-gray-400">Not Answered ({questions.length - answeredCount})</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Current Question</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card className="glass">
        <CardContent className="p-4">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3"
            size="lg"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            Submit Exam
          </Button>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {answeredCount < questions.length && (
                <>You have {questions.length - answeredCount} unanswered question{questions.length - answeredCount !== 1 ? 's' : ''}</>
              )}
              {answeredCount === questions.length && (
                "All questions answered! Ready to submit."
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Warning for flagged questions */}
      {flaggedCount > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center text-orange-600 dark:text-orange-400">
              <Flag className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                {flaggedCount} question{flaggedCount !== 1 ? 's' : ''} flagged for review
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
