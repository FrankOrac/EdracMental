import { useLocation } from "wouter";
import PracticeInterface from "@/components/exam/PracticeInterface";

export default function Practice() {
  const [location] = useLocation();
  
  // Extract subject ID and mode from URL
  // Format: /practice/1?mode=instant or /practice/1?mode=ai
  const pathParts = location.split('/');
  const subjectId = pathParts[2];
  
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const mode = (urlParams.get('mode') as "instant" | "ai") || "instant";

  if (!subjectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Practice Session</h1>
          <p className="text-gray-600 mb-4">Subject not found.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <PracticeInterface 
      subjectId={subjectId}
      mode={mode}
      onComplete={() => {
        window.location.href = "/dashboard";
      }}
    />
  );
}