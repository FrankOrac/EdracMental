import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Copy, 
  Volume2, 
  VolumeX, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Share2,
  Bookmark,
  Download
} from "lucide-react";

interface AIResponseActionsProps {
  content: string;
  messageId: string;
  onSpeak?: (text: string) => void;
  onFeedback?: (messageId: string, rating: 'positive' | 'negative') => void;
  className?: string;
}

export default function AIResponseActions({ 
  content, 
  messageId, 
  onSpeak, 
  onFeedback,
  className = ""
}: AIResponseActionsProps) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleSpeak = () => {
    if (onSpeak) {
      onSpeak(content);
      setSpeaking(true);
      setTimeout(() => setSpeaking(false), 3000);
    }
  };

  const handleFeedback = (rating: 'positive' | 'negative') => {
    setFeedback(rating);
    if (onFeedback) {
      onFeedback(messageId, rating);
    }
    toast({
      title: "Thanks for your feedback!",
      description: "Your rating helps improve the AI tutor.",
    });
  };

  const shareResponse = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AI Tutor Response',
        text: content,
      });
    } else {
      copyToClipboard();
    }
  };

  const bookmarkResponse = () => {
    toast({
      title: "Bookmarked!",
      description: "Response saved to your bookmarks.",
    });
  };

  const downloadResponse = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-response-${messageId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 w-7 p-0"
          >
            <motion.div
              initial={false}
              animate={copied ? { scale: 1.2 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
        </TooltipContent>
      </Tooltip>
      
      {onSpeak && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeak}
              className="h-7 w-7 p-0"
              disabled={speaking}
            >
              <motion.div
                animate={speaking ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
              >
                {speaking ? <VolumeX className="h-3 w-3 text-blue-500" /> : <Volume2 className="h-3 w-3" />}
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{speaking ? "Speaking..." : "Read aloud"}</p>
          </TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={shareResponse}
            className="h-7 w-7 p-0"
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share response</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={bookmarkResponse}
            className="h-7 w-7 p-0"
          >
            <Bookmark className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bookmark response</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadResponse}
            className="h-7 w-7 p-0"
          >
            <Download className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download response</p>
        </TooltipContent>
      </Tooltip>

      <div className="flex items-center gap-1 ml-2 border-l pl-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback('positive')}
              className={`h-7 w-7 p-0 ${feedback === 'positive' ? 'text-green-500' : ''}`}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Helpful response</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback('negative')}
              className={`h-7 w-7 p-0 ${feedback === 'negative' ? 'text-red-500' : ''}`}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Not helpful</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}