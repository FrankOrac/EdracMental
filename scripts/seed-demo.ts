import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, institutions, subjects, topics, questions, exams } from "../shared/schema.js";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function seedDemo() {
  console.log("🌱 Seeding demo data...");

  try {
    // Clean existing data
    console.log("🧹 Cleaning existing demo data...");
    await db.delete(questions);
    await db.delete(topics);
    await db.delete(subjects);
    await db.delete(exams);
    await db.delete(institutions);
    await db.delete(users).where(eq(users.email, "admin@edrac.com"));
    await db.delete(users).where(eq(users.email, "institution@edrac.com"));
    await db.delete(users).where(eq(users.email, "student@edrac.com"));

    // Create demo users
    console.log("👥 Creating demo users...");
    
    const adminId = uuidv4();
    const institutionId = uuidv4();
    const studentId = uuidv4();
    const demoInstitutionId = uuidv4();

    await db.insert(users).values([
      {
        id: adminId,
        email: "admin@edrac.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        subscriptionPlan: "premium",
        isEnabled: true,
      },
      {
        id: institutionId,
        email: "institution@edrac.com",
        firstName: "Institution",
        lastName: "Admin",
        role: "institution",
        subscriptionPlan: "institution",
        institutionId: demoInstitutionId,
        isEnabled: true,
      },
      {
        id: studentId,
        email: "student@edrac.com",
        firstName: "Demo",
        lastName: "Student",
        role: "student",
        subscriptionPlan: "free",
        institutionId: demoInstitutionId,
        isEnabled: true,
      },
    ]);

    // Create demo institution
    console.log("🏫 Creating demo institution...");
    await db.insert(institutions).values({
      id: demoInstitutionId,
      name: "Demo Secondary School",
      type: "school",
      contactEmail: "contact@demoschool.edu.ng",
      contactPhone: "+234 801 234 5678",
      address: "123 Education Street, Lagos, Nigeria",
      subscriptionPlan: "premium",
      ownerId: institutionId,
      settings: {
        allowStudentRegistration: true,
        examRetakeLimit: 3,
        defaultExamDuration: 60,
      },
      isEnabled: true,
    });

    // Create subjects
    console.log("📚 Creating subjects...");
    const subjectsData = [
      { name: "Mathematics", code: "MTH", category: "jamb" as const, description: "Mathematics for JAMB examination" },
      { name: "English Language", code: "ENG", category: "jamb" as const, description: "English Language for JAMB examination" },
      { name: "Physics", code: "PHY", category: "jamb" as const, description: "Physics for JAMB examination" },
      { name: "Chemistry", code: "CHE", category: "jamb" as const, description: "Chemistry for JAMB examination" },
      { name: "Biology", code: "BIO", category: "jamb" as const, description: "Biology for JAMB examination" },
      { name: "Computer Science", code: "CMP", category: "jamb" as const, description: "Computer Science for JAMB examination" },
      { name: "Literature in English", code: "LIT", category: "waec" as const, description: "Literature in English for WAEC examination" },
      { name: "Geography", code: "GEO", category: "waec" as const, description: "Geography for WAEC examination" },
    ];

    const insertedSubjects = await db.insert(subjects).values(subjectsData).returning();

    // Create topics
    console.log("📖 Creating topics...");
    const topicsData: Array<{
      name: string;
      subjectId: number;
      difficulty: "easy" | "medium" | "hard";
      classLevel: string;
    }> = [];
    for (const subject of insertedSubjects) {
      if (subject.code === "MTH") {
        topicsData.push(
          { name: "Algebra", subjectId: subject.id, difficulty: "medium" as const, classLevel: "SS3" },
          { name: "Geometry", subjectId: subject.id, difficulty: "hard" as const, classLevel: "SS3" },
          { name: "Trigonometry", subjectId: subject.id, difficulty: "hard" as const, classLevel: "SS3" },
          { name: "Calculus", subjectId: subject.id, difficulty: "hard" as const, classLevel: "SS3" }
        );
      } else if (subject.code === "ENG") {
        topicsData.push(
          { name: "Comprehension", subjectId: subject.id, difficulty: "medium" as const, classLevel: "SS3" },
          { name: "Grammar", subjectId: subject.id, difficulty: "easy" as const, classLevel: "SS3" },
          { name: "Essay Writing", subjectId: subject.id, difficulty: "medium" as const, classLevel: "SS3" }
        );
      } else if (subject.code === "PHY") {
        topicsData.push(
          { name: "Mechanics", subjectId: subject.id, difficulty: "medium" as const, classLevel: "SS3" },
          { name: "Electricity", subjectId: subject.id, difficulty: "hard" as const, classLevel: "SS3" },
          { name: "Waves and Optics", subjectId: subject.id, difficulty: "hard" as const, classLevel: "SS3" }
        );
      }
    }

    const insertedTopics = await db.insert(topics).values(topicsData).returning();

    // Create sample questions
    console.log("❓ Creating sample questions...");
    const questionsData: Array<{
      text: string;
      type: "multiple_choice" | "essay" | "true_false";
      options: Array<{ id: string; text: string }>;
      correctAnswer: string;
      explanation: string;
      difficulty: "easy" | "medium" | "hard";
      subjectId: number;
      examType: "jamb" | "waec" | "neco" | "gce" | "custom";
      points: number;
      createdBy: string;
    }> = [];
    
    // Mathematics questions
    const mathSubject = insertedSubjects.find(s => s.code === "MTH");
    if (mathSubject) {
      questionsData.push(
        {
          text: "If 2x + 3 = 11, what is the value of x?",
          type: "multiple_choice" as const,
          options: [
            { id: "A", text: "3" },
            { id: "B", text: "4" },
            { id: "C", text: "5" },
            { id: "D", text: "6" }
          ],
          correctAnswer: "B",
          explanation: "Solving: 2x + 3 = 11, subtract 3 from both sides: 2x = 8, divide by 2: x = 4",
          difficulty: "easy" as const,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: 1,
          createdBy: adminId,
        },
        {
          text: "What is the area of a circle with radius 7cm? (Use π = 22/7)",
          type: "multiple_choice" as const,
          options: [
            { id: "A", text: "154 cm²" },
            { id: "B", text: "144 cm²" },
            { id: "C", text: "164 cm²" },
            { id: "D", text: "174 cm²" }
          ],
          correctAnswer: "A",
          explanation: "Area = πr² = (22/7) × 7² = (22/7) × 49 = 22 × 7 = 154 cm²",
          difficulty: "medium" as const,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: 1,
          createdBy: adminId,
        }
      );
    }

    // English questions
    const engSubject = insertedSubjects.find(s => s.code === "ENG");
    if (engSubject) {
      questionsData.push(
        {
          text: "Choose the correct form: 'The books _____ on the table.'",
          type: "multiple_choice" as const,
          options: [
            { id: "A", text: "is" },
            { id: "B", text: "are" },
            { id: "C", text: "was" },
            { id: "D", text: "were" }
          ],
          correctAnswer: "B",
          explanation: "'Books' is plural, so the correct verb form is 'are'.",
          difficulty: "easy" as const,
          subjectId: engSubject.id,
          examType: "jamb" as const,
          points: 1,
          createdBy: adminId,
        },
        {
          text: "What is the meaning of the idiom 'Break the ice'?",
          type: "multiple_choice" as const,
          options: [
            { id: "A", text: "To start a conversation" },
            { id: "B", text: "To break something cold" },
            { id: "C", text: "To end a relationship" },
            { id: "D", text: "To solve a problem" }
          ],
          correctAnswer: "A",
          explanation: "'Break the ice' means to initiate conversation in a social setting or to overcome initial tension.",
          difficulty: "medium" as const,
          subjectId: engSubject.id,
          examType: "jamb" as const,
          points: 1,
          createdBy: adminId,
        }
      );
    }

    // Physics questions
    const phySubject = insertedSubjects.find(s => s.code === "PHY");
    if (phySubject) {
      questionsData.push(
        {
          text: "What is the SI unit of force?",
          type: "multiple_choice" as const,
          options: [
            { id: "A", text: "Joule" },
            { id: "B", text: "Newton" },
            { id: "C", text: "Watt" },
            { id: "D", text: "Pascal" }
          ],
          correctAnswer: "B",
          explanation: "The SI unit of force is Newton (N), named after Sir Isaac Newton.",
          difficulty: "easy" as const,
          subjectId: phySubject.id,
          examType: "jamb" as const,
          points: 1,
          createdBy: adminId,
        }
      );
    }

    await db.insert(questions).values(questionsData);

    // Create sample exams
    console.log("📝 Creating sample exams...");
    await db.insert(exams).values([
      {
        id: uuidv4(),
        title: "JAMB Mathematics Practice Test",
        description: "Practice test for JAMB Mathematics examination",
        type: "practice",
        examCategory: "jamb",
        duration: 60,
        totalQuestions: 40,
        passingScore: 50,
        subjects: [mathSubject?.id],
        difficulty: "mixed",
        instructions: "Answer all questions. Each question carries 1 mark. Choose the best option from A-D.",
        isPublic: true,
        createdBy: adminId,
        settings: {
          shuffleQuestions: true,
          shuffleOptions: true,
          showResults: true,
          allowRetake: true,
        },
      },
      {
        id: uuidv4(),
        title: "JAMB English Language Mock Exam",
        description: "Mock examination for JAMB English Language",
        type: "mock",
        examCategory: "jamb",
        duration: 90,
        totalQuestions: 60,
        passingScore: 60,
        subjects: [engSubject?.id],
        difficulty: "mixed",
        instructions: "This is a timed examination. Answer all questions carefully.",
        isPublic: true,
        createdBy: adminId,
        institutionId: demoInstitutionId,
        settings: {
          shuffleQuestions: true,
          shuffleOptions: false,
          showResults: false,
          allowRetake: false,
          proctoring: {
            enabled: true,
            webcam: true,
            tabSwitchDetection: true,
            focusDetection: true,
          },
        },
      },
    ]);

    console.log("✅ Demo data seeded successfully!");
    console.log("\n📋 Demo Accounts Created:");
    console.log("  👨‍💼 Admin: admin@edrac.com (password: admin)");
    console.log("  🏫 Institution: institution@edrac.com (password: institution)");
    console.log("  🎓 Student: student@edrac.com (password: student)");
    console.log("\n🎯 Demo Data Created:");
    console.log(`  📚 ${insertedSubjects.length} subjects`);
    console.log(`  📖 ${insertedTopics.length} topics`);
    console.log(`  ❓ ${questionsData.length} questions`);
    console.log("  📝 2 sample exams");
    console.log("  🏫 1 demo institution");

  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    throw error;
  } finally {
    await client.end();
  }
}



if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemo()
    .then(() => {
      console.log("🎉 Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDemo };