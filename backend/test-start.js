try {
  console.log('Starting backend test...');
  const app = require('./app.js');
  console.log('Backend started successfully!');
  process.exit(0);
} catch (error) {
  console.error('Error starting backend:', error.message);
  process.exit(1);
}
