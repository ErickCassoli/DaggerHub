"""
Parser de Hope & Fear — Daggerheart (expansão PT-BR, agosto 2026).
Fork de docs/parse_bestiary.py — adapte os TODO abaixo quando o PDF estiver disponível.

Uso:
  python docs/parse_hope_and_fear.py

Pré-requisitos:
  1. Extraia o texto do PDF usando pdfminer.six ou pypdf:
       python -m pdfminer.high_level extract_text "hope_and_fear_ptbr.pdf" > docs/hf_raw.txt
  2. Ajuste RAW abaixo para apontar ao arquivo extraído.
  3. Ajuste o intervalo de páginas (TODO: pgs dos stat blocks no livro).
  4. Execute e valide os primeiros 5 resultados.
  5. Se necessário, ajuste regexes por particularidades do layout do H&F.

Diferenças esperadas vs. Livro Básico (atualizar aqui após leitura):
  - TODO: verificar se H&F usa "Domínio do Terror" como seção antes dos stat blocks.
  - TODO: verificar se existem tipos novos além dos 10 do Livro Básico.
  - TODO: verificar se há campo "Transformação" ou "Maldição" nos stat blocks.
  - TODO: verificar formato dos limiares (pode diferir para Senhores do Domínio).
  - TODO: verificar campos de Mascote se o PDF PT-BR incluir mecânica de Mascotes.
"""
import re
import json
import sys
import unicodedata
from pathlib import Path

# TODO: ajustar para o caminho real após extrair o texto do PDF.
RAW = Path('docs/hf_raw.txt')
OUT_TS = Path('src/data/bestiarioExpansao.ts')
OUT_JSON = Path('docs/hf_parsed.json')

# ID prefix: "hf:" para não colidir com "oficial:" (Livro Básico) e IDs do usuário.
ID_PREFIX = 'hf:'

# Fonte a ser injetada em todas as entradas geradas por este parser.
FONTE_VALUE = 'hope_and_fear'

TIPO_MAP = {
    'Assistente': 'assistente', 'Atirador': 'atirador', 'Brutamonte': 'brutamonte',
    'Comum': 'comum', 'Horda': 'horda', 'Lacaio': 'lacaio', 'Líder': 'lider',
    'Lider': 'lider', 'Manipulador': 'manipulador', 'Oportunista': 'oportunista',
    'Solo': 'solo',
    # TODO: adicionar novos tipos introduzidos por H&F, se houver.
}

PATAMAR_RE = re.compile(r'(\d)º patamar')
TIPO_HEADER_RE = re.compile(
    r'^(Assistente|Atirador|Brutamonte|Comum|Horda|Lacaio|Líder|Manipulador|Oportunista|Solo)\s*\((\d)º patamar\)(?:\s*\(([^)]+)\))?\s*$'
    # TODO: se H&F tiver tipos adicionais, adicionar ao grupo de alternativas acima.
)
STATS_RE = re.compile(
    r'Dificuldade:\s*(\d+)\s*\|\s*Limiares?:\s*([^\|]+?)\s*\|\s*(\d+)\s*PV\s*\|\s*(\d+)\s*PF'
    # TODO: verificar se H&F usa o mesmo formato de linha de stats.
)
ATQ_RE = re.compile(r'ATQ:\s*([+\-]?\d+)\s*\|\s*([^\|]+?)\s*\|\s*(.+?)$')

ABILITY_KIND_MAP = {
    'ação': 'acao', 'acao': 'acao', 'reação': 'reacao', 'reacao': 'reacao',
    'passiva': 'passiva',
}


def fix_text(s: str) -> str:
    s = s.replace('−', '-').replace('–', '-').replace('—', '-')
    s = s.replace('fi  ', 'fi').replace('fl  ', 'fl').replace('ff  ', 'ff')

    def collapse_caps(m):
        return m.group(0).replace(' ', '')

    s = re.sub(r'\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ]+(?: [A-ZÁÉÍÓÚÂÊÔÃÕÇ] [A-ZÁÉÍÓÚÂÊÔÃÕÇ]+)+)\b', collapse_caps, s)
    return s


