import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

async function checkDatabase() {
  const client = postgres(connectionString!, { max: 1 });
  const db = drizzle(client);

  try {
    console.log("🔍 Checking database connection...");
    
    // Test basic connection
    await client`SELECT 1 as test`;
    console.log("✅ Database connection successful");

    // Check if main tables exist
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;

    const tableNames = tables.map(t => t.table_name);
    const requiredTables = ['users', 'institutions', 'subjects', 'questions', 'exams', 'sessions'];
    
    console.log(`📋 Found ${tableNames.length} tables in database`);
    
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log("💡 Run 'npm run db:push' to create missing tables");
    } else {
      console.log("✅ All required tables exist");
    }

    // Check for demo data
    const userCount = await client`SELECT COUNT(*) as count FROM users`;
    const questionCount = await client`SELECT COUNT(*) as count FROM questions`;
    
    console.log(`👥 Users in database: ${userCount[0].count}`);
    console.log(`❓ Questions in database: ${questionCount[0].count}`);

    if (userCount[0].count === "0") {
      console.log("💡 No users found. Run 'npm run seed:demo' to create demo accounts");
    }

    console.log("🎉 Database check completed successfully!");
    
  } catch (error) {
    console.error("❌ Database check failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Database check failed:", error);
      process.exit(1);
    });
}

export { checkDatabase };