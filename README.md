# 🏃 홈런 (HomeRun)

아파트 입주민들이 산책·달리기·걷기 운동 기록을 GPS로 남기고, 같은 단지 이웃들과 공유·응원하는 헬스케어 서비스 MVP입니다.

## 시작하기

```bash
npm install
npm run dev
```

`.env.local`을 채우지 않아도 **데모 모드**로 바로 실행됩니다. 인메모리 목데이터(가상 이웃 5명, 운동 기록, 챌린지)로 전체 화면을 체험할 수 있어요.

## 주요 화면

- **피드** (`/`) — 우리 단지 이웃들의 운동 기록, 좋아요·댓글
- **기록하기** (`/track`) — 브라우저 GPS(`watchPosition`)로 산책/달리기/등산 기록, 시작·일시정지·종료·저장
- **랭킹** (`/ranking`) — 단지 내 주간/월간 거리 랭킹
- **챌린지** (`/challenges`) — 진행 중인 챌린지 참여·진행률
- **마이페이지** (`/profile`) — 내 누적 기록

## 실제 백엔드(Supabase) 연동하기

1. [Supabase](https://supabase.com/dashboard)에서 프로젝트를 생성합니다.
2. SQL Editor에서 [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)을 실행해 스키마(테이블, RLS 정책)를 생성합니다.
3. `apartment_complexes` 테이블에 우리 단지 정보를 최소 1건 추가합니다.
4. `.env.local`을 만들고(`.env.local.example` 참고) `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 채웁니다.
5. 카카오 로그인을 쓰려면 Supabase Auth → Providers → Kakao를 활성화하고, [카카오 개발자 콘솔](https://developers.kakao.com)에서 발급한 키를 등록합니다.

값이 채워지면 `src/lib/data/*.ts`의 각 함수가 자동으로 목데이터 대신 Supabase를 사용합니다(`isSupabaseConfigured()` 분기).

## 지도 표시 관련 참고

현재 운동 경로는 API 키 없이 동작하는 경량 SVG 미리보기(`src/components/track/RoutePreview.tsx`)로 시각화됩니다. 실제 지도 타일이 필요하면 카카오맵 JavaScript SDK를 발급받아 이 컴포넌트를 대체하면 됩니다(`NEXT_PUBLIC_KAKAO_JS_KEY` 값은 `.env.local.example`에 자리만 마련해두었습니다).

## 기술 스택

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Postgres + Auth) — 미설정 시 인메모리 데모 데이터로 폴백
- 브라우저 Geolocation API 기반 GPS 트래킹
