"""
Generate a test PDF with FRENCH column names to test AI field mapping.
The AI should recognize that:
  "Semestre" → semester
  "Taux de réussite" → success_rate
  "Taux d'abandon" → dropout_rate
"""
from fpdf import FPDF

pdf = FPDF()
pdf.add_page()

# Title
pdf.set_font('Arial', 'B', 16)
pdf.cell(190, 10, 'Indicateurs Academiques - FST', 0, 1, 'C')
pdf.ln(10)

# Table Header (FRENCH column names!)
pdf.set_font('Arial', 'B', 11)
pdf.cell(50, 10, 'Semestre', 1)
pdf.cell(50, 10, 'Taux de reussite', 1)
pdf.cell(50, 10, "Taux d'abandon", 1)
pdf.ln()

# Data rows
pdf.set_font('Arial', '', 11)
pdf.cell(50, 10, 'S1-2025', 1)
pdf.cell(50, 10, '82.3%', 1)
pdf.cell(50, 10, '6.1%', 1)
pdf.ln()

pdf.cell(50, 10, 'S2-2025', 1)
pdf.cell(50, 10, '79.8%', 1)
pdf.cell(50, 10, '7.4%', 1)
pdf.ln()

pdf.output('/data/test_french.pdf')
print("Generated /data/test_french.pdf with French columns!")
