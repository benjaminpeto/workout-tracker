import type { BodyMetrics, Exercise, ProgramPlan, TrackerState, WeekPlan, WorkoutDay } from '../types';

export const parseNumber = (value?: string) => {
  if (!value) return 0;
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

export function youtubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function getExerciseProgress(state: TrackerState, weekId: string, dayId: string, exercise: Exercise) {
  const log = state.weeks[weekId]?.days[dayId]?.exercises[exercise.id];
  if (!log) return { doneSets: 0, totalSets: exercise.plannedSets, volume: 0, hasInput: false };

  const doneSets = log.sets.filter(set => set.done || set.kg || set.reps || set.rir).length;
  const volume = log.sets.reduce((sum, set) => {
    const kg = parseNumber(set.kg);
    const reps = parseNumber(set.reps);
    return sum + kg * reps;
  }, 0);
  const hasInput = log.sets.some(set => set.done || set.kg || set.reps || set.rir) || Boolean(log.notes || log.actualRir || log.completed);

  return { doneSets, totalSets: exercise.plannedSets, volume, hasInput };
}

export function getDayStats(state: TrackerState, weekId: string, day: WorkoutDay) {
  const exerciseStats = day.exercises.map(exercise => getExerciseProgress(state, weekId, day.id, exercise));
  const totalSets = exerciseStats.reduce((sum, item) => sum + item.totalSets, 0);
  const doneSets = exerciseStats.reduce((sum, item) => sum + item.doneSets, 0);
  const volume = exerciseStats.reduce((sum, item) => sum + item.volume, 0);
  const completedExercises = exerciseStats.filter(item => item.doneSets >= item.totalSets).length;
  const inputExercises = exerciseStats.filter(item => item.hasInput).length;

  return {
    totalSets,
    doneSets,
    volume,
    completedExercises,
    inputExercises,
    exerciseCount: day.exercises.length,
    percent: totalSets ? Math.round((doneSets / totalSets) * 100) : 0
  };
}

export function getWeekStats(state: TrackerState, week: WeekPlan) {
  const days = week.days.map(day => getDayStats(state, week.id, day));
  const totalSets = days.reduce((sum, item) => sum + item.totalSets, 0);
  const doneSets = days.reduce((sum, item) => sum + item.doneSets, 0);
  const volume = days.reduce((sum, item) => sum + item.volume, 0);
  const completedDays = days.filter(item => item.doneSets > 0 && item.percent >= 90).length;

  return {
    totalSets,
    doneSets,
    volume,
    completedDays,
    totalDays: week.days.length,
    percent: totalSets ? Math.round((doneSets / totalSets) * 100) : 0
  };
}

export function getProgramStats(state: TrackerState, program: ProgramPlan) {
  const weeks = program.weeks.map(week => getWeekStats(state, week));
  const totalSets = weeks.reduce((sum, item) => sum + item.totalSets, 0);
  const doneSets = weeks.reduce((sum, item) => sum + item.doneSets, 0);
  const volume = weeks.reduce((sum, item) => sum + item.volume, 0);
  const completedWeeks = weeks.filter(item => item.percent >= 90).length;
  const completedDays = weeks.reduce((sum, item) => sum + item.completedDays, 0);

  return {
    totalSets,
    doneSets,
    volume,
    completedWeeks,
    completedDays,
    totalWeeks: program.weeks.length,
    totalDays: program.weeks.reduce((sum, week) => sum + week.days.length, 0),
    percent: totalSets ? Math.round((doneSets / totalSets) * 100) : 0
  };
}

export function getBodyTrend(program: ProgramPlan, bodyByWeek: Record<string, BodyMetrics>) {
  return program.weeks.map(week => ({
    weekNumber: week.weekNumber,
    weekId: week.id,
    weight: parseNumber(bodyByWeek[week.id]?.weightKg),
    waist: parseNumber(bodyByWeek[week.id]?.waistCm),
    sleep: parseNumber(bodyByWeek[week.id]?.sleepHours),
    stress: bodyByWeek[week.id]?.stress ?? ''
  }));
}

export function formatSavedTime(value?: string) {
  if (!value) return 'Not saved yet';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return 'Saved';
  }
}
