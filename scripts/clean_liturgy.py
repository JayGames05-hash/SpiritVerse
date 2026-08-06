import json, re, sys
from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'data' / 'liturgy_full.json'
if not p.exists():
    print('Missing', p)
    sys.exit(1)

data = json.loads(p.read_text(encoding='utf-8'))

def clean_text(text):
    # Split into lines, clean each line
    lines = text.split('\n')
    out_lines = []
    for line in lines:
        s = line.strip()
        # skip lines that are only dots and optional numbers
        if re.fullmatch(r'[.\s\u00A0]*\d*', s):
            continue
        # remove trailing dotted leaders and page numbers
        s = re.sub(r'\s*\.{3,}\s*\d*\s*$', '', s)
        # remove leading dotted leaders
        s = re.sub(r'^\.{3,}\s*', '', s)
        # collapse multiple spaces
        s = re.sub(r'\s{2,}', ' ', s)
        if s:
            out_lines.append(s)
    # Join lines into paragraphs: group consecutive non-empty lines; preserve paragraphs separated by blank lines
    paragraphs = []
    cur = []
    for L in out_lines:
        if L == '':
            if cur:
                paragraphs.append(' '.join(cur))
                cur = []
        else:
            cur.append(L)
    if cur:
        paragraphs.append(' '.join(cur))
    return '\n\n'.join(paragraphs)

for sec in data.get('sections', []):
    orig = sec.get('content','')
    cleaned = clean_text(orig)
    sec['content'] = cleaned

p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print('Cleaned', p)
