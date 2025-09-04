import sys
import pdfplumber
import openpyxl
import warnings
import os

# Suppress UserWarnings
warnings.filterwarnings("ignore", category=UserWarning, module="pdfminer")

# Silence stderr during pdfplumber usage
class DummyFile(object):
    def write(self, x): pass

def silence_stderr():
    sys.stderr = DummyFile()

def restore_stderr():
    sys.stderr = sys.__stderr__

# Get file paths
input_pdf = sys.argv[1]
output_excel = sys.argv[2]

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Marks Table"

try:
    silence_stderr()
    with pdfplumber.open(input_pdf) as pdf:
        row_num = 1
        for page in pdf.pages:
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    for row in table:
                        if row:
                            for col_num, cell in enumerate(row, start=1):
                                ws.cell(row=row_num, column=col_num).value = str(cell).strip() if cell else ''
                            row_num += 1
    restore_stderr()
except Exception as e:
    restore_stderr()
    print(f"Error processing PDF: {e}")
    sys.exit(1)

try:
    wb.save(output_excel)
    print(f"✅ Converted '{input_pdf}' → '{output_excel}' successfully.")
except Exception as e:
    print(f"Error saving Excel: {e}")
    sys.exit(1)