# Edrac Codebase Overview

This comprehensive guide explains the complete codebase structure, advanced features, logic flow, and how different components integrate to deliver Africa's first AI-powered CBT and smart learning platform.

## 🏗 High-Level Architecture

The Edrac platform follows a **client-server separation** pattern:

```
┌─────────────────┐    HTTP/API    ┌─────────────────┐    SQL    ┌─────────────────┐
│   React Client  │ ──────────────▶│  Express Server │ ────────▶│   PostgreSQL    │
│   (Frontend)    │ ◀──────────────│   (Backend)     │ ◀────────│   Database      │
└─────────────────┘    JSON Data   └─────────────────┘   Data   └─────────────────┘
```

## 📂 Detailed File Structure

### Frontend (`client/src/`)

```
client/src/
├── App.tsx                 # Main app with routing setup
├── main.tsx               # React app entry point
├── index.css              # Global styles and theme variables
│
├── components/            # Reusable UI components
│   ├── admin/            # Admin-specific components
│   │   ├── AdminQuestionBank.tsx     # Question management for admins
│   │   ├── EnhancedAdminDashboard.tsx # Main admin dashboard
│   │   ├── UserManagement.tsx        # User account management
│   │   └── CategoryTopicManager.tsx  # Subject/topic management
│   │
│   ├── auth/             # Authentication components
│   │   ├── LoginPage.tsx            # Login interface
│   │   └── SignupPage.tsx           # Registration interface
│   │
│   ├── exam/             # Advanced exam and proctoring components
│   │   ├── CBTExamInterface.tsx     # Main exam interface with anti-cheating measures
│   │   ├── ExamTimer.tsx            # Precise countdown timer with auto-submit
│   │   ├── QuestionDisplay.tsx      # Individual question display with randomization
│   │   ├── AdvancedProctoring.tsx   # Multi-modal proctoring system
│   │   └── ExamSecurity.tsx         # Tab-switch and focus monitoring
│   │
│   ├── institution/      # Institution management
│   │   ├── EnhancedInstitutionDashboard.tsx # Institution dashboard
│   │   ├── StudentManagement.tsx           # Student account management
│   │   └── InstitutionSettings.tsx         # Institution preferences
│   │
│   ├── student/          # Comprehensive student interface components
│   │   ├── EnhancedStudentDashboard.tsx # Main dashboard with performance insights
│   │   ├── StudyGroupsManager.tsx       # AI-powered study group matching and management
│   │   ├── PerformanceTracker.tsx       # Advanced analytics with predictive scoring
│   │   ├── CollaborativeSessions.tsx    # Real-time collaborative study sessions
│   │   └── PersonalizedLearning.tsx     # Adaptive learning path recommendations
│   │
│   ├── ai/               # AI tutoring and intelligence components
│   │   ├── AiTutorEnhanced.tsx         # GPT-4 powered chat interface with fallbacks
│   │   ├── StudentAITutor.tsx          # Student-specific AI tutor with personalization
│   │   └── QuestionValidator.tsx       # AI-powered question validation and optimization
│   │
│   ├── layout/           # Layout and navigation
│   │   ├── DashboardLayout.tsx         # Common dashboard wrapper
│   │   ├── Sidebar.tsx                 # Navigation sidebar
│   │   └── Header.tsx                  # Top navigation bar
│   │
│   ├── system/           # System-wide components
│   │   ├── Landing.tsx                 # Homepage/landing page
│   │   ├── ThemeProvider.tsx           # Dark/light mode provider
│   │   └── Analytics.tsx               # Analytics dashboard
│   │
│   └── ui/               # shadcn/ui component library
│       ├── button.tsx    # Reusable button component
│       ├── card.tsx      # Card layout component
│       ├── form.tsx      # Form components
│       └── ...           # Many more UI primitives
│
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication state management
│   ├── use-toast.ts      # Toast notification hook
│   └── use-mobile.tsx    # Mobile device detection
│
├── lib/                  # Utility functions
│   ├── queryClient.ts    # TanStack Query configuration
│   ├── utils.ts          # General utility functions
│   └── authUtils.ts      # Authentication helpers
│
└── pages/                # Page components (organized by role)
    ├── Dashboard.tsx     # Role-based dashboard router
    ├── Login.tsx         # Login page
    ├── Home.tsx          # Home page
    ├── Exam.tsx          # Exam taking page
    ├── Practice.tsx      # Practice mode page
    │
    ├── admin/            # Admin-only pages
    │   ├── Settings.tsx  # System configuration
    │   ├── Users.tsx     # User management page
    │   └── System.tsx    # System health page
    │
    ├── institution/      # Institution-only pages
    │   └── CreateQuestions.tsx # Question creation page
    │
    └── student/          # Student-only pages
        └── Progress.tsx  # Student progress page
```

### Backend (`server/`)

