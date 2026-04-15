"""
Parser do bestiário de Daggerheart PT-BR (pp.209-239, PDF pages 209-239).
Extrai stat blocks do texto cru e gera TypeScript para src/data/bestiario.ts.
"""
import re
import json
import sys
import unicodedata
from pathlib import Path

RAW = Path(r'C:\Users\erick\Documents\Repositorios\DaggerHub\.claude\worktrees\romantic-grothendieck\docs\bestiario_raw.txt')
OUT_TS = Path(r'C:\Users\erick\Documents\Repositorios\DaggerHub\.claude\worktrees\romantic-grothendieck\src\data\bestiario.ts')
OUT_JSON = Path(r'C:\Users\erick\Documents\Repositorios\DaggerHub\.claude\worktrees\romantic-grothendieck\docs\bestiario_parsed.json')

TIPO_MAP = {
    'Assistente': 'assistente', 'Atirador': 'atirador', 'Brutamonte': 'brutamonte',
    'Comum': 'comum', 'Horda': 'horda', 'Lacaio': 'lacaio', 'Líder': 'lider',
    'Lider': 'lider', 'Manipulador': 'manipulador', 'Oportunista': 'oportunista',
    'Solo': 'solo',
}

# Patamar — "1º" → 1
PATAMAR_RE = re.compile(r'(\d)º patamar')
TIPO_HEADER_RE = re.compile(
    r'^(Assistente|Atirador|Brutamonte|Comum|Horda|Lacaio|Líder|Manipulador|Oportunista|Solo)\s*\((\d)º patamar\)(?:\s*\(([^)]+)\))?\s*$'
)
STATS_RE = re.compile(
    r'Dificuldade:\s*(\d+)\s*\|\s*Limiares?:\s*([^\|]+?)\s*\|\s*(\d+)\s*PV\s*\|\s*(\d+)\s*PF'
)
ATQ_RE = re.compile(r'ATQ:\s*([+\-]?\d+)\s*\|\s*([^\|]+?)\s*\|\s*(.+?)$')

ABILITY_KIND_MAP = {
    'ação': 'acao', 'acao': 'acao', 'reação': 'reacao', 'reacao': 'reacao',
    'passiva': 'passiva',
}

FIX_LIGATURES = [
    ('fi  ', 'fi'), ('fl  ', 'fl'), ('ff  ', 'ff'),
    ('fi ', 'fi'), ('fl ', 'fl'),  # cautious — only applied to broken-word tokens
    ('Difi  culdade', 'Dificuldade'),
    ('Difi culdade', 'Dificuldade'),
]

def fix_text(s: str) -> str:
    # Unicode minus (U+2212) and non-breaking hyphen → ASCII hyphen
    s = s.replace('\u2212', '-').replace('\u2013', '-').replace('\u2014', '-')
    # fix common ligature corruption: "fi  ca" -> "fica", "Difi  culdade" -> "Dificuldade"
    s = s.replace('fi  ', 'fi').replace('fl  ', 'fl').replace('ff  ', 'ff')
    # space-separated uppercase: "CA V ALEIRO" -> "CAVALEIRO"
    # More general: "X V Y" where X,Y are uppercase letters — join them
    # Also "SIL VESTRE" -> "SILVESTRE"
    # Apply to all-caps tokens: collapse lone letter gaps
    def collapse_caps(m):
        return m.group(0).replace(' ', '')
    s = re.sub(r'\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ]+(?: [A-ZÁÉÍÓÚÂÊÔÃÕÇ] [A-ZÁÉÍÓÚÂÊÔÃÕÇ]+)+)\b', collapse_caps, s)
    return s

def strip_page_headers(lines):
    out = []
    for ln in lines:
        if ln.startswith('======= PDF page '):
            continue
        # Skip page number footer lines like "209" alone or "209Capítulo 4..."
        if re.match(r'^\d{1,3}(Capítulo\s*4[:\s].*)?$', ln.strip()):
            continue
        if re.match(r'^\s*Capítulo\s+4[:\s]', ln):
            continue
        out.append(ln)
    return out

