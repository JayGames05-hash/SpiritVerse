import sys
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
# possible pdf locations
candidates = [ROOT / 'Rites_Liturgy_Full.pdf', ROOT / 'data' / 'Rites_Liturgy_Full.pdf', ROOT / 'data' / 'rites_liturgy_full.pdf']
PDF = next((p for p in candidates if p.exists()), None)
if not PDF:
    print('PDF not found. Searched:', candidates)
    sys.exit(2)

print('Using PDF:', PDF)

# Try OCR dependencies
try:
    from pdf2image import convert_from_path
    import pytesseract
    from PIL import Image
except Exception as e:
    print('OCR dependencies missing or failed to import:', e)
    print('Install `pdf2image`, `pytesseract` and ensure poppler and tesseract are installed on the system.')
    sys.exit(3)

# load existing JSON headings
DATA_PATH = ROOT / 'data' / 'liturgy_full.json'
if not DATA_PATH.exists():
    print('Data JSON not found at', DATA_PATH)
    sys.exit(4)

data = json.loads(DATA_PATH.read_text(encoding='utf-8'))
headings = [s.get('heading') or s.get('title') for s in data.get('sections', [])]
# normalize headings for searching
norm_headings = [re.sub(r"\s+", ' ', h.strip().upper()) if h else None for h in headings]

# Convert PDF pages to images
print('Converting PDF pages to images (this may take a while)...')
try:
    pages = convert_from_path(str(PDF), dpi=300)
except Exception as e:
    print('pdf2image.convert_from_path failed:', e)
    sys.exit(5)

print('Running OCR on', len(pages), 'pages...')
texts = []
for i, img in enumerate(pages):
    try:
        txt = pytesseract.image_to_string(img)
    except Exception as e:
        print('pytesseract failed on page', i, e)
        txt = ''
    texts.append(txt)

full = '\n\n'.join(texts)
full_norm = re.sub(r"\s+", ' ', full).upper()

# find headings in full_norm
positions = {}
for i, h in enumerate(norm_headings):
    if not h:
        continue
    idx = full_norm.find(h)
    if idx != -1:
        positions[i] = idx

if not positions:
    print('No headings found in OCR text. Aborting mapping. (Headings may differ in OCR output)')
    sys.exit(6)

# sort positions and slice text between headings
sorted_items = sorted(positions.items(), key=lambda x: x[1])
for idx_i, (sec_idx, pos) in enumerate(sorted_items):
    start = pos
    end = None
    if idx_i + 1 < len(sorted_items):
        end = sorted_items[idx_i + 1][1]
    slice_text = full[start:end] if end else full[start:]
    # remove heading from slice
    h = headings[sec_idx]
    # try to remove first occurrence of heading (case-insensitive)
    slice_text = re.sub(re.escape(h), '', slice_text, flags=re.IGNORECASE)
    # clean obvious page numbers/dotted leaders
    slice_text = re.sub(r"\.{3,}\s*\d+", '', slice_text)
    slice_text = re.sub(r"\s{2,}", ' ', slice_text)
    slice_text = slice_text.strip()
    if slice_text:
        data['sections'][sec_idx]['content'] = slice_text
        print('Filled section', sec_idx, headings[sec_idx][:60])

# write back
DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print('Updated', DATA_PATH)
