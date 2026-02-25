import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlatform } from '../store/PlatformContext';
import { JOBS_DATA } from '../data/jobsData';
import { computeMatchScore } from '../lib/matchScore';
import { computeAtsScore } from '../lib/atsScore';
import { computePlacementScore, applicationProgressPercent } from '../lib/placementScore';

export default function Dashboard() {
  const { preferences, resumeData, getJDAnalyses, getSavedIds, getApplicationStage } = usePlatform();
  const analyses = getJDAnalyses();
  const savedIds = getSavedIds();

  const top5JobsWithScores = useMemo(() => {
    return JOBS_DATA.map((j) => ({ job: j, score: computeMatchScore(j, preferences) }))
      .filter((x) => x.score >= (preferences?.minMatchScore ?? 0))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [preferences]);

  const top5Jobs = useMemo(() => top5JobsWithScores.map((x) => x.job), [top5JobsWithScores]);
  const top5Scores = useMemo(() => top5JobsWithScores.map((x) => x.score), [top5JobsWithScores]);

  const placementScore = useMemo(() => computePlacementScore({
    topJobScores: top5Scores,
    jdScore: analyses[0]?.finalScore ?? analyses[0]?.baseScore ?? null,
    atsScore: computeAtsScore(resumeData),
    applicationProgress: applicationProgressPercent(savedIds, getApplicationStage),
    practiceScore: 0,
  }), [top5Scores, analyses, resumeData, savedIds, getApplicationStage]);


  const atsScore = useMemo(() => computeAtsScore(resumeData), [resumeData]);
  const latestAnalysis = analyses[0];
  const jdScore = latestAnalysis?.finalScore ?? latestAnalysis?.baseScore ?? null;

  const practiceSkills = useMemo(() => {
    if (!latestAnalysis?.extractedSkills?.categories || !latestAnalysis?.skillConfidenceMap) return [];
    const map = latestAnalysis.skillConfidenceMap;
    const cats = latestAnalysis.extractedSkills.categories;
    return Object.entries(cats).flatMap(([, skills]) => (skills || []).filter((s) => map[s] === 'practice')).slice(0, 3);
  }, [latestAnalysis]);

  const pipelineCounts = useMemo(() => {
    const stages = ['Saved', 'Applied', 'Interview Scheduled', 'Interview Completed', 'Offer', 'Rejected'];
    const counts = {};
    stages.forEach((s) => { counts[s] = 0; });
    savedIds.forEach((id) => {
      const stage = getApplicationStage(id);
      if (counts[stage] != null) counts[stage]++;
    });
    return counts;
  }, [savedIds, getApplicationStage]);

  return (
    <section className="route-content">
      <h1 className="heading-1">Dashboard</h1>
      <p className="subtext">Your placement control center.</p>

      <div className="card" style={{ marginTop: 'var(--space-3)' }}>
        <h2 className="card__title">Placement Score</h2>
        <p className="card__body"><strong>{placementScore}</strong> / 100 — Job match, JD readiness, resume ATS, and application progress.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <div className="card">
          <h2 className="card__title">Daily Job Matches</h2>
          <p className="card__body">Top {top5Jobs.length} jobs by match score.</p>
          {top5Jobs.length === 0 ? (
            <p className="empty-state__body">Set preferences in Settings to see matches.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 'var(--space-3)' }}>
              {top5Jobs.map((j) => (
                <li key={j.id} style={{ marginBottom: 'var(--space-1)' }}>
                  <Link to="/jobs">{j.title}</Link> — {j.company}
                </li>
              ))}
            </ul>
          )}
          <Link to="/jobs" className="btn btn--secondary btn--small" style={{ marginTop: 'var(--space-2)' }}>View all jobs</Link>
        </div>

        <div className="card">
          <h2 className="card__title">Resume ATS Score</h2>
          <p className="card__body"><strong>{atsScore}</strong> / 100</p>
          <Link to="/resume/preview" className="btn btn--secondary btn--small" style={{ marginTop: 'var(--space-1)' }}>Edit resume</Link>
        </div>

        <div className="card">
          <h2 className="card__title">JD Readiness Score</h2>
          <p className="card__body">
            {jdScore != null ? <strong>{jdScore}</strong> : '—'} / 100
          </p>
          <Link to="/analyze" className="btn btn--secondary btn--small" style={{ marginTop: 'var(--space-1)' }}>Analyze JD</Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-3)' }}>
        <h2 className="card__title">Applications Pipeline</h2>
        <p className="card__body">
          Saved: {pipelineCounts.Saved} · Applied: {pipelineCounts.Applied} · Interview: {pipelineCounts['Interview Scheduled'] + pipelineCounts['Interview Completed']} · Offer: {pipelineCounts.Offer} · Rejected: {pipelineCounts.Rejected}
        </p>
        <Link to="/applications" className="btn btn--secondary btn--small">View pipeline</Link>
      </div>

      {practiceSkills.length > 0 && (
        <div className="card panel-section" style={{ marginTop: 'var(--space-3)' }}>
          <h2 className="panel-section__title">Weak skill alert</h2>
          <p className="panel-section__body">Focus on: {practiceSkills.join(', ')}. Mark skills in your latest JD analysis or run a new analysis.</p>
          <Link to="/analyze/results" className="btn btn--secondary btn--small">View results</Link>
        </div>
      )}

      <div className="card panel-section" style={{ marginTop: 'var(--space-3)' }}>
        <h2 className="panel-section__title">Next action</h2>
        <p className="panel-section__body">
          {atsScore < 70 && 'Improve your resume ATS score. '}
          {jdScore == null && 'Analyze a job description to get a readiness plan. '}
          {top5Jobs.length > 0 && 'Apply to your top job match. '}
          {!atsScore && !jdScore && top5Jobs.length === 0 && 'Set job preferences, add your resume, or paste a JD to get started.'}
        </p>
      </div>
    </section>
  );
}
