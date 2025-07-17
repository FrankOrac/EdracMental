import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function createDemoUser() {
  try {
    // Create a demo student user
    const [user] = await db
      .insert(users)
      .values({
        id: "demo-student-123",
        email: "demo@student.com",
        firstName: "Demo",
        lastName: "Student",
        role: "student",
        subscriptionPlan: "free",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: "demo@student.com",
          firstName: "Demo",
          lastName: "Student",
          role: "student",
          subscriptionPlan: "free",
          updatedAt: new Date(),
        },
      })
      .returning();

    console.log("Demo user created:", user);
    
    // Create admin user
    const [admin] = await db
      .insert(users)
      .values({
        id: "demo-admin-123",
        email: "admin@edrac.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        subscriptionPlan: "premium",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: "admin@edrac.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          subscriptionPlan: "premium",
          updatedAt: new Date(),
        },
      })
      .returning();

    console.log("Demo admin created:", admin);
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating demo user:", error);
    process.exit(1);
  }
}

createDemoUser();