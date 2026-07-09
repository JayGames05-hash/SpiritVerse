from pathlib import Path
from pypdf import PdfReader

path = Path(__file__).resolve().parent.parent / 'Rites_Liturgy_Full.pdf'
reader = PdfReader(str(path))
print(f'PDF path: {path}')
print(f'Pages: {len(reader.pages)}')
for i, page in enumerate(reader.pages[:10], start=1):
    text = page.extract_text() or ''
    print('--- PAGE', i, '---')
    print(text[:2000])
    print()
