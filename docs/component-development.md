# Component Development Guide

Step-by-step guide for creating, updating, and deleting components in the Edrac CBT platform.

## 🎯 Component Development Process

### Step 1: Plan Your Component

Before coding, answer these questions:
1. **What does it do?** (Purpose and functionality)
2. **Where does it belong?** (Admin, Student, Institution, or System)
3. **What data does it need?** (Props, API calls, state)
4. **How should it look?** (UI design and styling)

### Step 2: Choose Component Location

```
client/src/components/
├── admin/          # Admin-only components (user management, system settings)
├── student/        # Student-specific components (dashboard, study tools)
├── institution/    # Institution management components
├── auth/           # Login, signup, authentication
├── exam/           # Exam-taking interface, questions, timer
├── ai/             # AI tutoring, chat interfaces
├── layout/         # Navigation, headers, sidebars
├── system/         # Landing page, theme, shared utilities
└── ui/             # Reusable UI elements (buttons, cards, forms)
```

## 🔨 Creating a New Component

### Example: Creating a Student Progress Component

#### Step 1: Create the Component File

```typescript
// File: client/src/components/student/StudentProgress.tsx

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the data type your component expects
interface ProgressData {
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
}

interface StudentProgressProps {
  studentId: string;
  className?: string;
}

export default function StudentProgress({ 
  studentId, 
  className 
}: StudentProgressProps) {
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // Fetch student progress data
  const { 
    data: progressData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/student/progress', studentId],
    queryFn: async () => {
      const response = await fetch(`/api/student/progress/${studentId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }
      return response.json();
    },
    enabled: !!studentId // Only run query if studentId exists
  });

  // Handle loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Failed to load progress data</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {progressData?.map((subject: ProgressData) => (
          <div key={subject.subject} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{subject.subject}</span>
              <span className="text-sm text-gray-500">
                {subject.accuracy}% accuracy
              </span>
            </div>
            <Progress value={subject.accuracy} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{subject.correctAnswers}/{subject.totalQuestions} correct</span>
              <span>{subject.timeSpent}min studied</span>
            </div>
          </div>
        ))}
        
        <Button className="w-full mt-4">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Detailed Analytics
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### Step 2: Add API Endpoint (Backend)

```typescript
// File: server/routes.ts

// Add this endpoint in your routes file
app.get('/api/student/progress/:studentId', requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Validate that user can access this data
    if (req.user.role !== 'admin' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get progress data from storage
    const progressData = await storage.getStudentProgress(studentId);
    
    res.json(progressData);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

#### Step 3: Add Storage Method (Database)

```typescript
// File: server/storage.ts

// Add this method to your storage interface and implementation
async getStudentProgress(studentId: string): Promise<ProgressData[]> {
  try {
    const results = await db
      .select({
        subject: subjects.name,
        totalQuestions: sql<number>`count(distinct ${questions.id})`,
        correctAnswers: sql<number>`count(case when ${examSessions.isCorrect} then 1 end)`,
        accuracy: sql<number>`
          round(
            (count(case when ${examSessions.isCorrect} then 1 end) * 100.0) / 
            count(distinct ${questions.id}), 
            2
          )
        `,
        timeSpent: sql<number>`sum(${examSessions.timeSpent}) / 60`
      })
      .from(subjects)
      .leftJoin(questions, eq(questions.subjectId, subjects.id))
      .leftJoin(examSessions, eq(examSessions.questionId, questions.id))
      .where(eq(examSessions.userId, studentId))
      .groupBy(subjects.id, subjects.name);

    return results;
  } catch (error) {
    console.error('Error getting student progress:', error);
    throw error;
  }
}
```

#### Step 4: Use Component in Parent

```typescript
// File: client/src/components/student/EnhancedStudentDashboard.tsx

import StudentProgress from './StudentProgress';

export default function EnhancedStudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Other dashboard components */}
      
      <StudentProgress 
        studentId={user.id} 
        className="col-span-1 md:col-span-2"
      />
      
      {/* More components */}
    </div>
  );
}
```

## ✏️ Updating Existing Components

### Step 1: Locate the Component

```cmd
# Search for the component file
# Use your code editor's search or:
grep -r "ComponentName" client/src/components/
```

### Step 2: Make Changes Safely

```typescript
// Example: Adding a new prop to existing component

// Before
interface StudentProgressProps {
  studentId: string;
  className?: string;
}

// After (add new optional prop)
interface StudentProgressProps {
  studentId: string;
  className?: string;
  showDetailed?: boolean; // New optional prop
}

export default function StudentProgress({ 
  studentId, 
  className,
  showDetailed = false // Default value
}: StudentProgressProps) {
  // Use the new prop
  const displayMode = showDetailed ? 'detailed' : 'summary';
  
  // Rest of component logic...
}
```

### Step 3: Update All Usage

```typescript
// Find all places where component is used and update if needed
<StudentProgress 
  studentId={user.id} 
  className="col-span-2"
  showDetailed={true} // Use new prop