def strip_page_headers(lines):
    out = []
    for ln in lines:
        if ln.startswith('======= PDF page '):
            continue
        # TODO: ajustar para o padrão de cabeçalho/rodapé de H&F (capítulo, número de página).
        if re.match(r'^\d{1,3}(Capítulo\s*\d+[:\s].*)?$', ln.strip()):
            continue
        if re.match(r'^\s*Capítulo\s+\d+[:\s]', ln):
            continue
        out.append(ln)
    return out


def read_raw():
    text = RAW.read_text(encoding='utf-8')
    text = fix_text(text)
    return [l for l in text.split('\n')]


def find_stat_blocks(lines):
    headers = []
    for i, ln in enumerate(lines):
        m = TIPO_HEADER_RE.match(ln.strip())
        if not m:
            continue
        prev = None
        for j in range(i - 1, max(i - 6, -1), -1):
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
    limMaior, limGrave = None, None
    if lim_raw.lower() not in ('nenhum', 'nenhuma', '—', '-', ''):
        parts = re.split(r'\s*/\s*', lim_raw)
        if len(parts) == 2:
            for idx, p in enumerate(parts):
                if re.fullmatch(r'\d+', p):
                    v = int(p)
                    if idx == 0:
                        limMaior = v
                    else:
                        limGrave = v
    return dif, limMaior, limGrave, pv, pf


def parse_atq(chunk):
    m = re.search(r'ATQ:\s*([+\-]?\d+(?:d\d+)?)\s*\|\s*([^\n\|]+?)\s*\|\s*([^\n]+)', chunk)
    if not m:
        return None
    raw_bonus = m.group(1)
    dice_bonus = ''
    if 'd' in raw_bonus:
        prefix = re.match(r'([+\-]?\d+)', raw_bonus).group(1)
        atq = int(prefix)
        dice_bonus = raw_bonus
    else:
        atq = int(raw_bonus)
    nome_alcance = m.group(2).strip()
    dano = m.group(3).strip()
    if ':' in nome_alcance:
        nome, alcance = [s.strip() for s in nome_alcance.split(':', 1)]
    else:
        nome, alcance = nome_alcance, ''
    dano = re.sub(r'\s{2,}.*$', '', dano)
    m2 = re.match(r'((?:\d+(?:d\d+)?(?:[+\-]\d+)?)\s+(?:fís|mág))', dano, re.IGNORECASE)
    if m2:
        dano = m2.group(1)
    if dice_bonus:
        nome = f'{nome} (ATQ {dice_bonus})'
    return atq, nome, alcance, dano


def parse_experiencias(chunk):
    m = re.search(
        r'Experiências?:\s*([^\n]+(?:\n(?!ATQ|Dificuldade|HABILIDADES|Motivações|Dificul|Limiar)[^\n]+)*)',
        chunk,
    )
    if not m:
        return []
    raw = m.group(1)
    entries = []
    for part in re.split(r',\s*', raw):
        part = part.strip().rstrip('.')
        em = re.match(r'(.+?)\s*\+(\d+)$', part)
        if em:
            entries.append({'nome': em.group(1).strip(), 'bonus': int(em.group(2))})
    return entries


def parse_motivacoes(chunk):
    m = re.search(
        r'Motivações? e táticas?:\s*([^\n]+(?:\n(?!Dificuldade|Dificul|ATQ|HABILIDADES|Experiências)[^\n]+)*)',
        chunk,
    )
    if not m:
        return []
    text = m.group(1).strip().rstrip('.')
    parts = re.split(r',\s*', text)
    return [p.strip() for p in parts if p.strip()]


def parse_descricao(chunk):
    lines = chunk.split('\n')
    desc = []
    for ln in lines:
        s = ln.strip()
        if s.startswith('Motivações') or s.startswith('Dificuldade') or s.startswith('ATQ'):
            break
        desc.append(s)
    desc_text = ' '.join([s for s in desc if s]).strip()
    return re.sub(r'\s+', ' ', desc_text)


ABILITY_START_RE = re.compile(
    r'^([A-ZÁÉÍÓÚÂÊÔÃÕÇ][^:\(]{0,80}?)\s*\(((?:ação|acao|reação|reacao|passiva)(?:[^)]*)?)\)\s*:\s*(.*)$'
)


