const fs = require('fs');
const path = require('path');

// Delete package-lock.json
const lockFile = path.join(__dirname, 'package-lock.json');
if (fs.existsSync(lockFile)) {
  fs.unlinkSync(lockFile);
  console.log('Deleted package-lock.json');
}

// Delete node_modules if exceljs exists there
const nmDir = path.join(__dirname, 'node_modules');
if (fs.existsSync(nmDir)) {
  const excelDir = path.join(nmDir, 'exceljs');
  if (fs.existsSync(excelDir)) {
    fs.rmSync(excelDir, { recursive: true, force: true });
    console.log('Deleted node_modules/exceljs');
  }
}

console.log('Cleanup complete');
