export interface RoutePoint {
  lat: number;
  lng: number;
  t: number; // epoch ms
}

export interface ApartmentComplex {
  id: string;
  name: string;
  address: string;
  region: string;
}

export interface Profile {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  apartmentComplexId: string;
  dong: string;
}

export interface Workout {
  id: string;
  userId: string;
  apartmentComplexId: string;
  route: RoutePoint[];
  distanceM: number;
  durationS: number;
  avgPaceSecPerKm: number | null;
  startedAt: string;
  endedAt: string;
  author: Pick<Profile, "nickname" | "avatarUrl" | "dong">;
  likeCount: number;
  likedByMe: boolean;
  comments: WorkoutComment[];
}

export interface WorkoutComment {
  id: string;
  workoutId: string;
  userId: string;
  nickname: string;
  body: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  apartmentComplexId: string | null;
  title: string;
  description: string;
  targetType: "distance" | "count";
  targetValue: number;
  startDate: string;
  endDate: string;
  participantCount: number;
  myProgress: number | null;
}

export interface RankingEntry {
  userId: string;
  nickname: string;
  dong: string;
  avatarUrl: string | null;
  totalDistanceM: number;
  workoutCount: number;
}
