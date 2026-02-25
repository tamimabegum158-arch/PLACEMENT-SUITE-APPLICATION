/**
 * Placement Suite — single localStorage key and default state shape.
 */

export const STORAGE_KEY = 'placementSuiteState';

export const defaultPreferences = () => ({
  roleKeywords: [],
  preferredLocations: [],
  preferredMode: [],
  experienceLevel: '',
  skills: [],
  minMatchScore: 40,
});

export const defaultResumeData = () => ({
  personal: { name: '', email: '', phone: '', location: '' },
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: { technical: [], soft: [], tools: [] },
  links: { github: '', linkedin: '' },
  template: 'classic',
  colorTheme: 'hsl(168, 60%, 40%)',
});

export const defaultState = () => ({
  preferences: defaultPreferences(),
  resumeData: defaultResumeData(),
  jobMatches: { savedIds: [] },
  applications: {},
  jdAnalyses: [],
  readinessScore: null,
  lastActivity: null,
});
