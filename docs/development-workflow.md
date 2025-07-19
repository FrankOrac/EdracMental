# Development Workflow Guide

Best practices and daily workflows for developing the Edrac CBT platform.

## 🚀 Daily Development Workflow

### Starting Your Development Session

```bash
# 1. Navigate to project directory
cd /path/to/edrac-cbt-platform

# 2. Pull latest changes
git pull origin main

# 3. Install any new dependencies
npm install

# 4. Start development server
npm run dev
```

### Development Process

1. **Check Current State**
   - Open browser to `http://localhost:5000`
   - Test login with demo accounts
   - Verify core features are working

2. **Plan Your Changes**
   - Review requirements
   - Identify files to modify
   - Plan database changes if needed

3. **Make Changes**
   - Follow component development patterns
   - Test as you build
   - Use browser dev tools for debugging

4. **Test Your Changes**
   - Verify functionality works
   - Test on different screen sizes
   - Check both light and dark modes

5. **Commit Your Work**
   ```bash
   git add .
   git commit -m "descriptive message about changes"
   git push origin main
   ```

## 🎯 Feature Development Process

### Adding a New Feature

#### Step 1: Database Changes (if needed)

```bash
# 1. Update schema in shared/schema.ts
# 2. Push changes to database
npm run db:push

# 3. Add storage methods in server/storage.ts
# 4. Add API endpoints in server/routes.ts
```

#### Step 2: Backend Development

```typescript
// Example: Adding a new feature
// 1. Define data types in shared/schema.ts
export const newTable = pgTable('new_table', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  // ... other fields
});

// 2. Add storage methods in server/storage.ts
async createNewItem(item: InsertNewItem): Promise<NewItem> {
  // Implementation
}

// 3. Add API routes in server/routes.ts
app.post('/api/new-items', requireAuth, async (req, res) => {
  // Implementation
});
```

#### Step 3: Frontend Development

```typescript
// 1. Create component in appropriate folder
// client/src/components/[role]/NewFeature.tsx

// 2. Add data fetching
const { data, isLoading } = useQuery({
  queryKey: ['/api/new-items'],
  queryFn: () => apiRequest('GET', '/api/new-items')
});

// 3. Add to parent component/routing
import NewFeature from '@/components/role/NewFeature';

// 4. Test integration
```

#### Step 4: Testing & Integration

```bash
# Test the feature
# 1. Verify database operations work
# 2. Test API endpoints with demo data
# 3. Test UI functionality
# 4. Test responsive design
# 5. Test both light/dark modes
```

## 🐛 Debugging Workflow

### Frontend Debugging

1. **Browser Developer Tools**
   ```bash
   # Open in browser
   F12 or Right-click → Inspect
   
   # Check Console tab for JavaScript errors
   # Check Network tab for API request issues
   # Check Elements tab for CSS/styling issues
   ```

2. **React DevTools**
   - Install React Developer Tools browser extension
   - Inspect component state and props
   - Monitor re-renders and performance

3. **Common Issues & Solutions**
   ```typescript
   // Issue: Component not re-rendering
   // Solution: Check useQuery dependencies
   const { data } = useQuery({
     queryKey: ['/api/data', dependency], // Include all dependencies
     queryFn: () => fetchData(dependency)
   });
   
   // Issue: Form not submitting
   // Solution: Check form validation errors
   console.log('Form errors:', form.formState.errors);
   
   // Issue: API request failing
   // Solution: Check network tab and server logs
   ```

### Backend Debugging

1. **Server Logs**
   ```bash
   # Check server console output
   # Look for error messages and stack traces
   # Check API request/response logs
   ```

2. **Database Debugging**
   ```bash
   # Test database connection
   npx tsx -e "import { db } from './server/db'; console.log('DB connected');"
   
   # Check database schema
   npm run db:push --dry-run
   ```

3. **API Testing**
   ```bash
   # Test endpoints with curl
   curl -X GET "http://localhost:5000/api/subjects" \
     -H "Content-Type: application/json"
   
   # Test with authentication
   curl -X GET "http://localhost:5000/api/admin/users" \
     -H "Content-Type: application/json" \
     -b "session_cookie=value"
   ```

## 📝 Code Quality & Standards

### TypeScript Best Practices

```typescript
// Use proper type definitions
interface ComponentProps {
  title: string;
  items: Item[];
  onSelect: (item: Item) => void;
}

// Avoid 'any' type
// ❌ Bad
const data: any = fetchData();

// ✅ Good
const data: UserData = fetchData();

// Use proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('Failed to complete operation');
}
```

