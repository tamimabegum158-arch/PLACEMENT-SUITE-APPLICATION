import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlatform } from '../store/PlatformContext';
import { defaultResumeData } from '../store/constants';
import { computeAtsScore } from '../lib/atsScore';

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

const sampleData = {
  personal: { name: 'Alex Chen', email: 'alex.chen@email.com', phone: '+1 (555) 123-4567', location: 'San Francisco, CA' },
  summary: 'Software engineer with 5+ years of experience building web applications. Focus on clean code, user experience, and scalable systems.',
  education: [
    { id: genId(), school: 'State University', degree: 'B.S. Computer Science', period: '2015 – 2019', details: 'Relevant coursework, honors.' },
  ],
  experience: [
    { id: genId(), company: 'Tech Corp', role: 'Senior Software Engineer', period: '2021 – Present', details: 'Led features. Improved performance by 20%. Mentored juniors.' },
  ],
  projects: [
    { id: genId(), title: 'Open Source Tool', description: 'CLI tool for developers. 2k+ GitHub stars.', techStack: ['TypeScript', 'Node.js'], liveUrl: '', githubUrl: 'https://github.com/example/tool' },
  ],
  skills: {
    technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL'],
    soft: ['Team Leadership', 'Problem Solving'],
    tools: ['Git', 'Docker'],
  },
  links: { github: 'https://github.com/alexchen', linkedin: 'https://linkedin.com/in/alexchen' },
  template: 'classic',
  colorTheme: 'hsl(168, 60%, 40%)',
};

