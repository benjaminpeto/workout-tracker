import type { DayLog, ExerciseLog, ProgramPlan, TrackerState, WeekLog, WeekPlan } from '../types';

const DB_NAME = 'benji-workout-tracker-db';
const DB_VERSION = 1;
const STORE_NAME = 'app-state';
const STATE_KEY = 'tracker-state-v2';
const LEGACY_LOCALSTORAGE_KEY = 'benji-workout-tracker:v1';

type StoredRecord = {
  key: string;
  value: TrackerState;
};

function emptyExerciseLog(plannedSets: number): ExerciseLog {
  return {
    sets: Array.from({ length: plannedSets }, () => ({ kg: '', reps: '', rir: '', done: false })),
    actualRir: '',
    completed: false,
    notes: ''
  };
}

function emptyDayLog(dayId: string, week: WeekPlan): DayLog {
  const day = week.days.find(item => item.id === dayId);
  const exercises: Record<string, ExerciseLog> = {};

  day?.exercises.forEach(exercise => {
    exercises[exercise.id] = emptyExerciseLog(exercise.plannedSets);
  });

  return {
    date: '',
    mood: '',
    energy: '',
    soreness: '',
    exercises,
    sessionNotes: ''
  };
}

function emptyWeekLog(week: WeekPlan): WeekLog {
  return {
    weekId: week.id,
    days: Object.fromEntries(week.days.map(day => [day.id, emptyDayLog(day.id, week)])),
    weekNotes: ''
  };
}

export function createInitialState(program: ProgramPlan): TrackerState {
  const firstWeek = program.weeks[0];
  const firstDay = firstWeek?.days[0];
  return {
    schemaVersion: 2,
    programId: program.id,
    activeWeekId: firstWeek?.id ?? '',
    activeDayId: firstDay?.id ?? '',
    weeks: Object.fromEntries(program.weeks.map(week => [week.id, emptyWeekLog(week)])),
    bodyByWeek: Object.fromEntries(program.weeks.map(week => [week.id, {
      weightKg: '',
      waistCm: '',
      sleepHours: '',
      stress: '',
      surfSessions: '',
      gymSessions: '',
      notes: ''
    }])),
    updatedAt: new Date().toISOString()
  };
}

function ensureShape(input: Partial<TrackerState>, program: ProgramPlan): TrackerState {
  const base = createInitialState(program);
  const next: TrackerState = {
    ...base,
    ...input,
    schemaVersion: 2,
    programId: program.id,
    weeks: { ...base.weeks, ...(input.weeks ?? {}) },
    bodyByWeek: { ...base.bodyByWeek, ...(input.bodyByWeek ?? {}) }
  };

  if (!program.weeks.some(week => week.id === next.activeWeekId)) {
    next.activeWeekId = program.weeks[0]?.id ?? '';
  }

  program.weeks.forEach(week => {
    const currentWeek = next.weeks[week.id] ?? emptyWeekLog(week);
    const days = { ...emptyWeekLog(week).days, ...currentWeek.days };

    week.days.forEach(day => {
      const currentDay = days[day.id] ?? emptyDayLog(day.id, week);
      const exercises = { ...currentDay.exercises };

      day.exercises.forEach(exercise => {
        const currentExercise = exercises[exercise.id] ?? emptyExerciseLog(exercise.plannedSets);
        const sets = Array.from({ length: exercise.plannedSets }, (_, index) => ({
          kg: currentExercise.sets[index]?.kg ?? '',
          reps: currentExercise.sets[index]?.reps ?? '',
          rir: currentExercise.sets[index]?.rir ?? '',
          done: currentExercise.sets[index]?.done ?? false
        }));
        exercises[exercise.id] = { ...currentExercise, sets };
      });

      days[day.id] = { ...currentDay, exercises };
    });

    next.weeks[week.id] = { ...currentWeek, days };
    next.bodyByWeek[week.id] = {
      weightKg: '',
      waistCm: '',
      sleepHours: '',
      stress: '',
      surfSessions: '',
      gymSessions: '',
      notes: '',
      ...(next.bodyByWeek[week.id] ?? {})
    };
  });

  const activeWeek = program.weeks.find(week => week.id === next.activeWeekId) ?? program.weeks[0];
  if (activeWeek && !activeWeek.days.some(day => day.id === next.activeDayId)) {
    next.activeDayId = activeWeek.days[0]?.id ?? '';
  }

  return next;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readRecord(): Promise<TrackerState | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(STATE_KEY);
    request.onsuccess = () => resolve((request.result as StoredRecord | undefined)?.value);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function writeRecord(state: TrackerState): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ key: STATE_KEY, value: state } satisfies StoredRecord);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function deleteRecord(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(STATE_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

function tryMigrateLegacyWeekOne(program: ProgramPlan): TrackerState | undefined {
  try {
    const raw = localStorage.getItem(LEGACY_LOCALSTORAGE_KEY);
    if (!raw) return undefined;
    const legacy = JSON.parse(raw) as {
      schemaVersion?: number;
      activeDayId?: string;
      days?: TrackerState['weeks'][string]['days'];
      body?: TrackerState['bodyByWeek'][string];
      updatedAt?: string;
    };
    if (legacy.schemaVersion !== 1 || !legacy.days) return undefined;

    const next = createInitialState(program);
    const firstWeek = program.weeks[0];
    if (!firstWeek) return next;

    next.weeks[firstWeek.id].days = {
      ...next.weeks[firstWeek.id].days,
      ...legacy.days
    };
    next.bodyByWeek[firstWeek.id] = {
      ...next.bodyByWeek[firstWeek.id],
      ...(legacy.body ?? {})
    };
    next.activeWeekId = firstWeek.id;
    next.activeDayId = legacy.activeDayId ?? firstWeek.days[0]?.id ?? '';
    next.updatedAt = legacy.updatedAt ?? new Date().toISOString();
    return ensureShape(next, program);
  } catch {
    return undefined;
  }
}

export async function loadState(program: ProgramPlan): Promise<TrackerState> {
  try {
    const stored = await readRecord();
    if (stored?.schemaVersion === 2 && stored.programId === program.id) {
      return ensureShape(stored, program);
    }

    const migrated = tryMigrateLegacyWeekOne(program);
    if (migrated) {
      await saveState(migrated);
      return migrated;
    }

    return createInitialState(program);
  } catch {
    return createInitialState(program);
  }
}

export async function saveState(state: TrackerState): Promise<void> {
  const stamped = { ...state, updatedAt: new Date().toISOString() };
  await writeRecord(stamped);
}

export async function clearState(): Promise<void> {
  await deleteRecord();
}

export function prepareExport(state: TrackerState) {
  return {
    ...state,
    updatedAt: new Date().toISOString()
  };
}

export function exportState(state: TrackerState) {
  const blob = new Blob([JSON.stringify(prepareExport(state), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `benji-12-week-workout-log-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importState(file: File, program: ProgramPlan): Promise<TrackerState> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Partial<TrackerState>;
  return ensureShape(parsed, program);
}
