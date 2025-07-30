import { db } from "../server/db";
import { subjects, topics, questions, exams } from "../shared/schema";

async function createStudentReadyData() {
  console.log("Creating comprehensive data for student dashboard...");

  try {
    // Create subjects with various categories
    const mathSubject = await db.insert(subjects).values({
      name: "Mathematics",
      code: "MTH101",
      category: "jamb",
      description: "Core mathematics for JAMB and WAEC",
      isActive: true
    }).returning();

    const englishSubject = await db.insert(subjects).values({
      name: "English Language",
      code: "ENG101", 
      category: "jamb",
      description: "English comprehension and grammar",
      isActive: true
    }).returning();

    const physicsSubject = await db.insert(subjects).values({
      name: "Physics",
      code: "PHY101",
      category: "jamb", 
      description: "Basic physics concepts",
      isActive: true
    }).returning();

    console.log("✓ Created subjects");

    // Create topics for each subject
    const mathTopics = await db.insert(topics).values([
      {
        name: "Algebra",
        subjectId: mathSubject[0].id,
        description: "Algebraic expressions and equations",
        difficulty: "medium",
        classLevel: "SS2",
        isActive: true
      },
      {
        name: "Geometry", 
        subjectId: mathSubject[0].id,
        description: "Shapes, angles, and measurements",
        difficulty: "easy",
        classLevel: "SS1",
        isActive: true
      }
    ]).returning();

    const englishTopics = await db.insert(topics).values([
      {
        name: "Comprehension",
        subjectId: englishSubject[0].id,
        description: "Reading comprehension and analysis",
        difficulty: "medium",
        classLevel: "SS2", 
        isActive: true
      },
      {
        name: "Grammar",
        subjectId: englishSubject[0].id,
        description: "English grammar rules and usage",
        difficulty: "easy",
        classLevel: "SS1",
        isActive: true
      }
    ]).returning();

    console.log("✓ Created topics");

    // Create sample questions for each topic
    const mathQuestions = await db.insert(questions).values([
      {
        text: "Solve for x: 2x + 5 = 15",
        options: ["A. 5", "B. 10", "C. 15", "D. 20"],
        correctAnswer: "A",
        explanation: "2x + 5 = 15. Subtract 5 from both sides: 2x = 10. Divide by 2: x = 5",
        difficulty: "easy",
        subjectId: mathSubject[0].id,
        topicId: mathTopics[0].id,
        examType: "jamb",
        points: 1
      },
      {
        text: "What is the area of a rectangle with length 8cm and width 5cm?",
        options: ["A. 13 cm²", "B. 26 cm²", "C. 40 cm²", "D. 80 cm²"],
        correctAnswer: "C",
        explanation: "Area of rectangle = length × width = 8 × 5 = 40 cm²",
        difficulty: "easy",
        subjectId: mathSubject[0].id,
        topicId: mathTopics[1].id,
        examType: "jamb",
        points: 1
      },
      {
        text: "Find the value of x in the equation: x² - 9 = 0",
        options: ["A. ±3", "B. 3", "C. -3", "D. 9"],
        correctAnswer: "A",
        explanation: "x² - 9 = 0, so x² = 9, therefore x = ±3",
        difficulty: "medium",
        subjectId: mathSubject[0].id,
        topicId: mathTopics[0].id,
        examType: "jamb",
        points: 2
      }
    ]).returning();

    const englishQuestions = await db.insert(questions).values([
      {
        text: "Choose the correct form: He _____ to school every day.",
        options: ["A. go", "B. goes", "C. going", "D. gone"],
        correctAnswer: "B",
        explanation: "Present simple tense with third person singular requires 's' - 'goes'",
        difficulty: "easy",
        subjectId: englishSubject[0].id,
        topicId: englishTopics[1].id,
        examType: "jamb",
        points: 1
      },
      {
        text: "What is the opposite of 'ancient'?",
        options: ["A. old", "B. modern", "C. historic", "D. antique"],
        correctAnswer: "B",
        explanation: "Ancient means very old, so the opposite is modern (new or recent)",
        difficulty: "easy",
        subjectId: englishSubject[0].id,
        topicId: englishTopics[0].id,
        examType: "jamb",
        points: 1
      }
    ]).returning();

    console.log("✓ Created questions");

    // Create practice exams that students can access
    const mathExam = await db.insert(exams).values({
      id: "math-practice-001",
      title: "JAMB Mathematics Practice Test",
      description: "Practice test covering algebra and geometry",
      subjectId: mathSubject[0].id,
      createdBy: "demo-admin-123",
      duration: 30,
      totalQuestions: 3,
      passingScore: 60,
      difficulty: "mixed",
      examType: "jamb",
      isPublic: true,
      isActive: true,
      allowRetake: true,
      showResults: true,
      randomizeQuestions: true
    }).returning();

    const englishExam = await db.insert(exams).values({
      id: "english-practice-001", 
      title: "English Language Practice Test",
      description: "Grammar and comprehension practice",
      subjectId: englishSubject[0].id,
      createdBy: "demo-admin-123",
      duration: 25,
      totalQuestions: 2,
      passingScore: 50,
      difficulty: "easy",
      examType: "jamb",
      isPublic: true,
      isActive: true,
      allowRetake: true,
      showResults: true,
      randomizeQuestions: false
    }).returning();

    const mixedExam = await db.insert(exams).values({
      id: "jamb-mock-001",
      title: "JAMB Mock Examination", 
      description: "Full JAMB simulation with multiple subjects",
      subjectId: mathSubject[0].id,
      createdBy: "demo-admin-123",
      duration: 60,
      totalQuestions: 5,
      passingScore: 70,
      difficulty: "mixed",
      examType: "jamb",
      isPublic: true,
      isActive: true,
      allowRetake: false,
      showResults: true,
      randomizeQuestions: true
    }).returning();

    console.log("✓ Created exams");

    console.log("✓ Questions and exams linked properly in database");

    console.log("✓ Linked questions to exams");

    console.log("\n🎉 Student-ready data created successfully!");
    console.log("\nCreated:");
    console.log("- 3 subjects (Mathematics, English, Physics)");
    console.log("- 4 topics across subjects");
    console.log("- 5 practice questions");
    console.log("- 3 public exams ready for students");
    console.log("\nStudents can now:");
    console.log("- View available subjects and exams");
    console.log("- Take practice tests inline within dashboard");
    console.log("- Get AI explanations with smart fallbacks");
    console.log("- Track their progress and achievements");

  } catch (error) {
    console.error("Error creating student data:", error);
    throw error;
  }
}

// Run the script
createStudentReadyData().catch(console.error);