from fpdf import FPDF
import os

pdf = FPDF()
pdf.add_page()

# Title
pdf.set_font('Arial', 'B', 16)
pdf.cell(190, 10, 'Academic Key Performance Indicators', 0, 1, 'C')
pdf.ln(10)

# Table Header
pdf.set_font('Arial', 'B', 12)
pdf.cell(50, 10, 'semester', 1)
pdf.cell(40, 10, 'success_rate', 1)
pdf.cell(40, 10, 'dropout_rate', 1)
pdf.ln()

# Table Rows
pdf.set_font('Arial', '', 12)
pdf.cell(50, 10, 'S1-2025', 1)
pdf.cell(40, 10, '85.5%', 1)
pdf.cell(40, 10, '5.2%', 1)
pdf.ln()

pdf.cell(50, 10, 'S2-2025', 1)
pdf.cell(40, 10, '87.1%', 1)
pdf.cell(40, 10, '4.8%', 1)
pdf.ln()

# Output to the mapped data volume
pdf.output('/data/test_stats.pdf')
print("Successfully generated correct /data/test_stats.pdf")
