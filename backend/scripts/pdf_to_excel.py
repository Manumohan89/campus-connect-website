import aspose.pdf as ap
import sys

# Use the paths provided as command-line arguments
input_pdf = sys.argv[1]
output_excel = sys.argv[2]

# Load the PDF document
document = ap.Document(input_pdf)

# Create ExcelSaveOptions to customize the conversion
options = ap.ExcelSaveOptions()

# Save the PDF as an Excel document
document.save(output_excel, options)
