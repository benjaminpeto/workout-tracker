import type { BodyMetrics, ProgramPlan, TrackerState, WeekPlan } from '../types';
import { formatSavedTime, getBodyTrend, getDayStats, getProgramStats, getWeekStats } from '../lib/analytics';
import { StatCard } from './StatCard';

type DashboardProps = {
  program: ProgramPlan;
  week: WeekPlan;
  state: TrackerState;
  onBodyPatch: (patch: Partial<BodyMetrics>) => void;
};

export function Dashboard({ program, week, state, onBodyPatch }: DashboardProps) {
  const weekStats = getWeekStats(state, week);
  const programStats = getProgramStats(state, program);
  const lastSaved = formatSavedTime(state.updatedAt);
  const body = state.bodyByWeek[week.id];
  const trend = getBodyTrend(program, state.bodyByWeek).filter(item => item.weight || item.waist).slice(-6);

  return (
    <section className="dashboard-grid">
      <div className="glass-panel summary-panel wide-panel">
        <p className="eyebrow">12-week dashboard</p>
        <h2>{program.title}</h2>
        <p>{program.subtitle}</p>
        <div className="week-progress big-progress">
          <div style={{ width: `${programStats.percent}%` }} />
        </div>
        <span className="saved-label">Saved to IndexedDB: {lastSaved}</span>
      </div>

      <div className="stats-grid">
        <StatCard label="Total progress" value={`${programStats.percent}%`} hint={`${programStats.doneSets}/${programStats.totalSets} sets touched`} />
        <StatCard label="Completed weeks" value={`${programStats.completedWeeks}/${programStats.totalWeeks}`} hint="90%+ set completion" />
        <StatCard label="Completed days" value={`${programStats.completedDays}/${programStats.totalDays}`} hint="90%+ set completion" />
        <StatCard label="Total volume" value={`${Math.round(programStats.volume)}`} hint="kg x reps" />
      </div>

      <div className="glass-panel summary-panel">
        <p className="eyebrow">Week {week.weekNumber} - {week.phase}</p>
        <h2>{week.goal}</h2>
        <p>{week.notes}</p>
        <div className="week-progress">
          <div style={{ width: `${weekStats.percent}%` }} />
        </div>
        <div className="week-meta-grid">
          <span><strong>RIR</strong>{week.targetRir}</span>
          <span><strong>Volume</strong>{week.setsVolume}</span>
          <span><strong>Conditioning</strong>{week.conditioning}</span>
        </div>
      </div>

      <div className="glass-panel body-panel">
        <div>
          <p className="eyebrow">Week {week.weekNumber} body check-in</p>
          <h3>Optional weekly markers</h3>
        </div>
        <div className="body-input-grid">
          <label>
            Weight kg
            <input inputMode="decimal" type="number" step="0.1" value={body.weightKg ?? ''} onChange={event => onBodyPatch({ weightKg: event.target.value })} placeholder="87" />
          </label>
          <label>
            Waist cm
            <input inputMode="decimal" type="number" step="0.5" value={body.waistCm ?? ''} onChange={event => onBodyPatch({ waistCm: event.target.value })} placeholder="94" />
          </label>
          <label>
            Sleep h
            <input inputMode="decimal" type="number" step="0.25" value={body.sleepHours ?? ''} onChange={event => onBodyPatch({ sleepHours: event.target.value })} placeholder="7.5" />
          </label>
          <label>
            Stress
            <select value={body.stress ?? ''} onChange={event => onBodyPatch({ stress: event.target.value })}>
              <option value="">Select</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>
          <label>
            Surf sessions
            <input inputMode="numeric" type="number" min="0" step="1" value={body.surfSessions ?? ''} onChange={event => onBodyPatch({ surfSessions: event.target.value })} placeholder="1" />
          </label>
          <label>
            Gym sessions
            <input inputMode="numeric" type="number" min="0" step="1" value={body.gymSessions ?? ''} onChange={event => onBodyPatch({ gymSessions: event.target.value })} placeholder="4" />
          </label>
        </div>
        <label className="full-width-field">
          Weekly body notes
          <textarea rows={3} value={body.notes ?? ''} onChange={event => onBodyPatch({ notes: event.target.value })} placeholder="Waist/photo notes, appetite, recovery, stress, travel, surf..." />
        </label>
      </div>

      <div className="glass-panel mini-analytics">
        <p className="eyebrow">Selected week day status</p>
        {week.days.map(day => {
          const stats = getDayStats(state, week.id, day);
          return (
            <div className="day-row" key={day.id}>
              <span>{day.shortLabel}</span>
              <div className="tiny-bar"><div style={{ width: `${stats.percent}%` }} /></div>
              <strong>{stats.percent}%</strong>
            </div>
          );
        })}
      </div>

      <div className="glass-panel mini-analytics">
        <p className="eyebrow">Recent body trend</p>
        {trend.length ? trend.map(item => (
          <div className="trend-row" key={item.weekId}>
            <span>W{item.weekNumber}</span>
            <strong>{item.weight ? `${item.weight} kg` : '-'}</strong>
            <em>{item.waist ? `${item.waist} cm waist` : 'waist empty'}</em>
          </div>
        )) : <p className="muted">Add weight/waist each week to start seeing a trend here.</p>}
      </div>
    </section>
  );
}
