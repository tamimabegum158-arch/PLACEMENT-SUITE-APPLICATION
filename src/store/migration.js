/**
 * One-time migration from legacy localStorage keys into placementSuiteState.
 * Run once on app init.
 */

import { STORAGE_KEY, defaultState, defaultPreferences, defaultResumeData } from './constants';

const LEGACY_KEYS = {
  preferences: 'jobTrackerPreferences',
  saved: 'job-notification-tracker-saved',
  status: 'jobTrackerStatus',
  statusLog: 'jobTrackerStatusLog',
  digestPrefix: 'jobTrackerDigest_',
  history: 'placement_readiness_history',
  resumeData: 'resumeBuilderData',
  resumeTemplate: 'resumeBuilderTemplate',
  resumeColor: 'resumeBuilderColorTheme',
};

function getStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function migratePreferences(existing) {
  try {
    const raw = localStorage.getItem(LEGACY_KEYS.preferences);
    if (!raw) return existing.preferences;
    const p = JSON.parse(raw);
    if (!p || typeof p !== 'object') return existing.preferences;
    return {
      roleKeywords: Array.isArray(p.roleKeywords) ? p.roleKeywords : (p.roleKeywords ? String(p.roleKeywords).split(',').map((s) => s.trim()).filter(Boolean) : []),
      preferredLocations: Array.isArray(p.preferredLocations) ? p.preferredLocations : [],
      preferredMode: Array.isArray(p.preferredMode) ? p.preferredMode : [],
      experienceLevel: typeof p.experienceLevel === 'string' ? p.experienceLevel : '',
      skills: Array.isArray(p.skills) ? p.skills : (p.skills ? String(p.skills).split(',').map((s) => s.trim()).filter(Boolean) : []),
      minMatchScore: typeof p.minMatchScore === 'number' ? Math.max(0, Math.min(100, p.minMatchScore)) : 40,
    };
  } catch {
    return existing.preferences;
  }
}

function migrateSavedIds() {
  try {
    const raw = localStorage.getItem(LEGACY_KEYS.saved);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function migrateApplications(existing) {
  try {
    const raw = localStorage.getItem(LEGACY_KEYS.status);
    if (!raw) return existing;
    const map = JSON.parse(raw);
    if (!map || typeof map !== 'object') return existing;
    const applications = {};
    for (const [jobId, status] of Object.entries(map)) {
      if (status && typeof status === 'string') {
        applications[jobId] = { status, updatedAt: new Date().toISOString() };
      }
    }
    return applications;
  } catch {
    return existing;
  }
}

function migrateJDAnalyses() {
  try {
    const raw = localStorage.getItem(LEGACY_KEYS.history);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function migrateResumeData(existing) {
  try {
    const raw = localStorage.getItem(LEGACY_KEYS.resumeData);
    if (!raw) return existing;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return existing;
    const def = defaultResumeData();
    const personal = parsed.personal && typeof parsed.personal === 'object'
      ? { ...def.personal, ...parsed.personal }
      : def.personal;
    const links = parsed.links && typeof parsed.links === 'object'
      ? { ...def.links, ...parsed.links }
      : def.links;
    const skills = parsed.skills && typeof parsed.skills === 'object' && !Array.isArray(parsed.skills)
      ? {
          technical: Array.isArray(parsed.skills.technical) ? parsed.skills.technical : def.skills.technical,
          soft: Array.isArray(parsed.skills.soft) ? parsed.skills.soft : def.skills.soft,
          tools: Array.isArray(parsed.skills.tools) ? parsed.skills.tools : def.skills.tools,
        }
      : def.skills;
    const template = localStorage.getItem(LEGACY_KEYS.resumeTemplate) || parsed.template || def.template;
    const colorTheme = localStorage.getItem(LEGACY_KEYS.resumeColor) || parsed.colorTheme || def.colorTheme;
    return {
      personal: personal ?? def.personal,
      summary: typeof parsed.summary === 'string' ? parsed.summary : def.summary,
      education: Array.isArray(parsed.education) ? parsed.education : def.education,
      experience: Array.isArray(parsed.experience) ? parsed.experience : def.experience,
      projects: Array.isArray(parsed.projects) ? parsed.projects : def.projects,
      skills,
      links: links ?? def.links,
      template: typeof template === 'string' ? template : def.template,
      colorTheme: typeof colorTheme === 'string' ? colorTheme : def.colorTheme,
    };
  } catch {
    return existing;
  }
}

/**
 * Returns the full state: either existing placementSuiteState or a new one
 * filled from legacy keys. Does NOT write to localStorage (caller persists).
 */
export function runMigration() {
  const existing = getStoredState();
  const base = existing ? { ...defaultState(), ...existing } : defaultState();

  const savedIds = (existing?.jobMatches?.savedIds != null)
    ? existing.jobMatches.savedIds
    : migrateSavedIds();
  const preferences = (existing?.preferences != null)
    ? base.preferences
    : migratePreferences(base);
  const applications = (existing?.applications != null && Object.keys(existing.applications).length > 0)
    ? base.applications
    : migrateApplications(base.applications || {});
  const jdAnalyses = (existing?.jdAnalyses != null && existing.jdAnalyses.length > 0)
    ? base.jdAnalyses
    : migrateJDAnalyses();
  const resumeData = (existing?.resumeData != null)
    ? base.resumeData
    : migrateResumeData(defaultResumeData());

  return {
    ...base,
    preferences,
    jobMatches: { savedIds: Array.isArray(savedIds) ? savedIds : [] },
    applications: applications || {},
    jdAnalyses: Array.isArray(jdAnalyses) ? jdAnalyses : [],
    resumeData,
    readinessScore: base.readinessScore ?? null,
    lastActivity: base.lastActivity ?? null,
  };
}
