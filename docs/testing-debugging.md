# Testing & Debugging Guide

Comprehensive guide for testing and debugging the Edrac CBT platform effectively.

## 🔍 Debugging Strategies

### Frontend Debugging

#### Browser Developer Tools

```javascript
// Console debugging
console.log('Component data:', data);
console.error('Error occurred:', error);
console.table(arrayData); // For arrays/objects
console.group('API Call Debug');
console.log('Request:', request);
console.log('Response:', response);
console.groupEnd();

// Network debugging
// 1. Open DevTools (F12)
// 2. Go to Network tab
// 3. Filter by XHR/Fetch to see API calls
// 4. Check request/response headers and data
```

#### React Component Debugging

```typescript
// Debug component props and state
export default function MyComponent({ data }: Props) {
  console.log('Component rendered with data:', data);
  
  const [state, setState] = useState();
  
  // Debug state changes
  useEffect(() => {
    console.log('State changed:', state);
  }, [state]);
  
  // Debug query data
  const { data: queryData, isLoading, error } = useQuery({
    queryKey: ['/api/data'],
    queryFn: () => {
      console.log('Fetching data...');
      return apiRequest('GET', '/api/data');
    }
  });
  
  // Debug render conditions
  if (isLoading) {
    console.log('Component is loading');
    return <div>Loading...</div>;
  }
  
  if (error) {
    console.error('Component error:', error);
    return <div>Error: {error.message}</div>;
  }
  
  return <div>{/* Component content */}</div>;
}
```

#### Form Debugging

