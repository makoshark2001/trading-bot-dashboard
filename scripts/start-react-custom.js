const { spawn } = require('child_process');

// Set React dev server to port 3010
process.env.PORT = '3010';
process.env.BROWSER = 'none'; // Prevent auto-opening browser

console.log('🚀 Starting React development server on port 3010...');

const reactProcess = spawn('npx', ['react-scripts', 'start'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '3010' }
});

reactProcess.on('error', (error) => {
    console.error('Failed to start React:', error);
});

reactProcess.on('close', (code) => {
    console.log(`React process exited with code ${code}`);
});