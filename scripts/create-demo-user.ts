import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function createDemoUser() {
  try {
    // Create demo users to match LoginPage
    const demoUsers = [
      {
        id: "demo-student-123",
        email: "student@edrac.com",
        firstName: "Test",
        lastName: "Student",
        role: "student",
        subscriptionPlan: "free",
      },
      {
        id: "demo-student-jane",
        email: "jane.student@edrac.com",
        firstName: "Jane",
        lastName: "Doe",
        role: "student",
        subscriptionPlan: "premium",
      },
      {
        id: "demo-institution-123",
        email: "institution@edrac.com",
        firstName: "Institution",
        lastName: "Manager",
        role: "institution",
        subscriptionPlan: "premium",
      },
      {
        id: "demo-admin-123",
        email: "admin@edrac.com",
        firstName: "System",
        lastName: "Administrator",
        role: "admin",
        subscriptionPlan: "premium",
      }
    ];

    for (const userData of demoUsers) {
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();

      console.log(`Demo user created: ${user.email} (${user.role})`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating demo user:", error);
    process.exit(1);
  }
}

createDemoUser();