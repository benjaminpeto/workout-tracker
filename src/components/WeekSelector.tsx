import type { ProgramPlan, TrackerState } from '../types';
import { getWeekStats } from '../lib/analytics';

type WeekSelectorProps = {
  program: ProgramPlan;
  state: TrackerState;
  activeWeekId: string;
  onSelect: (weekId: string) => void;
};

export function WeekSelector({ program, state, activeWeekId, onSelect }: WeekSelectorProps) {
  return (
    <section className="week-strip" aria-label="12 week plan">
      {program.weeks.map(week => {
        const stats = getWeekStats(state, week);
        return (
          <button
            key={week.id}
            type="button"
            className={week.id === activeWeekId ? 'week-chip active' : 'week-chip'}
            onClick={() => onSelect(week.id)}
          >
            <span>Week {week.weekNumber}</span>
            <strong>{stats.percent}%</strong>
            <small>{week.phase}</small>
          </button>
        );
      })}
    </section>
  );
}
