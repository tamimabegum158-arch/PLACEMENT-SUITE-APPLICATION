import { useMemo } from 'react';
import { usePlatform } from '../store/PlatformContext';
import { JOBS_DATA } from '../data/jobsData';

export default function Applications() {
  const { getSavedIds, getApplicationStage, setApplicationStage, PIPELINE_STAGES } = usePlatform();
  const savedIds = getSavedIds();
  const jobMap = useMemo(() => {
    const m = {};
    JOBS_DATA.forEach((j) => { m[j.id] = j; });
    return m;
  }, []);

  const jobsByStage = useMemo(() => {
    const map = {};
    PIPELINE_STAGES.forEach((s) => { map[s] = []; });
    savedIds.forEach((id) => {
      const stage = getApplicationStage(id);
      if (map[stage]) map[stage].push(id);
    });
    return map;
  }, [savedIds, getApplicationStage]);

  if (savedIds.length === 0) {
    return (
      <section className="route-content">
        <h1 className="heading-1">Applications</h1>
        <p className="subtext">Track your applications through the pipeline.</p>
        <div className="empty-state empty-state--premium" style={{ marginTop: 'var(--space-4)' }}>
          <p className="empty-state__title">No applications yet</p>
          <p className="empty-state__body">Save jobs from the Jobs page to see them here and move them through stages.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="route-content">
      <h1 className="heading-1">Applications</h1>
      <p className="subtext">Move jobs through stages. Changes are saved automatically.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage} className="card" style={{ minHeight: 120 }}>
            <h3 className="card__title" style={{ fontSize: 'var(--text-body-size)', marginBottom: 'var(--space-2)' }}>{stage}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {(jobsByStage[stage] || []).map((jobId) => {
                const job = jobMap[jobId];
                if (!job) return null;
                return (
                  <div key={jobId} className="job-card" style={{ padding: 'var(--space-2)' }}>
                    <p className="job-card__title" style={{ marginBottom: 'var(--space-1)' }}>{job.title}</p>
                    <p className="job-card__company" style={{ margin: 0, fontSize: 'var(--text-caption-size)' }}>{job.company}</p>
                    <select
                      className="input select"
                      style={{ marginTop: 'var(--space-1)', fontSize: 'var(--text-caption-size)' }}
                      value={stage}
                      onChange={(e) => setApplicationStage(jobId, e.target.value)}
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <a href={job.applyUrl} target="_blank" rel="noreferrer" className="btn btn--primary btn--small" style={{ marginTop: 'var(--space-1)' }}>Apply</a>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