def read_raw():
    text = RAW.read_text(encoding='utf-8')
    text = fix_text(text)
    return [l for l in text.split('\n')]

def find_stat_blocks(lines):
    """Scan lines looking for Type (Xº patamar) header lines. Record (idx, tipo, patamar, paren_extra)."""
    headers = []
    for i, ln in enumerate(lines):
        m = TIPO_HEADER_RE.match(ln.strip())
        if not m:
            continue
        # The name should be the prior non-empty line, and should be all-caps-ish
        prev = None
        for j in range(i-1, max(i-6, -1), -1):
            cand = lines[j].strip()
            if not cand:
                continue
            prev = (j, cand)
            break
        if prev is None:
            continue
        name = prev[1]
        if not re.match(r'^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9][A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9\s,\-\'"]*$', name):
            continue
        # Skip section-level markers that happen to be all-caps: "SOLO", "ATIRADOR" (type headers used as big chapter titles)
        # Those are followed by a paragraph about the type, not a "Motivações..." line.
        # We'll validate further down by requiring a Dificuldade line after.
        tipo_label = m.group(1)
        patamar = int(m.group(2))
        paren = m.group(3) or ''
        headers.append({
            'header_line': i,
            'name_line': prev[0],
            'name': name,
            'tipo_label': tipo_label,
            'tipo': TIPO_MAP[tipo_label],
            'patamar': patamar,
            'paren_extra': paren.strip(),
        })
    return headers

def collect_block(lines, start_idx, end_idx):
    return '\n'.join(lines[start_idx:end_idx])

def parse_stats(chunk):
    m = STATS_RE.search(chunk)
    if not m:
        return None
    dif = int(m.group(1))
    lim_raw = m.group(2).strip()
    pv = int(m.group(3))
    pf = int(m.group(4))
    # Limiares: "6/10" or "nenhum" or "6/Nenhum" or "—/—" etc.
    limMaior, limGrave = None, None
    if lim_raw.lower() not in ('nenhum', 'nenhuma', '—', '-', ''):
        parts = re.split(r'\s*/\s*', lim_raw)
        if len(parts) == 2:
            for idx, p in enumerate(parts):
                if re.fullmatch(r'\d+', p):
                    v = int(p)
                    if idx == 0: limMaior = v
                    else: limGrave = v
                # if "Nenhum" leave as None
    return dif, limMaior, limGrave, pv, pf

def parse_atq(chunk):
    # Find the ATQ line. Bonus can be numeric (+3) or dice (+2d4, -1d6).
    m = re.search(r'ATQ:\s*([+\-]?\d+(?:d\d+)?)\s*\|\s*([^\n\|]+?)\s*\|\s*([^\n]+)', chunk)
    if not m:
        return None
    raw_bonus = m.group(1)
    dice_bonus = ''
    if 'd' in raw_bonus:
        # Keep numeric prefix as atq, remember dice part for the attack name
        prefix = re.match(r'([+\-]?\d+)', raw_bonus).group(1)
        atq = int(prefix)
        dice_bonus = raw_bonus
    else:
        atq = int(raw_bonus)
    nome_alcance = m.group(2).strip()
    dano = m.group(3).strip()
    # nome_alcance might be "Cajado de carvalho: corpo a corpo" or single "Cajado: muito próximo"
    if ':' in nome_alcance:
        nome, alcance = [s.strip() for s in nome_alcance.split(':', 1)]
    else:
        nome, alcance = nome_alcance, ''
    # normalize dano: remove trailing page numbers/footers
    dano = re.sub(r'\s{2,}.*$', '', dano)
    # Multi-line ATQ sometimes wraps — take first damage-looking token: e.g. "1d10+1 fís" or "2d6 mág"
    m2 = re.match(r'((?:\d+(?:d\d+)?(?:[+\-]\d+)?)\s+(?:fís|mág))', dano, re.IGNORECASE)
    if m2:
        dano = m2.group(1)
    if dice_bonus:
        nome = f'{nome} (ATQ {dice_bonus})'
    return atq, nome, alcance, dano

