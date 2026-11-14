import {useEffect, useMemo, useState} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {TopNav, TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Button} from '@astryxdesign/core/Button';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Link} from '@astryxdesign/core/Link';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Selector} from '@astryxdesign/core/Selector';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import {Pagination} from '@astryxdesign/core/Pagination';
import {Drawer, DrawerHeader} from '@astryxdesign/core/Drawer';
import {Layout, LayoutContent, LayoutFooter} from '@astryxdesign/core/Layout';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {
  BuildingLibraryIcon,
  PhotoIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  MusicalNoteIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  GiftIcon,
  ScaleIcon,
  SunIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  ClockIcon,
  DocumentTextIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import {
  PRESS,
  PRESS_CATEGORIES,
  CATEGORY_BADGE,
  EVENTS,
  TODAY,
  formatKDate,
  daysBetween,
  eventPeriod,
  type PressRelease,
  type CivicEvent,
  type EventStatus,
} from './data';

type TabKey = 'press' | 'events';
const PAGE_SIZE = 8;

function useIsNarrow(query = '(max-width: 720px)') {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return narrow;
}

const isNew = (p: PressRelease) => daysBetween(p.date, TODAY) <= 3;

/* ------------------------------------------------------------------ */
/* 보도자료                                                             */
/* ------------------------------------------------------------------ */

function PressBoard() {
  const narrow = useIsNarrow();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [period, setPeriod] = useState('all');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    return PRESS.filter(p => {
      if (q && !p.title.includes(q) && !p.dept.includes(q)) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (period === 'week' && daysBetween(p.date, TODAY) > 7) return false;
      if (period === 'month' && daysBetween(p.date, TODAY) > 31) return false;
      return true;
    });
  }, [query, category, period]);

  useEffect(() => setPage(1), [query, category, period]);

  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = PRESS.find(p => p.id === openId) ?? null;

  const openDetail = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenId(id);
  };

  return (
    <VStack gap={4}>
      <div className="filter-bar">
        <TextInput
          type="search"
          label="검색어"
          isLabelHidden
          placeholder="제목 또는 담당부서 검색"
          startIcon="search"
          value={query}
          onChange={setQuery}
          hasClear
          width={narrow ? '100%' : 280}
        />
        <Selector
          label="분야"
          isLabelHidden
          value={category}
          onChange={v => setCategory(v ?? 'all')}
          options={[
            {value: 'all', label: '전체 분야'},
            ...PRESS_CATEGORIES.map(c => ({value: c, label: c})),
          ]}
          width={narrow ? '100%' : 140}
          presentation="adaptive"
        />
        <SegmentedControl label="등록 기간" value={period} onChange={setPeriod} size="md">
          <SegmentedControlItem value="all" label="전체" />
          <SegmentedControlItem value="month" label="최근 1개월" />
          <SegmentedControlItem value="week" label="최근 1주" />
        </SegmentedControl>
      </div>

      <HStack justify="between" align="center">
        <Text type="supporting">
          총 <strong>{filtered.length}</strong>건 · {page}/{Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}쪽
        </Text>
        <Text type="supporting">기준일 {formatKDate(TODAY)}</Text>
      </HStack>

      {filtered.length === 0 ? (
        <Card variant="muted">
          <EmptyState
            title="검색 결과가 없습니다"
            description="검색어나 분야, 기간 조건을 바꿔 보세요."
            icon={<Icon icon={NewspaperIcon} size="lg" color="secondary" />}
            actions={
              <Button
                label="조건 초기화"
                onClick={() => {
                  setQuery('');
                  setCategory('all');
                  setPeriod('all');
                }}
              />
            }
          />
        </Card>
      ) : narrow ? (
        <Card padding={0}>
          <ul className="m-list">
            {pageData.map((p, i) => (
              <li key={p.id}>
                {i > 0 && <Divider />}
                <button type="button" className="m-item" onClick={() => setOpenId(p.id)}>
                  <HStack gap={2} align="center" wrap="wrap">
                    <Badge variant={CATEGORY_BADGE[p.category]} label={p.category} />
                    {isNew(p) && <Badge variant="error" label="NEW" />}
                    {p.embargo && <Badge variant="warning" label="엠바고" />}
                  </HStack>
                  <Text type="body" weight="semibold" maxLines={2}>
                    {p.title}
                  </Text>
                  <Text type="supporting">
                    {p.dept} · {formatKDate(p.date)}
                    {p.hasPhoto ? ' · 사진 있음' : ''}
                  </Text>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card padding={0}>
          <Table<PressRelease>
            idKey="id"
            data={pageData}
            hasHover
            density="balanced"
            rowIndexStart={(page - 1) * PAGE_SIZE + 1}
            rowCount={filtered.length}
            columns={[
              {key: 'no', header: '번호', width: pixel(64), align: 'center'},
              {
                key: 'category',
                header: '분야',
                width: pixel(96),
                renderCell: p => <Badge variant={CATEGORY_BADGE[p.category]} label={p.category} />,
              },
              {
                key: 'title',
                header: '제목',
                width: proportional(1, {minWidth: 260}),
                renderCell: p => (
                  <HStack gap={2} align="center" wrap="wrap">
                    <Link href={`#${p.id}`} onClick={openDetail(p.id)} color="primary" weight="medium">
                      {p.title}
                    </Link>
                    {isNew(p) && <Badge variant="error" label="NEW" />}
                    {p.embargo && <Badge variant="warning" label="엠바고" />}
                  </HStack>
                ),
              },
              {key: 'dept', header: '담당부서', width: pixel(120)},
              {
                key: 'date',
                header: '등록일',
                width: pixel(132),
                renderCell: p => <Text type="body">{formatKDate(p.date)}</Text>,
              },
              {
                key: 'files',
                header: '첨부',
                width: pixel(72),
                align: 'center',
                renderCell: p => (
                  <HStack gap={1} justify="center">
                    <Icon icon={PaperClipIcon} size="sm" color="secondary" label="본문 파일" />
                    {p.hasPhoto && <Icon icon={PhotoIcon} size="sm" color="secondary" label="사진" />}
                  </HStack>
                ),
              },
            ]}
          />
        </Card>
      )}

      {filtered.length > PAGE_SIZE && (
        <HStack justify="center">
          <Pagination
            page={page}
            onChange={setPage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            variant="pages"
            label="보도자료 페이지"
          />
        </HStack>
      )}

      <Drawer
        isOpen={selected !== null}
        onOpenChange={open => !open && setOpenId(null)}
        label="보도자료 상세"
        width={520}
        experimental={{isFullWidthOnMobile: true}}>
        {selected && <PressDetail item={selected} onClose={() => setOpenId(null)} />}
      </Drawer>
    </VStack>
  );
}

function PressDetail({item, onClose}: {item: PressRelease; onClose: () => void}) {
  const ymd = item.date.replace(/-/g, '');
  return (
    <Layout
      header={
        <DrawerHeader
          title={item.title}
          subtitle={`${item.dept} · ${formatKDate(item.date)}`}
          onOpenChange={open => !open && onClose()}
          hasDivider
        />
      }
      content={
        <LayoutContent>
          <VStack gap={5}>
            <HStack gap={2} wrap="wrap">
              <Badge variant={CATEGORY_BADGE[item.category]} label={item.category} />
              {item.embargo ? (
                <Badge variant="warning" label={`보도시점 ${formatKDate(item.embargo.split(' ')[0], false)} ${item.embargo.split(' ')[1]}`} />
              ) : (
                <Badge variant="success" label="배포 즉시 보도" />
              )}
            </HStack>

            <MetadataList title="배포 정보">
              <MetadataListItem label="담당부서" icon={<Icon icon={BuildingOffice2Icon} size="sm" />}>
                {item.dept}
              </MetadataListItem>
              <MetadataListItem label="담당자" icon={<Icon icon={UserGroupIcon} size="sm" />}>
                [확인요망]
              </MetadataListItem>
              <MetadataListItem label="연락처" icon={<Icon icon={PhoneIcon} size="sm" />}>
                053-[확인요망]
              </MetadataListItem>
              <MetadataListItem label="배포일" icon={<Icon icon={CalendarDaysIcon} size="sm" />}>
                {formatKDate(item.date)}
              </MetadataListItem>
            </MetadataList>

            <Divider />

            <VStack gap={3}>
              <Heading level={3}>본문 미리보기</Heading>
              <Text as="p" type="body">
                대구 북구(구청장 [확인요망])는 ‘{item.title.replace(/^북구,\s*/, '')}’와 관련해 … (본문 예시 문단입니다.
                실제 게시 시에는 보도자료 원문의 첫 문단이 들어갑니다.)
              </Text>
              <Text as="p" type="body" color="secondary">
                이번 사업은 … 구청장은 “…”라고 말했다. (인용문·수치는 원문에서 확인된 내용만 게재)
              </Text>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={3}>첨부파일</Heading>
              <FileRow name={`보도자료_${ymd}.hwpx`} kind="HWPX" />
              <FileRow name={`보도자료_${ymd}.pdf`} kind="PDF" />
              {item.hasPhoto && <FileRow name={`사진_${ymd}.zip`} kind="사진" />}
            </VStack>
          </VStack>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <HStack gap={2} justify="end" wrap="wrap">
            <Button label="목록으로" variant="ghost" onClick={onClose} />
            <Button label="전체 내려받기" variant="primary" icon={<Icon icon={ArrowDownTrayIcon} />} />
          </HStack>
        </LayoutFooter>
      }
    />
  );
}

function FileRow({name, kind}: {name: string; kind: string}) {
  return (
    <Card variant="muted" padding={3}>
      <HStack gap={3} align="center" justify="between">
        <HStack gap={2} align="center">
          <Icon icon={kind === '사진' ? PhotoIcon : DocumentTextIcon} size="md" color="secondary" />
          <VStack gap={0}>
            <Text type="label">{name}</Text>
            <Text type="supporting">{kind} 파일 · 용량 표시 영역</Text>
          </VStack>
        </HStack>
        <IconButton
          label={`${name} 내려받기`}
          tooltip="내려받기"
          variant="ghost"
          icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
        />
      </HStack>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 행사안내                                                             */
/* ------------------------------------------------------------------ */

const STATUS_BADGE: Record<EventStatus, 'success' | 'info' | 'warning' | 'neutral'> = {
  접수중: 'success',
  진행예정: 'info',
  마감: 'warning',
  종료: 'neutral',
};

const EVENT_ICON: Record<string, typeof MusicalNoteIcon> = {
  'ev-1': MusicalNoteIcon,
  'ev-2': CodeBracketIcon,
  'ev-3': DevicePhoneMobileIcon,
  'ev-4': GiftIcon,
  'ev-5': ScaleIcon,
  'ev-6': SunIcon,
};

function EventBoard() {
  const [status, setStatus] = useState<'all' | 'closed' | EventStatus>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const isClosed = (e: CivicEvent) => e.status === '마감' || e.status === '종료';
  const list = EVENTS.filter(e =>
    status === 'all' ? true : status === 'closed' ? isClosed(e) : e.status === status,
  );
  const selected = EVENTS.find(e => e.id === openId) ?? null;
  const count = (s: EventStatus) => EVENTS.filter(e => e.status === s).length;

  return (
    <VStack gap={4}>
      <div className="filter-bar">
        <SegmentedControl label="진행 상태" value={status} onChange={v => setStatus(v as typeof status)}>
          <SegmentedControlItem value="all" label={`전체 ${EVENTS.length}`} />
          <SegmentedControlItem value="접수중" label={`접수중 ${count('접수중')}`} />
          <SegmentedControlItem value="진행예정" label={`진행예정 ${count('진행예정')}`} />
          <SegmentedControlItem value="closed" label={`마감·종료 ${EVENTS.filter(isClosed).length}`} />
        </SegmentedControl>
      </div>

      <Grid columns={{minWidth: 260, repeat: 'fill'}} gap={4}>
        {list.map(ev => (
          <EventCard key={ev.id} ev={ev} onOpen={() => setOpenId(ev.id)} />
        ))}
      </Grid>

      <Drawer
        isOpen={selected !== null}
        onOpenChange={open => !open && setOpenId(null)}
        label="행사 상세"
        width={480}
        experimental={{isFullWidthOnMobile: true}}>
        {selected && <EventDetail ev={selected} onClose={() => setOpenId(null)} />}
      </Drawer>
    </VStack>
  );
}

function EventCard({ev, onOpen}: {ev: CivicEvent; onOpen: () => void}) {
  const done = ev.status === '종료';
  return (
    <Card padding={0} className={`event-card${done ? ' is-done' : ''}`}>
      <div className={`poster tone-${ev.tone}`} aria-hidden="true">
        <Icon icon={EVENT_ICON[ev.id]} className="poster-icon" />
        <span className="poster-note">포스터 이미지 영역</span>
      </div>
      <VStack gap={3} padding={4} className="event-body">
        <HStack gap={2} wrap="wrap">
          <Badge variant={STATUS_BADGE[ev.status]} label={ev.status} />
          <Badge variant="neutral" label={ev.category} />
        </HStack>
        <Heading level={3} maxLines={2}>
          {ev.title}
        </Heading>
        <VStack gap={1.5}>
          <InfoLine icon={CalendarDaysIcon} text={eventPeriod(ev)} />
          {ev.time && <InfoLine icon={ClockIcon} text={ev.time} />}
          <InfoLine icon={MapPinIcon} text={ev.place} />
          <InfoLine icon={UserGroupIcon} text={ev.target} />
        </VStack>
        <HStack gap={2} className="event-actions">
          <Button label="자세히 보기" onClick={onOpen} width="100%" />
          {ev.status === '접수중' && <Button label="신청하기" variant="primary" width="100%" />}
        </HStack>
      </VStack>
    </Card>
  );
}

function InfoLine({icon, text}: {icon: typeof MapPinIcon; text: string}) {
  return (
    <HStack gap={2} align="start">
      <Icon icon={icon} size="sm" color="secondary" className="info-icon" />
      <Text type="body" color="secondary">
        {text}
      </Text>
    </HStack>
  );
}

function EventDetail({ev, onClose}: {ev: CivicEvent; onClose: () => void}) {
  return (
    <Layout
      header={
        <DrawerHeader
          title={ev.title}
          subtitle={`${ev.category} · ${ev.dept}`}
          onOpenChange={open => !open && onClose()}
          hasDivider
        />
      }
      content={
        <LayoutContent>
          <VStack gap={5}>
            <div className={`poster poster-lg tone-${ev.tone}`} aria-hidden="true">
              <Icon icon={EVENT_ICON[ev.id]} className="poster-icon" />
              <span className="poster-note">포스터 이미지 영역</span>
            </div>
            <HStack gap={2}>
              <Badge variant={STATUS_BADGE[ev.status]} label={ev.status} />
              <Badge variant="neutral" label={ev.fee} />
            </HStack>
            <Text as="p" type="body">
              {ev.summary}
            </Text>
            <MetadataList title="행사 정보">
              <MetadataListItem label="일시">
                {eventPeriod(ev)}
                {ev.time ? ` ${ev.time}` : ''}
              </MetadataListItem>
              <MetadataListItem label="장소">{ev.place}</MetadataListItem>
              <MetadataListItem label="대상">{ev.target}</MetadataListItem>
              <MetadataListItem label="참가비">{ev.fee}</MetadataListItem>
              <MetadataListItem label="신청">{ev.apply}</MetadataListItem>
              <MetadataListItem label="문의">{ev.dept} (053-[확인요망])</MetadataListItem>
            </MetadataList>
          </VStack>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <HStack gap={2} justify="end" wrap="wrap">
            <Button label="닫기" variant="ghost" onClick={onClose} />
            {ev.status === '접수중' ? (
              <Button label="신청하기" variant="primary" />
            ) : (
              <Button label={ev.status === '진행예정' ? '일정 공유하기' : ev.status} isDisabled={ev.status !== '진행예정'} />
            )}
          </HStack>
        </LayoutFooter>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 페이지                                                               */
/* ------------------------------------------------------------------ */

export default function App() {
  const [tab, setTab] = useState<TabKey>('press');
  const title = tab === 'press' ? '보도자료' : '행사·축제 안내';
  const desc =
    tab === 'press'
      ? '북구청이 언론에 배포한 보도자료와 사진을 내려받을 수 있습니다.'
      : '구민이 참여할 수 있는 문화·교육·나눔 행사를 안내합니다.';

  return (
    <AppShell
      height="auto"
      variant="section"
      contentPadding={0}
      banner={
        <Banner
          status="info"
          container="section"
          title="디자인 시안 (Astryx 디자인 시스템)"
          description="게시물·부서명·일정·장소는 모두 예시 데이터이며 실제 북구청 자료가 아닙니다."
          isDismissable
          dismissLabel="시안 안내 닫기"
        />
      }
      topNav={
        <TopNav
          label="북구청 주 메뉴"
          heading={
            <TopNavHeading
              superheading="대구광역시"
              heading="북구 소통광장"
              headingHref="#"
              logo={<NavIcon icon={<Icon icon={BuildingLibraryIcon} size="sm" />} />}
            />
          }
          startContent={
            <>
              <TopNavItem label="구정소식" href="#" />
              <TopNavItem
                label="보도자료"
                href="#press"
                isSelected={tab === 'press'}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  setTab('press');
                }}
              />
              <TopNavItem
                label="행사·축제"
                href="#events"
                isSelected={tab === 'events'}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  setTab('events');
                }}
              />
              <TopNavItem label="고시·공고" href="#" />
            </>
          }
          endContent={
            <>
              <IconButton
                label="통합검색"
                tooltip="통합검색"
                variant="ghost"
                icon={<Icon icon="search" size="sm" />}
              />
              <Button label="누리집 바로가기" variant="ghost" />
            </>
          }
        />
      }>
      <div className="page">
        <VStack gap={6}>
          <VStack gap={3}>
            <Breadcrumbs variant="supporting">
              <BreadcrumbItem href="#">홈</BreadcrumbItem>
              <BreadcrumbItem href="#">소통·참여</BreadcrumbItem>
              <BreadcrumbItem>{title}</BreadcrumbItem>
            </Breadcrumbs>
            <Heading level={1}>{title}</Heading>
            <Text type="large" color="secondary">
              {desc}
            </Text>
          </VStack>

          <TabList value={tab} onChange={v => setTab(v as TabKey)} hasDivider size="lg">
            <Tab value="press" label="보도자료" endContent={<Badge label={PRESS.length} />} />
            <Tab value="events" label="행사·축제" endContent={<Badge label={EVENTS.length} />} />
          </TabList>

          {tab === 'press' ? <PressBoard /> : <EventBoard />}
        </VStack>
      </div>

      <footer className="site-footer">
        <div className="page footer-inner">
          <Text type="label">대구광역시 북구청</Text>
          <Text type="supporting">주소 [확인요망] · 대표전화 [확인요망]</Text>
          <Text type="supporting">
            이 화면은 Astryx(@astryxdesign/core 0.7.16, MIT 라이선스) 컴포넌트로 만든 디자인 시안입니다.
          </Text>
        </div>
      </footer>
    </AppShell>
  );
}