### Component Organization

```typescript
// Good component structure
export default function MyComponent({ prop1, prop2 }: Props) {
  // 1. Hooks and state
  const [state, setState] = useState();
  const { data, isLoading } = useQuery();
  
  // 2. Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  // 3. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // 4. Early returns
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  
  // 5. Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### File Naming Conventions

```
✅ Good naming:
- UserProfile.tsx (PascalCase for components)
- useAuth.ts (camelCase for hooks)
- api-client.ts (kebab-case for utilities)
- schema.ts (lowercase for shared modules)

❌ Avoid:
- userprofile.tsx
- UseAuth.ts
- API_CLIENT.ts
- Schema.TS
```

## 🔄 Git Workflow

### Branch Management

```bash
# Create feature branch
git checkout -b feature/user-profile-enhancement

# Work on changes
git add .
git commit -m "Add user profile picture upload"

# Push feature branch
git push origin feature/user-profile-enhancement

# Merge to main (after review)
git checkout main
git merge feature/user-profile-enhancement
git push origin main
```

### Commit Message Standards

```bash
# Good commit messages
git commit -m "Add user authentication middleware"
git commit -m "Fix dashboard loading state display"
git commit -m "Update exam timer to show remaining time"
git commit -m "Remove deprecated question validation function"

# Bad commit messages
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "working on feature"
```

### Managing Changes

```bash
# Check what files changed
git status

# Review changes before committing
git diff

# Stage specific files
git add client/src/components/NewComponent.tsx
git add server/routes.ts

# Commit with descriptive message
git commit -m "Add new exam management component with API integration"
```

## 🧪 Testing Strategy

### Manual Testing Checklist

#### Authentication Testing
- [ ] Demo login works for all user roles
- [ ] Session persistence across page refreshes
- [ ] Logout functionality
- [ ] Protected routes redirect properly

#### UI Testing
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Dark mode toggle works correctly
- [ ] All buttons and links are clickable
- [ ] Forms submit and validate properly
- [ ] Loading states display correctly

#### Feature Testing
- [ ] Create, read, update, delete operations work
- [ ] API endpoints return correct data
- [ ] Error handling displays appropriate messages
- [ ] Data persists after page refresh

### Automated Testing Setup

```bash
# Add testing dependencies (when ready)
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

## 📊 Performance Optimization

### Frontend Performance

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));

// Use in component
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

### Backend Performance

```typescript
// Use database indexes for frequently queried fields
export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  email: varchar('email').notNull().unique(), // Automatically indexed
  role: varchar('role').notNull(),
}, (table) => ({
  roleIndex: index('role_idx').on(table.role), // Custom index
}));

// Optimize queries with proper joins
const usersWithProfiles = await db
  .select({
    id: users.id,
    email: users.email,
    profile: profiles
  })
  .from(users)
  .leftJoin(profiles, eq(users.id, profiles.userId))
  .where(eq(users.role, 'student'));
```

## 🔧 Environment Management

### Development vs Production

```typescript
// Use environment variables
const isDevelopment = import.meta.env.MODE === 'development';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Conditional debugging
if (isDevelopment) {
  console.log('Debug info:', data);
}

// Feature flags
const enableNewFeature = import.meta.env.VITE_ENABLE_NEW_FEATURE === 'true';
```

### Managing Dependencies

```bash
# Check for outdated packages
npm outdated

# Update dependencies carefully
npm update package-name

# Add new dependencies
npm install new-package

# Remove unused dependencies
npm uninstall unused-package
```

## 📚 Learning & Documentation

### Staying Updated

1. **Read Documentation**
   - React documentation for component patterns
   - Tailwind CSS for styling utilities
   - Drizzle ORM for database operations

2. **Code Review**
   - Review your own code before committing
   - Ask for feedback on complex features
   - Learn from existing code patterns

3. **Continuous Learning**
   - Experiment with new features in development
   - Read about TypeScript best practices
   - Learn about accessibility standards

### Documentation Updates

```bash
# Update documentation when adding features
# 1. Update component documentation
# 2. Update API documentation
# 3. Update this workflow guide if process changes
# 4. Update replit.md with architectural changes
```

This workflow guide helps maintain consistent, high-quality development practices across the Edrac CBT platform. Follow these processes to ensure smooth collaboration and maintainable code.