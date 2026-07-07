import type {
  ApartmentComplex,
  Challenge,
  Profile,
  RankingEntry,
  Workout,
  WorkoutComment,
} from "./types";

// 로컬 데모용 인메모리 데이터. Supabase 미설정 시 이 데이터로 전체 화면을 체험할 수 있다.
// 서버 재시작 시 초기화된다.

export const DEMO_USER_ID = "demo-user";
export const DEMO_APARTMENT_COMPLEX_ID = "complex-1";

export const apartmentComplexes: ApartmentComplex[] = [
  {
    id: DEMO_APARTMENT_COMPLEX_ID,
    name: "래미안 그린파크",
    address: "서울시 강남구",
    region: "서울",
  },
];

const profiles: Profile[] = [
  {
    id: DEMO_USER_ID,
    nickname: "나",
    avatarUrl: null,
    apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID,
    dong: "101동",
  },
  { id: "u2", nickname: "달리는곰", avatarUrl: null, apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID, dong: "102동" },
  { id: "u3", nickname: "산책왕민지", avatarUrl: null, apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID, dong: "103동" },
  { id: "u4", nickname: "새벽러너", avatarUrl: null, apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID, dong: "101동" },
  { id: "u5", nickname: "걷기좋아", avatarUrl: null, apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID, dong: "105동" },
];

