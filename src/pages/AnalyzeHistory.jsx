import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../store/PlatformContext';

export default function AnalyzeHistory() {
  const navigate = useNavigate();
  const { getJDAnalyses } = usePlatform();
  const entries = getJDAnalyses();

  function openResult(entry) {
    navigate('/analyze/results?id=' + entry.id);
  }

  return (
    <section className="route-content">
      <h1 className="heading-1">Analysis history</h1>
      <p className="subtext">Click an entry to view full results. Data is stored locally.</p>
      <div className="card" style={{ marginTop: 'var(--space-3)' }}>
        {entries.length === 0 ? (
          <p className="empty-state__body">No analyses yet. Run one from the Analyze page.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {entries.map((entry) => {
              const date = entry.createdAt
                ? new Date(entry.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                : '—';
              const score = entry.finalScore ?? entry.baseScore ?? 0;
              return (
                <li
                  key={entry.id}
                  style={{
                    padding: 'var(--space-2) 0',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => openResult(entry)}
                  onKeyDown={(e) => e.key === 'Enter' && openResult(entry)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>
                        {entry.company || 'No company'} · {entry.role || 'No role'}
                      </p>
                      <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-caption-size)', opacity: 0.85 }}>{date}</p>
                    </div>
                    <span className="badge" style={{ flexShrink: 0 }}>{score}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p style={{ marginTop: 'var(--space-3)' }}>
        <button type="button" className="btn btn--secondary" onClick={() => navigate('/analyze')}>Back to Analyze</button>
      </p>
    </section>
  );
}
