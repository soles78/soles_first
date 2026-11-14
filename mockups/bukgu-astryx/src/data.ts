// 시안용 예시 데이터. 제목·부서·일정은 모두 가상이며 실제 북구청 자료가 아닙니다.

export type PressCategory = '구정일반' | '복지' | '문화관광' | '안전' | '환경' | '경제';

interface PressBase {
  title: string;
  category: PressCategory;
  dept: string;
  date: string; // YYYY-MM-DD
  hasPhoto: boolean;
  embargo?: string;
}

export interface PressRelease extends PressBase, Record<string, unknown> {
  id: string;
  no: number;
}

export const TODAY = '2026-11-14';

const RAW: PressBase[] = [
  {title: '북구, 겨울철 한파 대비 취약계층 안전 점검 나서', category: '복지', dept: '복지정책과', date: '2026-11-13', hasPhoto: true},
  {title: '북구, 주민참여예산 사업 제안 공모 결과 발표', category: '구정일반', dept: '기획예산과', date: '2026-11-12', hasPhoto: false, embargo: '2026-11-13 조간'},
  {title: '북구, 생활권 공원 야간 조명 개선 사업 마무리', category: '환경', dept: '공원녹지과', date: '2026-11-11', hasPhoto: true},
  {title: '북구, 소상공인 경영 컨설팅 참여 업체 모집', category: '경제', dept: '일자리경제과', date: '2026-11-10', hasPhoto: false},
  {title: '북구, 어린이 통학로 교통안전 시설 정비', category: '안전', dept: '교통과', date: '2026-11-09', hasPhoto: true},
  {title: '북구, 가을 독서 문화 행사 마무리', category: '문화관광', dept: '문화관광과', date: '2026-11-06', hasPhoto: true},
  {title: '북구, 노후 공동주택 화재 안전 합동 점검 실시', category: '안전', dept: '안전총괄과', date: '2026-11-05', hasPhoto: false},
  {title: '북구, 1인 가구 사회적 고립 예방 프로그램 운영', category: '복지', dept: '복지정책과', date: '2026-11-04', hasPhoto: false},
  {title: '북구, 청년 창업 공간 입주 기업 모집', category: '경제', dept: '일자리경제과', date: '2026-11-03', hasPhoto: false},
  {title: '북구, 재활용품 분리배출 집중 홍보 기간 운영', category: '환경', dept: '자원순환과', date: '2026-11-02', hasPhoto: true},
  {title: '북구, 구민 생활법률 무료 상담 운영', category: '구정일반', dept: '민원봉사과', date: '2026-10-30', hasPhoto: false},
  {title: '북구, 하천변 산책로 환경 정비 추진', category: '환경', dept: '건설과', date: '2026-10-29', hasPhoto: true},
  {title: '북구, 찾아가는 치매 조기 검진 서비스 확대', category: '복지', dept: '보건소', date: '2026-10-28', hasPhoto: false},
  {title: '북구, 전통시장 가을맞이 할인 행사 지원', category: '경제', dept: '일자리경제과', date: '2026-10-27', hasPhoto: true},
  {title: '북구, 공공 와이파이 확충 사업 추진', category: '구정일반', dept: '정보통신과', date: '2026-10-26', hasPhoto: false},
];

export const PRESS: PressRelease[] = RAW.map((r, i) => ({
  ...r,
  id: `pr-${i + 1}`,
  no: RAW.length - i,
}));

export const PRESS_CATEGORIES: PressCategory[] = ['구정일반', '복지', '문화관광', '안전', '환경', '경제'];

export const CATEGORY_BADGE: Record<PressCategory, 'blue' | 'green' | 'purple' | 'red' | 'teal' | 'orange'> = {
  구정일반: 'blue',
  복지: 'green',
  문화관광: 'purple',
  안전: 'red',
  환경: 'teal',
  경제: 'orange',
};

export type EventStatus = '접수중' | '진행예정' | '마감' | '종료';

