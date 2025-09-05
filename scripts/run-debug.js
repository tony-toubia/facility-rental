const { execSync } = require('child_process');
const path = require('path');

// Change to the project directory
process.chdir(path.join(__dirname, '..'));

// Run the TypeScript file with ts-node
try {
  console.log('🔍 Running database diagnostics...');
  execSync('npx ts-node --esm scripts/debug-database.ts', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--loader ts-node/esm' }
  });
} catch (error) {
  console.error('❌ Error running diagnostics:', error.message);
  process.exit(1);
}