# API Development Guide

Complete guide for developing backend APIs and database operations in the Edrac CBT platform.

## 🗄 Database Schema & Operations

### Understanding the Database Structure

The platform uses **PostgreSQL** with **Drizzle ORM** for type-safe database operations.

#### Key Database Tables

```typescript
// File: shared/schema.ts

// Users table - stores all user accounts
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'student', 'institution', 'admin'
  subscriptionPlan: varchar('subscription_plan', { length: 50 }).default('free'),
  institutionId: varchar('institution_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Subjects table - academic subjects like Math, English
export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 10 }).notNull(), // MTH, ENG, etc.
  description: text('description'),
  category: varchar('category', { length: 100 }).default('academic'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Questions table - exam questions
export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  options: text('options').array(), // Array of answer choices
  correctAnswer: varchar('correct_answer', { length: 10 }).notNull(),
  explanation: text('explanation'),
  difficulty: varchar('difficulty', { length: 20 }).notNull(), // 'easy', 'medium', 'hard'
  subjectId: integer('subject_id').references(() => subjects.id),
  topicId: integer('topic_id'),
  examType: varchar('exam_type', { length: 50 }).notNull(), // 'jamb', 'waec', etc.
  points: integer('points').default(1),
  createdAt: timestamp('created_at').defaultNow()
});
```

### Adding New Database Tables

#### Step 1: Define Schema

```typescript
// File: shared/schema.ts

// Example: Adding a new "courses" table
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  subjectId: integer('subject_id').references(() => subjects.id),
  instructorId: varchar('instructor_id', { length: 255 }).references(() => users.id),
  duration: integer('duration'), // in minutes
  difficulty: varchar('difficulty', { length: 20 }).default('medium'),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Create insert and select types
export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
```

#### Step 2: Push Schema to Database

```cmd
# Apply schema changes to database
npm run db:push
```

## 🛠 Storage Layer Development

The storage layer handles all database operations.

### Adding New Storage Methods

```typescript
// File: server/storage.ts

// Add methods to the IStorage interface
interface IStorage {
  // Existing methods...
  
  // Course operations
  createCourse(course: InsertCourse): Promise<Course>;
  getCourseById(id: number): Promise<Course | undefined>;
  getCoursesBySubject(subjectId: number): Promise<Course[]>;
  updateCourse(id: number, updates: Partial<Course>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  getUserCourses(userId: string): Promise<Course[]>;
}

// Implement methods in MemStorage class
class MemStorage implements IStorage {
  // Existing methods...

  async createCourse(course: InsertCourse): Promise<Course> {
    try {
      const [newCourse] = await db
        .insert(courses)
        .values({
          ...course,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return newCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      throw new Error('Failed to create course');
    }
  }

  async getCourseById(id: number): Promise<Course | undefined> {
    try {
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, id))
        .limit(1);
      
      return course;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw new Error('Failed to fetch course');
    }
  }

  async getCoursesBySubject(subjectId: number): Promise<Course[]> {
    try {
      const subjectCourses = await db
        .select()
        .from(courses)
        .where(and(
          eq(courses.subjectId, subjectId),
          eq(courses.isPublished, true)
        ))
        .orderBy(courses.createdAt);
      
      return subjectCourses;
    } catch (error) {
      console.error('Error fetching courses by subject:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  async updateCourse(id: number, updates: Partial<Course>): Promise<Course> {
    try {
      const [updatedCourse] = await db
        .update(courses)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(courses.id, id))
        .returning();
      
      if (!updatedCourse) {
        throw new Error('Course not found');
      }
      
      return updatedCourse;
    } catch (error) {
      console.error('Error updating course:', error);
      throw new Error('Failed to update course');
    }
  }

  async deleteCourse(id: number): Promise<void> {
    try {
      await db
        .delete(courses)
        .where(eq(courses.id, id));
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new Error('Failed to delete course');
    }
  }

  async getUserCourses(userId: string): Promise<Course[]> {
    try {
      const userCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.instructorId, userId))
        .orderBy(courses.createdAt);
      
      return userCourses;
    } catch (error) {
      console.error('Error fetching user courses:', error);
      throw new Error('Failed to fetch user courses');
    }
  }
}
```

## 🌐 API Endpoint Development

### Creating New API Routes

