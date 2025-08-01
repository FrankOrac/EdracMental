import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function cleanCodebase() {
  console.log("🧹 Cleaning codebase...");

  try {
    // Files and directories to remove (safe for Windows deployment)
    const itemsToRemove = [
      // Cookie files (demo login cookies)
      'admin_cookies.txt',
      'admin_test_cookies.txt',
      'cookies.txt',
      'demo_test_cookies.txt',
      'institution_cookies.txt',
      'jane_cookies.txt',
      'student_cookies.txt',
      'test_cookies.txt',
      
      // OS generated files
      '.DS_Store',
      'Thumbs.db',
      
      // Build artifacts (if they exist)
      'dist-temp',
      
      // Log files in root
      'npm-debug.log',
      'yarn-debug.log',
      'yarn-error.log',
    ];

    let removedCount = 0;
    let skippedCount = 0;

    for (const item of itemsToRemove) {
      const itemPath = join(rootDir, item);
      
      try {
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          await fs.rmdir(itemPath, { recursive: true });
          console.log(`🗂️  Removed directory: ${item}`);
        } else {
          await fs.unlink(itemPath);
          console.log(`📄 Removed file: ${item}`);
        }
        
        removedCount++;
      } catch (error) {
        // File/directory doesn't exist or can't be removed
        skippedCount++;
      }
    }

    // Clean up empty directories
    const dirsToCheck = [
      'temp',
      'tmp',
      'logs',
      'coverage',
      'test-results',
    ];

    for (const dir of dirsToCheck) {
      const dirPath = join(rootDir, dir);
      try {
        const files = await fs.readdir(dirPath);
        if (files.length === 0) {
          await fs.rmdir(dirPath);
          console.log(`📁 Removed empty directory: ${dir}`);
          removedCount++;
        }
      } catch (error) {
        // Directory doesn't exist or isn't empty
      }
    }

    // Clean package-lock.json if it exists (force fresh install)
    try {
      await fs.unlink(join(rootDir, 'package-lock.json'));
      console.log("🔒 Removed package-lock.json for fresh install");
      removedCount++;
    } catch (error) {
      // File doesn't exist
    }

    console.log(`✅ Codebase cleaning completed!`);
    console.log(`   📊 Removed: ${removedCount} items`);
    console.log(`   ⏭️  Skipped: ${skippedCount} items (didn't exist)`);

    // Verify critical files still exist
    const criticalFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.ts',
      'drizzle.config.ts',
      'shared/schema.ts',
      'server/index.ts',
      'client/src/App.tsx',
    ];

    let missingCritical = 0;
    for (const file of criticalFiles) {
      try {
        await fs.access(join(rootDir, file));
      } catch (error) {
        console.error(`❌ Critical file missing: ${file}`);
        missingCritical++;
      }
    }

    if (missingCritical === 0) {
      console.log("✅ All critical files intact");
    } else {
      console.warn(`⚠️  ${missingCritical} critical files are missing!`);
    }

  } catch (error) {
    console.error("❌ Error cleaning codebase:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  cleanCodebase()
    .then(() => {
      console.log("🎉 Codebase cleaning completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Codebase cleaning failed:", error);
      process.exit(1);
    });
}

export { cleanCodebase };