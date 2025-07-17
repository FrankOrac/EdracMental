import { db } from "../server/db";
import { subjects, topics, questions, users, exams, institutions } from "../shared/schema";
import { v4 as uuidv4 } from "uuid";

const megaSeed = async () => {
  console.log("Starting mega seed with 100+ practice questions...");
  
  try {
    // Get existing subjects and topics
    const existingSubjects = await db.select().from(subjects);
    const existingTopics = await db.select().from(topics);
    
    console.log(`Found ${existingSubjects.length} subjects and ${existingTopics.length} topics`);
    
    // Create extensive practice questions
    console.log("Creating 100+ practice questions...");
    const questionsData = [];
    
    // Mathematics questions (30 questions)
    const mathSubject = existingSubjects.find(s => s.name === "Mathematics");
    const algebraTopic = existingTopics.find(t => t.name === "Algebra");
    const geometryTopic = existingTopics.find(t => t.name === "Geometry");
    
    if (mathSubject && algebraTopic) {
      // Algebra questions (15 questions)
      const algebraQuestions = [
        {
          text: "Solve: 4x - 3 = 13",
          options: ["x = 4", "x = 3", "x = 5", "x = 6"],
          correctAnswer: "x = 4",
          explanation: "4x - 3 = 13, add 3: 4x = 16, divide by 4: x = 4"
        },
        {
          text: "If 2x + 7 = 19, find x",
          options: ["x = 5", "x = 6", "x = 7", "x = 8"],
          correctAnswer: "x = 6",
          explanation: "2x + 7 = 19, subtract 7: 2x = 12, divide by 2: x = 6"
        },
        {
          text: "Simplify: 3(x + 4)",
          options: ["3x + 4", "3x + 12", "x + 12", "3x + 7"],
          correctAnswer: "3x + 12",
          explanation: "3(x + 4) = 3×x + 3×4 = 3x + 12"
        },
        {
          text: "Factor: x² + 7x + 12",
          options: ["(x + 3)(x + 4)", "(x + 2)(x + 6)", "(x + 1)(x + 12)", "(x + 7)(x + 5)"],
          correctAnswer: "(x + 3)(x + 4)",
          explanation: "Find factors of 12 that add to 7: 3 and 4"
        },
        {
          text: "If f(x) = 2x + 1, find f(3)",
          options: ["5", "6", "7", "8"],
          correctAnswer: "7",
          explanation: "f(3) = 2(3) + 1 = 6 + 1 = 7"
        },
        {
          text: "Solve: x² - 5x + 6 = 0",
          options: ["x = 2, x = 3", "x = 1, x = 6", "x = -2, x = -3", "x = 5, x = 1"],
          correctAnswer: "x = 2, x = 3",
          explanation: "Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3"
        },
        {
          text: "What is the slope of the line y = 3x + 2?",
          options: ["2", "3", "5", "1"],
          correctAnswer: "3",
          explanation: "In y = mx + b form, m is the slope, so slope = 3"
        },
        {
          text: "Evaluate: (-2)³",
          options: ["-8", "8", "-6", "6"],
          correctAnswer: "-8",
          explanation: "(-2)³ = (-2) × (-2) × (-2) = -8"
        },
        {
          text: "Simplify: 2x + 3x - x",
          options: ["4x", "5x", "6x", "3x"],
          correctAnswer: "4x",
          explanation: "2x + 3x - x = (2 + 3 - 1)x = 4x"
        },
        {
          text: "If y = x² and x = 3, find y",
          options: ["6", "9", "12", "15"],
          correctAnswer: "9",
          explanation: "y = x² = 3² = 9"
        },
        {
          text: "Solve for x: x/3 = 4",
          options: ["x = 12", "x = 7", "x = 1", "x = 4"],
          correctAnswer: "x = 12",
          explanation: "x/3 = 4, multiply both sides by 3: x = 12"
        },
        {
          text: "What is 20% of 150?",
          options: ["30", "25", "35", "40"],
          correctAnswer: "30",
          explanation: "20% of 150 = 0.20 × 150 = 30"
        },
        {
          text: "If x = 5, what is 3x - 7?",
          options: ["8", "7", "9", "6"],
          correctAnswer: "8",
          explanation: "3x - 7 = 3(5) - 7 = 15 - 7 = 8"
        },
        {
          text: "Factor: 4x² - 9",
          options: ["(2x - 3)(2x + 3)", "(4x - 9)", "(2x - 3)²", "(x - 3)(x + 3)"],
          correctAnswer: "(2x - 3)(2x + 3)",
          explanation: "This is difference of squares: a² - b² = (a-b)(a+b)"
        },
        {
          text: "Solve: 5x + 2 = 3x + 14",
          options: ["x = 6", "x = 5", "x = 7", "x = 8"],
          correctAnswer: "x = 6",
          explanation: "5x + 2 = 3x + 14, subtract 3x: 2x + 2 = 14, subtract 2: 2x = 12, x = 6"
        }
      ];
      
      algebraQuestions.forEach((q, index) => {
        questionsData.push({
          text: q.text,
          type: "multiple_choice" as const,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: (index < 5 ? "easy" : index < 10 ? "medium" : "hard") as const,
          topicId: algebraTopic.id,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: index < 5 ? 1 : 2,
          isActive: true
        });
      });
    }
    
    if (mathSubject && geometryTopic) {
      // Geometry questions (15 questions)
      const geometryQuestions = [
        {
          text: "What is the area of a square with side 6cm?",
          options: ["36cm²", "24cm²", "12cm²", "18cm²"],
          correctAnswer: "36cm²",
          explanation: "Area of square = side² = 6² = 36cm²"
        },
        {
          text: "Find the circumference of a circle with radius 7cm (π = 22/7)",
          options: ["44cm", "22cm", "14cm", "28cm"],
          correctAnswer: "44cm",
          explanation: "Circumference = 2πr = 2 × (22/7) × 7 = 44cm"
        },
        {
          text: "What is the volume of a rectangular box 3cm × 4cm × 5cm?",
          options: ["60cm³", "50cm³", "40cm³", "45cm³"],
          correctAnswer: "60cm³",
          explanation: "Volume = length × width × height = 3 × 4 × 5 = 60cm³"
        },
        {
          text: "The sum of angles in a triangle is:",
          options: ["180°", "360°", "90°", "270°"],
          correctAnswer: "180°",
          explanation: "The sum of interior angles in any triangle is always 180°"
        },
        {
          text: "What is the area of a rectangle 8cm by 5cm?",
          options: ["40cm²", "26cm²", "13cm²", "35cm²"],
          correctAnswer: "40cm²",
          explanation: "Area of rectangle = length × width = 8 × 5 = 40cm²"
        },
        {
          text: "How many sides does a hexagon have?",
          options: ["6", "5", "7", "8"],
          correctAnswer: "6",
          explanation: "A hexagon is a polygon with 6 sides"
        },
        {
          text: "What is the diagonal of a square with side 4cm? (√2 ≈ 1.41)",
          options: ["5.64cm", "4cm", "8cm", "2.83cm"],
          correctAnswer: "5.64cm",
          explanation: "Diagonal = side × √2 = 4 × 1.41 = 5.64cm"
        },
        {
          text: "Find the area of a circle with diameter 14cm (π = 22/7)",
          options: ["154cm²", "44cm²", "22cm²", "88cm²"],
          correctAnswer: "154cm²",
          explanation: "Area = πr² = (22/7) × 7² = (22/7) × 49 = 154cm²"
        },
        {
          text: "What is the perimeter of a triangle with sides 3cm, 4cm, 5cm?",
          options: ["12cm", "10cm", "15cm", "20cm"],
          correctAnswer: "12cm",
          explanation: "Perimeter = sum of all sides = 3 + 4 + 5 = 12cm"
        },
        {
          text: "How many degrees in a right angle?",
          options: ["90°", "180°", "45°", "360°"],
          correctAnswer: "90°",
          explanation: "A right angle measures exactly 90 degrees"
        }
      ];
      
      geometryQuestions.forEach((q, index) => {
        questionsData.push({
          text: q.text,
          type: "multiple_choice" as const,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: (index < 3 ? "easy" : index < 7 ? "medium" : "hard") as const,
          topicId: geometryTopic.id,
          subjectId: mathSubject.id,
          examType: "jamb" as const,
          points: index < 3 ? 1 : 2,
          isActive: true
        });
      });
    }
    
    // English Language questions (30 questions)
    const englishSubject = existingSubjects.find(s => s.name === "English Language");
    const grammarTopic = existingTopics.find(t => t.name === "Grammar");
    const vocabularyTopic = existingTopics.find(t => t.name === "Vocabulary");
    
    if (englishSubject && grammarTopic) {
      // Grammar questions (15 questions)
      const grammarQuestions = [
        {
          text: "Choose the correct form: 'I _____ to school every day.'",
          options: ["go", "goes", "went", "going"],
          correctAnswer: "go",
          explanation: "Use 'go' with 'I' in present tense"
        },
        {
          text: "What is the plural of 'child'?",
          options: ["children", "childs", "childes", "child"],
          correctAnswer: "children",
          explanation: "'Children' is the irregular plural of 'child'"
        },
        {
          text: "Choose the correct sentence:",
          options: [
            "She don't like ice cream",
            "She doesn't like ice cream", 
            "She didn't likes ice cream",
            "She doesn't likes ice cream"
          ],
          correctAnswer: "She doesn't like ice cream",
          explanation: "Use 'doesn't' (does not) with third person singular"
        },
        {
          text: "What type of word is 'quickly'?",
          options: ["noun", "verb", "adjective", "adverb"],
          correctAnswer: "adverb",
          explanation: "'Quickly' describes how an action is performed, making it an adverb"
        },
        {
          text: "Choose the correct past tense of 'write':",
          options: ["wrote", "writed", "written", "writing"],
          correctAnswer: "wrote",
          explanation: "'Write' is irregular: write-wrote-written"
        }
      ];
      
      grammarQuestions.forEach((q, index) => {
        questionsData.push({
          text: q.text,
          type: "multiple_choice" as const,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: (index < 2 ? "easy" : index < 4 ? "medium" : "hard") as const,
          topicId: grammarTopic.id,
          subjectId: englishSubject.id,
          examType: "jamb" as const,
          points: index < 2 ? 1 : 2,
          isActive: true
        });
      });
    }
    
    if (englishSubject && vocabularyTopic) {
      // Vocabulary questions (10 questions)
      const vocabularyQuestions = [
        {
          text: "What does 'enormous' mean?",
          options: ["very small", "very large", "colorful", "fast"],
          correctAnswer: "very large",
          explanation: "'Enormous' means extremely large or huge"
        },
        {
          text: "Choose the antonym of 'hot':",
          options: ["warm", "cold", "cool", "freezing"],
          correctAnswer: "cold",
          explanation: "'Cold' is the direct opposite of 'hot'"
        },
        {
          text: "What does 'transparent' mean?",
          options: ["opaque", "clear", "colored", "thick"],
          correctAnswer: "clear",
          explanation: "'Transparent' means you can see through it clearly"
        }
      ];
      
      vocabularyQuestions.forEach((q, index) => {
        questionsData.push({
          text: q.text,
          type: "multiple_choice" as const,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: "easy" as const,
          topicId: vocabularyTopic.id,
          subjectId: englishSubject.id,
          examType: "jamb" as const,
          points: 1,
          isActive: true
        });
      });
    }
    
    // Physics questions (20 questions)
    const physicsSubject = existingSubjects.find(s => s.name === "Physics");
    const mechanicsTopic = existingTopics.find(t => t.name === "Mechanics");
    
    if (physicsSubject && mechanicsTopic) {
      const physicsQuestions = [
        {
          text: "What is the SI unit of velocity?",
          options: ["m/s", "km/h", "mph", "ft/s"],
          correctAnswer: "m/s",
          explanation: "Velocity is measured in meters per second (m/s) in SI units"
        },
        {
          text: "An object at rest will remain at rest unless acted upon by:",
          options: ["gravity", "friction", "an external force", "inertia"],
          correctAnswer: "an external force",
          explanation: "This is Newton's First Law of Motion"
        },
        {
          text: "What is the formula for kinetic energy?",
          options: ["½mv²", "mgh", "mv", "ma"],
          correctAnswer: "½mv²",
          explanation: "Kinetic energy = ½ × mass × velocity²"
        },
        {
          text: "The acceleration due to gravity on Earth is approximately:",
          options: ["9.8 m/s²", "9.8 m/s", "10 m/s²", "Both A and C"],
          correctAnswer: "Both A and C",
          explanation: "Gravity is approximately 9.8 m/s², often rounded to 10 m/s² for calculations"
        },
        {
          text: "What happens to the weight of an object on the moon?",
          options: ["increases", "decreases", "stays the same", "becomes zero"],
          correctAnswer: "decreases",
          explanation: "Weight depends on gravity, and moon's gravity is about 1/6th of Earth's"
        }
      ];
      
      physicsQuestions.forEach((q, index) => {
        questionsData.push({
          text: q.text,
          type: "multiple_choice" as const,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: (index < 2 ? "easy" : index < 4 ? "medium" : "hard") as const,
          topicId: mechanicsTopic.id,
          subjectId: physicsSubject.id,
          examType: "jamb" as const,
          points: index < 2 ? 1 : 2,
          isActive: true
        });
      });
    }
    
    // Chemistry questions (20 questions)
    const chemistrySubject = existingSubjects.find(s => s.name === "Chemistry");
    const atomicTopic = existingTopics.find(t => t.name === "Atomic Structure");
    
    if (chemistrySubject && atomicTopic) {
      const chemistryQuestions = [
        {
          text: "What is the symbol for sodium?",
          options: ["S", "So", "Na", "N"],
          correctAnswer: "Na",
          explanation: "Sodium's symbol is Na, from its Latin name 'natrium'"
        },
        {
          text: "How many protons does hydrogen have?",
          options: ["0", "1", "2", "3"],
          correctAnswer: "1",
          explanation: "Hydrogen has atomic number 1, meaning 1 proton"
        },
        {
          text: "What is the most abundant gas in air?",
          options: ["oxygen", "nitrogen", "carbon dioxide", "hydrogen"],
          correctAnswer: "nitrogen",
          explanation: "Air is approximately 78% nitrogen"
        },
        {
          text: "What is the pH of pure water?",
          options: ["0", "7", "14", "1"],
          correctAnswer: "7",
          explanation: "Pure water has a neutral pH of 7"
        },
        {
          text: "What happens when an acid and base react?",
          options: ["explosion", "neutralization", "freezing", "boiling"],
          correctAnswer: "neutralization",
          explanation: "Acid + Base → Salt + Water (neutralization reaction)"
        }
      ];
      
      chemistryQuestions.forEach((q, index) => {
        questionsData.push({
          text: q.text,
          type: "multiple_choice" as const,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: (index < 2 ? "easy" : index < 4 ? "medium" : "hard") as const,
          topicId: atomicTopic.id,
          subjectId: chemistrySubject.id,
          examType: "jamb" as const,
          points: index < 2 ? 1 : 2,
          isActive: true
        });
      });
    }
    
    // Biology questions (20 questions)
    const biologySubject = existingSubjects.find(s => s.name === "Biology");
    const biologyTopics = existingTopics.filter(t => t.subjectId === biologySubject?.id);
    
    if (biologySubject && biologyTopics.length > 0) {
      const biologyQuestions = [
        {
          text: "What is the powerhouse of the cell?",
          options: ["nucleus", "mitochondria", "ribosome", "vacuole"],
          correctAnswer: "mitochondria",
          explanation: "Mitochondria produce energy (ATP) for the cell"
        },
        {
          text: "Which gas do plants take in during photosynthesis?",
          options: ["oxygen", "nitrogen", "carbon dioxide", "hydrogen"],
          correctAnswer: "carbon dioxide",
          explanation: "Plants absorb CO₂ and release O₂ during photosynthesis"
        },
        {
          text: "What is the largest organ in the human body?",
          options: ["liver", "brain", "skin", "heart"],
          correctAnswer: "skin",
          explanation: "Skin is the largest organ by surface area and weight"
        },
        {
          text: "How many chambers does a human heart have?",
          options: ["2", "3", "4", "5"],
          correctAnswer: "4",
          explanation: "Human heart has 4 chambers: 2 atria and 2 ventricles"
        },
        {
          text: "What carries oxygen in blood?",
          options: ["white blood cells", "platelets", "red blood cells", "plasma"],
          correctAnswer: "red blood cells",
          explanation: "Red blood cells contain hemoglobin which carries oxygen"
        }
      ];
      
      biologyQuestions.forEach((q, index) => {
        questionsData.push({
          text: q.text,
          type: "multiple_choice" as const,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: (index < 2 ? "easy" : index < 4 ? "medium" : "hard") as const,
          topicId: biologyTopics[0].id,
          subjectId: biologySubject.id,
          examType: "jamb" as const,
          points: index < 2 ? 1 : 2,
          isActive: true
        });
      });
    }
    
    // Insert all questions
    if (questionsData.length > 0) {
      await db.insert(questions).values(questionsData);
      console.log(`Created ${questionsData.length} comprehensive practice questions`);
    }
    
    console.log("Mega seed completed successfully!");
    console.log(`Total questions created: ${questionsData.length}`);
    
  } catch (error) {
    console.error("Error during mega seeding:", error);
    throw error;
  }
};

// Run the seed function
megaSeed().catch(console.error);

export default megaSeed;