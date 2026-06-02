import { useEffect, useMemo, useRef, useState } from "react";
import type {
  BodyMetrics,
  DayLog,
  ExerciseLog,
  SetEntry,
  TrackerState,
} from "./types";
import { trainingProgram } from "./data/trainingProgram";
import {
  clearState,
  createInitialState,
  exportState,
  importState,
  loadState,
  saveState,
} from "./lib/storage";
import { Dashboard } from "./components/Dashboard";
import { DayTabs } from "./components/DayTabs";
import { DayTracker } from "./components/DayTracker";
import { TempoHelp } from "./components/TempoHelp";
import { ExerciseLibrary } from "./components/ExerciseLibrary";
import { WeekSelector } from "./components/WeekSelector";

const views = ["today", "dashboard", "guide"] as const;
type View = (typeof views)[number];

export default function App() {
  const program = trainingProgram;
  const [state, setState] = useState<TrackerState | null>(null);
  const [view, setView] = useState<View>("today");
  const [storageStatus, setStorageStatus] = useState("Opening IndexedDB...");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    loadState(program)
      .then((loaded) => {
        if (!mounted) return;
        setState(loaded);
        setStorageStatus("IndexedDB ready");
      })
      .catch(() => {
        if (!mounted) return;
        setState(createInitialState(program));
        setStorageStatus("IndexedDB unavailable, using memory until reload");
      });
    return () => {
      mounted = false;
    };
  }, [program]);

  useEffect(() => {
    if (!state) return;
    saveState(state)
      .then(() => setStorageStatus("Saved to IndexedDB"))
      .catch(() => setStorageStatus("Save failed - export a backup"));
  }, [state]);

  const activeWeek = useMemo(() => {
    if (!state) return program.weeks[0];
    return (
      program.weeks.find((week) => week.id === state.activeWeekId) ??
      program.weeks[0]
    );
  }, [program.weeks, state]);

  const activeDay = useMemo(() => {
    if (!state || !activeWeek) return activeWeek?.days[0];
    return (
      activeWeek.days.find((day) => day.id === state.activeDayId) ??
      activeWeek.days[0]
    );
  }, [activeWeek, state]);

  const updateState = (updater: (current: TrackerState) => TrackerState) => {
    setState((current) => {
      const base = current ?? createInitialState(program);
      return { ...updater(base), updatedAt: new Date().toISOString() };
    });
  };

  const setActiveWeek = (weekId: string) => {
    const week = program.weeks.find((item) => item.id === weekId);
    if (!week) return;
    updateState((current) => ({
      ...current,
      activeWeekId: weekId,
      activeDayId: week.days[0]?.id ?? "",
    }));
    setView("today");
  };

  const setActiveDay = (dayId: string) => {
    updateState((current) => ({ ...current, activeDayId: dayId }));
    setView("today");
  };

  const patchBody = (patch: Partial<BodyMetrics>) => {
    if (!activeWeek) return;
    updateState((current) => ({
      ...current,
      bodyByWeek: {
        ...current.bodyByWeek,
        [activeWeek.id]: { ...current.bodyByWeek[activeWeek.id], ...patch },
      },
    }));
  };

  const patchDay = (patch: Partial<DayLog>) => {
    if (!activeWeek || !activeDay) return;
    updateState((current) => {
      const weekLog = current.weeks[activeWeek.id];
      return {
        ...current,
        weeks: {
          ...current.weeks,
          [activeWeek.id]: {
            ...weekLog,
            days: {
              ...weekLog.days,
              [activeDay.id]: { ...weekLog.days[activeDay.id], ...patch },
            },
          },
        },
      };
    });
  };

  const patchExercise = (exerciseId: string, patch: Partial<ExerciseLog>) => {
    if (!activeWeek || !activeDay) return;
    updateState((current) => {
      const weekLog = current.weeks[activeWeek.id];
      const day = weekLog.days[activeDay.id];
      return {
        ...current,
        weeks: {
          ...current.weeks,
          [activeWeek.id]: {
            ...weekLog,
            days: {
              ...weekLog.days,
              [activeDay.id]: {
                ...day,
                exercises: {
                  ...day.exercises,
                  [exerciseId]: { ...day.exercises[exerciseId], ...patch },
                },
              },
            },
          },
        },
      };
    });
  };

  const patchSet = (
    exerciseId: string,
    setIndex: number,
    patch: Partial<SetEntry>,
  ) => {
    if (!activeWeek || !activeDay) return;
    updateState((current) => {
      const weekLog = current.weeks[activeWeek.id];
      const day = weekLog.days[activeDay.id];
      const exercise = day.exercises[exerciseId];
      const sets = exercise.sets.map((set, index) =>
        index === setIndex ? { ...set, ...patch } : set,
      );
      return {
        ...current,
        weeks: {
          ...current.weeks,
          [activeWeek.id]: {
            ...weekLog,
            days: {
              ...weekLog.days,
              [activeDay.id]: {
                ...day,
                exercises: {
                  ...day.exercises,
                  [exerciseId]: { ...exercise, sets },
                },
              },
            },
          },
        },
      };
    });
  };

  const clearDay = () => {
    if (!state || !activeWeek || !activeDay) return;
    const fresh =
      createInitialState(program).weeks[activeWeek.id].days[activeDay.id];
    updateState((current) => {
      const weekLog = current.weeks[activeWeek.id];
      return {
        ...current,
        weeks: {
          ...current.weeks,
          [activeWeek.id]: {
            ...weekLog,
            days: { ...weekLog.days, [activeDay.id]: fresh },
          },
        },
      };
    });
  };

  const resetEverything = async () => {
    const confirmed = window.confirm(
      "Clear all 12-week workout data from this browser/device? Export a backup first if needed.",
    );
    if (!confirmed) return;
    await clearState();
    setState(createInitialState(program));
    setView("today");
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    try {
      const imported = await importState(file, program);
      setState(imported);
      setView("dashboard");
    } catch {
      window.alert(
        "Could not import that file. Make sure it is a JSON backup from this app.",
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!state || !activeWeek || !activeDay) {
    return (
      <main className="app-shell loading-shell">
        <div className="background-orb orb-one" />
        <div className="glass-panel loading-card">
          <p className="eyebrow">Private tracker</p>
          <h1>Loading your 12-week plan...</h1>
          <p>{storageStatus}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />

      <header className="top-bar">
        <div>
          <p className="eyebrow">Private IndexedDB tracker</p>
          <h1>{program.title}</h1>
        </div>
        <div className="top-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => exportState(state)}
          >
            Export
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </button>
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept="application/json"
            onChange={(event) => handleImport(event.target.files?.[0])}
          />
        </div>
      </header>

      <section className="hero-card glass-panel">
        <div>
          <p className="eyebrow">
            Week {activeWeek.weekNumber} / {activeWeek.phase} / RIR{" "}
            {activeWeek.targetRir}
          </p>
          <h2>{activeWeek.goal}</h2>
          <p>
            {activeWeek.notes}. {activeWeek.conditioning}.
          </p>
          <span className="saved-label">{storageStatus}</span>
        </div>
        <button
          type="button"
          className="danger-button"
          onClick={resetEverything}
        >
          Reset all
        </button>
      </section>

      <WeekSelector
        program={program}
        state={state}
        activeWeekId={activeWeek.id}
        onSelect={setActiveWeek}
      />

      <div className="view-switcher" role="tablist" aria-label="Main views">
        <button
          className={view === "today" ? "active" : ""}
          type="button"
          onClick={() => setView("today")}
        >
          Workout
        </button>
        <button
          className={view === "dashboard" ? "active" : ""}
          type="button"
          onClick={() => setView("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={view === "guide" ? "active" : ""}
          type="button"
          onClick={() => setView("guide")}
        >
          Guide
        </button>
      </div>

      <DayTabs
        week={activeWeek}
        state={state}
        activeDayId={activeDay.id}
        onSelect={setActiveDay}
      />

      {view === "today" ? (
        <DayTracker
          week={activeWeek}
          day={activeDay}
          state={state}
          onDayPatch={patchDay}
          onSetChange={patchSet}
          onExerciseChange={patchExercise}
          onClearDay={clearDay}
        />
      ) : null}

      {view === "dashboard" ? (
        <Dashboard
          program={program}
          week={activeWeek}
          state={state}
          onBodyPatch={patchBody}
        />
      ) : null}

      {view === "guide" ? (
        <div className="guide-grid">
          <TempoHelp />
          <section className="glass-panel rir-help">
            <p className="eyebrow">RIR reminder</p>
            <h3>RIR = reps in reserve</h3>
            <p>
              RIR 3 means stop when you could still do about 3 clean reps. This
              app uses RIR instead of percentages so you can adjust to sleep,
              stress, surf, soreness, and real life.
            </p>
            <ul>
              <li>Pain above 3/10: stop that movement and write a note.</li>
              <li>
                Lower-back pinching: reduce range, load, or switch variation.
              </li>
              <li>Surf day: skip gym and do the missed workout next time.</li>
              <li>
                The small checkboxes mean set done; the larger checkbox marks
                the whole exercise complete.
              </li>
            </ul>
          </section>
          <ExerciseLibrary week={activeWeek} />
        </div>
      ) : null}
    </main>
  );
}
