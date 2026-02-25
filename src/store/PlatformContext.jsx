import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEY, defaultState } from './constants';
import { runMigration } from './migration';

const PlatformContext = createContext(null);

function loadState() {
  const migrated = runMigration();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
  } catch (e) {
    console.warn('placementSuite: could not persist migrated state', e);
  }
  return migrated;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('placementSuite: could not save state', e);
  }
}

export function PlatformProvider({ children }) {
  const [state, setState] = useState(() => loadState());

  useEffect(() => {
    setState(loadState());
  }, []);

  const persist = useCallback((next) => {
    setState((prev) => {
      const nextState = typeof next === 'function' ? next(prev) : next;
      const withActivity = { ...nextState, lastActivity: new Date().toISOString() };
      saveState(withActivity);
      return withActivity;
    });
  }, []);

  const setPreferences = useCallback((prefs) => {
    persist((prev) => ({ ...prev, preferences: { ...prev.preferences, ...prefs } }));
  }, [persist]);

  const setResumeData = useCallback((data) => {
    persist((prev) => ({
      ...prev,
      resumeData: typeof data === 'function' ? data(prev.resumeData) : { ...prev.resumeData, ...data },
    }));
  }, [persist]);

  const getSavedIds = useCallback(() => state.jobMatches?.savedIds ?? [], [state.jobMatches]);
  const addSavedJob = useCallback((jobId) => {
    persist((prev) => {
      const ids = prev.jobMatches?.savedIds ?? [];
      if (ids.includes(jobId)) return prev;
      return { ...prev, jobMatches: { ...prev.jobMatches, savedIds: [...ids, jobId] } };
    });
  }, [persist]);
  const removeSavedJob = useCallback((jobId) => {
    persist((prev) => {
      const ids = (prev.jobMatches?.savedIds ?? []).filter((id) => id !== jobId);
      return { ...prev, jobMatches: { ...prev.jobMatches, savedIds: ids } };
    });
  }, [persist]);
  const isJobSaved = useCallback((jobId) => (state.jobMatches?.savedIds ?? []).includes(jobId), [state.jobMatches]);

  const getApplicationStatus = useCallback((jobId) => {
    const app = state.applications?.[jobId];
    const status = app?.status;
    if (['Not Applied', 'Applied', 'Rejected', 'Selected'].includes(status)) return status;
    return 'Not Applied';
  }, [state.applications]);
  const setApplicationStatus = useCallback((jobId, status) => {
    if (!['Not Applied', 'Applied', 'Rejected', 'Selected'].includes(status)) return;
    persist((prev) => ({
      ...prev,
      applications: {
        ...prev.applications,
        [jobId]: { ...prev.applications[jobId], status, updatedAt: new Date().toISOString() },
      },
    }));
  }, [persist]);

  const PIPELINE_STAGES = ['Saved', 'Applied', 'Interview Scheduled', 'Interview Completed', 'Offer', 'Rejected'];
  const getApplicationStage = useCallback((jobId) => {
    const app = state.applications?.[jobId];
    if (app?.stage && PIPELINE_STAGES.includes(app.stage)) return app.stage;
    const s = app?.status;
    if (s === 'Selected') return 'Offer';
    if (s === 'Applied') return 'Applied';
    if (s === 'Rejected') return 'Rejected';
    return 'Saved';
  }, [state.applications]);

  const setApplicationStage = useCallback((jobId, stage) => {
    if (!PIPELINE_STAGES.includes(stage)) return;
    persist((prev) => ({
      ...prev,
      applications: {
        ...prev.applications,
        [jobId]: { ...prev.applications[jobId], stage, updatedAt: new Date().toISOString() },
      },
    }));
  }, [persist]);

  const getJDAnalyses = useCallback(() => state.jdAnalyses ?? [], [state.jdAnalyses]);
  const saveJDAnalysis = useCallback((entry) => {
    persist((prev) => ({
      ...prev,
      jdAnalyses: [entry, ...(prev.jdAnalyses ?? [])],
    }));
  }, [persist]);
  const updateJDAnalysis = useCallback((id, updates) => {
    persist((prev) => {
      const list = prev.jdAnalyses ?? [];
      const idx = list.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const next = [...list];
      next[idx] = { ...next[idx], ...updates };
      return { ...prev, jdAnalyses: next };
    });
  }, [persist]);

  const setReadinessScore = useCallback((score) => {
    persist((prev) => ({ ...prev, readinessScore: score }));
  }, [persist]);
  const setLastActivity = useCallback(() => {
    persist((prev) => ({ ...prev, lastActivity: new Date().toISOString() }));
  }, [persist]);

  const value = useMemo(
    () => ({
      state,
      preferences: state.preferences,
      resumeData: state.resumeData,
      jobMatches: state.jobMatches,
      applications: state.applications,
      jdAnalyses: state.jdAnalyses,
      readinessScore: state.readinessScore,
      lastActivity: state.lastActivity,
      setPreferences,
      setResumeData,
      getSavedIds,
      addSavedJob,
      removeSavedJob,
      isJobSaved,
      getApplicationStatus,
      setApplicationStatus,
      getApplicationStage,
      setApplicationStage,
      PIPELINE_STAGES,
      getJDAnalyses,
      saveJDAnalysis,
      updateJDAnalysis,
      setReadinessScore,
      setLastActivity,
    }),
    [
      state,
      setPreferences,
      setResumeData,
      getSavedIds,
      addSavedJob,
      removeSavedJob,
      isJobSaved,
      getApplicationStatus,
      setApplicationStatus,
      getApplicationStage,
      setApplicationStage,
      getJDAnalyses,
      saveJDAnalysis,
      updateJDAnalysis,
      setReadinessScore,
      setLastActivity,
    ]
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider');
  return ctx;
}