def parse_habilidades(chunk):
    m = re.search(r'HABILIDADES\s*\n', chunk)
    if not m:
        return []
    remainder = chunk[m.end():]
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
            first = kind_raw.split()[0]
            tipo = ABILITY_KIND_MAP.get(first, 'passiva')
            descricao = am.group(3).strip()
            current = {'nome': nome, 'tipo': tipo, 'descricao': descricao}
        else:
            if current:
                current['descricao'] += ' ' + stripped
    if current:
        abilities.append(current)
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

    blocks = []
    for i, h in enumerate(headers):
        start = h['name_line']
        end = headers[i + 1]['name_line'] if i + 1 < len(headers) else len(lines)
        chunk = collect_block(lines, start, end)
        if not STATS_RE.search(chunk):
            continue
        stats = parse_stats(chunk)
        if stats is None:
            continue
        dif, lmaj, lgra, pv, pf = stats
        atq = parse_atq(chunk)
        if atq is None:
            atq_val, atq_nome, atq_alc, atq_dano = 0, '-', '', '1 fís'
        else:
            atq_val, atq_nome, atq_alc, atq_dano = atq
        chunk_no_header = '\n'.join(chunk.split('\n')[2:])
        descricao = parse_descricao(chunk_no_header)
        motivacoes = parse_motivacoes(chunk)
        experiencias = parse_experiencias(chunk)
        habilidades = parse_habilidades(chunk)

        nome = normalize_name(h['name'])
        slug = slugify(nome)
        adv = {
            'id': f'{ID_PREFIX}{slug}',
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
            'ataques': [{'id': f'hf-{slug}-atq', 'nome': atq_nome, 'alcance': atq_alc, 'dano': atq_dano}],
            'experiencias': [{'id': f'hf-{slug}-exp{n}', **e} for n, e in enumerate(experiencias)],
            'habilidades': [{'id': f'hf-{slug}-hab{n}', **a} for n, a in enumerate(habilidades)],
            'fonte': FONTE_VALUE,
            'criadoEm': '1970-01-01T00:00:00.000Z',
            'atualizadoEm': '1970-01-01T00:00:00.000Z',
        }
        if h['tipo'] == 'horda' and h['paren_extra']:
            adv['hordaRatio'] = h['paren_extra']
        blocks.append(adv)

    seen = set()
    unique = []
    for b in blocks:
        if b['id'] in seen:
            continue
        seen.add(b['id'])
        unique.append(b)
    return unique


def render_ts(entries):
    lines = [
        "import type { Adversary } from '@/types/adversary';",
        '',
        '/**',
        f' * Adversárias oficiais de Hope & Fear — Daggerheart (expansão PT-BR).',
        f' * Gerado automaticamente por docs/parse_hope_and_fear.py.',
        f' * IDs prefixados com `{ID_PREFIX}` para não colidir com `oficial:` ou IDs do usuário.',
        f' * Timestamps "1970-01-01" marcam origem estática.',
        ' */',
        '',
        'export const BESTIARIO_EXPANSAO: Adversary[] = [',
    ]
    for adv in entries:
        lines.append('  ' + json.dumps(adv, ensure_ascii=False) + ',')
    lines += [
        '];',
        '',
    ]
    return '\n'.join(lines)


def main():
    if not RAW.exists():
        print(
            f'ERRO: arquivo de texto cru não encontrado em {RAW}.\n'
            'Extraia o texto do PDF com pdfminer.six:\n'
            '  python -m pdfminer.high_level extract_text "hope_and_fear_ptbr.pdf" > docs/hf_raw.txt\n'
            'Então ajuste RAW neste script e execute novamente.',
            file=sys.stderr,
        )
        sys.exit(1)

    entries = parse()
    print(f'Parseadas {len(entries)} adversárias de H&F.', file=sys.stderr)
    OUT_JSON.write_text(json.dumps(entries, indent=2, ensure_ascii=False), encoding='utf-8')
    ts = render_ts(entries)
    OUT_TS.write_text(ts, encoding='utf-8')
    print(f'Saída TypeScript: {OUT_TS}', file=sys.stderr)
    print(f'Saída JSON: {OUT_JSON}', file=sys.stderr)
    for e in entries[:3]:
        print(json.dumps(e, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
