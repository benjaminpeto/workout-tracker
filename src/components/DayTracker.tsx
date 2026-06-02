import type { DayLog, ExerciseLog, SetEntry, TrackerState, WeekPlan, WorkoutDay } from '../types';
import { getDayStats } from '../lib/analytics';
import { ExerciseCard } from './ExerciseCard';
import { StatCard } from './StatCard';

type DayTrackerProps = {
  week: WeekPlan;
  day: WorkoutDay;
  state: TrackerState;
  onDayPatch: (patch: Partial<DayLog>) => void;
  onSetChange: (exerciseId: string, setIndex: number, patch: Partial<SetEntry>) => void;
  onExerciseChange: (exerciseId: string, patch: Partial<ExerciseLog>) => void;
  onClearDay: () => void;
};

export function DayTracker({ week, day, state, onDayPatch, onSetChange, onExerciseChange, onClearDay }: DayTrackerProps) {
  const dayLog = state.weeks[week.id].days[day.id];
  const stats = getDayStats(state, week.id, day);

  return (
    <section className="day-panel">
      <div className="day-hero glass-panel">
        <div>
          <p className="eyebrow">Week {week.weekNumber} / {day.estimatedMinutes}</p>
          <h2>{day.label}</h2>
          <p>{day.focus}</p>
        </div>
        <div className="day-actions">
          <button type="button" className="ghost-button" onClick={onClearDay}>Clear day</button>
        </div>
      </div>

      <div className="stats-grid compact">
        <StatCard label="Day progress" value={`${stats.percent}%`} hint={`${stats.doneSets}/${stats.totalSets} sets touched`} />
        <StatCard label="Exercises" value={`${stats.inputExercises}/${stats.exerciseCount}`} hint="With log input" />
        <StatCard label="Volume" value={`${Math.round(stats.volume)}`} hint="kg x reps" />
      </div>

      <div className="session-form glass-panel">
        <label>
          Date
          <input type="date" value={dayLog.date ?? ''} onChange={event => onDayPatch({ date: event.target.value })} />
        </label>
        <label>
          Energy
          <select value={dayLog.energy ?? ''} onChange={event => onDayPatch({ energy: event.target.value })}>
            <option value="">Select</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
        <label>
          Soreness
          <select value={dayLog.soreness ?? ''} onChange={event => onDayPatch({ soreness: event.target.value })}>
            <option value="">Select</option>
            <option>None</option>
            <option>Light</option>
            <option>Moderate</option>
            <option>High</option>
          </select>
        </label>
        <label>
          Mood
          <select value={dayLog.mood ?? ''} onChange={event => onDayPatch({ mood: event.target.value })}>
            <option value="">Select</option>
            <option>Calm</option>
            <option>Focused</option>
            <option>Stressed</option>
            <option>Tired</option>
          </select>
        </label>
      </div>

      <div className="exercise-list">
        {day.exercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            log={dayLog.exercises[exercise.id]}
            onSetChange={onSetChange}
            onExerciseChange={onExerciseChange}
          />
        ))}
      </div>

      <div className="glass-panel session-notes">
        <label>
          Session notes
          <textarea
            value={dayLog.sessionNotes ?? ''}
            onChange={event => onDayPatch({ sessionNotes: event.target.value })}
            rows={4}
            placeholder="Overall feeling, surf/waves, sleep, pain, lifts to repeat next week..."
          />
        </label>
      </div>
    </section>
  );
}