export interface CivicEvent {
  id: string;
  title: string;
  category: string;
  start: string; // YYYY-MM-DD
  end?: string;
  time?: string;
  place: string;
  target: string;
  fee: string;
  status: EventStatus;
  apply: string;
  dept: string;
  tone: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'pink';
  summary: string;
}

export const EVENTS: CivicEvent[] = [
  {
    id: 'ev-1',
    title: '주민과 함께하는 가을 음악회',
    category: '문화',
    start: '2026-11-21',
    time: '18:00',
    place: '구청 앞 광장 [예시]',
    target: '구민 누구나',
    fee: '무료',
    status: '진행예정',
    apply: '사전 신청 없음 (현장 자유 관람)',
    dept: '문화관광과',
    tone: 'purple',
    summary: '지역 예술 단체가 함께하는 야외 음악회입니다. 우천 시 장소가 바뀔 수 있습니다.',
  },
  {
    id: 'ev-2',
    title: '겨울방학 어린이 코딩 교실',
    category: '교육',
    start: '2027-01-05',
    end: '2027-01-08',
    time: '10:00~12:00',
    place: '○○도서관 강의실 [예시]',
    target: '초등학교 4~6학년',
    fee: '무료',
    status: '접수중',
    apply: '2026. 11. 9.(월) ~ 11. 30.(월), 온라인 선착순',
    dept: '교육지원과',
    tone: 'blue',
    summary: '블록 코딩으로 간단한 게임을 만들어 보는 4일 과정입니다.',
  },
  {
    id: 'ev-3',
    title: '어르신 스마트폰 활용 교육',
    category: '복지',
    start: '2026-11-24',
    end: '2026-12-15',
    time: '매주 화요일 14:00',
    place: '○○노인복지관 [예시]',
    target: '만 65세 이상 구민',
    fee: '무료',
    status: '접수중',
    apply: '전화 또는 방문 접수 (연락처 [확인요망])',
    dept: '노인장애인과',
    tone: 'green',
    summary: '키오스크 이용, 영상통화, 공공 앱 사용법을 단계별로 배웁니다.',
  },
  {
    id: 'ev-4',
    title: '연말 이웃 나눔 바자회',
    category: '나눔',
    start: '2026-12-05',
    time: '10:00~15:00',
    place: '구청 앞 광장 [예시]',
    target: '구민 누구나',
    fee: '무료 입장',
    status: '진행예정',
    apply: '판매 참여 단체는 별도 공고 예정',
    dept: '복지정책과',
    tone: 'orange',
    summary: '수익금은 지역 취약계층 지원에 쓰일 예정입니다.',
  },
  {
    id: 'ev-5',
    title: '구민 생활법률 아카데미',
    category: '교육',
    start: '2026-11-18',
    time: '14:00~16:00',
    place: '구청 대강당 [예시]',
    target: '구민 누구나 (선착순)',
    fee: '무료',
    status: '마감',
    apply: '접수 마감',
    dept: '민원봉사과',
    tone: 'teal',
    summary: '임대차·상속 등 생활 속 법률 문제를 전문가와 함께 알아봅니다.',
  },
  {
    id: 'ev-6',
    title: '가족과 함께 걷는 하천길',
    category: '체육',
    start: '2026-10-24',
    time: '09:00',
    place: '○○천 산책로 [예시]',
    target: '구민 가족 단위',
    fee: '무료',
    status: '종료',
    apply: '행사 종료',
    dept: '체육진흥과',
    tone: 'pink',
    summary: '하천 산책로를 따라 걷는 가족 걷기 행사입니다.',
  },
];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 공문서식 날짜 표기: 2026. 11. 13.(금) */
export function formatKDate(iso: string, withYear = true): string {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${withYear ? `${y}. ` : ''}${m}. ${d}.(${wd})`;
}

export function daysBetween(a: string, b: string): number {
  const toUtc = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86400000);
}

export function eventPeriod(ev: CivicEvent): string {
  if (!ev.end) return formatKDate(ev.start);
  const sameYear = ev.start.slice(0, 4) === ev.end.slice(0, 4);
  return `${formatKDate(ev.start)} ~ ${formatKDate(ev.end, !sameYear)}`;
}