/>
```

## 🗑️ Deleting Components

### Step 1: Find All References

```cmd
# Search for component imports
grep -r "import.*ComponentName" client/src/
grep -r "ComponentName" client/src/
```

### Step 2: Remove Imports and Usage

```typescript
// Remove import statements
// Before
import StudentProgress from './StudentProgress';
import OtherComponent from './OtherComponent';

// After
import OtherComponent from './OtherComponent';

// Remove component usage
// Before
<div>
  <StudentProgress studentId={user.id} />
  <OtherComponent />
</div>

// After
<div>
  <OtherComponent />
</div>
```

### Step 3: Delete the File

```cmd
# Delete the component file
rm client/src/components/student/StudentProgress.tsx
```

### Step 4: Clean Up Related Code

```typescript
// Remove related API endpoints, storage methods, and types if no longer needed
// Check server/routes.ts, server/storage.ts, shared/schema.ts
```

## 🎨 UI Component Patterns

### Using shadcn/ui Components

```typescript
// Import UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Use in your component
<Card>
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Enter name" />
    </div>
    
    <div>
      <Label htmlFor="role">Role</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="teacher">Teacher</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <Button className="w-full">
      Submit
    </Button>
  </CardContent>
</Card>
```

### Form Handling Pattern

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["student", "teacher", "admin"])
});

type FormData = z.infer<typeof formSchema>;

export default function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "student"
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        toast({ title: "Success", description: "User created successfully" });
        form.reset();
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## 📡 Data Fetching Patterns

### Simple Data Fetching

```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ['/api/subjects'],
  queryFn: async () => {
    const response = await fetch('/api/subjects', { credentials: 'include' });
    return response.json();
  }
});
```

### Data Mutations (Create/Update/Delete)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const createSubjectMutation = useMutation({
  mutationFn: async (data: SubjectData) => {
    const response = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return response.json();
  },
  onSuccess: () => {
    // Refresh the subjects list
    queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
    toast({ title: "Subject created successfully" });
  },
  onError: () => {
    toast({ 
      title: "Error", 
      description: "Failed to create subject",
      variant: "destructive" 
    });
  }
});

// Use in component
const handleCreate = (data: SubjectData) => {
  createSubjectMutation.mutate(data);
};
```

## 🚀 Component Best Practices

### 1. Component Structure

```typescript
// Good component structure
export default function MyComponent({ prop1, prop2 }: Props) {
  // 1. Hooks at the top
  const [state, setState] = useState();
  const { data } = useQuery();
  
  // 2. Event handlers
  const handleClick = () => {
    // Handle logic
  };
  
  // 3. Early returns for loading/error states
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  
  // 4. Main render
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### 2. Props and TypeScript

```typescript
// Define clear prop interfaces
interface ComponentProps {
  title: string;                    // Required prop
  description?: string;             // Optional prop
  onSubmit: (data: FormData) => void; // Function prop
  className?: string;               // Style prop
  children?: React.ReactNode;       // Children prop
}

// Use proper default values
export default function MyComponent({ 
  title,
  description = "Default description",
  onSubmit,
  className = "",
  children 
}: ComponentProps) {
  // Component logic
}
```

### 3. Error Handling

```typescript
// Always handle loading and error states
if (isLoading) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
}

if (error) {
  return (
    <div className="text-center p-8">
      <p className="text-red-500">Something went wrong</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
}
```

### 4. Accessibility

```typescript
// Use proper ARIA labels and semantic HTML
<button 
  aria-label="Delete user"
  className="text-red-500 hover:text-red-700"
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4" />
</button>

// Use proper form labels
<Label htmlFor="email">Email Address</Label>
<Input 
  id="email" 
  type="email" 
  placeholder="Enter your email"
  aria-describedby="email-error"
/>
```

## 🔧 Development Tools

### VS Code Extensions (Recommended)

1. **ES7+ React/Redux/React-Native snippets**
   - `rafce` → React Arrow Function Component Export
   - `useState` → useState hook snippet

2. **TypeScript Importer**
   - Auto-imports TypeScript types

3. **Tailwind CSS IntelliSense**
   - Auto-complete for Tailwind classes

### Useful Code Snippets

```typescript
// Component template (save as snippet)
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface $1Props {
  $2
}

export default function $1({ $3 }: $1Props) {
  const [state, setState] = useState();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['$4'],
    queryFn: async () => {
      // Fetch data
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>$1</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
}
```

This guide provides everything you need to create, update, and delete components in the Edrac platform. Start with simple components and gradually add more complex features as you become comfortable with the patterns.