export default function ResumeBuilderPage() {
  const { resumeData, setResumeData } = usePlatform();
  const [local, setLocal] = useState(() => ({ ...defaultResumeData(), ...resumeData }));

  useEffect(() => {
    setLocal((prev) => ({ ...prev, ...resumeData }));
  }, [resumeData]);

  const update = (key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    setResumeData(next);
  };

  const loadSample = () => {
    const next = { ...defaultResumeData(), ...sampleData };
    setLocal(next);
    setResumeData(next);
  };

  const addEducation = () => {
    const list = [...(local.education || []), { id: genId(), school: '', degree: '', period: '', details: '' }];
    update('education', list);
  };
  const updateEducation = (index, field, value) => {
    const list = [...(local.education || [])];
    list[index] = { ...list[index], [field]: value };
    update('education', list);
  };
  const removeEducation = (index) => {
    const list = (local.education || []).filter((_, i) => i !== index);
    update('education', list);
  };

  const addExperience = () => {
    const list = [...(local.experience || []), { id: genId(), company: '', role: '', period: '', details: '' }];
    update('experience', list);
  };
  const updateExperience = (index, field, value) => {
    const list = [...(local.experience || [])];
    list[index] = { ...list[index], [field]: value };
    update('experience', list);
  };
  const removeExperience = (index) => {
    const list = (local.experience || []).filter((_, i) => i !== index);
    update('experience', list);
  };

  const addProject = () => {
    const list = [...(local.projects || []), { id: genId(), title: '', description: '', techStack: [], liveUrl: '', githubUrl: '' }];
    update('projects', list);
  };
  const updateProject = (index, field, value) => {
    const list = [...(local.projects || [])];
    list[index] = { ...list[index], [field]: value };
    update('projects', list);
  };
  const removeProject = (index) => {
    const list = (local.projects || []).filter((_, i) => i !== index);
    update('projects', list);
  };

  const score = computeAtsScore(local);

  return (
    <section className="route-content">
      <h1 className="heading-1">Resume Builder</h1>
      <p className="subtext">Edit your resume. Changes are saved automatically.</p>
      <p style={{ marginTop: 'var(--space-2)' }}>
        <button type="button" className="btn btn--secondary" onClick={loadSample}>Load Sample Data</button>
        <Link to="/resume/preview" className="btn btn--primary" style={{ marginLeft: 'var(--space-2)' }}>Preview</Link>
      </p>

      <div className="card" style={{ marginTop: 'var(--space-3)', maxWidth: '560px' }}>
        <h2 className="card__title">Personal</h2>
        <div className="form-group">
          <label className="form-group__label">Name</label>
          <input className="input" value={local.personal?.name ?? ''} onChange={(e) => update('personal', { ...local.personal, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-group__label">Email</label>
          <input type="email" className="input" value={local.personal?.email ?? ''} onChange={(e) => update('personal', { ...local.personal, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-group__label">Phone</label>
          <input className="input" value={local.personal?.phone ?? ''} onChange={(e) => update('personal', { ...local.personal, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-group__label">Location</label>
          <input className="input" value={local.personal?.location ?? ''} onChange={(e) => update('personal', { ...local.personal, location: e.target.value })} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-3)', maxWidth: '560px' }}>
        <h2 className="card__title">Summary</h2>
        <textarea className="input textarea" value={local.summary ?? ''} onChange={(e) => update('summary', e.target.value)} rows={4} />
      </div>

      <div className="card" style={{ marginTop: 'var(--space-3)', maxWidth: '560px' }}>
        <h2 className="card__title">Education</h2>
        {(local.education || []).map((e, i) => (
          <div key={e.id} style={{ marginBottom: 'var(--space-2)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
            <input className="input" placeholder="School" value={e.school} onChange={(ev) => updateEducation(i, 'school', ev.target.value)} />
            <input className="input" placeholder="Degree" value={e.degree} onChange={(ev) => updateEducation(i, 'degree', ev.target.value)} style={{ marginTop: 'var(--space-1)' }} />
            <input className="input" placeholder="Period" value={e.period} onChange={(ev) => updateEducation(i, 'period', ev.target.value)} style={{ marginTop: 'var(--space-1)' }} />
            <textarea className="input textarea" placeholder="Details" value={e.details} onChange={(ev) => updateEducation(i, 'details', ev.target.value)} rows={2} style={{ marginTop: 'var(--space-1)' }} />
            <button type="button" className="btn btn--secondary btn--small" style={{ marginTop: 'var(--space-1)' }} onClick={() => removeEducation(i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn btn--secondary btn--small" onClick={addEducation}>Add Education</button>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-3)', maxWidth: '560px' }}>
        <h2 className="card__title">Experience</h2>
        {(local.experience || []).map((e, i) => (
          <div key={e.id} style={{ marginBottom: 'var(--space-2)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
            <input className="input" placeholder="Company" value={e.company} onChange={(ev) => updateExperience(i, 'company', ev.target.value)} />
            <input className="input" placeholder="Role" value={e.role} onChange={(ev) => updateExperience(i, 'role', ev.target.value)} style={{ marginTop: 'var(--space-1)' }} />
            <input className="input" placeholder="Period" value={e.period} onChange={(ev) => updateExperience(i, 'period', ev.target.value)} style={{ marginTop: 'var(--space-1)' }} />
            <textarea className="input textarea" placeholder="Details (bullets)" value={e.details} onChange={(ev) => updateExperience(i, 'details', ev.target.value)} rows={3} style={{ marginTop: 'var(--space-1)' }} />
            <button type="button" className="btn btn--secondary btn--small" style={{ marginTop: 'var(--space-1)' }} onClick={() => removeExperience(i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn btn--secondary btn--small" onClick={addExperience}>Add Experience</button>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-3)', maxWidth: '560px' }}>
        <h2 className="card__title">Projects</h2>
        {(local.projects || []).map((p, i) => (
          <div key={p.id} style={{ marginBottom: 'var(--space-2)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
            <input className="input" placeholder="Title" value={p.title} onChange={(ev) => updateProject(i, 'title', ev.target.value)} />
            <textarea className="input textarea" placeholder="Description" value={p.description} onChange={(ev) => updateProject(i, 'description', ev.target.value)} rows={2} style={{ marginTop: 'var(--space-1)' }} />
            <input className="input" placeholder="Tech stack (comma-separated)" value={Array.isArray(p.techStack) ? p.techStack.join(', ') : ''} onChange={(ev) => updateProject(i, 'techStack', ev.target.value.split(',').map((s) => s.trim()).filter(Boolean))} style={{ marginTop: 'var(--space-1)' }} />
            <input className="input" placeholder="GitHub URL" value={p.githubUrl} onChange={(ev) => updateProject(i, 'githubUrl', ev.target.value)} style={{ marginTop: 'var(--space-1)' }} />
            <button type="button" className="btn btn--secondary btn--small" style={{ marginTop: 'var(--space-1)' }} onClick={() => removeProject(i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn btn--secondary btn--small" onClick={addProject}>Add Project</button>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-3)', maxWidth: '560px' }}>
        <h2 className="card__title">Skills (comma-separated per line)</h2>
        <p className="form-group__label">Technical</p>
        <input className="input" placeholder="e.g. JavaScript, React" value={(local.skills?.technical || []).join(', ')} onChange={(e) => update('skills', { ...local.skills, technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
        <p className="form-group__label" style={{ marginTop: 'var(--space-2)' }}>Soft</p>
        <input className="input" placeholder="e.g. Leadership" value={(local.skills?.soft || []).join(', ')} onChange={(e) => update('skills', { ...local.skills, soft: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
        <p className="form-group__label" style={{ marginTop: 'var(--space-2)' }}>Tools</p>
        <input className="input" placeholder="e.g. Git" value={(local.skills?.tools || []).join(', ')} onChange={(e) => update('skills', { ...local.skills, tools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
      </div>

      <div className="card" style={{ marginTop: 'var(--space-3)', maxWidth: '560px' }}>
        <h2 className="card__title">Links</h2>
        <div className="form-group">
          <label className="form-group__label">GitHub</label>
          <input className="input" value={local.links?.github ?? ''} onChange={(e) => update('links', { ...local.links, github: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-group__label">LinkedIn</label>
          <input className="input" value={local.links?.linkedin ?? ''} onChange={(e) => update('links', { ...local.links, linkedin: e.target.value })} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-3)' }}>
        <h2 className="card__title">ATS Readiness Score</h2>
        <p className="card__body">{score} / 100</p>
        <Link to="/resume/preview" className="btn btn--primary" style={{ marginTop: 'var(--space-2)' }}>Preview & Export</Link>
      </div>
    </section>
  );
}
