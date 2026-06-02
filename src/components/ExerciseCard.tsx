import type { Exercise, ExerciseLog, SetEntry } from '../types';
import { youtubeSearchUrl } from '../lib/analytics';
import { SetLogger } from './SetLogger';

type ExerciseCardProps = {
  exercise: Exercise;
  log: ExerciseLog;
  onSetChange: (exerciseId: string, setIndex: number, patch: Partial<SetEntry>) => void;
  onExerciseChange: (exerciseId: string, patch: Partial<ExerciseLog>) => void;
};

export function ExerciseCard({ exercise, log, onSetChange, onExerciseChange }: ExerciseCardProps) {
  return (
    <article className="exercise-card">
      <div className="exercise-topline">
        <span className="section-chip">{exercise.section}</span>
        <a href={youtubeSearchUrl(exercise.demoQuery)} target="_blank" rel="noreferrer" className="demo-link">
          YouTube demo
        </a>
      </div>

      <header className="exercise-header">
        <h3>{exercise.name}</h3>
        <div className="exercise-targets">
          <span>{exercise.plannedSets} sets</span>
          <span>{exercise.target}</span>
          <span>RIR {exercise.targetRir}</span>
          <span>{exercise.rest}</span>
          <span>{exercise.tempo}</span>
        </div>
      </header>

      <div className="exercise-notes">
        {exercise.progression ? <p><strong>Progression:</strong> {exercise.progression}</p> : null}
        {exercise.notes ? <p><strong>Cue:</strong> {exercise.notes}</p> : null}
      </div>

      <SetLogger
        exercise={exercise}
        log={log}
        onSetChange={(setIndex, patch) => onSetChange(exercise.id, setIndex, patch)}
        onExerciseChange={patch => onExerciseChange(exercise.id, patch)}
      />
    </article>
  );
}
