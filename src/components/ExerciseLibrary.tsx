import type { WeekPlan } from '../types';
import { youtubeSearchUrl } from '../lib/analytics';

type ExerciseLibraryProps = {
  week: WeekPlan;
};

export function ExerciseLibrary({ week }: ExerciseLibraryProps) {
  const seen = new Set<string>();
  const exercises = week.days.flatMap(day => day.exercises).filter(exercise => {
    if (seen.has(exercise.name)) return false;
    seen.add(exercise.name);
    return true;
  });

  return (
    <section className="glass-panel exercise-library">
      <p className="eyebrow">Exercise guide</p>
      <h3>Week {week.weekNumber} demo links</h3>
      <p className="muted">Links open YouTube search results, so you can pick a clear demo in your preferred language.</p>
      <div className="library-list">
        {exercises.map(exercise => (
          <a key={exercise.id} href={youtubeSearchUrl(exercise.demoQuery)} target="_blank" rel="noreferrer">
            <span>{exercise.name}</span>
            <small>{exercise.section} / {exercise.tempo}</small>
          </a>
        ))}
      </div>
    </section>
  );
}
