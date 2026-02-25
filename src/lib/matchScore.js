/**
 * Match score (cap 100): +25 title keyword, +15 desc keyword, +15 location,
 * +10 mode, +10 experience, +15 skills overlap, +5 postedDaysAgo<=2, +5 source LinkedIn.
 */
export function computeMatchScore(job, prefs) {
  if (!prefs) return 0;
  let score = 0;
  const title = (job.title || '').toLowerCase();
  const desc = (job.description || '').toLowerCase();
  const roleKeywords = prefs.roleKeywords || [];
  for (let i = 0; i < roleKeywords.length; i++) {
    const kw = (roleKeywords[i] || '').trim().toLowerCase();
    if (!kw) continue;
    if (title.includes(kw)) {
      score += 25;
      break;
    }
  }
  for (let j = 0; j < roleKeywords.length; j++) {
    const kw = (roleKeywords[j] || '').trim().toLowerCase();
    if (!kw) continue;
    if (desc.includes(kw)) {
      score += 15;
      break;
    }
  }
  const locs = prefs.preferredLocations || [];
  if (locs.length && job.location && locs.includes(job.location)) score += 15;
  const modes = prefs.preferredMode || [];
  if (modes.length && job.mode && modes.includes(job.mode)) score += 10;
  if (prefs.experienceLevel && job.experience === prefs.experienceLevel) score += 10;
  const userSkills = prefs.skills || [];
  const jobSkills = job.skills || [];
  let skillMatch = false;
  for (let s = 0; s < userSkills.length && !skillMatch; s++) {
    const us = (userSkills[s] || '').trim().toLowerCase();
    if (!us) continue;
    for (let js = 0; js < jobSkills.length; js++) {
      const jsk = (jobSkills[js] || '').toLowerCase();
      if (jsk.includes(us) || us.includes(jsk)) {
        skillMatch = true;
        break;
      }
    }
  }
  if (skillMatch) score += 15;
  if (job.postedDaysAgo != null && job.postedDaysAgo <= 2) score += 5;
  if (job.source === 'LinkedIn') score += 5;
  return Math.min(100, score);
}

export function extractSalaryNumber(salaryRange) {
  if (!salaryRange || typeof salaryRange !== 'string') return 0;
  const s = salaryRange.trim();
  const match = s.match(/(\d+)\s*[–\-]\s*(\d+)/);
  if (match) {
    const a = parseInt(match[1], 10);
    const b = parseInt(match[2], 10);
    return (a + b) / 2;
  }
  const single = s.match(/(\d+)/);
  return single ? parseInt(single[1], 10) : 0;
}

export function matchScoreBadgeClass(score) {
  if (score >= 80) return 'badge badge--match-high';
  if (score >= 60) return 'badge badge--match-mid';
  if (score >= 40) return 'badge badge--match-neutral';
  return 'badge badge--match-low';
}

export function postedLabel(days) {
  if (days == null || typeof days !== 'number') return 'Recently';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}
