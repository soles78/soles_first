"""대구 북구청 보도자료 코퍼스 문체 통계 (표준 라이브러리만 사용).

사용: python3 press-style/scripts/analyze_press.py [CSV] [--since YYYY-MM-DD] [--json OUT]
CSV 열: 제목, 내용, 등록일, 부서, 전화번호 (공공데이터포털 15149016)
"""
import csv, json, re, statistics, sys
from collections import Counter

args = sys.argv[1:]
path = 'press-style/corpus/buk_press_2018-2026.csv'
since, out = '0000', None
i = 0
while i < len(args):
    if args[i] == '--since': since = args[i+1]; i += 2
    elif args[i] == '--json': out = args[i+1]; i += 2
    else: path = args[i]; i += 1

rows = [r for r in csv.DictReader(open(path, encoding='utf-8-sig')) if r['등록일'] >= since]
N = len(rows)
S = {'n': N, 'since': since, 'range': [min(r['등록일'] for r in rows), max(r['등록일'] for r in rows)]}
pct = lambda c: round(100 * c / N, 1)

def sents(t):
    t = re.sub(r'"[^"]*"|“[^”]*”', 'Q', t)          # 인용문은 한 덩어리로
    return [s.strip() for s in re.split(r'(?<=[다요])\.\s*|\s*○\s*', t) if len(s.strip()) > 5]

body_len = [len(r['내용']) for r in rows]
title_len = [len(r['제목']) for r in rows]
S['본문_글자수_중앙값'] = statistics.median(body_len)
S['본문_글자수_사분위'] = [round(x) for x in statistics.quantiles(body_len, n=4)]
S['제목_글자수_중앙값'] = statistics.median(title_len)

allsent = [s for r in rows for s in sents(r['내용'])]
slen = [len(s) for s in allsent]
S['문장수'] = len(allsent)
S['문장_글자수_중앙값'] = statistics.median(slen)
S['문장_글자수_사분위'] = [round(x) for x in statistics.quantiles(slen, n=4)]
S['문장_80자초과_비율'] = round(100 * sum(l > 80 for l in slen) / len(slen), 1)

# 종결 (문장 끝 4글자 기준 범주)
end_pat = [('할 계획이다', r'계획이다$'), ('할 예정이다', r'예정이다$'), ('라고 말했다/밝혔다', r'(말했|밝혔|전했|강조했)다$'),
           ('기대된다/전망이다', r'(기대된다|전망이다)$'), ('했다(과거)', r'었다$|았다$|했다$|였다$'),
           ('한다(현재)', r'한다$|된다$|ㄴ다$'), ('이다(지정)', r'이다$'), ('있다', r'있다$')]
ec = Counter()
for s in allsent:
    for name, p in end_pat:
        if re.search(p, s): ec[name] += 1; break
    else: ec['기타'] += 1
S['종결_분포_%'] = {k: round(100 * v / len(allsent), 1) for k, v in ec.most_common()}

def has(p, field='내용'): return sum(bool(re.search(p, r[field])) for r in rows)
S['도입부'] = {
    '첫 문장에 「기관명(청장·구청장·소장 ○○○)」 표기': pct(has(r'^[^○]{0,150}?\((구?청장|소장|회장|관장|센터장)\s?\S+\)')),
    '「대구 북구청(청장/구청장 ○○○)은」으로 시작': pct(has(r'^[^○]{0,150}?대구\s?북구청?\s?\(구?청장')),
    '본문 첫 ○ 앞에 부제 있음': pct(sum(1 for r in rows if '○' in r['내용'] and not re.search(r'대구|북구', r['내용'].split('○')[0][:15]) and len(r['내용'].split('○')[0]) < 120)),
    '○ 항목 표지 사용': pct(has(r'○')),
    '▲ 나열 사용': pct(has(r'▲')),
    '날짜에 요일 괄호 표기 예 7월 1일(수)': pct(has(r'\d+일\s?\([월화수목금토일]\)')),
}
S['인용'] = {
    '구청장 인용 포함': pct(has(r'구청장[은는]?\s*["“]')),
    '인용 맺음 「라고 말했다」': pct(has(r'라고\s*말했다')),
    '인용 맺음 「라고 밝혔다」': pct(has(r'라고\s*밝혔다')),
    '인용 맺음 「라고 전했다」': pct(has(r'라고\s*전했다')),
    '「라며,」로 인용 2개 잇기': pct(has(r'라며\s*,?\s*["“]')),
    '인용 끝 「~하겠다」 다짐형': pct(has(r'겠다\.?["”]\s*라고')),
}
S['제목'] = {
    '「대구 북구」로 시작': pct(has(r'^\s*대구\s?북구', '제목')),
    '따옴표 카피 포함': pct(has(r'["“‘\']', '제목')),
    '느낌표 포함': pct(has(r'!', '제목')),
    '「개최」로 끝남': pct(has(r'개최\s*$', '제목')),
    '「실시」로 끝남': pct(has(r'실시\s*$', '제목')),
    '「선정」 포함': pct(has(r'선정', '제목')),
}
cliche = ['적극', '대폭', '한층', '명품', '성황리', '앞으로도', '최선을 다하', '기대된다', '할 수 있도록 하겠다', '노력하겠다',
          '아낌없', '뜻깊', '다채로운', '눈길', '호평', '큰 호응', '힐링', '활성화', '체계적', '본격', '획기적', '이바지', '기여']
S['상투어_사용_문서비율_%'] = dict(sorted({w: pct(has(re.escape(w))) for w in cliche}.items(), key=lambda x: -x[1]))
S['부서_상위10'] = Counter(r['부서'] for r in rows).most_common(10)
S['연도별_건수'] = dict(sorted(Counter(r['등록일'][:4] for r in rows).items()))

if out: json.dump(S, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(S, ensure_ascii=False, indent=1))
