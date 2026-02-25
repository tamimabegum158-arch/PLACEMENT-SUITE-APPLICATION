import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { usePlatform } from '../store/PlatformContext';
import { CATEGORY_ORDER } from '../lib/skillCategories';

function clampScore(score) {
  return Math.min(100, Math.max(0, Math.round(score)));
}

function getAllSkillsFromCategories(categories) {
  const catsWithSkills = CATEGORY_ORDER.filter((c) => categories[c]?.length);
  const displayCats = catsWithSkills.length > 0 ? catsWithSkills : ['General'];
  return displayCats.flatMap((cat) => (categories[cat] || []).map((skill) => ({ category: cat, skill })));
}

function computeLiveScore(baseScore, skillConfidenceMap, allSkills) {
  let know = 0;
  let practice = 0;
  allSkills.forEach(({ skill }) => {
    const c = skillConfidenceMap[skill];
    if (c === 'know') know++;
    else practice++;
  });
  return clampScore(baseScore + 2 * know - 2 * practice);
}

function planToText(plan) {
  if (!plan?.length) return '';
  return plan
    .map((block) => `${block.day}: ${block.focus || block.title}\n${(block.tasks || block.items || []).map((i) => `  • ${i}`).join('\n')}`)
    .join('\n\n');
}

function checklistToText(checklist) {
  if (!checklist?.length) return '';
  return checklist
    .map((round) => `${round.roundTitle || round.round}\n${(round.items || []).map((i) => `  • ${i}`).join('\n')}`)
    .join('\n\n');
}

function questionsToText(questions) {
  if (!questions?.length) return '';
  return questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
}

function buildFullTxt(entry, liveScore) {
  const plan = entry.plan7Days || entry.plan || [];
  const checklist = entry.checklist || [];
  const categories = entry.extractedSkills?.categories ?? {};
  const skillsByCat = Object.entries(categories)
    .map(([cat, skills]) => `${cat}: ${(skills || []).join(', ')}`)
    .join('\n');
  return [
    `Placement Readiness – ${entry.company || 'Company'} ${entry.role ? `· ${entry.role}` : ''}`,
    `Readiness score: ${liveScore}/100`,
    '',
    '--- Key skills extracted ---',
    skillsByCat,
    '',
    '--- Round-wise checklist ---',
    checklistToText(checklist),
    '',
    '--- 7-day plan ---',
    planToText(plan),
    '',
    '--- 10 likely interview questions ---',
    questionsToText(entry.questions || []),
  ].join('\n');
}

