# press-style — 대구 북구청 보도자료 문체 키트

| 경로 | 내용 |
|---|---|
| `북구청 보도자료 문체 가이드라인.md` | 정본. 관찰 수치, 지킬 형식, 덜어 낼 것, 압축 프롬프트 |
| `corpus/buk_press_2018-2026.csv` | 공공데이터포털 15149016 「대구광역시 북구_보도자료」 1,412건(2018-02-28~2026-08-14, 이용허락범위 제한 없음). 내려받은 날 2026-11-07 |
| `scripts/analyze_press.py` | 표준 라이브러리만 쓰는 통계 스크립트 |
| `stats_all.json`, `stats_2024-.json` | 전체 / 2024-01-01 이후 통계 |
| `samples/` | 시험 윤문 1건(원문·결과·작업 기록) |

## 다시 만들기

```bash
python3 press-style/scripts/analyze_press.py --json press-style/stats_all.json
python3 press-style/scripts/analyze_press.py --since 2024-01-01 --json press-style/stats_2024-.json
```

새 CSV를 받으면 `corpus/`의 파일을 바꾸고 위 두 줄을 다시 돌린 뒤 가이드라인 §1 표를 손으로 맞춘다.

## 한계

- 이 CSV는 2026-08-14 등록분까지만 있다. 북구청 홈페이지 게시판(2026-11-06, 1597번까지)과 차이가 있다.
- 종결·상투어 집계는 정규식 근사다. 「기타」 종결 16%는 명사형 부제·괄호 끝 문장 등이다.
- slop-rewrite(https://github.com/byungjunjang/slop-rewrite)에는 라이선스 파일이 없어 원문을 이 저장소에 복제하지 않았다.
