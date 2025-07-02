import sys
import pdfplumber
import openpyxl

# Get file paths from command-line arguments
input_pdf = sys.argv[1]
output_excel = sys.argv[2]

# Create a new Excel workbook and sheet
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Marks Table"

try:
    with pdfplumber.open(input_pdf) as pdf:
        row_num = 1
        for page in pdf.pages:
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    for row in table:
                        if row:  # Ensure the row is not empty
                            for col_num, cell in enumerate(row, start=1):
                                ws.cell(row=row_num, column=col_num).value = str(cell).strip() if cell else ''
                            row_num += 1
except Exception as e:
    print(f"Error processing PDF: {e}")
    sys.exit(1)

# Save Excel
try:
    wb.save(output_excel)
    print(f"✅ Converted '{input_pdf}' → '{output_excel}' successfully.")
except Exception as e:
    print(f"Error saving Excel: {e}")
    sys.exit(1)
