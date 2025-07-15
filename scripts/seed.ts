import { db } from "../server/db";
import { subjects, topics, questions } from "../shared/schema";

const seedData = async () => {
  console.log("Starting database seeding...");
  
  // Insert subjects
  const subjectData = [
    { name: "Mathematics", code: "MTH", description: "Core mathematics concepts", category: "jamb", isActive: true },
    { name: "English Language", code: "ENG", description: "English language and literature", category: "jamb", isActive: true },
    { name: "Physics", code: "PHY", description: "Basic physics principles", category: "jamb", isActive: true },
    { name: "Chemistry", code: "CHE", description: "Basic chemistry concepts", category: "jamb", isActive: true },
    { name: "Biology", code: "BIO", description: "Life sciences and biology", category: "jamb", isActive: true },
    { name: "Government", code: "GOV", description: "Civics and government studies", category: "waec", isActive: true },
    { name: "Economics", code: "ECO", description: "Basic economic principles", category: "waec", isActive: true },
    { name: "Geography", code: "GEO", description: "Physical and human geography", category: "waec", isActive: true },
  ];

  const insertedSubjects = await db.insert(subjects).values(subjectData).returning();
  console.log(`Inserted ${insertedSubjects.length} subjects`);

  // Insert topics for Mathematics
  const mathSubject = insertedSubjects.find(s => s.name === "Mathematics");
  if (mathSubject) {
    const mathTopics = [
      { name: "Algebra", description: "Basic algebraic operations", subjectId: mathSubject.id, difficulty: "easy", isActive: true },
      { name: "Geometry", description: "Shapes and spatial relationships", subjectId: mathSubject.id, difficulty: "medium", isActive: true },
      { name: "Calculus", description: "Differentiation and integration", subjectId: mathSubject.id, difficulty: "hard", isActive: true },
      { name: "Statistics", description: "Data analysis and probability", subjectId: mathSubject.id, difficulty: "medium", isActive: true },
    ];
    
    const insertedTopics = await db.insert(topics).values(mathTopics).returning();
    console.log(`Inserted ${insertedTopics.length} math topics`);

    // Insert sample questions for Algebra
    const algebraTopic = insertedTopics.find(t => t.name === "Algebra");
    if (algebraTopic) {
      const algebraQuestions = [
        {
          text: "What is the value of x in the equation 2x + 5 = 13?",
          type: "multiple_choice" as const,
          options: ["x = 3", "x = 4", "x = 5", "x = 6"],
          correctAnswer: "x = 4",
          explanation: "To solve 2x + 5 = 13, subtract 5 from both sides: 2x = 8, then divide by 2: x = 4",
          difficulty: "easy" as const,
          topicId: algebraTopic.id,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true,
        },
        {
          text: "Simplify: 3x² + 2x - 5x² + 7x",
          type: "multiple_choice" as const,
          options: ["-2x² + 9x", "-2x² + 5x", "8x² + 9x", "-2x² - 5x"],
          correctAnswer: "-2x² + 9x",
          explanation: "Combine like terms: 3x² - 5x² = -2x² and 2x + 7x = 9x, so the result is -2x² + 9x",
          difficulty: "medium" as const,
          topicId: algebraTopic.id,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: 2,
          isActive: true,
        }
      ];
      
      await db.insert(questions).values(algebraQuestions);
      console.log(`Inserted ${algebraQuestions.length} algebra questions`);
    }
  }

  // Insert topics for English
  const englishSubject = insertedSubjects.find(s => s.name === "English Language");
  if (englishSubject) {
    const englishTopics = [
      { name: "Grammar", description: "English grammar rules", subjectId: englishSubject.id, difficulty: "easy", isActive: true },
      { name: "Comprehension", description: "Reading comprehension", subjectId: englishSubject.id, difficulty: "medium", isActive: true },
      { name: "Vocabulary", description: "Word meanings and usage", subjectId: englishSubject.id, difficulty: "easy", isActive: true },
    ];
    
    const insertedEnglishTopics = await db.insert(topics).values(englishTopics).returning();
    console.log(`Inserted ${insertedEnglishTopics.length} English topics`);

    // Insert sample questions for Grammar
    const grammarTopic = insertedEnglishTopics.find(t => t.name === "Grammar");
    if (grammarTopic) {
      const grammarQuestions = [
        {
          text: "Choose the correct form: 'She _____ to the market yesterday.'",
          type: "multiple_choice" as const,
          options: ["go", "goes", "went", "going"],
          correctAnswer: "went",
          explanation: "The sentence refers to a past action (yesterday), so the past tense 'went' is correct.",
          difficulty: "easy" as const,
          topicId: grammarTopic.id,
          subjectId: englishSubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true,
        }
      ];
      
      await db.insert(questions).values(grammarQuestions);
      console.log(`Inserted ${grammarQuestions.length} grammar questions`);
    }
  }

  console.log("Database seeding completed successfully!");
};

// Run the seed function
seedData().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});