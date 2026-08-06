import { scoreReadme, scoreToStars } from '../lib/qualityScore';

export default function QualityScore({ state }) {
  const { score, passed, missing } = scoreReadme(state);
  const stars = scoreToStars(score);

  return (
    <div className="quality-score">
      <div className="quality-score__header">
        <span className="quality-score__label">README Quality</span>
        <span className="quality-score__number">{score}/100</span>
      </div>
      <div className="quality-score__stars" aria-hidden="true">
        {'★'.repeat(stars)}
        {'☆'.repeat(5 - stars)}
      </div>
      <div className="quality-score__bar">
        <div className="quality-score__bar-fill" style={{ width: `${score}%` }} />
      </div>
      {missing.length > 0 && (
        <div className="quality-score__suggestions">
          <span className="quality-score__suggestions-label">Suggestions</span>
          <ul>
            {missing.map((m) => (
              <li key={m.id}>{m.label}</li>
            ))}
          </ul>
        </div>
      )}
      {missing.length === 0 && (
        <p className="quality-score__done">All checks passed — nice work.</p>
      )}
    </div>
  );
}
