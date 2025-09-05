const { execSync } = require('child_process');
const path = require('path');

// Change to the project directory
process.chdir(path.join(__dirname, '..'));

// Run the TypeScript file with ts-node
try {
  console.log('🚀 Running test data population script...');
  execSync('npx ts-node --esm scripts/populate-test-data.ts', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--loader ts-node/esm' }
  });
} catch (error) {
  console.error('❌ Error running script:', error.message);
  process.exit(1);
}