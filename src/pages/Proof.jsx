import { useState, useEffect } from 'react';
import { usePlatform } from '../store/PlatformContext';

const PROOF_STORAGE_KEY = 'placementSuiteProof';
const CHECKLIST_IDS = [
  'job_tracker',
  'jd_analyzer',
  'resume_builder',
  'dashboard',
  'applications',
  'placement_score',
];

function loadProof() {
  try {
    const raw = localStorage.getItem(PROOF_STORAGE_KEY);
    if (!raw) return { checks: {}, deployLink: '', githubLink: '' };
    const p = JSON.parse(raw);
    return {
      checks: p.checks || {},
      deployLink: p.deployLink || '',
      githubLink: p.githubLink || '',
    };
  } catch {
    return { checks: {}, deployLink: '', githubLink: '' };
  }
}

function saveProof(data) {
  try {
    localStorage.setItem(PROOF_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const LABELS = {
  job_tracker: 'Job Tracker working',
  jd_analyzer: 'JD Analyzer working',
  resume_builder: 'Resume Builder working',
  dashboard: 'Unified Dashboard working',
  applications: 'Application Pipeline working',
  placement_score: 'Placement Score visible',
};

export default function Proof() {
  const { readinessScore } = usePlatform();
  const [proof, setProof] = useState(loadProof);

  useEffect(() => {
    setProof(loadProof());
  }, []);

  const setCheck = (id, checked) => {
    const next = { ...proof, checks: { ...proof.checks, [id]: checked } };
    setProof(next);
    saveProof(next);
  };

  const setLink = (key, value) => {
    const next = { ...proof, [key]: value };
    setProof(next);
    saveProof(next);
  };

  const passed = CHECKLIST_IDS.filter((id) => proof.checks[id]).length;
  const total = CHECKLIST_IDS.length;

  const copySubmission = () => {
    const text = [
      'Placement Suite — Proof',
      '',
      'Checklist:',
      ...CHECKLIST_IDS.map((id) => (proof.checks[id] ? '☑' : '☐') + ' ' + LABELS[id]),
      '',
      'Deployment: ' + (proof.deployLink || '—'),
      'GitHub: ' + (proof.githubLink || '—'),
      '',
      'Placement Score: ' + (readinessScore != null ? readinessScore : 'N/A'),
    ].join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <section className="route-content">
      <h1 className="heading-1">Proof</h1>
      <p className="subtext">Artifact collection and delivery proof.</p>

      <div className="card" style={{ marginTop: 'var(--space-3)', maxWidth: '560px' }}>
        <h2 className="card__title">Checklist</h2>
        <ul className="test-checklist-list">
          {CHECKLIST_IDS.map((id) => (
            <li key={id} className="test-checklist-item">
              <label className="test-checklist-item__label">
                <input
                  type="checkbox"
                  checked={!!proof.checks[id]}
                  onChange={(e) => setCheck(id, e.target.checked)}
                />
                <span className="test-checklist-item__text">{LABELS[id]}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="test-summary" style={{ marginTop: 'var(--space-2)' }}>Completed: {passed} / {total}</p>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-3)', maxWidth: '560px' }}>
        <h2 className="card__title">Links</h2>
        <div className="form-group">
          <label className="form-group__label" htmlFor="proof-deploy">Deployment link</label>
          <input
            id="proof-deploy"
            type="url"
            className="input"
            placeholder="https://..."
            value={proof.deployLink}
            onChange={(e) => setLink('deployLink', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-group__label" htmlFor="proof-github">GitHub link</label>
          <input
            id="proof-github"
            type="url"
            className="input"
            placeholder="https://github.com/..."
            value={proof.githubLink}
            onChange={(e) => setLink('githubLink', e.target.value)}
          />
        </div>
        <p style={{ marginTop: 'var(--space-2)' }}>
          <button type="button" className="btn btn--primary" onClick={copySubmission}>Copy Final Submission</button>
        </p>
      </div>
    </section>
  );
}
