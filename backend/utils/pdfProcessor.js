// This utility previously used exceljs to convert PDF content to Excel.
// Currently the application relies on an external Python script for conversion,
// so this stub is retained for compatibility but does nothing.
// NOTE: pdf-parse is NOT required at top level to avoid ENOENT crash on Render.
const fs = require('fs');
const path = require('path');

async function processPdfToExcel(pdfPath) {
  // Stub: call Python script directly or return original path
  // In case it's used elsewhere, simply return the expected output filename
  const excelPath = pdfPath.replace('.pdf', '.xlsx');
  return excelPath;
}

module.exports = { processPdfToExcel };