export default function AnalyzeResults() {
  const [searchParams] = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const navigate = useNavigate();
  const { getJDAnalyses, updateJDAnalysis, resumeData } = usePlatform();
  const analyses = getJDAnalyses();
  const entry = idFromUrl
    ? analyses.find((e) => e.id === idFromUrl)
    : analyses[0] || null;

  const updateEntry = useCallback(
    (updates) => {
      if (!entry?.id) return;
      updateJDAnalysis(entry.id, { ...updates, updatedAt: new Date().toISOString() });
    },
    [entry, updateJDAnalysis]
  );

  const setSkillConfidence = useCallback(
    (skill, value) => {
      const map = { ...(entry?.skillConfidenceMap ?? {}) };
      map[skill] = value;
      const allSkills = getAllSkillsFromCategories(entry?.extractedSkills?.categories ?? {});
      const base = entry?.baseScore ?? 0;
      const liveScore = computeLiveScore(base, map, allSkills);
      updateEntry({ skillConfidenceMap: map, finalScore: liveScore });
    },
    [entry, updateEntry]
  );

  const categories = entry?.extractedSkills?.categories ?? {};
  const skillConfidenceMap = entry?.skillConfidenceMap ?? {};
  const allSkills = useMemo(() => getAllSkillsFromCategories(categories), [categories]);
  const baseScore = entry?.baseScore ?? 0;
  const liveScore = useMemo(
    () => computeLiveScore(baseScore, skillConfidenceMap, allSkills),
    [baseScore, skillConfidenceMap, allSkills]
  );
  const practiceSkills = allSkills.filter(({ skill }) => skillConfidenceMap[skill] !== 'know').map(({ skill }) => skill);
  const top3Weak = practiceSkills.slice(0, 3);

  const resumeSkills = useMemo(() => {
    const s = resumeData?.skills;
    if (!s) return [];
    return [...(s.technical || []), ...(s.soft || []), ...(s.tools || [])].map((x) => x.toLowerCase());
  }, [resumeData?.skills]);
  const missingForResume = useMemo(() => {
    return allSkills
      .map(({ skill }) => skill)
      .filter((skill) => !resumeSkills.some((r) => r.includes(skill.toLowerCase()) || skill.toLowerCase().includes(r)));
  }, [allSkills, resumeSkills]);

  const handleCopyPlan = () => {
    navigator.clipboard.writeText(planToText(entry?.plan7Days || entry?.plan || []) || 'No plan.');
  };
  const handleCopyChecklist = () => {
    navigator.clipboard.writeText(checklistToText(entry?.checklist || []) || 'No checklist.');
  };
  const handleCopyQuestions = () => {
    navigator.clipboard.writeText(questionsToText(entry?.questions || []) || 'No questions.');
  };
  const handleDownloadTxt = () => {
    const text = buildFullTxt(entry, liveScore);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (entry?.company || 'analysis').replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 40) || 'analysis';
    a.download = `placement-readiness-${safeName}-${(entry?.id || '').slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!entry) {
    return (
      <section className="route-content">
        <h1 className="heading-1">Results</h1>
        <p className="subtext">No analysis found. Run an analysis from the Analyze page first.</p>
        <p style={{ marginTop: 'var(--space-3)' }}>
          <button type="button" className="btn btn--primary" onClick={() => navigate('/analyze')}>
            Go to Analyze
          </button>
        </p>
      </section>
    );
  }

  const displayCats = CATEGORY_ORDER.filter((c) => categories[c]?.length).length > 0
    ? CATEGORY_ORDER.filter((c) => categories[c]?.length)
    : ['General'];

  return (
    <section className="route-content">
      <h1 className="heading-1">Analysis results</h1>
      <p className="subtext">
        {entry.company && `${entry.company}${entry.role ? ` · ${entry.role}` : ''}`} ·{' '}
        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''}
      </p>

      <div className="card" style={{ marginTop: 'var(--space-3)' }}>
        <h2 className="card__title">Readiness score</h2>
        <p className="card__body">Base score from JD; +2 per skill marked &quot;I know&quot;, −2 per &quot;Need practice&quot;.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '4px solid var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{liveScore}</span>
          </div>
          <span>out of 100</span>
        </div>
      </div>

      {entry.companyIntel && (
        <div className="card" style={{ marginTop: 'var(--space-3)' }}>
          <h2 className="card__title">Company intel</h2>
          <p className="card__body" style={{ marginBottom: 'var(--space-2)' }}>
            {entry.companyIntel.companyName} · {entry.companyIntel.industry} · {entry.companyIntel.sizeLabel}
          </p>
          <p className="card__body">{entry.companyIntel.typicalHiringFocus}</p>
          <p className="text-caption-size" style={{ marginTop: 'var(--space-2)', opacity: 0.7 }}>
            Demo Mode: Company intel generated heuristically.
          </p>
        </div>
      )}

      <div className="card" style={{ marginTop: 'var(--space-3)' }}>
        <h2 className="card__title">Key skills extracted</h2>
        <p className="card__body" style={{ marginBottom: 'var(--space-2)' }}>
          Mark each skill. Default: Need practice. Changes are saved.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {displayCats.map((cat) =>
            (categories[cat] || []).map((skill) => {
              const current = skillConfidenceMap[skill] || 'practice';
              return (
                <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <span className="badge">{skill}</span>
                  <button
                    type="button"
                    className={`btn btn--small ${current === 'know' ? 'btn--primary' : 'btn--secondary'}`}
                    onClick={() => setSkillConfidence(skill, 'know')}
                  >
                    I know
                  </button>
                  <button
                    type="button"
                    className={`btn btn--small ${current === 'practice' ? 'btn--primary' : 'btn--secondary'}`}
                    onClick={() => setSkillConfidence(skill, 'practice')}
                  >
                    Need practice
                  </button>
                </span>
              );
            })
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-3)' }}>
        <h2 className="card__title">Round mapping</h2>
        {(entry.roundMapping || []).map((r, i) => (
          <div key={i} style={{ marginBottom: 'var(--space-2)' }}>
            <p className="card__body" style={{ fontWeight: 600 }}>{r.roundTitle}</p>
            <p className="card__body" style={{ marginLeft: 'var(--space-2)' }}>{r.whyItMatters}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 'var(--space-3)' }}>
        <h2 className="card__title">Export</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <button type="button" className="btn btn--secondary btn--small" onClick={handleCopyPlan}>Copy 7-day plan</button>
          <button type="button" className="btn btn--secondary btn--small" onClick={handleCopyChecklist}>Copy checklist</button>
          <button type="button" className="btn btn--secondary btn--small" onClick={handleCopyQuestions}>Copy questions</button>
          <button type="button" className="btn btn--secondary btn--small" onClick={handleDownloadTxt}>Download as TXT</button>
        </div>
      </div>

      {missingForResume.length > 0 && (
        <div className="card panel-section" style={{ marginTop: 'var(--space-3)' }}>
          <h2 className="panel-section__title">Resume alignment</h2>
          <p className="panel-section__body">
            Consider adding these JD skills to your resume: {missingForResume.slice(0, 5).join(', ')}.
          </p>
          <Link to="/resume/builder" className="btn btn--secondary btn--small">Edit resume</Link>
        </div>
      )}

      <div className="card panel-section" style={{ marginTop: 'var(--space-3)' }}>
        <h2 className="panel-section__title">Action next</h2>
        <p className="panel-section__body">
          {top3Weak.length > 0
            ? `Top weak skills: ${top3Weak.join(', ')}. Start Day 1 plan now.`
            : 'All skills marked known. Keep revising and run mocks.'}
        </p>
      </div>

      <p style={{ marginTop: 'var(--space-3)' }}>
        <button type="button" className="btn btn--secondary" onClick={() => navigate('/analyze/history')}>View history</button>
      </p>
    </section>
  );
}