```
server/
├── index.ts              # Server entry point with Express setup
├── routes.ts             # All API endpoint definitions
├── storage.ts            # Database operations and queries
├── db.ts                 # Database connection configuration
├── vite.ts               # Vite integration for development
│
└── services/             # Advanced business logic services
    ├── enhanced-openai.ts    # GPT-4 integration with intelligent fallbacks
    ├── aiTutor.ts            # Comprehensive AI tutoring with personalization
    ├── paystack.ts           # Nigerian payment processing with Paystack
    ├── proctoring.ts         # Multi-modal exam security and monitoring
    ├── analytics.ts          # Advanced performance analytics and predictions
    └── collaboration.ts      # Real-time study group and session management
```

### Shared Code (`shared/`)

```
shared/
└── schema.ts             # Database schema and TypeScript types
```

## 🔄 Data Flow Logic

### 1. Authentication Flow

```
User Login → LoginPage.tsx → POST /api/auth/demo-login → Session Created → Dashboard Route
                                                      ↓
User Data Stored in Session ← Database Query ← server/routes.ts
```

### 2. Component Data Fetching

```typescript
// Example: Admin Question Bank
useQuery({
  queryKey: ['/api/questions'],          // Cache key
  queryFn: () => apiRequest('GET', '/api/questions')  // Fetch function
})
↓
TanStack Query manages caching, loading states, error handling
↓
Component receives data and renders UI
```

### 3. Form Submission Flow

```
User Fills Form → React Hook Form Validation → onSubmit Handler
                                                      ↓
useMutation → POST/PUT/DELETE to API → Server Validation → Database Update
                                                      ↓
Query Cache Invalidation → UI Automatically Updates
```

## 🎨 UI Component Structure

### Component Hierarchy Example

```
EnhancedStudentDashboard.tsx
├── DashboardLayout.tsx (wrapper)
│   ├── Header.tsx (top navigation)
│   └── Sidebar.tsx (left navigation)
├── Tabs.tsx (tab navigation)
├── Card.tsx (content containers)
├── StudyGroupsManager.tsx (study groups)
└── PerformanceTracker.tsx (analytics)
```

### Styling Pattern

All components use Tailwind CSS with the shadcn/ui design system:

```typescript
// Example component structure
export default function MyComponent() {
  return (
    <Card className="p-6 bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button className="bg-blue-500 hover:bg-blue-600">
          Action Button
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 🗄 Database Logic

### Schema Structure (`shared/schema.ts`)

```typescript
// Example table definition using Drizzle ORM
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

### Database Operations (`server/storage.ts`)

```typescript
// Example storage interface
interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Question operations
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestionsBySubject(subjectId: number): Promise<Question[]>;
  // ... more operations
}
```

## 🚀 API Endpoint Logic

### Route Structure (`server/routes.ts`)

```typescript
// Authentication routes
app.post('/api/auth/demo-login', async (req, res) => {
  // 1. Validate request body
  // 2. Find user in database
  // 3. Create session
  // 4. Return user data
});

// CRUD routes
app.get('/api/questions', requireAuth, async (req, res) => {
  // 1. Check authentication
  // 2. Query database
  // 3. Return formatted data
});

app.post('/api/questions', requireAuth, async (req, res) => {
  // 1. Validate input with Zod
  // 2. Check permissions
  // 3. Save to database
  // 4. Return created item
});
```

## 🎯 Role-Based Logic

### Access Control Pattern

```typescript
// Middleware for role checking
function requireRole(role: string) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// Usage in routes
app.get('/api/admin/users', requireAuth, requireRole('admin'), handler);
```

### Component Role Filtering

```typescript
// In App.tsx routing
{user?.role === 'admin' && (
  <>
    <Route path="/admin/users" component={AdminUsers} />
    <Route path="/admin/settings" component={AdminSettings} />
  </>
)}

{user?.role === 'student' && (
  <>
    <Route path="/study-groups" component={StudyGroups} />
    <Route path="/practice" component={Practice} />
  </>
)}
```

## 🔄 State Management

### Client State (React)

```typescript
// Local component state
const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState({});

// Global state through context
const { user, isAuthenticated } = useAuth();
```

### Server State (TanStack Query)

```typescript
// Data fetching
const { data: questions, isLoading } = useQuery({
  queryKey: ['/api/questions'],
  queryFn: () => apiRequest('GET', '/api/questions')
});

// Data mutations
const createQuestionMutation = useMutation({
  mutationFn: (data) => apiRequest('POST', '/api/questions', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
  }
});
```

## 🎨 Theme System

### CSS Variables (`index.css`)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
}
```

### Theme Provider (`components/system/ThemeProvider.tsx`)

```typescript
// Manages light/dark mode switching
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

This overview gives you a complete understanding of how the Edrac codebase is structured and how different parts work together. Each component, API endpoint, and database operation follows consistent patterns that make development predictable and maintainable.