```typescript
import { useForm } from 'react-hook-form';

export default function MyForm() {
  const form = useForm();
  
  // Debug form state
  console.log('Form state:', {
    values: form.watch(),
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty
  });
  
  const onSubmit = (data) => {
    console.log('Form submitted with data:', data);
    
    // Debug form validation
    if (!form.formState.isValid) {
      console.error('Form validation errors:', form.formState.errors);
      return;
    }
    
    // Continue with submission
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Backend Debugging

#### Server-side Debugging

```typescript
// API endpoint debugging
app.get('/api/subjects', requireAuth, async (req, res) => {
  console.log('API called by user:', req.user?.id);
  console.log('Request query:', req.query);
  
  try {
    const subjects = await storage.getAllSubjects();
    console.log('Subjects fetched:', subjects.length);
    
    res.json(subjects);
  } catch (error) {
    console.error('Error in /api/subjects:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Middleware debugging
function debugMiddleware(req, res, next) {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
    user: req.user?.id,
    timestamp: new Date().toISOString()
  });
  next();
}

app.use(debugMiddleware);
```

#### Database Debugging

```typescript
// Debug database queries
async getAllSubjects(): Promise<Subject[]> {
  console.log('Executing getAllSubjects query');
  
  try {
    const start = Date.now();
    
    const subjects = await db
      .select()
      .from(subjects)
      .orderBy(subjects.name);
    
    const duration = Date.now() - start;
    console.log(`Query completed in ${duration}ms, returned ${subjects.length} subjects`);
    
    return subjects;
  } catch (error) {
    console.error('Database query failed:', error);
    console.error('Query details:', {
      table: 'subjects',
      operation: 'select',
      error: error.message
    });
    throw error;
  }
}

// Debug complex queries
async getStudentProgress(studentId: string): Promise<any> {
  console.log('Getting progress for student:', studentId);
  
  const query = db
    .select({
      subject: subjects.name,
      totalQuestions: sql<number>`count(${questions.id})`,
      correctAnswers: sql<number>`count(case when ${examResults.isCorrect} then 1 end)`
    })
    .from(subjects)
    .leftJoin(questions, eq(questions.subjectId, subjects.id))
    .leftJoin(examResults, eq(examResults.questionId, questions.id))
    .where(eq(examResults.userId, studentId))
    .groupBy(subjects.id, subjects.name);
  
  console.log('Generated SQL:', query.toSQL());
  
  const results = await query;
  console.log('Progress results:', results);
  
  return results;
}
```

## 🧪 Testing Strategies

### Manual Testing Workflows

#### User Authentication Testing

```bash
# Test all user roles
1. Login as student (student@edrac.com)
   - Verify student dashboard loads
   - Check available features
   - Test exam taking functionality

2. Login as institution (institution@edrac.com)
   - Verify institution dashboard
   - Test student management
   - Check exam creation tools

3. Login as admin (admin@edrac.com)
   - Verify admin dashboard
   - Test user management
   - Check system settings

# Test session management
1. Login successfully
2. Refresh page - should stay logged in
3. Close browser, reopen - should stay logged in
4. Logout - should redirect to login page
5. Try accessing protected route - should redirect to login
```

#### Feature Testing Checklist

```markdown
## Component Testing Checklist

### Basic Functionality
- [ ] Component renders without errors
- [ ] All buttons and links are clickable
- [ ] Forms submit correctly
- [ ] Data displays properly
- [ ] Loading states show during data fetching
- [ ] Error states display when needed

### Responsive Design
- [ ] Mobile view (320px - 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (1024px+)
- [ ] All elements properly positioned
- [ ] Text remains readable
- [ ] Buttons remain accessible

### Dark Mode
- [ ] Toggle between light and dark modes
- [ ] All colors remain readable
- [ ] No elements become invisible
- [ ] Images and icons adapt properly

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Proper ARIA labels
- [ ] Color contrast meets standards
```

#### API Testing

```bash
# Test with curl commands

# Authentication
curl -X POST "http://localhost:5000/api/auth/demo-login" \
  -H "Content-Type: application/json" \
  -d '{"email": "student@edrac.com"}'

# Protected routes
curl -X GET "http://localhost:5000/api/subjects" \
  -H "Content-Type: application/json" \
  -b "connect.sid=session_cookie_value"

# Data creation
curl -X POST "http://localhost:5000/api/questions" \
  -H "Content-Type: application/json" \
  -b "connect.sid=session_cookie_value" \
  -d '{
    "text": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": "4",
    "difficulty": "easy",
    "subjectId": 1
  }'

# Error handling
curl -X GET "http://localhost:5000/api/nonexistent" \
  -H "Content-Type: application/json"
```

### Automated Testing Setup

#### Frontend Unit Tests

```typescript
// Example test file: __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### API Integration Tests

```typescript
// Example: __tests__/api/subjects.test.ts
import { describe, test, expect } from 'vitest';
import request from 'supertest';
import app from '../server/index';

describe('Subjects API', () => {
  test('GET /api/subjects returns subjects list', async () => {
    const response = await request(app)
      .get('/api/subjects')
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });
  
  test('POST /api/subjects creates new subject', async () => {
    const newSubject = {
      name: 'Test Subject',
      code: 'TST',
      description: 'Test subject description'
    };
    
    const response = await request(app)
      .post('/api/subjects')
      .send(newSubject)
      .expect(201);
    
    expect(response.body.name).toBe(newSubject.name);
    expect(response.body.code).toBe(newSubject.code);
  });
});
```

## 🚨 Common Issues & Solutions

### Frontend Issues

#### Issue: Component Not Re-rendering

```typescript
// Problem: Component doesn't update when data changes
// Solution: Check query dependencies

// ❌ Missing dependency
const { data } = useQuery({
  queryKey: ['/api/data'],
  queryFn: () => fetchData(userId) // userId not in queryKey
});

// ✅ Include all dependencies
const { data } = useQuery({
  queryKey: ['/api/data', userId],
  queryFn: () => fetchData(userId)
});
```

#### Issue: Form Not Submitting

```typescript
// Problem: Form submission doesn't work
// Solution: Check form validation

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    name: '', // Make sure all fields have default values
    email: ''
  }
});

const onSubmit = (data) => {
  // Debug form state
  console.log('Form valid:', form.formState.isValid);
  console.log('Form errors:', form.formState.errors);
  
  if (!form.formState.isValid) {
    console.error('Form has validation errors');
    return;
  }
  
  // Continue with submission
};
```

#### Issue: API Requests Failing

```typescript
// Problem: API calls return errors
// Solution: Check authentication and error handling

const { data, error, isLoading } = useQuery({
  queryKey: ['/api/data'],
  queryFn: async () => {
    const response = await fetch('/api/data', {
      credentials: 'include' // Include session cookies
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },
  retry: (failureCount, error) => {
    // Don't retry on authentication errors
    if (error.message.includes('401')) return false;
    return failureCount < 3;
  }
});

if (error) {
  console.error('API Error:', error);
  // Handle different error types
  if (error.message.includes('401')) {
    // Redirect to login
  } else if (error.message.includes('403')) {
    // Show access denied message
  }
}
```

### Backend Issues

#### Issue: Database Connection Errors

```typescript
// Problem: Database queries fail
// Solution: Check connection and error handling

import { db } from './db';

async function testDatabaseConnection() {
  try {
    // Test basic connection
    await db.select().from(users).limit(1);
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    
    // Check specific error types
    if (error.code === 'ECONNREFUSED') {
      console.error('Database server is not running');
    } else if (error.code === '28P01') {
      console.error('Authentication failed - check credentials');
    } else if (error.code === '3D000') {
      console.error('Database does not exist');
    }
    
    throw error;
  }
}
```

#### Issue: Session Management Problems

```typescript
// Problem: User sessions not working
// Solution: Check session configuration

import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';

app.use(session({
  store: new (ConnectPgSimple(session))({
    conObject: {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Debug session middleware
app.use((req, res, next) => {
  console.log('Session debug:', {
    sessionID: req.sessionID,
    session: req.session,
    user: req.user
  });
  next();
});
```

## 📊 Performance Debugging

### Frontend Performance

```typescript
// Use React DevTools Profiler
// 1. Install React Developer Tools
// 2. Go to Profiler tab
// 3. Record component interactions
// 4. Analyze render times and causes

// Debug re-renders
const MyComponent = ({ data, callback }) => {
  console.log('Component re-rendered');
  
  // Use React.memo to prevent unnecessary re-renders
  return <div>{data}</div>;
};

export default React.memo(MyComponent, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.data === nextProps.data;
});

// Debug expensive calculations
const expensiveValue = useMemo(() => {
  console.log('Expensive calculation running');
  return heavyCalculation(data);
}, [data]);
```

### Backend Performance

```typescript
// Debug slow queries
async function debugQuery() {
  const start = performance.now();
  
  const result = await db
    .select()
    .from(largeTable)
    .where(eq(largeTable.userId, userId));
  
  const end = performance.now();
  console.log(`Query took ${end - start} milliseconds`);
  
  if (end - start > 1000) {
    console.warn('Slow query detected, consider adding indexes');
  }
  
  return result;
}

// Monitor memory usage
function logMemoryUsage() {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`
  });
}
```

## 🔧 Debugging Tools & Setup

### Development Tools

```bash
# Install helpful debugging packages
npm install --save-dev @types/debug debug

# Enable debug logging
export DEBUG=app:*
npm run dev
```

### Browser Extensions

1. **React Developer Tools**
   - Inspect component state and props
   - Profile component performance
   - Debug React Query cache

2. **Redux DevTools** (if using Redux)
   - Monitor state changes
   - Time travel debugging

3. **Lighthouse**
   - Performance auditing
   - Accessibility testing
   - SEO analysis

### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "envFile": "${workspaceFolder}/.env",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:server"]
    }
  ]
}
```

This comprehensive testing and debugging guide helps ensure the Edrac CBT platform remains stable, performant, and user-friendly throughout development.