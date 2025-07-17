import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface AIConfidenceIndicatorProps {
  confidence: number;
  className?: string;
}

export default function AIConfidenceIndicator({ confidence, className = "" }: AIConfidenceIndicatorProps) {
  const getConfidenceLevel = () => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  const getConfidenceColor = () => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceIcon = () => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 0.6) return <AlertCircle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getConfidenceText = () => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const getProgressColor = () => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center gap-1 ${getConfidenceColor()}`}>
        {getConfidenceIcon()}
        <span className="text-xs font-medium">{getConfidenceText()}</span>
      </div>
      <div className="flex items-center gap-2 flex-1">
        <Progress 
          value={confidence * 100} 
          className="h-2 flex-1"
        />
        <span className="text-xs font-mono min-w-[3ch]">
          {Math.round(confidence * 100)}%
        </span>
      </div>
    </div>
  );
}