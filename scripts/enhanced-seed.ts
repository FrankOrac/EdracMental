import { db } from "../server/db";
import { subjects, topics, questions, users, exams, institutions } from "../shared/schema";
import { v4 as uuidv4 } from "uuid";

const enhancedSeed = async () => {
  console.log("Starting enhanced database seeding with extensive practice questions...");
  
  try {
    // Clear existing data (except users)
    console.log("Clearing existing data...");
    await db.delete(questions);
    await db.delete(exams);
    
    // Get existing subjects and topics
    const existingSubjects = await db.select().from(subjects);
    const existingTopics = await db.select().from(topics);
    
    console.log(`Found ${existingSubjects.length} subjects and ${existingTopics.length} topics`);
    
    // Create extensive practice questions
    console.log("Creating extensive practice questions...");
    const questionsData = [];
    
    // Mathematics questions
    const mathSubject = existingSubjects.find(s => s.name === "Mathematics");
    const algebraTopic = existingTopics.find(t => t.name === "Algebra");
    const geometryTopic = existingTopics.find(t => t.name === "Geometry");
    const calculusTopic = existingTopics.find(t => t.name === "Calculus");
    const statisticsTopic = existingTopics.find(t => t.name === "Statistics");
    const trigonometryTopic = existingTopics.find(t => t.name === "Trigonometry");
    
    if (mathSubject && algebraTopic) {
      questionsData.push(
        {
          text: "Solve for x: 2x + 5 = 17",
          type: "multiple_choice" as const,
          options: ["x = 6", "x = 5", "x = 7", "x = 8"],
          correctAnswer: "x = 6",
          explanation: "2x + 5 = 17, subtract 5: 2x = 12, divide by 2: x = 6",
          difficulty: "easy" as const,
          topicId: algebraTopic.id,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true
        },
        {
          text: "If y = 3x - 2, what is y when x = 4?",
          type: "multiple_choice" as const,
          options: ["8", "10", "12", "14"],
          correctAnswer: "10",
          explanation: "y = 3x - 2, substitute x = 4: y = 3(4) - 2 = 12 - 2 = 10",
          difficulty: "easy" as const,
          topicId: algebraTopic.id,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true
        },
        {
          text: "Factorize: x² + 5x + 6",
          type: "multiple_choice" as const,
          options: ["(x + 2)(x + 3)", "(x + 1)(x + 6)", "(x - 2)(x - 3)", "(x + 4)(x + 2)"],
          correctAnswer: "(x + 2)(x + 3)",
          explanation: "Find two numbers that multiply to 6 and add to 5: 2 and 3. So x² + 5x + 6 = (x + 2)(x + 3)",
          difficulty: "medium" as const,
          topicId: algebraTopic.id,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: 2,
          isActive: true
        },
        {
          text: "Solve the quadratic equation: x² - 7x + 12 = 0",
          type: "multiple_choice" as const,
          options: ["x = 3, x = 4", "x = 2, x = 6", "x = 1, x = 12", "x = 3, x = 5"],
          correctAnswer: "x = 3, x = 4",
          explanation: "Factor: (x - 3)(x - 4) = 0, so x = 3 or x = 4",
          difficulty: "medium" as const,
          topicId: algebraTopic.id,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: 2,
          isActive: true
        }
      );
    }
    
    if (mathSubject && geometryTopic) {
      questionsData.push(
        {
          text: "What is the perimeter of a rectangle with length 8cm and width 5cm?",
          type: "multiple_choice" as const,
          options: ["26cm", "24cm", "28cm", "30cm"],
          correctAnswer: "26cm",
          explanation: "Perimeter = 2(length + width) = 2(8 + 5) = 2(13) = 26cm",
          difficulty: "easy" as const,
          topicId: geometryTopic.id,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true
        },
        {
          text: "Find the area of a triangle with base 12cm and height 8cm",
          type: "multiple_choice" as const,
          options: ["48cm²", "96cm²", "24cm²", "60cm²"],
          correctAnswer: "48cm²",
          explanation: "Area of triangle = ½ × base × height = ½ × 12 × 8 = 48cm²",
          difficulty: "easy" as const,
          topicId: geometryTopic.id,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true
        },
        {
          text: "What is the volume of a cube with side length 4cm?",
          type: "multiple_choice" as const,
          options: ["64cm³", "48cm³", "32cm³", "16cm³"],
          correctAnswer: "64cm³",
          explanation: "Volume of cube = side³ = 4³ = 64cm³",
          difficulty: "medium" as const,
          topicId: geometryTopic.id,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: 2,
          isActive: true
        }
      );
    }
    
    // English Language questions
    const englishSubject = existingSubjects.find(s => s.name === "English Language");
    const grammarTopic = existingTopics.find(t => t.name === "Grammar");
    const comprehensionTopic = existingTopics.find(t => t.name === "Comprehension");
    const vocabularyTopic = existingTopics.find(t => t.name === "Vocabulary");
    
    if (englishSubject && grammarTopic) {
      questionsData.push(
        {
          text: "Choose the correct form: 'She _____ to the market yesterday.'",
          type: "multiple_choice" as const,
          options: ["go", "goes", "went", "going"],
          correctAnswer: "went",
          explanation: "'Yesterday' indicates past tense, so the correct form is 'went'",
          difficulty: "easy" as const,
          topicId: grammarTopic.id,
          subjectId: englishSubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true
        },
        {
          text: "Identify the subject in: 'The beautiful flowers bloom in spring.'",
          type: "multiple_choice" as const,
          options: ["flowers", "beautiful", "bloom", "spring"],
          correctAnswer: "flowers",
          explanation: "The subject is 'flowers' - it's what the sentence is about. 'Beautiful' is an adjective modifying 'flowers'",
          difficulty: "easy" as const,
          topicId: grammarTopic.id,
          subjectId: englishSubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true
        },
        {
          text: "Choose the correct sentence:",
          type: "multiple_choice" as const,
          options: [
            "Each of the students have submitted their assignment",
            "Each of the students has submitted their assignment",
            "Each of the students have submitted his assignment",
            "Each of the students has submitted his assignment"
          ],
          correctAnswer: "Each of the students has submitted his assignment",
          explanation: "'Each' is singular, so use 'has' and 'his' (though 'their' is increasingly accepted)",
          difficulty: "medium" as const,
          topicId: grammarTopic.id,
          subjectId: englishSubject.id,
          examType: "jamb" as const,
          points: 2,
          isActive: true
        }
      );
    }
    
    if (englishSubject && vocabularyTopic) {
      questionsData.push(
        {
          text: "What does 'ubiquitous' mean?",
          type: "multiple_choice" as const,
          options: ["rare", "present everywhere", "ancient", "beautiful"],
          correctAnswer: "present everywhere",
          explanation: "'Ubiquitous' means existing or being everywhere at the same time",
          difficulty: "medium" as const,
          topicId: vocabularyTopic.id,
          subjectId: englishSubject.id,
          examType: "jamb" as const,
          points: 2,
          isActive: true
        },
        {
          text: "Choose the synonym for 'magnificent':",
          type: "multiple_choice" as const,
          options: ["ordinary", "splendid", "terrible", "small"],
          correctAnswer: "splendid",
          explanation: "'Magnificent' and 'splendid' both mean impressive and beautiful",
          difficulty: "easy" as const,
          topicId: vocabularyTopic.id,
          subjectId: englishSubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true
        }
      );
    }
    
    // Physics questions
    const physicsSubject = existingSubjects.find(s => s.name === "Physics");
    const mechanicsTopic = existingTopics.find(t => t.name === "Mechanics");
    const electricityTopic = existingTopics.find(t => t.name === "Electricity");
    const wavesTopic = existingTopics.find(t => t.name === "Waves");
    
    if (physicsSubject && mechanicsTopic) {
      questionsData.push(
        {
          text: "What is the unit of force in the SI system?",
          type: "multiple_choice" as const,
          options: ["Joule", "Newton", "Watt", "Pascal"],
          correctAnswer: "Newton",
          explanation: "The SI unit of force is Newton (N), named after Sir Isaac Newton",
          difficulty: "easy" as const,
          topicId: mechanicsTopic.id,
          subjectId: physicsSubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true
        },
        {
          text: "A ball is thrown upward with initial velocity 20 m/s. What is its velocity after 2 seconds? (g = 10 m/s²)",
          type: "multiple_choice" as const,
          options: ["0 m/s", "10 m/s", "-10 m/s", "20 m/s"],
          correctAnswer: "0 m/s",
          explanation: "v = u - gt = 20 - (10)(2) = 20 - 20 = 0 m/s",
          difficulty: "medium" as const,
          topicId: mechanicsTopic.id,
          subjectId: physicsSubject.id,
          examType: "jamb" as const,
          points: 2,
          isActive: true
        }
      );
    }
    
    // Chemistry questions
    const chemistrySubject = existingSubjects.find(s => s.name === "Chemistry");
    const atomicTopic = existingTopics.find(t => t.name === "Atomic Structure");
    const bondingTopic = existingTopics.find(t => t.name === "Chemical Bonding");
    const acidsTopic = existingTopics.find(t => t.name === "Acids and Bases");
    
    if (chemistrySubject && atomicTopic) {
      questionsData.push(
        {
          text: "What is the atomic number of oxygen?",
          type: "multiple_choice" as const,
          options: ["6", "7", "8", "9"],
          correctAnswer: "8",
          explanation: "Oxygen has atomic number 8, meaning it has 8 protons in its nucleus",
          difficulty: "easy" as const,
          topicId: atomicTopic.id,
          subjectId: chemistrySubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true
        },
        {
          text: "How many electrons can the second electron shell hold?",
          type: "multiple_choice" as const,
          options: ["2", "6", "8", "18"],
          correctAnswer: "8",
          explanation: "The second electron shell (L shell) can hold a maximum of 8 electrons",
          difficulty: "medium" as const,
          topicId: atomicTopic.id,
          subjectId: chemistrySubject.id,
          examType: "jamb" as const,
          points: 2,
          isActive: true
        }
      );
    }
    
    // Biology questions
    const biologySubject = existingSubjects.find(s => s.name === "Biology");
    const biologyTopics = existingTopics.filter(t => t.subjectId === biologySubject?.id);
    
    if (biologySubject && biologyTopics.length > 0) {
      questionsData.push(
        {
          text: "What is the basic unit of life?",
          type: "multiple_choice" as const,
          options: ["Atom", "Molecule", "Cell", "Organ"],
          correctAnswer: "Cell",
          explanation: "The cell is considered the basic structural and functional unit of all living organisms",
          difficulty: "easy" as const,
          topicId: biologyTopics[0].id,
          subjectId: biologySubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true
        },
        {
          text: "Which organelle is responsible for photosynthesis in plant cells?",
          type: "multiple_choice" as const,
          options: ["Nucleus", "Mitochondria", "Chloroplast", "Ribosome"],
          correctAnswer: "Chloroplast",
          explanation: "Chloroplasts contain chlorophyll and are the sites of photosynthesis in plant cells",
          difficulty: "medium" as const,
          topicId: biologyTopics[0].id,
          subjectId: biologySubject.id,
          examType: "jamb" as const,
          points: 2,
          isActive: true
        }
      );
    }
    
    // Insert all questions
    if (questionsData.length > 0) {
      await db.insert(questions).values(questionsData);
      console.log(`Created ${questionsData.length} practice questions`);
    }
    
    // Create comprehensive practice exams
    console.log("Creating practice exams...");
    const examsData = [
      {
        id: uuidv4(),
        title: "JAMB Mathematics Practice Test",
        description: "Comprehensive mathematics practice for JAMB preparation",
        type: "practice" as const,
        examCategory: "jamb" as const,
        duration: 60,
        totalQuestions: 20,
        passingScore: 50,
        subjects: [mathSubject?.id],
        difficulty: "mixed" as const,
        instructions: "Answer all questions. Each question carries equal marks.",
        isPublic: true,
        isActive: true,
        createdBy: "admin-user-id",
        settings: {
          allowReview: true,
          showCorrectAnswers: true,
          randomizeQuestions: true,
          antiCheating: false
        }
      },
      {
        id: uuidv4(),
        title: "English Language Mock Exam",
        description: "Complete English language preparation test",
        type: "mock" as const,
        examCategory: "jamb" as const,
        duration: 90,
        totalQuestions: 30,
        passingScore: 60,
        subjects: [englishSubject?.id],
        difficulty: "medium" as const,
        instructions: "Choose the best answer for each question. Time limit is strictly enforced.",
        isPublic: true,
        isActive: true,
        createdBy: "admin-user-id",
        settings: {
          allowReview: false,
          showCorrectAnswers: false,
          randomizeQuestions: true,
          antiCheating: true
        }
      },
      {
        id: uuidv4(),
        title: "Physics Fundamentals Quiz",
        description: "Basic physics concepts and problem solving",
        type: "practice" as const,
        examCategory: "jamb" as const,
        duration: 45,
        totalQuestions: 15,
        passingScore: 40,
        subjects: [physicsSubject?.id],
        difficulty: "easy" as const,
        instructions: "Practice exam for physics fundamentals. Take your time to understand each concept.",
        isPublic: true,
        isActive: true,
        createdBy: "admin-user-id",
        settings: {
          allowReview: true,
          showCorrectAnswers: true,
          randomizeQuestions: false,
          antiCheating: false
        }
      },
      {
        id: uuidv4(),
        title: "Chemistry Lab Concepts",
        description: "Laboratory-based chemistry questions",
        type: "practice" as const,
        examCategory: "jamb" as const,
        duration: 40,
        totalQuestions: 12,
        passingScore: 50,
        subjects: [chemistrySubject?.id],
        difficulty: "medium" as const,
        instructions: "Focus on practical chemistry applications and laboratory procedures.",
        isPublic: true,
        isActive: true,
        createdBy: "admin-user-id",
        settings: {
          allowReview: true,
          showCorrectAnswers: true,
          randomizeQuestions: true,
          antiCheating: false
        }
      },
      {
        id: uuidv4(),
        title: "Biology Essentials Test",
        description: "Core biology concepts for exam preparation",
        type: "practice" as const,
        examCategory: "jamb" as const,
        duration: 50,
        totalQuestions: 18,
        passingScore: 55,
        subjects: [biologySubject?.id],
        difficulty: "medium" as const,
        instructions: "Comprehensive test covering major biology topics.",
        isPublic: true,
        isActive: true,
        createdBy: "admin-user-id",
        settings: {
          allowReview: true,
          showCorrectAnswers: true,
          randomizeQuestions: true,
          antiCheating: false
        }
      },
      {
        id: uuidv4(),
        title: "Mixed Science Challenge",
        description: "Combined physics, chemistry, and biology questions",
        type: "mock" as const,
        examCategory: "jamb" as const,
        duration: 120,
        totalQuestions: 40,
        passingScore: 65,
        subjects: [physicsSubject?.id, chemistrySubject?.id, biologySubject?.id].filter(Boolean),
        difficulty: "hard" as const,
        instructions: "Advanced mixed science exam. Test your knowledge across multiple subjects.",
        isPublic: true,
        isActive: true,
        createdBy: "admin-user-id",
        settings: {
          allowReview: false,
          showCorrectAnswers: false,
          randomizeQuestions: true,
          antiCheating: true
        }
      }
    ];
    
    await db.insert(exams).values(examsData);
    console.log(`Created ${examsData.length} practice exams`);
    
    console.log("Enhanced database seeding completed successfully!");
    console.log(`Total questions created: ${questionsData.length}`);
    console.log(`Total exams created: ${examsData.length}`);
    
  } catch (error) {
    console.error("Error during enhanced seeding:", error);
    throw error;
  }
};

// Run the seed function
enhancedSeed().catch(console.error);

export default enhancedSeed;