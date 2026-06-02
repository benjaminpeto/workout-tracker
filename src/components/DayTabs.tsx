import type { TrackerState, WeekPlan } from '../types';
import { getDayStats } from '../lib/analytics';

type DayTabsProps = {
  week: WeekPlan;
  state: TrackerState;
  activeDayId: string;
  onSelect: (dayId: string) => void;
};

export function DayTabs({ week, state, activeDayId, onSelect }: DayTabsProps) {
  return (
    <nav className="day-tabs" aria-label="Workout days">
      {week.days.map(day => {
        const stats = getDayStats(state, week.id, day);
        return (
          <button
            className={day.id === activeDayId ? 'day-tab active' : 'day-tab'}
            key={day.id}
            onClick={() => onSelect(day.id)}
            type="button"
          >
            <span>{day.shortLabel}</span>
            <strong>{stats.percent}%</strong>
          </button>
        );
      })}
    </nav>
  );
}