def parse_experiencias(chunk):
    m = re.search(r'Experiências?:\s*([^\n]+(?:\n(?!ATQ|Dificuldade|HABILIDADES|Motivações|Dificul|Limiar)[^\n]+)*)', chunk)
    if not m:
        return []
    raw = m.group(1)
    # Split by commas, parse "Nome +X"
    entries = []
    for part in re.split(r',\s*', raw):
        part = part.strip().rstrip('.')
        em = re.match(r'(.+?)\s*\+(\d+)$', part)
        if em:
            entries.append({'nome': em.group(1).strip(), 'bonus': int(em.group(2))})
    return entries

def parse_motivacoes(chunk):
    m = re.search(r'Motivações? e táticas?:\s*([^\n]+(?:\n(?!Dificuldade|Dificul|ATQ|HABILIDADES|Experiências)[^\n]+)*)', chunk)
    if not m:
        return []
    text = m.group(1).strip()
    # strip trailing periods
    text = text.rstrip('.')
    # split commas or "e "
    parts = re.split(r',\s*', text)
    out = []
    for p in parts:
        p = p.strip()
        if not p: continue
        out.append(p)
    return out

def parse_descricao(chunk):
    """Description is between the type header and the 'Motivações' line. Multi-line italic-ish."""
    # Take lines after header until 'Motivações'
    lines = chunk.split('\n')
    # drop first line (header) — we'll pass chunk without the header above
    # Collect until 'Motivações' or a stat line
    desc = []
    for ln in lines:
        s = ln.strip()
        if s.startswith('Motivações') or s.startswith('Dificuldade') or s.startswith('ATQ'):
            break
        desc.append(s)
    desc_text = ' '.join([s for s in desc if s]).strip()
    # Cleanup multiple spaces
    desc_text = re.sub(r'\s+', ' ', desc_text)
    return desc_text

ABILITY_START_RE = re.compile(
    r'^([A-ZÁÉÍÓÚÂÊÔÃÕÇ][^:\(]{0,80}?)\s*\(((?:ação|acao|reação|reacao|passiva)(?:[^)]*)?)\)\s*:\s*(.*)$'
)

def parse_habilidades(chunk):
    """Parse abilities after HABILIDADES header."""
    m = re.search(r'HABILIDADES\s*\n', chunk)
    if not m:
        return []
    remainder = chunk[m.end():]
    # Remove trailing stuff that might leak into next block — caller truncates chunk at next block start
    lines = remainder.split('\n')
    abilities = []
    current = None
    for ln in lines:
        raw = ln.rstrip()
        stripped = raw.strip()
        if not stripped:
            if current:
                current['descricao'] += '\n'
            continue
        am = ABILITY_START_RE.match(stripped)
        if am:
            if current:
                abilities.append(current)
            nome = am.group(1).strip()
            kind_raw = am.group(2).strip().lower()
            # Extract first word
            first = kind_raw.split()[0]
            tipo = ABILITY_KIND_MAP.get(first, 'passiva')
            descricao = am.group(3).strip()
            current = {'nome': nome, 'tipo': tipo, 'descricao': descricao}
        else:
            if current:
                current['descricao'] += ' ' + stripped
    if current:
        abilities.append(current)
    # Collapse whitespace
    for a in abilities:
        a['descricao'] = re.sub(r'\s+', ' ', a['descricao']).strip()
    return abilities

def slugify(s: str) -> str:
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = re.sub(r'^-+|-+$', '', s)
    return s[:60] or 'adversaria'

def normalize_name(name: str) -> str:
    """Title Case for stat block names that come in ALL CAPS."""
    # Keep intentional all-caps small words but Title Case most
    parts = name.split()
    out = []
    for p in parts:
        if len(p) <= 2:
            out.append(p.lower() if p.lower() in ('de', 'do', 'da', 'dos', 'das', 'e', 'o', 'a') else p.title())
        else:
            out.append(p.title())
    return ' '.join(out).replace(',', ',')

