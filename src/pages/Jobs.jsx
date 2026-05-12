import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../store/PlatformContext';
import { useToast } from '../components/Toast';
import { JOBS_DATA } from '../data/jobsData';
import {
  computeMatchScore,
  extractSalaryNumber,
  matchScoreBadgeClass,
  postedLabel,
} from '../lib/matchScore';

const DIGEST_KEY = 'placementSuiteDigest_';

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDigest(dateKey) {
  try {
    const raw = localStorage.getItem(DIGEST_KEY + dateKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.jobs ? data : null;
  } catch {
    return null;
  }
}

function setDigest(dateKey, data) {
  try {
    localStorage.setItem(DIGEST_KEY + dateKey, JSON.stringify(data));
  } catch {}
}

const VALID_STATUSES = ['Not Applied', 'Applied', 'Rejected', 'Selected'];

function JobModal({ job, onClose, onApply }) {
  if (!job) return null;
  return (
    <div
      className="modal-overlay is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="job-modal-title" className="modal__title">{job.title}</h2>
        <p className="modal__company">{job.company}</p>
        <div className="modal__section">
          <span className="modal__label">Description</span>
          <p className="modal__body">{job.description || '—'}</p>
        </div>
        <div className="modal__section">
          <span className="modal__label">Skills</span>
          <div className="modal__skills">
            {(job.skills || []).map((s) => (
              <span key={s} className="modal__skill">{s}</span>
            ))}
          </div>
        </div>
        <div className="modal__actions">
          <button type="button" className="btn btn--primary btn--small" onClick={() => { onApply(job); onClose(); }}>
            Apply
          </button>
          <button type="button" className="btn btn--secondary btn--small modal__close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function JobCard({
  job,
  matchScore,
  status,
  isSaved,
  onView,
  onSave,
  onApply,
  onStatusChange,
  onAnalyzeJd,
  showMatchScore = true,
}) {
  const meta = [job.location, job.mode, job.experience].filter(Boolean).join(' · ') || '—';
  const statusClass = (s) => {
    if (s === 'Applied') return 'job-card__status-btn job-card__status-btn--applied';
    if (s === 'Rejected') return 'job-card__status-btn job-card__status-btn--rejected';
    if (s === 'Selected') return 'job-card__status-btn job-card__status-btn--selected';
    return 'job-card__status-btn job-card__status-btn--neutral';
  };

  return (
    <div className="job-card" data-job-id={job.id}>
      <p className="job-card__title">{job.title}</p>
      <p className="job-card__company">{job.company}</p>
      <p className="job-card__meta">{meta}</p>
      <p className="job-card__salary">{job.salaryRange || '—'}</p>
      <div className="job-card__status-group">
        {VALID_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`${statusClass(s)} ${s === status ? 'job-card__status-btn--active' : ''}`}
            onClick={() => onStatusChange(job.id, s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="job-card__footer">
        {showMatchScore && (
          <span className={matchScoreBadgeClass(matchScore)}>{matchScore}% match</span>
        )}
        <span className="badge">{job.source}</span>
        <span className="badge">{postedLabel(job.postedDaysAgo)}</span>
        <button type="button" className="btn btn--secondary btn--small" onClick={() => onView(job)}>View</button>
        {job.description && onAnalyzeJd && (
          <button type="button" className="btn btn--secondary btn--small" onClick={() => onAnalyzeJd(job)}>Analyze JD</button>
        )}
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={() => onSave(job.id)}
          disabled={isSaved}
        >
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button type="button" className="btn btn--primary btn--small" onClick={() => onApply(job)}>Apply</button>
      </div>
    </div>
  );
}

export default function Jobs() {
  const {
    preferences,
    getSavedIds,
    addSavedJob,
    removeSavedJob,
    isJobSaved,
    getApplicationStatus,
    setApplicationStatus,
  } = usePlatform();
  const addToast = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [mode, setMode] = useState('');
  const [experience, setExperience] = useState('');
  const [source, setSource] = useState('');
  const [sort, setSort] = useState('latest');
  const [statusFilter, setStatusFilter] = useState('');
  const [onlyAboveThreshold, setOnlyAboveThreshold] = useState(false);
  const [modalJob, setModalJob] = useState(null);
  const [digestGenerated, setDigestGenerated] = useState(null);

  const savedIds = getSavedIds();
  const locations = useMemo(() => {
    const set = new Set();
    JOBS_DATA.forEach((j) => j.location && set.add(j.location));
    return [...set].sort();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let list = tab === 'saved'
      ? JOBS_DATA.filter((j) => savedIds.includes(j.id))
      : [...JOBS_DATA];

    const kw = keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter((j) =>
        (j.title || '').toLowerCase().includes(kw) || (j.company || '').toLowerCase().includes(kw)
      );
    }
    if (location) list = list.filter((j) => j.location === location);
    if (mode) list = list.filter((j) => j.mode === mode);
    if (experience) list = list.filter((j) => j.experience === experience);
    if (source) list = list.filter((j) => j.source === source);
    if (statusFilter) {
      list = list.filter((j) => getApplicationStatus(j.id) === statusFilter);
    }

    list = list.map((j) => ({ ...j, _matchScore: computeMatchScore(j, preferences) }));
    if (onlyAboveThreshold && preferences) {
      const min = preferences.minMatchScore ?? 40;
      list = list.filter((j) => j._matchScore >= min);
    }

    const da = (x) => (x.postedDaysAgo != null ? x.postedDaysAgo : 99);
    if (sort === 'match') list.sort((a, b) => (b._matchScore || 0) - (a._matchScore || 0));
    else if (sort === 'salary') list.sort((a, b) => extractSalaryNumber(b.salaryRange) - extractSalaryNumber(a.salaryRange));
    else if (sort === 'oldest') list.sort((a, b) => da(b) - da(a));
    else list.sort((a, b) => da(a) - da(b));

    return list;
  }, [tab, keyword, location, mode, experience, source, sort, statusFilter, onlyAboveThreshold, preferences, savedIds, getApplicationStatus]);

  const handleSave = (jobId) => {
    if (savedIds.includes(jobId)) removeSavedJob(jobId);
    else addSavedJob(jobId);
  };

  const handleStatusChange = (jobId, status) => {
    setApplicationStatus(jobId, status);
    addToast(`Status updated: ${status}`);
  };

  const handleApply = (job) => {
    if (job.applyUrl) window.open(job.applyUrl, '_blank');
  };

  const handleGenerateDigest = () => {
    if (!preferences || !preferences.roleKeywords?.length) {
      addToast('Set preferences to generate a personalized digest.');
      return;
    }
    const todayKey = getTodayKey();
    let data = getDigest(todayKey);
    if (!data) {
      const minScore = preferences.minMatchScore ?? 40;
      const withScore = JOBS_DATA.map((j) => ({ job: j, score: computeMatchScore(j, preferences) }))
        .filter((x) => x.score >= minScore)
        .sort((a, b) => b.score !== a.score ? b.score - a.score : (a.job.postedDaysAgo ?? 99) - (b.job.postedDaysAgo ?? 99));
      const top10 = withScore.slice(0, 10).map(({ job: j, score }) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        experience: j.experience,
        matchScore: score,
        applyUrl: j.applyUrl,
      }));
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const [y, m, d] = todayKey.split('-');
      data = {
        date: todayKey,
        dateLabel: `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`,
        jobs: top10,
      };
      setDigest(todayKey, data);
    }
    setDigestGenerated(data);
    setTab('digest');
  };

  return (
    <section className="route-content">
      <h1 className="heading-1">{tab === 'digest' ? 'Digest' : tab === 'saved' ? 'Saved' : 'All jobs'}</h1>
      <p className="subtext">
        {tab === 'digest'
          ? "Your daily summary, delivered at 9AM."
          : tab === 'saved'
            ? "Jobs you want to revisit later."
            : "Your matched jobs in one place."}
      </p>

      {tab !== 'digest' && (
        <>
          {(!preferences || !preferences.roleKeywords?.length) && (
            <div className="preferences-banner" style={{ display: 'block' }}>
              Set your preferences to activate intelligent matching.
            </div>
          )}
          <div className="filter-bar">
            <div className="form-group form-group--search">
              <label className="form-group__label" htmlFor="filter-keyword">Keyword</label>
              <input
                id="filter-keyword"
                className="input"
                placeholder="Title or company"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="filter-location">Location</label>
              <select id="filter-location" className="input select" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">All</option>
                {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="filter-mode">Mode</label>
              <select id="filter-mode" className="input select" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="">All</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="filter-experience">Experience</label>
              <select id="filter-experience" className="input select" value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option value="">All</option>
                <option value="Fresher">Fresher</option>
                <option value="0-1">0-1</option>
                <option value="1-3">1-3</option>
                <option value="3-5">3-5</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="filter-source">Source</label>
              <select id="filter-source" className="input select" value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="">All</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Naukri">Naukri</option>
                <option value="Indeed">Indeed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="filter-sort">Sort</label>
              <select id="filter-sort" className="input select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="match">Match Score</option>
                <option value="salary">Salary</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="filter-status">Status</label>
              <select id="filter-status" className="input select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                {VALID_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-bar__actions">
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={() => {
                  setKeyword(''); setLocation(''); setMode(''); setExperience(''); setSource(''); setSort('latest'); setStatusFilter(''); setOnlyAboveThreshold(false);
                }}
              >
                Clear filters
              </button>
            </div>
          </div>
          <div className="dashboard-toggle">
            <input
              type="checkbox"
              id="filter-only-above-threshold"
              checked={onlyAboveThreshold}
              onChange={(e) => setOnlyAboveThreshold(e.target.checked)}
            />
            <label htmlFor="filter-only-above-threshold">Show only jobs above my threshold</label>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <button type="button" className="btn btn--secondary btn--small" onClick={() => setTab('all')}>All</button>
            <button type="button" className="btn btn--secondary btn--small" onClick={() => setTab('saved')}>Saved</button>
            <button type="button" className="btn btn--primary btn--small" onClick={handleGenerateDigest}>Generate Today&apos;s Digest</button>
          </div>
        </>
      )}

      {tab === 'digest' && digestGenerated && (
        <div className="digest-card">
          <div className="digest-card__header">
            <h2 className="digest-card__title">Top 10 Jobs For You — 9AM Digest</h2>
            <p className="digest-card__date">{digestGenerated.dateLabel}</p>
          </div>
          {(digestGenerated.jobs || []).length === 0 ? (
            <p className="empty-state__body">No matching roles today. Check again tomorrow.</p>
          ) : (
            (digestGenerated.jobs || []).map((item) => (
              <div key={item.id} className="digest-job">
                <p className="digest-job__title">{item.title} — {item.company}</p>
                <p className="digest-job__meta">{item.location} · {item.experience} · {item.matchScore}% match</p>
                <button type="button" className="btn btn--primary btn--small" onClick={() => item.applyUrl && window.open(item.applyUrl, '_blank')}>Apply</button>
              </div>
            ))
          )}
          <p className="digest-card__footer">This digest was generated based on your preferences.</p>
          <div className="digest-actions">
            <button type="button" className="btn btn--secondary btn--small" onClick={() => setTab('all')}>Back to All Jobs</button>
          </div>
        </div>
      )}

      {tab === 'digest' && !digestGenerated && (
        <>
          <p className="digest-simulation-note">Demo Mode: Daily 9AM trigger simulated manually.</p>
          <button type="button" className="btn btn--primary" onClick={handleGenerateDigest}>Generate Today&apos;s 9AM Digest (Simulated)</button>
          <button type="button" className="btn btn--secondary" onClick={() => setTab('all')}>Back to All Jobs</button>
        </>
      )}

      {(tab === 'all' || tab === 'saved') && (
        <>
          {filteredAndSorted.length === 0 ? (
            <div className="no-results">
              {tab === 'saved' ? 'No saved jobs yet.' : 'No jobs match your search.'}
            </div>
          ) : (
            <div className="job-cards-grid">
              {filteredAndSorted.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  matchScore={job._matchScore ?? 0}
                  status={getApplicationStatus(job.id)}
                  isSaved={isJobSaved(job.id)}
                  onView={setModalJob}
                  onSave={handleSave}
                  onApply={handleApply}
                  onStatusChange={handleStatusChange}
                  onAnalyzeJd={(job) => navigate('/analyze', { state: { jdText: job.description, company: job.company, role: job.title } })}
                  showMatchScore={tab === 'all'}
                />
              ))}
            </div>
          )}
        </>
      )}

      {modalJob && (
        <JobModal
          job={modalJob}
          onClose={() => setModalJob(null)}
          onApply={handleApply}
        />
      )}
    </section>
  );
}
