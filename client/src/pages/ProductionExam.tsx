import { useParams } from "wouter";
import ProductionCBTInterface from "@/components/exam/ProductionCBTInterface";

export default function ProductionExam() {
  const params = useParams();
  const examId = params.examId;

  if (!examId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Invalid Exam</h1>
          <p className="text-gray-600 dark:text-gray-400">No exam ID provided.</p>
        </div>
      </div>
    );
  }

  return <ProductionCBTInterface examId={examId} practiceMode={false} />;
}