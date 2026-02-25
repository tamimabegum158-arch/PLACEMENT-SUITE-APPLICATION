import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usePlatform } from '../store/PlatformContext';
import { computeAtsScore, getAtsSuggestions, getAtsBandLabel } from '../lib/atsScore';

function resumeToText(data) {
  if (!data) return '';
  const lines = [];
  const p = data.personal || {};
  lines.push(p.name || '');
  lines.push([p.email, p.phone, p.location].filter(Boolean).join(' | '));
  lines.push('');
  if ((data.summary || '').trim()) {
    lines.push('Summary');
    lines.push(data.summary.trim());
    lines.push('');
  }
  if ((data.education || []).length > 0) {
    lines.push('Education');
    data.education.forEach((e) => {
      lines.push(`${e.school || ''} · ${e.degree || ''} · ${e.period || ''}`);
      if ((e.details || '').trim()) lines.push(e.details.trim());
    });
    lines.push('');
  }
  if ((data.experience || []).length > 0) {
    lines.push('Experience');
    data.experience.forEach((e) => {
      lines.push(`${e.role || ''} at ${e.company || ''} · ${e.period || ''}`);
      if ((e.details || '').trim()) lines.push(e.details.trim());
    });
    lines.push('');
  }
  if ((data.projects || []).length > 0) {
    lines.push('Projects');
    data.projects.forEach((p) => {
      lines.push(p.title || '');
      if ((p.description || '').trim()) lines.push(p.description.trim());
      if ((p.techStack || []).length) lines.push((p.techStack || []).join(', '));
    });
    lines.push('');
  }
  const skills = data.skills;
  if (skills && (skills.technical?.length || skills.soft?.length || skills.tools?.length)) {
    lines.push('Skills');
    const all = [...(skills.technical || []), ...(skills.soft || []), ...(skills.tools || [])];
    lines.push(all.join(', '));
    lines.push('');
  }
  const links = data.links || {};
  if ((links.github || links.linkedin || '').trim()) {
    lines.push('Links');
    if (links.github) lines.push('GitHub: ' + links.github);
    if (links.linkedin) lines.push('LinkedIn: ' + links.linkedin);
  }
  return lines.join('\n');
}

export default function ResumePreviewPage() {
  const { resumeData } = usePlatform();
  const data = resumeData || {};
  const score = computeAtsScore(data);
  const suggestions = getAtsSuggestions(data).slice(0, 3);
  const bandLabel = getAtsBandLabel(score);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopyText = useCallback(() => {
    const text = resumeToText(data);
    navigator.clipboard.writeText(text || 'No content.');
  }, [data]);

  return (
    <section className="route-content">
      <h1 className="heading-1">Resume Preview</h1>
      <p className="subtext">Print or copy your resume. Use browser Print to save as PDF.</p>
      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <Link to="/resume/builder" className="btn btn--secondary">Edit in Builder</Link>
        <button type="button" className="btn btn--secondary" onClick={handlePrint}>Print / Save as PDF</button>
        <button type="button" className="btn btn--secondary" onClick={handleCopyText}>Copy Resume as Text</button>
      </div>

      <div className="card no-print" style={{ marginTop: 'var(--space-3)' }}>
        <h2 className="card__title">ATS Readiness Score</h2>
        <p className="card__body">
          <strong>{score}</strong> / 100 — {bandLabel}
        </p>
        {suggestions.length > 0 && (
          <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 'var(--space-3)' }}>
            {suggestions.map((s, i) => (
              <li key={i} style={{ marginBottom: 'var(--space-1)' }}>{s.text}</li>
            ))}
          </ul>
        )}
      </div>

      <div
        className="card"
        style={{
          marginTop: 'var(--space-3)',
          maxWidth: 720,
          background: '#fff',
          padding: 'var(--space-4)',
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: '0 0 var(--space-2)' }}>
          {data.personal?.name || 'Your Name'}
        </h2>
        <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-caption-size)' }}>
          {[data.personal?.email, data.personal?.phone, data.personal?.location].filter(Boolean).join(' · ')}
        </p>
        {(data.summary || '').trim() && (
          <>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: '0 0 var(--space-1)' }}>Summary</h3>
            <p style={{ margin: '0 0 var(--space-3)', lineHeight: 1.6 }}>{data.summary}</p>
          </>
        )}
        {(data.education || []).length > 0 && (
          <>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: '0 0 var(--space-1)' }}>Education</h3>
            {(data.education || []).map((e, i) => (
              <div key={i} style={{ marginBottom: 'var(--space-2)' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{e.school} · {e.degree}</p>
                <p style={{ margin: 0, fontSize: 'var(--text-caption-size)' }}>{e.period}</p>
                {e.details && <p style={{ margin: 'var(--space-1) 0 0' }}>{e.details}</p>}
              </div>
            ))}
          </>
        )}
        {(data.experience || []).length > 0 && (
          <>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: 'var(--space-2) 0 var(--space-1)' }}>Experience</h3>
            {(data.experience || []).map((e, i) => (
              <div key={i} style={{ marginBottom: 'var(--space-2)' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{e.role} at {e.company}</p>
                <p style={{ margin: 0, fontSize: 'var(--text-caption-size)' }}>{e.period}</p>
                {e.details && <p style={{ margin: 'var(--space-1) 0 0', whiteSpace: 'pre-wrap' }}>{e.details}</p>}
              </div>
            ))}
          </>
        )}
        {(data.projects || []).length > 0 && (
          <>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: 'var(--space-2) 0 var(--space-1)' }}>Projects</h3>
            {(data.projects || []).map((p, i) => (
              <div key={i} style={{ marginBottom: 'var(--space-2)' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{p.title}</p>
                {p.description && <p style={{ margin: 'var(--space-1) 0 0' }}>{p.description}</p>}
                {(p.techStack || []).length > 0 && <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-caption-size)' }}>{(p.techStack || []).join(', ')}</p>}
              </div>
            ))}
          </>
        )}
        {data.skills && (data.skills.technical?.length || data.skills.soft?.length || data.skills.tools?.length) && (
          <>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: 'var(--space-2) 0 var(--space-1)' }}>Skills</h3>
            <p style={{ margin: 0 }}>
              {[...(data.skills.technical || []), ...(data.skills.soft || []), ...(data.skills.tools || [])].join(', ')}
            </p>
          </>
        )}
        {(data.links?.github || data.links?.linkedin) && (
          <>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: 'var(--space-2) 0 var(--space-1)' }}>Links</h3>
            <p style={{ margin: 0 }}>
              {data.links.github && <a href={data.links.github} target="_blank" rel="noreferrer">GitHub</a>}
              {data.links.github && data.links.linkedin && ' · '}
              {data.links.linkedin && <a href={data.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
