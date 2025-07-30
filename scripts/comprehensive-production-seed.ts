import { db } from "../server/db";
import { users, subjects, topics, questions, exams } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedProductionData() {
  try {
    console.log("🌱 Starting comprehensive production seed...");

    // 1. Create/verify subjects
    const subjectsData = [
      { name: "Mathematics", code: "MATH", category: "jamb", description: "Core Mathematics for JAMB and WAEC" },
      { name: "English Language", code: "ENG", category: "jamb", description: "English Language and Literature" },
      { name: "Physics", code: "PHY", category: "jamb", description: "Physics for Science students" },
      { name: "Chemistry", code: "CHE", category: "jamb", description: "Chemistry for Science students" },
      { name: "Biology", code: "BIO", category: "jamb", description: "Biology for Science students" },
      { name: "Economics", code: "ECO", category: "jamb", description: "Economics for Social Science students" },
      { name: "Government", code: "GOV", category: "jamb", description: "Government for Social Science students" },
      { name: "Literature in English", code: "LIT", category: "jamb", description: "Literature studies" },
      { name: "Geography", code: "GEO", category: "jamb", description: "Geography for Social Science students" },
      { name: "Computer Science", code: "CSC", category: "jamb", description: "Computer Science fundamentals" }
    ];

    for (const subjectData of subjectsData) {
      const [subject] = await db
        .insert(subjects)
        .values(subjectData)
        .onConflictDoUpdate({
          target: subjects.code,
          set: { ...subjectData, updatedAt: new Date() }
        })
        .returning();
      console.log(`✓ Subject: ${subject.name}`);
    }

    // 2. Create topics for each subject
    const allSubjects = await db.select().from(subjects);
    
    for (const subject of allSubjects) {
      let topicsData = [];
      
      switch (subject.code) {
        case 'MATH':
          topicsData = [
            { name: "Algebra", difficulty: "medium", classLevel: "SS2" },
            { name: "Geometry", difficulty: "medium", classLevel: "SS2" },
            { name: "Calculus", difficulty: "hard", classLevel: "SS3" },
            { name: "Statistics", difficulty: "easy", classLevel: "SS1" },
            { name: "Trigonometry", difficulty: "medium", classLevel: "SS2" }
          ];
          break;
        case 'ENG':
          topicsData = [
            { name: "Grammar", difficulty: "easy", classLevel: "SS1" },
            { name: "Comprehension", difficulty: "medium", classLevel: "SS2" },
            { name: "Essay Writing", difficulty: "medium", classLevel: "SS2" },
            { name: "Literature Analysis", difficulty: "hard", classLevel: "SS3" },
            { name: "Vocabulary", difficulty: "easy", classLevel: "SS1" }
          ];
          break;
        case 'PHY':
          topicsData = [
            { name: "Mechanics", difficulty: "medium", classLevel: "SS2" },
            { name: "Electricity", difficulty: "medium", classLevel: "SS2" },
            { name: "Waves and Optics", difficulty: "hard", classLevel: "SS3" },
            { name: "Thermodynamics", difficulty: "hard", classLevel: "SS3" }
          ];
          break;
        case 'CHE':
          topicsData = [
            { name: "Organic Chemistry", difficulty: "hard", classLevel: "SS3" },
            { name: "Inorganic Chemistry", difficulty: "medium", classLevel: "SS2" },
            { name: "Physical Chemistry", difficulty: "hard", classLevel: "SS3" },
            { name: "Chemical Bonding", difficulty: "medium", classLevel: "SS2" }
          ];
          break;
        case 'BIO':
          topicsData = [
            { name: "Cell Biology", difficulty: "easy", classLevel: "SS1" },
            { name: "Genetics", difficulty: "hard", classLevel: "SS3" },
            { name: "Ecology", difficulty: "medium", classLevel: "SS2" },
            { name: "Human Physiology", difficulty: "medium", classLevel: "SS2" }
          ];
          break;
        default:
          topicsData = [
            { name: "Introduction", difficulty: "easy", classLevel: "SS1" },
            { name: "Advanced Topics", difficulty: "hard", classLevel: "SS3" }
          ];
      }

      for (const topicData of topicsData) {
        const [topic] = await db
          .insert(topics)
          .values({
            ...topicData,
            subjectId: subject.id,
            description: `${topicData.name} in ${subject.name}`
          })
          .onConflictDoNothing()
          .returning();
        if (topic) {
          console.log(`  ✓ Topic: ${topic.name} (${subject.name})`);
        }
      }
    }

    // 3. Create sample questions for each subject
    const allTopics = await db.select().from(topics);
    
    for (const topic of allTopics) {
      const subject = allSubjects.find(s => s.id === topic.subjectId);
      if (!subject) continue;

      // Create 5 sample questions per topic
      for (let i = 1; i <= 5; i++) {
        const questionData = {
          text: `Sample ${subject.name} question ${i} about ${topic.name}. What is the correct approach to solve this ${topic.name} problem?`,
          type: "multiple_choice" as const,
          options: [
            `Option A for ${topic.name}`,
            `Option B for ${topic.name}`,
            `Option C for ${topic.name}`,
            `Option D for ${topic.name}`
          ],
          correctAnswer: "Option A for " + topic.name,
          explanation: `This is the explanation for ${topic.name} question ${i}. The correct answer is A because it demonstrates the fundamental principle of ${topic.name}.`,
          difficulty: topic.difficulty as "easy" | "medium" | "hard",
          topicId: topic.id,
          subjectId: subject.id,
          examType: subject.category as "jamb" | "waec" | "neco" | "gce" | "custom",
          points: 1,
          createdBy: "demo-admin-123"
        };

        const [question] = await db
          .insert(questions)
          .values(questionData)
          .onConflictDoNothing()
          .returning();
        
        if (question && i === 1) {
          console.log(`    ✓ Created questions for ${topic.name}`);
        }
      }
    }

    // 4. Create sample exams
    const examData = [
      {
        title: "JAMB Mathematics Mock Exam",
        description: "Practice exam for JAMB Mathematics",
        type: "mock" as const,
        examCategory: "jamb" as const,
        duration: 60,
        totalQuestions: 40,
        passingScore: 50,
        subjects: [1], // Math subject ID
        difficulty: "mixed" as const,
        instructions: "Answer all questions. Choose the best option for each question.",
        isPublic: true,
        createdBy: "demo-admin-123"
      },
      {
        title: "WAEC English Language Practice",
        description: "WAEC English Language preparation",
        type: "practice" as const,
        examCategory: "waec" as const,
        duration: 45,
        totalQuestions: 30,
        passingScore: 40,
        subjects: [2], // English subject ID
        difficulty: "medium" as const,
        instructions: "Read each question carefully and select the most appropriate answer.",
        isPublic: true,
        createdBy: "demo-admin-123"
      },
      {
        title: "Science Combination Test",
        description: "Combined Physics, Chemistry, and Biology test",
        type: "custom" as const,
        examCategory: "custom" as const,
        duration: 90,
        totalQuestions: 60,
        passingScore: 60,
        subjects: [3, 4, 5], // Physics, Chemistry, Biology
        difficulty: "hard" as const,
        instructions: "Answer questions from all three science subjects.",
        isPublic: true,
        createdBy: "demo-admin-123"
      }
    ];

    for (const examInfo of examData) {
      const [exam] = await db
        .insert(exams)
        .values(examInfo)
        .onConflictDoNothing()
        .returning();
      
      if (exam) {
        console.log(`✓ Exam: ${exam.title}`);
      }
    }

    console.log("🎉 Production seed completed successfully!");
    console.log("📊 Data summary:");
    console.log(`- ${subjectsData.length} subjects created`);
    console.log(`- ${allTopics.length} topics created`);
    console.log(`- ${allTopics.length * 5} questions created`);
    console.log(`- ${examData.length} exams created`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

seedProductionData();