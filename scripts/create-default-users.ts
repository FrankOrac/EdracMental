import { db } from "../server/db";
import { users, institutions } from "../shared/schema";
import { v4 as uuidv4 } from "uuid";

const createDefaultUsers = async () => {
  console.log("Creating default user accounts for testing...");
  
  try {
    // Get the default institution
    const [defaultInstitution] = await db.select().from(institutions).limit(1);
    
    if (!defaultInstitution) {
      console.error("No institution found. Please run comprehensive seed first.");
      return;
    }

    // Default users data
    const defaultUsersData = [
      {
        id: "admin-001",
        email: "admin@edrac.com",
        firstName: "System",
        lastName: "Administrator",
        role: "admin" as const,
        subscriptionPlan: "premium" as const,
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "student-001", 
        email: "student@edrac.com",
        firstName: "Test",
        lastName: "Student",
        role: "student" as const,
        subscriptionPlan: "free" as const,
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b607?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "institution-001",
        email: "institution@edrac.com", 
        firstName: "Institution",
        lastName: "Manager",
        role: "institution" as const,
        institutionId: defaultInstitution.id,
        subscriptionPlan: "premium" as const,
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "student-002",
        email: "jane.student@edrac.com",
        firstName: "Jane",
        lastName: "Doe", 
        role: "student" as const,
        subscriptionPlan: "premium" as const,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "student-003",
        email: "michael.test@edrac.com",
        firstName: "Michael",
        lastName: "Johnson",
        role: "student" as const, 
        subscriptionPlan: "free" as const,
        profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
      }
    ];

    // Insert default users using upsert to avoid conflicts
    for (const userData of defaultUsersData) {
      await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        });
    }

    console.log(`✅ Created/updated ${defaultUsersData.length} default user accounts:`);
    console.log("📧 Admin: admin@edrac.com (System Administrator)");
    console.log("📧 Student: student@edrac.com (Test Student - Free Plan)");
    console.log("📧 Student Premium: jane.student@edrac.com (Jane Doe - Premium Plan)");
    console.log("📧 Student Free: michael.test@edrac.com (Michael Johnson - Free Plan)");
    console.log("📧 Institution: institution@edrac.com (Institution Manager - Premium Plan)");
    console.log("\n🔑 These accounts can be used for testing different role functionalities.");
    console.log("🔒 In production, users will authenticate via Replit Auth or Google OAuth.");

  } catch (error) {
    console.error("❌ Error creating default users:", error);
    throw error;
  }
};

// Run the function
createDefaultUsers().catch((error) => {
  console.error("Failed to create default users:", error);
  process.exit(1);
});