export function findProfile(userId: string): Profile | undefined {
  return profiles.find((p) => p.id === userId);
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function genRoute(startLat: number, startLng: number, steps: number): { lat: number; lng: number; t: number }[] {
  const route = [];
  let lat = startLat;
  let lng = startLng;
  const t0 = Date.now() - steps * 15_000;
  for (let i = 0; i < steps; i++) {
    lat += (Math.random() - 0.4) * 0.0006;
    lng += (Math.random() - 0.4) * 0.0006;
    route.push({ lat, lng, t: t0 + i * 15_000 });
  }
  return route;
}

const comments: WorkoutComment[] = [
  { id: "c1", workoutId: "w2", userId: DEMO_USER_ID, nickname: "나", body: "페이스 좋으시네요!", createdAt: hoursAgo(1) },
  { id: "c2", workoutId: "w2", userId: "u3", nickname: "산책왕민지", body: "화이팅입니다 👏", createdAt: hoursAgo(1) },
];

const likes = new Map<string, Set<string>>([
  ["w2", new Set(["u3", "u4"])],
  ["w3", new Set([DEMO_USER_ID])],
]);

const workoutsBase: Omit<Workout, "author" | "likeCount" | "likedByMe" | "comments">[] = [
  {
    id: "w1",
    userId: DEMO_USER_ID,
    apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID,
    type: "run",
    route: genRoute(37.4979, 127.0276, 40),
    distanceM: 5200,
    durationS: 1620,
    avgPaceSecPerKm: Math.round(1620 / 5.2),
    startedAt: hoursAgo(3),
    endedAt: hoursAgo(3 - 0.45),
  },
  {
    id: "w2",
    userId: "u2",
    apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID,
    type: "run",
    route: genRoute(37.499, 127.028, 30),
    distanceM: 4100,
    durationS: 1380,
    avgPaceSecPerKm: Math.round(1380 / 4.1),
    startedAt: hoursAgo(5),
    endedAt: hoursAgo(5 - 0.38),
  },
  {
    id: "w3",
    userId: "u3",
    apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID,
    type: "walk",
    route: genRoute(37.4985, 127.027, 50),
    distanceM: 3000,
    durationS: 2700,
    avgPaceSecPerKm: Math.round(2700 / 3.0),
    startedAt: hoursAgo(20),
    endedAt: hoursAgo(20 - 0.75),
  },
  {
    id: "w4",
    userId: "u4",
    apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID,
    type: "walk",
    route: genRoute(37.5, 127.03, 60),
    distanceM: 7800,
    durationS: 6300,
    avgPaceSecPerKm: Math.round(6300 / 7.8),
    startedAt: hoursAgo(30),
    endedAt: hoursAgo(30 - 1.75),
  },
  {
    id: "w5",
    userId: "u5",
    apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID,
    type: "walk",
    route: genRoute(37.497, 127.026, 35),
    distanceM: 2200,
    durationS: 1980,
    avgPaceSecPerKm: Math.round(1980 / 2.2),
    startedAt: hoursAgo(50),
    endedAt: hoursAgo(50 - 0.55),
  },
];

const savedWorkouts: Workout[] = [];

export function listWorkouts(apartmentComplexId: string, viewerId: string): Workout[] {
  return [...workoutsBase, ...savedWorkouts]
    .filter((w) => w.apartmentComplexId === apartmentComplexId)
    .map((w) => hydrateWorkout(w, viewerId))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

function hydrateWorkout(
  w: Omit<Workout, "author" | "likeCount" | "likedByMe" | "comments">,
  viewerId: string
): Workout {
  const author = findProfile(w.userId);
  const likeSet = likes.get(w.id) ?? new Set<string>();
  return {
    ...w,
    author: author
      ? { nickname: author.nickname, avatarUrl: author.avatarUrl, dong: author.dong }
      : { nickname: "알수없음", avatarUrl: null, dong: "" },
    likeCount: likeSet.size,
    likedByMe: likeSet.has(viewerId),
    comments: comments.filter((c) => c.workoutId === w.id),
  };
}

export function toggleLike(workoutId: string, userId: string): void {
  const set = likes.get(workoutId) ?? new Set<string>();
  if (set.has(userId)) {
    set.delete(userId);
  } else {
    set.add(userId);
  }
  likes.set(workoutId, set);
}

export function addComment(workoutId: string, userId: string, body: string): WorkoutComment {
  const author = findProfile(userId);
  const comment: WorkoutComment = {
    id: `c${comments.length + 1}`,
    workoutId,
    userId,
    nickname: author?.nickname ?? "알수없음",
    body,
    createdAt: new Date().toISOString(),
  };
  comments.push(comment);
  return comment;
}

export function saveWorkout(workout: Workout): void {
  savedWorkouts.unshift(workout);
}

export function getRanking(apartmentComplexId: string, sinceHours: number): RankingEntry[] {
  const cutoff = Date.now() - sinceHours * 60 * 60 * 1000;
  const totals = new Map<string, { distanceM: number; count: number }>();

  for (const w of [...workoutsBase, ...savedWorkouts]) {
    if (w.apartmentComplexId !== apartmentComplexId) continue;
    if (new Date(w.startedAt).getTime() < cutoff) continue;
    const entry = totals.get(w.userId) ?? { distanceM: 0, count: 0 };
    entry.distanceM += w.distanceM;
    entry.count += 1;
    totals.set(w.userId, entry);
  }

  return [...totals.entries()]
    .map(([userId, { distanceM, count }]) => {
      const profile = findProfile(userId);
      return {
        userId,
        nickname: profile?.nickname ?? "알수없음",
        dong: profile?.dong ?? "",
        avatarUrl: profile?.avatarUrl ?? null,
        totalDistanceM: distanceM,
        workoutCount: count,
      };
    })
    .sort((a, b) => b.totalDistanceM - a.totalDistanceM);
}

const challengesBase: Omit<Challenge, "participantCount" | "myProgress">[] = [
  {
    id: "ch1",
    apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID,
    title: "7월 30km 걷기 챌린지",
    description: "이번 달 우리 단지 함께 30km를 걸어봐요.",
    targetType: "distance",
    targetValue: 30_000,
    startDate: "2026-07-01",
    endDate: "2026-07-31",
  },
  {
    id: "ch2",
    apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID,
    title: "주 3회 운동 미션",
    description: "일주일에 3번 이상 기록을 남겨보세요.",
    targetType: "count",
    targetValue: 3,
    startDate: "2026-07-06",
    endDate: "2026-07-12",
  },
];

const challengeParticipants = new Map<string, Map<string, number>>([
  ["ch1", new Map([["u2", 12_000], ["u3", 8_000], [DEMO_USER_ID, 5200]])],
  ["ch2", new Map([[DEMO_USER_ID, 1]])],
]);

export function listChallenges(apartmentComplexId: string, viewerId: string): Challenge[] {
  return challengesBase
    .filter((c) => c.apartmentComplexId === apartmentComplexId)
    .map((c) => {
      const participants = challengeParticipants.get(c.id) ?? new Map();
      return {
        ...c,
        participantCount: participants.size,
        myProgress: participants.get(viewerId) ?? null,
      };
    });
}

export function joinChallenge(challengeId: string, userId: string): void {
  const participants = challengeParticipants.get(challengeId) ?? new Map<string, number>();
  if (!participants.has(userId)) {
    participants.set(userId, 0);
  }
  challengeParticipants.set(challengeId, participants);
}
