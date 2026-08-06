from PyPDF2 import PdfReader
import json
import re
import os

PDF = 'Liturgy.pdf'
OUT = os.path.join('data', 'liturgy_full.json')

# Major headings to split by (from the PDF table of contents)
HEADINGS = [
    'THE PRAYER OF PREPARATION',
    'THE PRAYER AFTER PREPARATION',
    'THE PROCESSION OF THE LAMB',
    'THE PRAYER OF THANKSGIVING',
    'THE LITURGY OF THE WORD',
    'THE PAULINE EPISTLE',
    'THE CATHOLIC EPISTLE',
    'THE LITANY OF THE OBLATIONS',
    'THE PRAXIS',
    'THE SYNAXARION',
    'THE LITANY OF THE GOSPEL',
    'THE GOSPEL',
    'LITURGY OF THE FAITHFUL',
    'THE PRAYER OF THE VEIL',
    'THE THREE LONG LITANIES',
    'THE ORTHODOX CREED',
    'THE PRAYER OF RECONCILIATION',
    'THE ANAPHORA',
    'THE INSTITUTION NARRATIVE',
    'THE PRAYER OF THE FRACTION',
    'THE DISTRIBUTION OF THE HOLY MYSTERIES',
    'THE DISMISSAL',
]

reader = PdfReader(PDF)
text_pages = []
for p in reader.pages:
    txt = p.extract_text() or ''
    text_pages.append(txt)

full_text = '\n\n'.join(text_pages)

# Normalize whitespace
full_text = re.sub(r"\r\n", "\n", full_text)
full_text = re.sub(r"\n{2,}", "\n\n", full_text)

# Uppercase version to find headings reliably
upper = full_text.upper()

# Build indices for headings
indices = []
for h in HEADINGS:
    idx = upper.find(h)
    if idx != -1:
        indices.append((idx, h))

# Sort by index
indices.sort()

sections = []
if not indices:
    # fallback: save everything as a single section
    sections.append({
        'title': 'Full Liturgy',
        'content': full_text.strip(),
    })
else:
    for i, (start, h) in enumerate(indices):
        # find end pos
        end = len(full_text)
        if i + 1 < len(indices):
            end = indices[i+1][0]
        # extract from start to end
        snippet = full_text[start:end].strip()
        # remove heading from snippet for content, but keep as title
        content = snippet[len(h):].strip()
        sections.append({
            'title': h.title(),
            'heading': h,
            'content': content,
        })

# Save JSON
os.makedirs('data', exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump({'source': PDF, 'sections': sections}, f, indent=2, ensure_ascii=False)

print(f'Wrote {len(sections)} sections to {OUT}')
