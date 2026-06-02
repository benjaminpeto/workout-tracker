export type TrackingMode = 'strength' | 'bodyweight' | 'duration' | 'checklist';

export type Exercise = {
  id: string;
  section: string;
  name: string;
  plannedSets: number;
  target: string;
  targetRir: string;
  rest: string;
  tempo: string;
  notes?: string;
  progression?: string;
  trackingMode: TrackingMode;
  demoQuery: string;
};

export type WorkoutDay = {
  id: string;
  label: string;
  shortLabel: string;
  focus: string;
  estimatedMinutes: string;
  exercises: Exercise[];
};

export type WeekPlan = {
  id: string;
  weekNumber: number;
  phase: string;
  goal: string;
  setsVolume: string;
  targetRir: string;
  conditioning: string;
  notes: string;
  days: WorkoutDay[];
};

export type ProgramPlan = {
  id: string;
  title: string;
  subtitle: string;
  weeks: WeekPlan[];
};

export type SetEntry = {
  kg?: string;
  reps?: string;
  rir?: string;
  done?: boolean;
};

export type ExerciseLog = {
  sets: SetEntry[];
  actualRir?: string;
  completed?: boolean;
  notes?: string;
};

export type DayLog = {
  date?: string;
  startedAt?: string;
  completedAt?: string;
  mood?: string;
  energy?: string;
  soreness?: string;
  exercises: Record<string, ExerciseLog>;
  sessionNotes?: string;
};

export type WeekLog = {
  weekId: string;
  days: Record<string, DayLog>;
  weekNotes?: string;
};

export type BodyMetrics = {
  weightKg?: string;
  waistCm?: string;
  sleepHours?: string;
  stress?: string;
  surfSessions?: string;
  gymSessions?: string;
  notes?: string;
};

export type TrackerState = {
  schemaVersion: 2;
  programId: string;
  activeWeekId: string;
  activeDayId: string;
  weeks: Record<string, WeekLog>;
  bodyByWeek: Record<string, BodyMetrics>;
  updatedAt?: string;
};