def parse():
    lines = read_raw()
    lines = strip_page_headers(lines)
    headers = find_stat_blocks(lines)

    # Filter out false positives: type section headers like big "SOLO" (no following stat line).
    blocks = []
    for i, h in enumerate(headers):
        start = h['name_line']
        end = headers[i+1]['name_line'] if i+1 < len(headers) else len(lines)
        chunk = collect_block(lines, start, end)
        if not STATS_RE.search(chunk):
            continue  # skip false positive (e.g., type intro paragraphs)
        stats = parse_stats(chunk)
        if stats is None:
            continue
        dif, lmaj, lgra, pv, pf = stats
        atq = parse_atq(chunk)
        if atq is None:
            atq_val, atq_nome, atq_alc, atq_dano = 0, '-', '', '1 fís'
        else:
            atq_val, atq_nome, atq_alc, atq_dano = atq
        # Description uses the chunk minus the header line (first line)
        chunk_no_header = '\n'.join(chunk.split('\n')[2:])  # skip name + header
        descricao = parse_descricao(chunk_no_header)
        motivacoes = parse_motivacoes(chunk)
        experiencias = parse_experiencias(chunk)
        habilidades = parse_habilidades(chunk)

        nome = normalize_name(h['name'])
        slug = slugify(nome)
        adv = {
            'id': f'oficial:{slug}',
            'nome': nome,
            'tipo': h['tipo'],
            'patamar': h['patamar'],
            'descricao': descricao,
            'motivacoes': motivacoes,
            'dificuldade': dif,
            'limiarMaior': lmaj,
            'limiarGrave': lgra,
            'pv': pv,
            'pf': pf,
            'atq': atq_val,
            'ataques': [{'id': f's-{slug}-atq', 'nome': atq_nome, 'alcance': atq_alc, 'dano': atq_dano}],
            'experiencias': [{'id': f's-{slug}-exp{n}', **e} for n, e in enumerate(experiencias)],
            'habilidades': [{'id': f's-{slug}-hab{n}', **a} for n, a in enumerate(habilidades)],
            'criadoEm': '1970-01-01T00:00:00.000Z',
            'atualizadoEm': '1970-01-01T00:00:00.000Z',
        }
        if h['tipo'] == 'horda' and h['paren_extra']:
            adv['hordaRatio'] = h['paren_extra']
        blocks.append(adv)

    # Dedup by id (in case same stat block parsed twice)
    seen = set()
    unique = []
    for b in blocks:
        if b['id'] in seen: continue
        seen.add(b['id'])
        unique.append(b)
    return unique

def render_ts(entries):
    lines = [
        "import type { Adversary } from '@/types/adversary';",
        '',
        '/**',
        ' * Bestiário oficial — Livro Básico de Daggerheart PT-BR, pp.209–239.',
        ' * Gerado automaticamente pelo parser em docs/parse_bestiary.py.',
        ' * IDs prefixados com `oficial:` para não colidir com a biblioteca do usuário.',
        ' * Timestamps "1970-01-01" marcam origem estática.',
        ' */',
        '',
        'export const BESTIARIO: Adversary[] = [',
    ]
    for adv in entries:
        lines.append('  ' + json.dumps(adv, ensure_ascii=False) + ',')
    lines += [
        '];',
        '',
        'export function findBestiarioEntry(id: string): Adversary | undefined {',
        '  return BESTIARIO.find((a) => a.id === id);',
        '}',
        '',
    ]
    return '\n'.join(lines)

def main():
    entries = parse()
    print(f'parsed {len(entries)} adversaries', file=sys.stderr)
    OUT_JSON.write_text(json.dumps(entries, indent=2, ensure_ascii=False), encoding='utf-8')
    ts = render_ts(entries)
    OUT_TS.write_text(ts, encoding='utf-8')
    # Diagnostics
    for e in entries[:3]:
        print(json.dumps(e, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()
