import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlatform } from '../store/PlatformContext';
import { runAnalysis } from '../lib/jdAnalysis';
import { getCompanyIntel } from '../lib/companyIntel';
import { generateRoundMapping } from '../lib/roundMapping';

function buildEntry(company, role, jdText, result, companyIntel, roundMapping) {
  const now = new Date().toISOString();
  const id = `jd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const plan7Days = (result.plan || []).map((p) => ({
    day: p.day,
    focus: p.title,
    tasks: p.items || [],
  }));
  const checklist = (result.checklist || []).map((c) => ({
    roundTitle: c.round,
    items: c.items || [],
  }));
  const roundMap = (roundMapping || []).map((r) => ({
    roundTitle: r.title,
    focusAreas: r.description ? [r.description] : [],
    whyItMatters: r.whyItMatters || '',
  }));
  return {
    id,
    createdAt: now,
    updatedAt: now,
    company: company || '',
    role: role || '',
    jdText: jdText || '',
    extractedSkills: result.extractedSkills || { categories: {}, allSkills: [], isGeneralFresher: true },
    roundMapping: roundMap,
    checklist,
    plan7Days,
    questions: result.questions || [],
    baseScore: result.readinessScore ?? 0,
    skillConfidenceMap: {},
    finalScore: result.readinessScore ?? 0,
    companyIntel: companyIntel || null,
  };
}

export default function AnalyzePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveJDAnalysis } = usePlatform();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const state = location.state;
    if (state?.jdText) setJdText(state.jdText);
    if (state?.company) setCompany(state.company);
    if (state?.role) setRole(state.role);
  }, [location.state]);

  const jdLength = (jdText || '').trim().length;
  const showShortJdWarning = jdLength > 0 && jdLength < 200;

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimmedJd = (jdText || '').trim();
    if (!trimmedJd) {
      setError('Please paste a job description to analyze.');
      return;
    }
    setLoading(true);
    try {
      const result = runAnalysis(company.trim(), role.trim(), trimmedJd);
      const companyTrimmed = company.trim();
      const companyIntel = companyTrimmed ? getCompanyIntel(companyTrimmed, trimmedJd) : null;
      const companySize = companyIntel?.sizeCategory ?? 'startup';
      const roundMapping = generateRoundMapping(result.extractedSkills, companySize);
      const entry = buildEntry(companyTrimmed, role.trim(), trimmedJd, result, companyIntel, roundMapping);
      saveJDAnalysis(entry);
      navigate('/analyze/results?id=' + entry.id, { replace: false });
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="route-content">
      <h1 className="heading-1">Analyze JD</h1>
      <p className="subtext">
        Paste the job description below. We&apos;ll extract skills and generate a preparation plan (no data sent online).
      </p>
      <form onSubmit={handleSubmit} className="card" style={{ marginTop: 'var(--space-4)', maxWidth: '560px' }}>
        <div className="form-group">
          <label className="form-group__label" htmlFor="company">Company (optional)</label>
          <input
            id="company"
            type="text"
            className="input"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google, Microsoft"
          />
        </div>
        <div className="form-group">
          <label className="form-group__label" htmlFor="role">Role (optional)</label>
          <input
            id="role"
            type="text"
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. SDE 1, Full Stack Developer"
          />
        </div>
        <div className="form-group">
          <label className="form-group__label" htmlFor="jd">Job description (required)</label>
          <textarea
            id="jd"
            className="input textarea"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={10}
            required
          />
          {showShortJdWarning && (
            <p className="error-message" style={{ marginTop: 'var(--space-1)' }}>
              This JD is too short to analyze deeply. Paste full JD for better output.
            </p>
          )}
        </div>
        {error && <p className="error-message">{error}</p>}
        <p style={{ marginTop: 'var(--space-3)' }}>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </p>
      </form>
    </section>
  );
}
