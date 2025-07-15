import { db } from "../server/db";
import { subjects, topics, questions, users, exams, institutions } from "../shared/schema";
import { v4 as uuidv4 } from "uuid";

const comprehensiveSeed = async () => {
  console.log("Starting comprehensive database seeding...");
  
  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("Clearing existing data...");
    await db.delete(questions);
    await db.delete(topics);
    await db.delete(subjects);
    await db.delete(exams);
    await db.delete(institutions);
    // Note: Not clearing users to preserve auth data
    
    // 1. Create default institution
    console.log("Creating default institution...");
    const [defaultInstitution] = await db.insert(institutions).values({
      id: uuidv4(),
      name: "Edrac Test Institution",
      address: "123 Education Street, Lagos, Nigeria",
      phone: "+234-801-234-5678",
      email: "admin@edrac-test.edu.ng",
      website: "https://edrac-test.edu.ng",
      type: "university",
      ownerId: "admin-user-id", // Will be updated after creating admin user
      subscriptionPlan: "premium",
      isActive: true
    }).returning();

    // 2. Insert comprehensive subjects with proper codes
    console.log("Creating subjects...");
    const subjectData = [
      { name: "Mathematics", code: "MTH", description: "Advanced mathematics for JAMB, WAEC, and NECO", category: "jamb", isActive: true },
      { name: "English Language", code: "ENG", description: "English language proficiency and literature", category: "jamb", isActive: true },
      { name: "Physics", code: "PHY", description: "Basic and advanced physics concepts", category: "jamb", isActive: true },
      { name: "Chemistry", code: "CHE", description: "General and organic chemistry", category: "jamb", isActive: true },
      { name: "Biology", code: "BIO", description: "Life sciences and biological concepts", category: "jamb", isActive: true },
      { name: "Government", code: "GOV", description: "Civics, politics, and government studies", category: "waec", isActive: true },
      { name: "Economics", code: "ECO", description: "Microeconomics and macroeconomics", category: "waec", isActive: true },
      { name: "Geography", code: "GEO", description: "Physical and human geography", category: "waec", isActive: true },
      { name: "Literature in English", code: "LIT", description: "English literature and literary analysis", category: "waec", isActive: true },
      { name: "Agricultural Science", code: "AGR", description: "Agricultural principles and practices", category: "neco", isActive: true }
    ];

    const insertedSubjects = await db.insert(subjects).values(subjectData).returning();
    console.log(`Created ${insertedSubjects.length} subjects`);

    // 3. Create topics for each subject
    console.log("Creating topics...");
    const topicsData = [];
    
    // Mathematics topics
    const mathSubject = insertedSubjects.find(s => s.name === "Mathematics")!;
    topicsData.push(
      { name: "Algebra", description: "Linear and quadratic equations", subjectId: mathSubject.id, difficulty: "easy", isActive: true },
      { name: "Geometry", description: "Shapes, angles, and spatial relationships", subjectId: mathSubject.id, difficulty: "medium", isActive: true },
      { name: "Calculus", description: "Differentiation and integration", subjectId: mathSubject.id, difficulty: "hard", isActive: true },
      { name: "Statistics", description: "Data analysis and probability", subjectId: mathSubject.id, difficulty: "medium", isActive: true },
      { name: "Trigonometry", description: "Trigonometric functions and identities", subjectId: mathSubject.id, difficulty: "medium", isActive: true }
    );

    // English topics
    const englishSubject = insertedSubjects.find(s => s.name === "English Language")!;
    topicsData.push(
      { name: "Grammar", description: "English grammar rules and syntax", subjectId: englishSubject.id, difficulty: "easy", isActive: true },
      { name: "Comprehension", description: "Reading comprehension skills", subjectId: englishSubject.id, difficulty: "medium", isActive: true },
      { name: "Vocabulary", description: "Word meanings and usage", subjectId: englishSubject.id, difficulty: "easy", isActive: true },
      { name: "Essay Writing", description: "Composition and essay techniques", subjectId: englishSubject.id, difficulty: "hard", isActive: true }
    );

    // Physics topics
    const physicsSubject = insertedSubjects.find(s => s.name === "Physics")!;
    topicsData.push(
      { name: "Mechanics", description: "Motion, force, and energy", subjectId: physicsSubject.id, difficulty: "medium", isActive: true },
      { name: "Electricity", description: "Electric circuits and magnetism", subjectId: physicsSubject.id, difficulty: "medium", isActive: true },
      { name: "Waves", description: "Sound, light, and wave properties", subjectId: physicsSubject.id, difficulty: "hard", isActive: true },
      { name: "Heat", description: "Temperature and thermal properties", subjectId: physicsSubject.id, difficulty: "easy", isActive: true }
    );

    // Chemistry topics
    const chemistrySubject = insertedSubjects.find(s => s.name === "Chemistry")!;
    topicsData.push(
      { name: "Atomic Structure", description: "Atoms, elements, and periodic table", subjectId: chemistrySubject.id, difficulty: "medium", isActive: true },
      { name: "Chemical Bonding", description: "Ionic, covalent, and metallic bonds", subjectId: chemistrySubject.id, difficulty: "hard", isActive: true },
      { name: "Acids and Bases", description: "pH, neutralization, and indicators", subjectId: chemistrySubject.id, difficulty: "easy", isActive: true },
      { name: "Organic Chemistry", description: "Carbon compounds and reactions", subjectId: chemistrySubject.id, difficulty: "hard", isActive: true }
    );

    const insertedTopics = await db.insert(topics).values(topicsData).returning();
    console.log(`Created ${insertedTopics.length} topics`);

    // 4. Create comprehensive questions for each topic
    console.log("Creating questions...");
    const questionsData = [];

    // Mathematics - Algebra questions
    const algebraTopic = insertedTopics.find(t => t.name === "Algebra")!;
    questionsData.push(
      {
        text: "Solve for x: 3x + 7 = 22",
        type: "multiple_choice" as const,
        options: ["x = 5", "x = 6", "x = 7", "x = 8"],
        correctAnswer: "x = 5",
        explanation: "3x + 7 = 22, subtract 7: 3x = 15, divide by 3: x = 5",
        difficulty: "easy" as const,
        topicId: algebraTopic.id,
        subjectId: mathSubject.id,
        examType: "jamb" as const,
        points: 1,
        isActive: true
      },
      {
        text: "What is the value of x² - 4x + 4 when x = 3?",
        type: "multiple_choice" as const,
        options: ["1", "2", "3", "4"],
        correctAnswer: "1",
        explanation: "Substitute x = 3: (3)² - 4(3) + 4 = 9 - 12 + 4 = 1",
        difficulty: "medium" as const,
        topicId: algebraTopic.id,
        subjectId: mathSubject.id,
        examType: "jamb" as const,
        points: 2,
        isActive: true
      }
    );

    // Mathematics - Geometry questions
    const geometryTopic = insertedTopics.find(t => t.name === "Geometry")!;
    questionsData.push(
      {
        text: "What is the area of a circle with radius 7cm? (Use π = 22/7)",
        type: "multiple_choice" as const,
        options: ["154 cm²", "144 cm²", "134 cm²", "164 cm²"],
        correctAnswer: "154 cm²",
        explanation: "Area = πr² = (22/7) × 7² = (22/7) × 49 = 154 cm²",
        difficulty: "medium" as const,
        topicId: geometryTopic.id,
        subjectId: mathSubject.id,
        examType: "jamb" as const,
        points: 2,
        isActive: true
      }
    );

    // English - Grammar questions
    const grammarTopic = insertedTopics.find(t => t.name === "Grammar")!;
    questionsData.push(
      {
        text: "Choose the correct sentence:",
        type: "multiple_choice" as const,
        options: [
          "Neither John nor his friends was present",
          "Neither John nor his friends were present", 
          "Neither John or his friends were present",
          "Neither John and his friends was present"
        ],
        correctAnswer: "Neither John nor his friends were present",
        explanation: "When using 'neither...nor' with compound subjects, the verb agrees with the subject closer to it. 'Friends' is plural, so use 'were'.",
        difficulty: "medium" as const,
        topicId: grammarTopic.id,
        subjectId: englishSubject.id,
        examType: "jamb" as const,
        points: 2,
        isActive: true
      },
      {
        text: "What is the past tense of 'go'?",
        type: "multiple_choice" as const,
        options: ["goed", "went", "gone", "going"],
        correctAnswer: "went",
        explanation: "'Go' is an irregular verb. Its past tense is 'went', not 'goed'.",
        difficulty: "easy" as const,
        topicId: grammarTopic.id,
        subjectId: englishSubject.id,
        examType: "jamb" as const,
        points: 1,
        isActive: true
      }
    );

    // Physics - Mechanics questions
    const mechanicsTopic = insertedTopics.find(t => t.name === "Mechanics")!;
    questionsData.push(
      {
        text: "A car accelerates from 0 to 20 m/s in 4 seconds. What is its acceleration?",
        type: "multiple_choice" as const,
        options: ["5 m/s²", "4 m/s²", "6 m/s²", "8 m/s²"],
        correctAnswer: "5 m/s²",
        explanation: "Acceleration = change in velocity / time = (20 - 0) / 4 = 5 m/s²",
        difficulty: "medium" as const,
        topicId: mechanicsTopic.id,
        subjectId: physicsSubject.id,
        examType: "jamb" as const,
        points: 2,
        isActive: true
      }
    );

    // Chemistry - Atomic Structure questions
    const atomicTopic = insertedTopics.find(t => t.name === "Atomic Structure")!;
    questionsData.push(
      {
        text: "How many protons does a carbon atom have?",
        type: "multiple_choice" as const,
        options: ["4", "6", "8", "12"],
        correctAnswer: "6",
        explanation: "Carbon has atomic number 6, which means it has 6 protons in its nucleus.",
        difficulty: "easy" as const,
        topicId: atomicTopic.id,
        subjectId: chemistrySubject.id,
        examType: "jamb" as const,
        points: 1,
        isActive: true
      }
    );

    await db.insert(questions).values(questionsData);
    console.log(`Created ${questionsData.length} questions`);

    // 5. Create sample exams
    console.log("Creating sample exams...");
    const examsData = [
      {
        id: uuidv4(),
        title: "JAMB Practice Test - Mathematics",
        description: "Comprehensive mathematics practice test for JAMB preparation",
        subjectIds: [mathSubject.id],
        topicIds: [algebraTopic.id, geometryTopic.id],
        difficulty: "medium" as const,
        duration: 60, // 1 hour
        totalQuestions: 10,
        passingScore: 70,
        examType: "jamb" as const,
        examCategory: "education" as const,
        type: "practice" as const,
        isPublic: true,
        status: "active" as const,
        createdBy: "system",
        institutionId: defaultInstitution.id
      },
      {
        id: uuidv4(),
        title: "English Language Mock Exam",
        description: "Practice test for English language proficiency",
        subjectIds: [englishSubject.id],
        topicIds: [grammarTopic.id],
        difficulty: "medium" as const,
        duration: 45,
        totalQuestions: 8,
        passingScore: 60,
        examType: "waec" as const,
        examCategory: "education" as const,
        type: "mock" as const,
        isPublic: true,
        status: "active" as const,
        createdBy: "system",
        institutionId: defaultInstitution.id
      },
      {
        id: uuidv4(),
        title: "General Science Quiz",
        description: "Mixed questions from Physics and Chemistry",
        subjectIds: [physicsSubject.id, chemistrySubject.id],
        topicIds: [mechanicsTopic.id, atomicTopic.id],
        difficulty: "easy" as const,
        duration: 30,
        totalQuestions: 5,
        passingScore: 50,
        examType: "custom" as const,
        examCategory: "education" as const,
        type: "quiz" as const,
        isPublic: true,
        status: "active" as const,
        createdBy: "system",
        institutionId: defaultInstitution.id
      }
    ];

    await db.insert(exams).values(examsData);
    console.log(`Created ${examsData.length} sample exams`);

    console.log("✅ Comprehensive database seeding completed successfully!");
    console.log(`
Summary:
- ${insertedSubjects.length} subjects created
- ${insertedTopics.length} topics created  
- ${questionsData.length} questions created
- ${examsData.length} sample exams created
- 1 default institution created

The platform now has comprehensive content for testing all features!
    `);

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
};

// Run the comprehensive seed
comprehensiveSeed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});