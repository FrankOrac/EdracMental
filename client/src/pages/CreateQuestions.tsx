import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MultiQuestionCreator from "@/components/admin/MultiQuestionCreator";
import { BookOpen, FileText, Plus, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreateQuestions() {
  const { toast } = useToast();
  const [step, setStep] = useState<'select-target' | 'select-method' | 'select-quantity' | 'create'>('select-target');
  const [targetType, setTargetType] = useState<'subject' | 'exam' | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<{id: string, name: string, type: 'subject' | 'exam'} | null>(null);
  const [creationMethod, setCreationMethod] = useState<'online' | 'bulk' | null>(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [showMultiCreator, setShowMultiCreator] = useState(false);

  // Fetch data
  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/subjects'],
    refetchOnWindowFocus: false
  });

  const { data: topics = [] } = useQuery({
    queryKey: ['/api/topics'],
    refetchOnWindowFocus: false
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['/api/exams'],
    refetchOnWindowFocus: false
  });

  const downloadSampleTemplate = () => {
    const csvContent = `Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation,Subject,Topic,Difficulty,Type
"What is 2 + 2?","3","4","5","6","B","Basic addition: 2 + 2 = 4","Mathematics","Arithmetic","easy","multiple_choice"
"What is the capital of Nigeria?","Lagos","Abuja","Kano","Port Harcourt","B","Abuja is the capital city of Nigeria","General Knowledge","Geography","easy","multiple_choice"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      toast({
        title: "File Upload",
        description: "Bulk upload functionality will be implemented soon.",
      });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select-target':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Where do you want to add questions?</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose whether to add questions to a subject or exam</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                setTargetType('subject');
                setStep('select-target');
              }}>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-semibold mb-2">Add to Subject</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add questions to a specific subject for general use</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                setTargetType('exam');
                setStep('select-target');
              }}>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">Add to Exam</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add questions directly to a specific exam</p>
                </CardContent>
              </Card>
            </div>

            {targetType && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Select {targetType === 'subject' ? 'Subject' : 'Exam'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                      {(targetType === 'subject' ? subjects : exams).map((item: any) => (
                        <Button
                          key={item.id}
                          variant={selectedTarget?.id === item.id ? "default" : "outline"}
                          className="w-full justify-start h-auto p-4"
                          onClick={() => {
                            setSelectedTarget({
                              id: item.id,
                              name: item.name || item.title,
                              type: targetType
                            });
                          }}
                        >
                          <div className="text-left">
                            <div className="font-medium">{item.name || item.title}</div>
                            {targetType === 'subject' && (
                              <div className="text-xs text-gray-500">{item.code}</div>
                            )}
                            {targetType === 'exam' && (
                              <div className="text-xs text-gray-500">{item.description}</div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                    
                    {selectedTarget && (
                      <div className="flex justify-end">
                        <Button onClick={() => setStep('select-method')}>
                          Continue
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'select-method':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">How do you want to create questions?</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Adding questions to: <span className="font-semibold">{selectedTarget?.name}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                setCreationMethod('online');
                setStep('select-quantity');
              }}>
                <CardContent className="p-6 text-center">
                  <Plus className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-semibold mb-2">Online Creation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Create questions manually using our form</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                setCreationMethod('bulk');
                // Handle bulk upload
                document.getElementById('file-upload')?.click();
              }}>
                <CardContent className="p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">Bulk Upload</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Upload questions from Excel/CSV file</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button variant="outline" onClick={downloadSampleTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Sample Template
              </Button>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setStep('select-target')}>
                Back
              </Button>
            </div>
          </div>
        );

      case 'select-quantity':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">How many questions?</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select the number of questions you want to create for <span className="font-semibold">{selectedTarget?.name}</span>
              </p>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-count">Number of Questions</Label>
                    <Select
                      value={questionCount.toString()}
                      onValueChange={(value) => setQuestionCount(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Question</SelectItem>
                        <SelectItem value="2">2 Questions</SelectItem>
                        <SelectItem value="3">3 Questions</SelectItem>
                        <SelectItem value="4">4 Questions</SelectItem>
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="15">15 Questions</SelectItem>
                        <SelectItem value="20">20 Questions</SelectItem>
                        <SelectItem value="25">25 Questions</SelectItem>
                        <SelectItem value="30">30 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between gap-4">
                    <Button variant="outline" onClick={() => setStep('select-method')}>
                      Back
                    </Button>
                    <Button onClick={() => setShowMultiCreator(true)}>
                      Start Creating
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (showMultiCreator) {
    return (
      <DashboardLayout>
        <MultiQuestionCreator
          isOpen={true}
          onClose={() => {
            setShowMultiCreator(false);
            setStep('select-target');
            setTargetType(null);
            setSelectedTarget(null);
            setCreationMethod(null);
            setQuestionCount(1);
          }}
          questionCount={questionCount}
          selectedSubject={selectedTarget?.type === 'subject' ? {
            id: parseInt(selectedTarget.id),
            name: selectedTarget.name,
            category: ''
          } : undefined}
          selectedTopic={selectedTarget?.type === 'subject' ? 
            topics.find((t: any) => t.subjectId === parseInt(selectedTarget.id)) : undefined}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Questions</h1>
            <p className="text-gray-600 dark:text-gray-400">Add questions to your question bank</p>
          </div>

          {renderStepContent()}

          {/* Hidden file input for bulk upload */}
          <input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}