```typescript
// File: server/routes.ts

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Role-based authorization middleware
function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// Course management endpoints
app.get('/api/courses', requireAuth, async (req, res) => {
  try {
    const { subjectId, userId } = req.query;
    
    let courses;
    if (subjectId) {
      courses = await storage.getCoursesBySubject(parseInt(subjectId as string));
    } else if (userId && req.user.role === 'admin') {
      courses = await storage.getUserCourses(userId as string);
    } else if (req.user.role === 'institution') {
      courses = await storage.getUserCourses(req.user.id);
    } else {
      // Students get all published courses
      courses = await storage.getAllPublishedCourses();
    }
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/courses', requireAuth, requireRole(['admin', 'institution']), async (req, res) => {
  try {
    // Validate request body
    const validatedData = insertCourseSchema.parse(req.body);
    
    // Set instructor ID to current user if not provided
    if (!validatedData.instructorId) {
      validatedData.instructorId = req.user.id;
    }
    
    // Create course
    const newCourse = await storage.createCourse(validatedData);
    
    res.status(201).json({
      message: 'Course created successfully',
      course: newCourse
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/courses/:id', requireAuth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const course = await storage.getCourseById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user has access to this course
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      if (!course.isPublished && req.user.role === 'student') {
        return res.status(403).json({ message: 'Course not accessible' });
      }
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/courses/:id', requireAuth, requireRole(['admin', 'institution']), async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const course = await storage.getCourseById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Validate update data
    const updates = insertCourseSchema.partial().parse(req.body);
    
    // Update course
    const updatedCourse = await storage.updateCourse(courseId, updates);
    
    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/courses/:id', requireAuth, requireRole(['admin', 'institution']), async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const course = await storage.getCourseById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await storage.deleteCourse(courseId);
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

## 🔍 Complex Database Queries

### Joining Tables

```typescript
// Get courses with subject and instructor information
async getCoursesWithDetails(): Promise<CourseWithDetails[]> {
  try {
    const coursesWithDetails = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        duration: courses.duration,
        difficulty: courses.difficulty,
        isPublished: courses.isPublished,
        createdAt: courses.createdAt,
        subject: {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code
        },
        instructor: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        }
      })
      .from(courses)
      .leftJoin(subjects, eq(courses.subjectId, subjects.id))
      .leftJoin(users, eq(courses.instructorId, users.id))
      .where(eq(courses.isPublished, true))
      .orderBy(courses.createdAt);
    
    return coursesWithDetails;
  } catch (error) {
    console.error('Error fetching courses with details:', error);
    throw new Error('Failed to fetch courses with details');
  }
}
```

### Aggregation Queries

```typescript
// Get course statistics
async getCourseStatistics(): Promise<CourseStats[]> {
  try {
    const stats = await db
      .select({
        subjectId: courses.subjectId,
        subjectName: subjects.name,
        totalCourses: sql<number>`count(${courses.id})`,
        publishedCourses: sql<number>`count(case when ${courses.isPublished} then 1 end)`,
        averageDuration: sql<number>`avg(${courses.duration})`,
        difficultyDistribution: sql<object>`
          json_object(
            'easy', count(case when ${courses.difficulty} = 'easy' then 1 end),
            'medium', count(case when ${courses.difficulty} = 'medium' then 1 end),
            'hard', count(case when ${courses.difficulty} = 'hard' then 1 end)
          )
        `
      })
      .from(courses)
      .leftJoin(subjects, eq(courses.subjectId, subjects.id))
      .groupBy(courses.subjectId, subjects.name)
      .having(sql`count(${courses.id}) > 0`);
    
    return stats;
  } catch (error) {
    console.error('Error fetching course statistics:', error);
    throw new Error('Failed to fetch course statistics');
  }
}
```

### Search and Filtering

```typescript
// Search courses with filters
async searchCourses(filters: CourseFilters): Promise<Course[]> {
  try {
    let query = db.select().from(courses);
    
    const conditions = [];
    
    // Text search
    if (filters.search) {
      conditions.push(
        or(
          ilike(courses.title, `%${filters.search}%`),
          ilike(courses.description, `%${filters.search}%`)
        )
      );
    }
    
    // Subject filter
    if (filters.subjectId) {
      conditions.push(eq(courses.subjectId, filters.subjectId));
    }
    
    // Difficulty filter
    if (filters.difficulty) {
      conditions.push(eq(courses.difficulty, filters.difficulty));
    }
    
    // Published status
    if (filters.published !== undefined) {
      conditions.push(eq(courses.isPublished, filters.published));
    }
    
    // Duration range
    if (filters.minDuration) {
      conditions.push(gte(courses.duration, filters.minDuration));
    }
    if (filters.maxDuration) {
      conditions.push(lte(courses.duration, filters.maxDuration));
    }
    
    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Sorting
    switch (filters.sortBy) {
      case 'title':
        query = query.orderBy(filters.sortOrder === 'desc' ? desc(courses.title) : courses.title);
        break;
      case 'duration':
        query = query.orderBy(filters.sortOrder === 'desc' ? desc(courses.duration) : courses.duration);
        break;
      default:
        query = query.orderBy(desc(courses.createdAt));
    }
    
    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }
    
    const results = await query;
    return results;
  } catch (error) {
    console.error('Error searching courses:', error);
    throw new Error('Failed to search courses');
  }
}
```

## 🔐 Authentication & Authorization

### Session-based Authentication

```typescript
// Check if user is authenticated
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Role-based authorization
function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied',
        requiredRoles: allowedRoles,
        userRole: req.user?.role 
      });
    }
    next();
  };
}

