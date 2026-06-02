export function TempoHelp() {
  return (
    <section className="glass-panel tempo-help">
      <p className="eyebrow">How to read tempo</p>
      <h3>Example: 3-1-1-1</h3>
      <p>
        Tempo describes the speed of one rep. The numbers usually mean: lower / pause at bottom / lift / pause at top.
      </p>
      <div className="tempo-grid">
        <div><strong>3</strong><span>Lower the weight for 3 seconds</span></div>
        <div><strong>1</strong><span>Pause for 1 second in the stretched/bottom position</span></div>
        <div><strong>1</strong><span>Lift the weight in 1 controlled second</span></div>
        <div><strong>1</strong><span>Pause/reset for 1 second before the next rep</span></div>
      </div>
      <p className="muted">
        If a workout shows 3-1-1, use the same idea but without a final top pause. "Still" means hold position. "Slow" means controlled with no rushing.
      </p>
    </section>
  );
}
