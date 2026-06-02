import type { Exercise, ExerciseLog, SetEntry } from '../types';

type SetLoggerProps = {
  exercise: Exercise;
  log: ExerciseLog;
  onSetChange: (setIndex: number, patch: Partial<SetEntry>) => void;
  onExerciseChange: (patch: Partial<ExerciseLog>) => void;
};

function setLabel(exercise: Exercise) {
  if (exercise.trackingMode === 'duration') return 'Time';
  if (exercise.trackingMode === 'checklist') return 'Done';
  return 'Reps';
}

function helpText(exercise: Exercise) {
  if (exercise.trackingMode === 'duration') return 'Use the time box for minutes, seconds, distance, or a short note. Tick Done when the set/drill is finished.';
  if (exercise.trackingMode === 'bodyweight') return 'Log reps or time. Add assistance/extra weight in the notes if needed.';
  return 'Log the working weight and reps. Tick Done when that set is completed.';
}

export function SetLogger({ exercise, log, onSetChange, onExerciseChange }: SetLoggerProps) {
  const repsLabel = setLabel(exercise);
  const showKg = exercise.trackingMode === 'strength';
  const repsPlaceholder = exercise.trackingMode === 'duration' ? 'sec/min/m' : exercise.target;

  return (
    <div className="set-logger">
      <p className="set-help">{helpText(exercise)}</p>
      <div className={showKg ? 'set-grid set-grid-head has-kg' : 'set-grid set-grid-head'}>
        <span>Set</span>
        {showKg ? <span>kg</span> : null}
        <span>{repsLabel}</span>
        <span>RIR</span>
        <span>Set done</span>
      </div>

      {log.sets.map((set, index) => (
        <div className={showKg ? 'set-grid has-kg' : 'set-grid'} key={`${exercise.id}-${index}`}>
          <span className="set-number">{index + 1}</span>
          {showKg ? (
            <input
              inputMode="decimal"
              type="number"
              min="0"
              step="0.5"
              value={set.kg ?? ''}
              onChange={event => onSetChange(index, { kg: event.target.value })}
              placeholder="0"
              aria-label={`${exercise.name} set ${index + 1} kilograms`}
            />
          ) : null}
          <input
            inputMode={exercise.trackingMode === 'duration' ? 'text' : 'numeric'}
            type="text"
            value={set.reps ?? ''}
            onChange={event => onSetChange(index, { reps: event.target.value })}
            placeholder={repsPlaceholder}
            aria-label={`${exercise.name} set ${index + 1} ${repsLabel}`}
          />
          <input
            inputMode="decimal"
            type="number"
            min="0"
            step="0.5"
            value={set.rir ?? ''}
            onChange={event => onSetChange(index, { rir: event.target.value })}
            placeholder={exercise.targetRir}
            aria-label={`${exercise.name} set ${index + 1} RIR`}
          />
          <label className="check-pill" title="Set done">
            <input
              type="checkbox"
              checked={Boolean(set.done)}
              onChange={event => onSetChange(index, { done: event.target.checked })}
            />
            <span />
            <em>Done</em>
          </label>
        </div>
      ))}

      <div className="exercise-meta-form">
        <label>
          Actual RIR
          <input
            inputMode="decimal"
            type="number"
            min="0"
            step="0.5"
            value={log.actualRir ?? ''}
            onChange={event => onExerciseChange({ actualRir: event.target.value })}
            placeholder="End feel"
          />
        </label>
        <label className="completed-toggle">
          <input
            type="checkbox"
            checked={Boolean(log.completed)}
            onChange={event => onExerciseChange({ completed: event.target.checked })}
          />
          Exercise complete
        </label>
      </div>

      <textarea
        value={log.notes ?? ''}
        onChange={event => onExerciseChange({ notes: event.target.value })}
        placeholder="Notes: pain, machine setting, variation used, assistance, form cue..."
        rows={2}
      />
    </div>
  );
}