// Resource ownership check
function requireOwnership(resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params.id;
      let resource;
      
      switch (resourceType) {
        case 'course':
          resource = await storage.getCourseById(parseInt(resourceId));
          if (resource && (resource.instructorId === req.user.id || req.user.role === 'admin')) {
            return next();
          }
          break;
        // Add more resource types as needed
      }
      
      return res.status(403).json({ message: 'Access denied' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}
```

## 📊 API Response Patterns

### Standardized Response Format

```typescript
// Success response helper
function successResponse(data: any, message?: string) {
  return {
    success: true,
    message: message || 'Operation successful',
    data: data,
    timestamp: new Date().toISOString()
  };
}

// Error response helper
function errorResponse(message: string, code?: string, details?: any) {
  return {
    success: false,
    message: message,
    code: code,
    details: details,
    timestamp: new Date().toISOString()
  };
}

// Paginated response helper
function paginatedResponse(data: any[], page: number, limit: number, total: number) {
  return {
    success: true,
    data: data,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    },
    timestamp: new Date().toISOString()
  };
}

// Usage in endpoints
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await storage.getAllCourses();
    res.json(successResponse(courses, 'Courses fetched successfully'));
  } catch (error) {
    res.status(500).json(errorResponse('Failed to fetch courses', 'FETCH_ERROR'));
  }
});
```

## 🧪 Testing API Endpoints

### Using curl for Testing

```bash
# Test GET endpoint
curl -X GET "http://localhost:5000/api/courses" \
  -H "Content-Type: application/json" \
  -b "session_cookie_name=session_value"

# Test POST endpoint
curl -X POST "http://localhost:5000/api/courses" \
  -H "Content-Type: application/json" \
  -b "session_cookie_name=session_value" \
  -d '{
    "title": "Advanced Mathematics",
    "description": "Calculus and linear algebra",
    "subjectId": 1,
    "duration": 120,
    "difficulty": "hard"
  }'

# Test with authentication
curl -X GET "http://localhost:5000/api/admin/users" \
  -H "Content-Type: application/json" \
  -b "session_cookie_name=session_value"
```

### Error Handling Best Practices

```typescript
// Comprehensive error handling
app.post('/api/courses', async (req, res) => {
  try {
    // Input validation
    const validatedData = insertCourseSchema.parse(req.body);
    
    // Business logic validation
    if (validatedData.duration < 1) {
      return res.status(400).json(
        errorResponse('Duration must be at least 1 minute', 'INVALID_DURATION')
      );
    }
    
    // Check if subject exists
    const subject = await storage.getSubjectById(validatedData.subjectId);
    if (!subject) {
      return res.status(400).json(
        errorResponse('Subject not found', 'SUBJECT_NOT_FOUND')
      );
    }
    
    // Create course
    const course = await storage.createCourse(validatedData);
    
    res.status(201).json(
      successResponse(course, 'Course created successfully')
    );
  } catch (error) {
    // Validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json(
        errorResponse('Validation failed', 'VALIDATION_ERROR', error.errors)
      );
    }
    
    // Database errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json(
        errorResponse('Course already exists', 'DUPLICATE_COURSE')
      );
    }
    
    // Generic error
    console.error('Unexpected error:', error);
    res.status(500).json(
      errorResponse('Internal server error', 'INTERNAL_ERROR')
    );
  }
});
```

This guide covers everything you need to develop robust APIs for the Edrac platform. Follow these patterns to ensure consistent, secure, and maintainable backend development.