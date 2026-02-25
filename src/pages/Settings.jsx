import { useState, useEffect } from 'react';
import { usePlatform } from '../store/PlatformContext';

export default function Settings() {
  const { preferences, setPreferences } = usePlatform();
  const [roleKeywords, setRoleKeywords] = useState('');
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [preferredMode, setPreferredMode] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [skills, setSkills] = useState('');
  const [minMatchScore, setMinMatchScore] = useState(40);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (preferences) {
      setRoleKeywords(Array.isArray(preferences.roleKeywords) ? preferences.roleKeywords.join(', ') : '');
      setPreferredLocations(preferences.preferredLocations || []);
      setExperienceLevel(preferences.experienceLevel || '');
      setSkills(Array.isArray(preferences.skills) ? preferences.skills.join(', ') : '');
      setMinMatchScore(preferences.minMatchScore ?? 40);
      setPreferredMode(preferences.preferredMode || []);
    }
  }, [preferences]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPreferences({
      roleKeywords: roleKeywords.split(',').map((s) => s.trim()).filter(Boolean),
      preferredLocations: Array.isArray(preferredLocations) ? preferredLocations : [],
      preferredMode,
      experienceLevel,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      minMatchScore: Math.max(0, Math.min(100, Number(minMatchScore) || 40)),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const locations = ['Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Pune', 'Noida', 'Gurgaon'];

  return (
    <section className="route-content">
      <h1 className="heading-1">What are you looking for?</h1>
      <p className="subtext">
        Tell us your preferences so we can match you to the right roles. Saved to this device only.
      </p>
      <form onSubmit={handleSubmit} className="card" style={{ marginTop: 'var(--space-4)', maxWidth: '560px' }}>
        <div className="form-group">
          <label className="form-group__label" htmlFor="pref-roleKeywords">Role keywords</label>
          <input
            type="text"
            id="pref-roleKeywords"
            className="input"
            placeholder="e.g. React, Frontend, Product Manager"
            value={roleKeywords}
            onChange={(e) => setRoleKeywords(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-group__label" htmlFor="pref-locations">Preferred locations</label>
          <select
            id="pref-locations"
            className="input select"
            multiple
            value={preferredLocations}
            onChange={(e) => {
              const opts = [...e.target.selectedOptions].map((o) => o.value);
              setPreferredLocations(opts);
            }}
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <span className="form-group__label">Preferred mode</span>
          <div className="checkbox-group">
            {['Remote', 'Hybrid', 'Onsite'].map((mode) => (
              <label key={mode} className="checkbox-group__item">
                <input
                  type="checkbox"
                  checked={preferredMode.includes(mode)}
                  onChange={(e) => {
                    if (e.target.checked) setPreferredMode((m) => [...m, mode]);
                    else setPreferredMode((m) => m.filter((x) => x !== mode));
                  }}
                />
                {mode}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-group__label" htmlFor="pref-experience">Experience level</label>
          <select
            id="pref-experience"
            className="input select"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
          >
            <option value="">Any</option>
            <option value="Fresher">Fresher</option>
            <option value="0-1">0-1</option>
            <option value="1-3">1-3</option>
            <option value="3-5">3-5</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-group__label" htmlFor="pref-skills">Skills</label>
          <input
            type="text"
            id="pref-skills"
            className="input"
            placeholder="e.g. JavaScript, Python, SQL"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-group__label" htmlFor="pref-minMatchScore">Minimum match score (0–100)</label>
          <div className="slider-group">
            <input
              type="range"
              id="pref-minMatchScore"
              min="0"
              max="100"
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
            />
            <p className="slider-group__value">{minMatchScore}</p>
          </div>
        </div>
        <p style={{ marginTop: 'var(--space-3)' }}>
          <button type="submit" className="btn btn--primary">
            {saved ? 'Saved' : 'Save preferences'}
          </button>
        </p>
      </form>
    </section>
  );
}
