const pdfParse = require('pdf-parse');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Convert PDF to Excel
async function processPdfToExcel(pdfPath) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(pdfBuffer);
  const text = data.text;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Marks');

  // Parse text and populate Excel (example format, adjust according to your PDF structure)
  const lines = text.split('\n').filter(line => line.trim() !== '');

  lines.forEach((line, index) => {
    const cells = line.split(/\s+/);
    worksheet.addRow(cells);
  });

  const excelPath = pdfPath.replace('.pdf', '.xlsx');
  await workbook.xlsx.writeFile(excelPath);

  return excelPath;
}

module.exports = { processPdfToExcel };
