import { db } from "../server/db";
import { 
  users, subjects, topics, questions, exams, institutions,
  examSessions, aiInteractions, learningPackages 
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const comprehensiveProductionSeed = async () => {
  console.log("🚀 Starting comprehensive production-ready database seeding...");

  try {
    // 1. Create Admin User
    console.log("📝 Creating admin user...");
    const adminUser = {
      id: "admin-123",
      email: "admin@edrac.com",
      firstName: "System",
      lastName: "Administrator",
      role: "admin" as const,
      subscriptionPlan: "admin" as const,
      isEnabled: true
    };

    await db.insert(users).values(adminUser).onConflictDoUpdate({
      target: users.email,
      set: { 
        role: adminUser.role,
        subscriptionPlan: adminUser.subscriptionPlan,
        isEnabled: adminUser.isEnabled,
        updatedAt: new Date() 
      }
    });

    // 2. Create Demo Institution
    console.log("🏫 Creating demo institution...");
    const institutionOwner = {
      id: "inst-owner-123",
      email: "institution@edrac.com",
      firstName: "Institution",
      lastName: "Administrator", 
      role: "institution" as const,
      subscriptionPlan: "institution" as const,
      institutionId: "demo-institution-123",
      isEnabled: true
    };

    await db.insert(users).values(institutionOwner).onConflictDoUpdate({
      target: users.email,
      set: { 
        role: institutionOwner.role,
        subscriptionPlan: institutionOwner.subscriptionPlan,
        institutionId: institutionOwner.institutionId,
        isEnabled: institutionOwner.isEnabled,
        updatedAt: new Date() 
      }
    });

    const demoInstitution = {
      id: "demo-institution-123",
      name: "Edrac Demo High School",
      type: "school" as const,
      contactEmail: "info@demo-school.edu.ng",
      contactPhone: "+234-801-234-5678",
      address: "123 Education Lane, Lagos, Nigeria",
      subscriptionPlan: "enterprise" as const,
      ownerId: "inst-owner-123",
      settings: {
        proctoring: {
          enabled: true,
          webcamRequired: true,
          screenRecording: true,
          aiMonitoring: true,
          tabSwitchDetection: true,
          microphoneMonitoring: true
        },
        examSettings: {
          allowReview: false,
          showResults: true,
          timeWarnings: [300, 120, 30], // 5min, 2min, 30sec warnings
          autoSubmit: true
        },
        branding: {
          logo: "/api/logos/demo-school.png",
          primaryColor: "#1e40af",
          secondaryColor: "#3b82f6"
        }
      },
      isEnabled: true
    };

    await db.insert(institutions).values(demoInstitution).onConflictDoUpdate({
      target: institutions.id,
      set: { updatedAt: new Date() }
    });

    // 3. Create Students
    console.log("👨‍🎓 Creating demo students...");
    const students = [
      {
        id: "student-demo-123",
        email: "student@edrac.com",
        firstName: "Demo",
        lastName: "Student",
        role: "student" as const,
        subscriptionPlan: "free" as const,
        institutionId: "demo-institution-123",
        isEnabled: true
      },
      {
        id: "student-jane-456",
        email: "jane.student@edrac.com",
        firstName: "Jane",
        lastName: "Doe",
        role: "student" as const,
        subscriptionPlan: "premium" as const,
        institutionId: "demo-institution-123",
        isEnabled: true
      },
      {
        id: "student-john-789",
        email: "john.student@edrac.com",
        firstName: "John",
        lastName: "Smith",
        role: "student" as const,
        subscriptionPlan: "free" as const,
        institutionId: "demo-institution-123",
        isEnabled: true
      }
    ];

    for (const student of students) {
      await db.insert(users).values(student).onConflictDoUpdate({
        target: users.email,
        set: { 
          role: student.role,
          subscriptionPlan: student.subscriptionPlan,
          institutionId: student.institutionId,
          isEnabled: student.isEnabled,
          updatedAt: new Date() 
        }
      });
    }

    // 4. Create Comprehensive Subjects
    console.log("📚 Creating comprehensive subjects...");
    const subjectsData = [
      // JAMB Core Subjects
      { name: "Mathematics", code: "MTH", category: "jamb", description: "Advanced mathematics for JAMB, WAEC, and NECO" },
      { name: "English Language", code: "ENG", category: "jamb", description: "English language proficiency and literature" },
      { name: "Physics", code: "PHY", category: "jamb", description: "Basic and advanced physics concepts" },
      { name: "Chemistry", code: "CHE", category: "jamb", description: "General and organic chemistry" },
      { name: "Biology", code: "BIO", category: "jamb", description: "Life sciences and biological concepts" },

      // WAEC Subjects
      { name: "Government", code: "GOV", category: "waec", description: "Civics, politics, and government studies" },
      { name: "Economics", code: "ECO", category: "waec", description: "Microeconomics and macroeconomics" },
      { name: "Geography", code: "GEO", category: "waec", description: "Physical and human geography" },
      { name: "Literature in English", code: "LIT", category: "waec", description: "English literature and literary analysis" },
      { name: "History", code: "HIS", category: "waec", description: "African and world history" },

      // NECO Subjects
      { name: "Agricultural Science", code: "AGR", category: "neco", description: "Agricultural principles and practices" },
      { name: "Computer Studies", code: "CMP", category: "neco", description: "Basic computer science and ICT" },
      { name: "Civic Education", code: "CIV", category: "neco", description: "Citizenship and civic responsibilities" },

      // Technical Subjects
      { name: "Further Mathematics", code: "FMT", category: "jamb", description: "Advanced mathematics for science students" },
      { name: "Technical Drawing", code: "TEC", category: "waec", description: "Technical and engineering drawing" },

      // Languages
      { name: "French", code: "FRE", category: "waec", description: "French language and culture" },
      { name: "Yoruba", code: "YOR", category: "waec", description: "Yoruba language and culture" },
      { name: "Hausa", code: "HAU", category: "waec", description: "Hausa language and culture" },
      { name: "Igbo", code: "IGB", category: "waec", description: "Igbo language and culture" },

      // Arts and Social Sciences
      { name: "Fine Arts", code: "ART", category: "waec", description: "Visual arts and creative expression" },
      { name: "Music", code: "MUS", category: "waec", description: "Music theory and practice" },
      { name: "Christian Religious Studies", code: "CRS", category: "waec", description: "Christian religious education" },
      { name: "Islamic Religious Studies", code: "IRS", category: "waec", description: "Islamic religious education" }
    ];

    const insertedSubjects = [];
    for (const subject of subjectsData) {
      try {
        const [insertedSubject] = await db.insert(subjects).values({
          ...subject,
          isActive: true
        }).returning();
        insertedSubjects.push(insertedSubject);
      } catch (error) {
        // If subject already exists, get it
        const existingSubject = await db.select().from(subjects).where(eq(subjects.code, subject.code)).limit(1);
        if (existingSubject.length > 0) {
          insertedSubjects.push(existingSubject[0]);
        }
      }
    }

    // 5. Create Topics for each subject
    console.log("📖 Creating topics for subjects...");
    const topicsData = [];

    // Mathematics Topics
    const mathSubject = insertedSubjects.find(s => s.code === "MTH");
    if (mathSubject) {
      const mathTopics = [
        "Algebra and Linear Equations", "Quadratic Equations", "Indices and Logarithms",
        "Sequences and Series", "Coordinate Geometry", "Trigonometry",
        "Calculus - Differentiation", "Calculus - Integration", "Statistics and Probability",
        "Matrices and Determinants", "Vectors", "Circle Geometry"
      ];
      mathTopics.forEach(topic => {
        topicsData.push({
          name: topic,
          subjectId: mathSubject.id,
          description: `${topic} concepts and applications`,
          difficulty: "medium" as const,
          classLevel: "SS3"
        });
      });
    }

    // English Language Topics
    const englishSubject = insertedSubjects.find(s => s.code === "ENG");
    if (englishSubject) {
      const englishTopics = [
        "Comprehension", "Summary Writing", "Essay Writing", "Letter Writing",
        "Grammar - Parts of Speech", "Grammar - Tenses", "Grammar - Concord",
        "Vocabulary Development", "Register", "Literature Texts Analysis",
        "Oral English", "Phonetics and Phonology"
      ];
      englishTopics.forEach(topic => {
        topicsData.push({
          name: topic,
          subjectId: englishSubject.id,
          description: `${topic} for English proficiency`,
          difficulty: "medium" as const,
          classLevel: "SS3"
        });
      });
    }

    // Physics Topics
    const physicsSubject = insertedSubjects.find(s => s.code === "PHY");
    if (physicsSubject) {
      const physicsTopics = [
        "Mechanics - Motion", "Mechanics - Forces", "Mechanics - Energy and Power",
        "Waves and Sound", "Light and Optics", "Heat and Thermodynamics",
        "Electricity and Magnetism", "Modern Physics", "Atomic Physics",
        "Electronics", "Fields and Potentials", "Simple Harmonic Motion"
      ];
      physicsTopics.forEach(topic => {
        topicsData.push({
          name: topic,
          subjectId: physicsSubject.id,
          description: `${topic} principles and applications`,
          difficulty: "hard" as const,
          classLevel: "SS3"
        });
      });
    }

    // Chemistry Topics
    const chemistrySubject = insertedSubjects.find(s => s.code === "CHE");
    if (chemistrySubject) {
      const chemistryTopics = [
        "Atomic Structure", "Chemical Bonding", "Periodic Table", "Chemical Reactions",
        "Acids and Bases", "Oxidation and Reduction", "Organic Chemistry - Hydrocarbons",
        "Organic Chemistry - Functional Groups", "Electrochemistry", "Chemical Equilibrium",
        "Thermochemistry", "Reaction Kinetics"
      ];
      chemistryTopics.forEach(topic => {
        topicsData.push({
          name: topic,
          subjectId: chemistrySubject.id,
          description: `${topic} concepts and reactions`,
          difficulty: "hard" as const,
          classLevel: "SS3"
        });
      });
    }

    // Biology Topics
    const biologySubject = insertedSubjects.find(s => s.code === "BIO");
    if (biologySubject) {
      const biologyTopics = [
        "Cell Biology", "Genetics and Heredity", "Evolution", "Ecology and Environment",
        "Plant Biology", "Animal Biology", "Human Physiology", "Reproduction",
        "Classification of Living Things", "Biochemistry", "Photosynthesis", "Respiration"
      ];
      biologyTopics.forEach(topic => {
        topicsData.push({
          name: topic,
          subjectId: biologySubject.id,
          description: `${topic} in living organisms`,
          difficulty: "medium" as const,
          classLevel: "SS3"
        });
      });
    }

    const insertedTopics = [];
    for (const topic of topicsData) {
      const [insertedTopic] = await db.insert(topics).values(topic).returning();
      insertedTopics.push(insertedTopic);
    }

    // 6. Create Comprehensive Questions
    console.log("❓ Creating comprehensive questions...");
    const questionsData = [];

    // Mathematics Questions
    const mathQuestions = [
      {
        text: "If 3x + 7 = 22, what is the value of x?",
        options: ["3", "5", "7", "15"],
        correctAnswer: "5",
        explanation: "3x + 7 = 22, so 3x = 15, therefore x = 5",
        difficulty: "easy" as const,
        subjectId: mathSubject?.id,
        topicId: insertedTopics.find(t => t.name === "Algebra and Linear Equations")?.id,
        examType: "jamb" as const,
        points: 1,
        createdBy: "admin-123"
      },
      {
        text: "Solve the quadratic equation x² - 5x + 6 = 0",
        options: ["x = 2, 3", "x = 1, 6", "x = -2, -3", "x = 0, 5"],
        correctAnswer: "x = 2, 3",
        explanation: "Factoring: (x-2)(x-3) = 0, so x = 2 or x = 3",
        difficulty: "medium" as const,
        subjectId: mathSubject?.id,
        topicId: insertedTopics.find(t => t.name === "Quadratic Equations")?.id,
        examType: "jamb" as const,
        points: 2,
        createdBy: "admin-123"
      },
      {
        text: "Find the derivative of f(x) = 3x² + 2x + 1",
        options: ["6x + 2", "3x + 2", "6x + 1", "3x² + 2"],
        correctAnswer: "6x + 2",
        explanation: "Using power rule: d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(1) = 0",
        difficulty: "hard" as const,
        subjectId: mathSubject?.id,
        topicId: insertedTopics.find(t => t.name === "Calculus - Differentiation")?.id,
        examType: "jamb" as const,
        points: 3,
        createdBy: "admin-123"
      }
    ];

    // English Questions
    const englishQuestions = [
      {
        text: "Choose the correct form: 'Neither John nor his friends _____ coming to the party.'",
        options: ["is", "are", "was", "were"],
        correctAnswer: "are",
        explanation: "With 'neither...nor', the verb agrees with the subject closest to it. 'Friends' is plural, so use 'are'.",
        difficulty: "medium" as const,
        subjectId: englishSubject?.id,
        topicId: insertedTopics.find(t => t.name === "Grammar - Concord")?.id,
        examType: "jamb" as const,
        points: 1,
        createdBy: "admin-123"
      },
      {
        text: "What is the main purpose of a topic sentence in a paragraph?",
        options: ["To conclude the paragraph", "To introduce the main idea", "To provide examples", "To transition to the next paragraph"],
        correctAnswer: "To introduce the main idea",
        explanation: "A topic sentence introduces and states the main idea that the paragraph will develop.",
        difficulty: "easy" as const,
        subjectId: englishSubject?.id,
        topicId: insertedTopics.find(t => t.name === "Essay Writing")?.id,
        examType: "jamb" as const,
        points: 1,
        createdBy: "admin-123"
      }
    ];

    // Physics Questions
    const physicsQuestions = [
      {
        text: "A car accelerates from rest at 2 m/s². What is its velocity after 5 seconds?",
        options: ["5 m/s", "7 m/s", "10 m/s", "12 m/s"],
        correctAnswer: "10 m/s",
        explanation: "Using v = u + at: v = 0 + (2)(5) = 10 m/s",
        difficulty: "easy" as const,
        subjectId: physicsSubject?.id,
        topicId: insertedTopics.find(t => t.name === "Mechanics - Motion")?.id,
        examType: "jamb" as const,
        points: 2,
        createdBy: "admin-123"
      },
      {
        text: "What is the wavelength of a wave with frequency 50 Hz and speed 300 m/s?",
        options: ["6 m", "15 m", "150 m", "15000 m"],
        correctAnswer: "6 m",
        explanation: "Using λ = v/f: λ = 300/50 = 6 m",
        difficulty: "medium" as const,
        subjectId: physicsSubject?.id,
        topicId: insertedTopics.find(t => t.name === "Waves and Sound")?.id,
        examType: "jamb" as const,
        points: 2,
        createdBy: "admin-123"
      }
    ];

    // Chemistry Questions
    const chemistryQuestions = [
      {
        text: "What is the atomic number of carbon?",
        options: ["4", "6", "8", "12"],
        correctAnswer: "6",
        explanation: "Carbon has 6 protons, which determines its atomic number.",
        difficulty: "easy" as const,
        subjectId: chemistrySubject?.id,
        topicId: insertedTopics.find(t => t.name === "Atomic Structure")?.id,
        examType: "jamb" as const,
        points: 1,
        createdBy: "admin-123"
      },
      {
        text: "In the equation 2H₂ + O₂ → 2H₂O, what type of reaction is this?",
        options: ["Decomposition", "Synthesis", "Single replacement", "Double replacement"],
        correctAnswer: "Synthesis",
        explanation: "This is a synthesis reaction where two or more substances combine to form a single product.",
        difficulty: "medium" as const,
        subjectId: chemistrySubject?.id,
        topicId: insertedTopics.find(t => t.name === "Chemical Reactions")?.id,
        examType: "jamb" as const,
        points: 2,
        createdBy: "admin-123"
      }
    ];

    // Biology Questions
    const biologyQuestions = [
      {
        text: "What is the basic unit of life?",
        options: ["Tissue", "Organ", "Cell", "Organism"],
        correctAnswer: "Cell",
        explanation: "The cell is the smallest structural and functional unit of life.",
        difficulty: "easy" as const,
        subjectId: biologySubject?.id,
        topicId: insertedTopics.find(t => t.name === "Cell Biology")?.id,
        examType: "jamb" as const,
        points: 1,
        createdBy: "admin-123"
      },
      {
        text: "What process do plants use to convert sunlight into chemical energy?",
        options: ["Respiration", "Photosynthesis", "Transpiration", "Germination"],
        correctAnswer: "Photosynthesis",
        explanation: "Photosynthesis is the process by which plants convert light energy into chemical energy (glucose).",
        difficulty: "easy" as const,
        subjectId: biologySubject?.id,
        topicId: insertedTopics.find(t => t.name === "Photosynthesis")?.id,
        examType: "jamb" as const,
        points: 1,
        createdBy: "admin-123"
      }
    ];

    // Combine all questions
    questionsData.push(...mathQuestions, ...englishQuestions, ...physicsQuestions, ...chemistryQuestions, ...biologyQuestions);

    // Insert questions in batches
    const insertedQuestions = [];
    for (const question of questionsData) {
      if (question.subjectId && question.topicId) {
        const [insertedQuestion] = await db.insert(questions).values(question).returning();
        insertedQuestions.push(insertedQuestion);
      }
    }

    // 7. Create Various Types of Exams
    console.log("📝 Creating various exam types...");
    const examsData = [
      // Regular Practice Exams
      {
        id: uuidv4(),
        title: "JAMB Mathematics Practice Test",
        description: "Comprehensive mathematics practice for JAMB preparation",
        type: "practice" as const,
        examCategory: "jamb" as const,
        duration: 60,
        totalQuestions: 15,
        passingScore: 50,
        subjects: [mathSubject?.id],
        difficulty: "mixed" as const,
        instructions: "Answer all questions. Each question carries equal marks. No negative marking.",
        isPublic: true,
        isActive: true,
        createdBy: "admin-123",
        settings: {
          proctoring: {
            enabled: false,
            webcamRequired: false,
            screenRecording: false,
            tabSwitchDetection: true,
            aiMonitoring: false
          },
          exam: {
            allowReview: true,
            showCorrectAnswers: true,
            randomizeQuestions: true,
            timeWarnings: [600, 300, 60]
          }
        }
      },
      
      // Proctored Official Exam
      {
        id: uuidv4(),
        title: "Mid-Term Physics Examination",
        description: "Official proctored physics examination",
        type: "official" as const,
        examCategory: "jamb" as const,
        duration: 90,
        totalQuestions: 20,
        passingScore: 60,
        subjects: [physicsSubject?.id],
        difficulty: "hard" as const,
        instructions: "This is a proctored examination. Ensure your webcam and microphone are working. Any suspicious activity will be flagged.",
        isPublic: false,
        isActive: true,
        createdBy: "inst-owner-123",
        institutionId: "demo-institution-123",
        settings: {
          proctoring: {
            enabled: true,
            webcamRequired: true,
            screenRecording: true,
            tabSwitchDetection: true,
            aiMonitoring: true,
            microphoneMonitoring: true,
            faceDetection: true,
            eyeTracking: true,
            environmentScan: true
          },
          exam: {
            allowReview: false,
            showCorrectAnswers: false,
            randomizeQuestions: true,
            timeWarnings: [1800, 900, 300, 60],
            autoSubmit: true,
            preventCopyPaste: true,
            disableRightClick: true,
            fullscreenRequired: true
          },
          security: {
            browserLockdown: true,
            minimumBandwidth: "1Mbps",
            requireSecureBrowser: false,
            allowedApplications: [],
            blockedWebsites: ["google.com", "youtube.com", "facebook.com"]
          }
        }
      },

      // Interview-Style Exam
      {
        id: uuidv4(),
        title: "Computer Science Interview Assessment",
        description: "Technical interview simulation with coding and conceptual questions",
        type: "custom" as const,
        examCategory: "custom" as const,
        duration: 120,
        totalQuestions: 10,
        passingScore: 70,
        subjects: [insertedSubjects.find(s => s.code === "CMP")?.id],
        difficulty: "hard" as const,
        instructions: "This is an interview-style assessment. Answer questions as if you're in a live technical interview. Some questions may require detailed explanations.",
        isPublic: false,
        isActive: true,
        createdBy: "inst-owner-123",
        institutionId: "demo-institution-123",
        settings: {
          proctoring: {
            enabled: true,
            webcamRequired: true,
            screenRecording: true,
            tabSwitchDetection: true,
            aiMonitoring: true,
            microphoneMonitoring: true,
            faceDetection: true,
            eyeTracking: true,
            voiceAnalysis: true
          },
          exam: {
            allowReview: true,
            showCorrectAnswers: false,
            randomizeQuestions: false,
            timeWarnings: [3600, 1800, 600, 300],
            autoSubmit: false,
            preventCopyPaste: true,
            disableRightClick: true,
            fullscreenRequired: true,
            questionTypes: ["multiple_choice", "essay", "code_submission"],
            interviewMode: true,
            allowNotes: true,
            extendedTime: true
          },
          interview: {
            recordVideo: true,
            recordAudio: true,
            saveScreenshots: true,
            behavioralAnalysis: true,
            stressDetection: true,
            confidenceMetrics: true,
            communicationSkills: true,
            problemSolvingTracking: true
          }
        }
      },

      // Multi-Subject Mock Exam
      {
        id: uuidv4(),
        title: "JAMB Mock Examination 2024",
        description: "Full JAMB simulation covering all core subjects",
        type: "mock" as const,
        examCategory: "jamb" as const,
        duration: 180,
        totalQuestions: 60,
        passingScore: 180,
        subjects: [mathSubject?.id, englishSubject?.id, physicsSubject?.id, chemistrySubject?.id],
        difficulty: "mixed" as const,
        instructions: "This is a full JAMB mock examination. Answer all 60 questions in 3 hours. Each correct answer = 4 marks, each wrong answer = -1 mark.",
        isPublic: true,
        isActive: true,
        createdBy: "admin-123",
        settings: {
          proctoring: {
            enabled: true,
            webcamRequired: true,
            screenRecording: false,
            tabSwitchDetection: true,
            aiMonitoring: true,
            microphoneMonitoring: false
          },
          exam: {
            allowReview: true,
            showCorrectAnswers: true,
            randomizeQuestions: true,
            timeWarnings: [3600, 1800, 900, 300],
            autoSubmit: true,
            negativeMarking: true,
            markingScheme: {
              correct: 4,
              wrong: -1,
              unanswered: 0
            }
          }
        }
      }
    ];

    const insertedExams = [];
    for (const exam of examsData) {
      const [insertedExam] = await db.insert(exams).values(exam).returning();
      insertedExams.push(insertedExam);
    }

    // 8. Create Learning Packages
    console.log("📦 Creating learning packages...");
    const packagesData = [
      {
        id: uuidv4(),
        title: "JAMB Complete Preparation Package",
        description: "Comprehensive JAMB preparation with over 1000 questions and detailed explanations",
        category: "jamb" as const,
        subjectIds: [mathSubject?.id, englishSubject?.id, physicsSubject?.id, chemistrySubject?.id],
        price: "15000.00",
        currency: "NGN",
        duration: 365, // 1 year access
        content: {
          questionsCount: 1000,
          mockExams: 10,
          videeLessons: 50,
          studyGuides: 20,
          practiceTests: 25
        },
        difficulty: "mixed" as const,
        prerequisites: ["SS2 completion", "Basic mathematics"],
        isActive: true,
        createdBy: "admin-123"
      },
      {
        id: uuidv4(),
        title: "Physics Mastery Package",
        description: "Advanced physics package for JAMB and university preparation",
        category: "jamb" as const,
        subjectIds: [physicsSubject?.id],
        price: "8000.00",
        currency: "NGN",
        duration: 180, // 6 months access
        content: {
          questionsCount: 500,
          mockExams: 5,
          videeLessons: 30,
          studyGuides: 15,
          practiceTests: 15,
          labSimulations: 10
        },
        difficulty: "advanced" as const,
        prerequisites: ["SS1 Physics", "Basic mathematics"],
        isActive: true,
        createdBy: "admin-123"
      }
    ];

    for (const packageData of packagesData) {
      await db.insert(learningPackages).values(packageData);
    }

    console.log("✅ Comprehensive production-ready database seeding completed successfully!");
    console.log(`
📊 Summary:
- 1 Admin user created
- 1 Institution with 3 students created  
- ${insertedSubjects.length} subjects created
- ${insertedTopics.length} topics created
- ${insertedQuestions.length} questions created
- ${insertedExams.length} exams created (including interview-style and proctored)
- 2 learning packages created

🚀 Platform Features:
- Role-based access control (Admin → Institution → Students)
- Comprehensive proctoring system with AI monitoring
- Interview-style assessment capabilities
- Multi-subject mock examinations
- Learning package system
- Advanced security features

🎯 Ready for production use!
    `);

  } catch (error) {
    console.error("❌ Error during comprehensive seeding:", error);
    throw error;
  }
};

// Run the comprehensive seed
comprehensiveProductionSeed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});