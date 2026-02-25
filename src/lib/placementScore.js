/**
 * Central Placement Score (0–100):
 * Job match quality 30% + JD alignment 25% + Resume ATS 25% + Application progress 10% + Practice 10%.
 */

export function computePlacementScore({
  topJobScores = [],
  jdScore = null,
  atsScore = 0,
  applicationProgress = 0,
  practiceScore = 0,
}) {
  const jobPart = topJobScores.length > 0
    ? (topJobScores.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, topJobScores.length)) * 0.3
    : 0;
  const jdPart = (jdScore != null ? jdScore : 0) * 0.25;
  const atsPart = (atsScore || 0) * 0.25;
  const appPart = Math.min(100, applicationProgress) * 0.1;
  const practicePart = Math.min(100, practiceScore) * 0.1;
  return Math.min(100, Math.round(jobPart + jdPart + atsPart + appPart + practicePart));
}

/**
 * Application progress: % of saved jobs that are Applied or beyond (or Offer).
 * Returns 0-100.
 */
export function applicationProgressPercent(savedIds, getStage) {
  if (!savedIds?.length) return 0;
  const advanced = ['Applied', 'Interview Scheduled', 'Interview Completed', 'Offer'];
  let count = 0;
  savedIds.forEach((id) => {
    if (advanced.includes(getStage(id))) count++;
  });
  return Math.round((count / savedIds.length) * 100);
}
