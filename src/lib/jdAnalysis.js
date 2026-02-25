import { SKILL_CATEGORIES, CATEGORY_ORDER } from './skillCategories'

const GENERAL_FRESHER_LABEL = 'General fresher stack'

/**
 * Extract skills from JD text (case-insensitive).
 * Returns { categories: { 'Core CS': ['DSA', 'OOP'], ... }, allSkills: [], isGeneralFresher }.
 */
export function extractSkills(jdText) {
  if (!jdText || typeof jdText !== 'string') {
    return { categories: {}, allSkills: [], isGeneralFresher: true }
  }
  const text = jdText.toLowerCase()
  const categories = {}
  const allSkills = new Set()

  for (const [categoryName, keywords] of Object.entries(SKILL_CATEGORIES)) {
    const found = keywords.filter((kw) => text.includes(kw.toLowerCase()))
    if (found.length > 0) {
      categories[categoryName] = found
      found.forEach((s) => allSkills.add(s))
    }
  }

  const isGeneralFresher = Object.keys(categories).length === 0
  if (isGeneralFresher) {
    categories['General'] = [GENERAL_FRESHER_LABEL]
    allSkills.add(GENERAL_FRESHER_LABEL)
  }

  return {
    categories,
    allSkills: Array.from(allSkills),
    isGeneralFresher,
  }
}

/**
 * Round-wise preparation checklist (5–8 items per round based on detected skills).
 */
export function generateChecklist(extracted) {
  const { categories, isGeneralFresher } = extracted
  const hasDSA = categories['Core CS']?.some((s) => s.toLowerCase().includes('dsa')) ?? false
  const hasWeb = (categories['Web']?.length ?? 0) > 0
  const hasData = (categories['Data']?.length ?? 0) > 0
  const hasCloud = (categories['Cloud/DevOps']?.length ?? 0) > 0
  const hasTesting = (categories['Testing']?.length ?? 0) > 0
  const langs = categories['Languages'] ?? []

  const round1 = [
    'Revise quantitative aptitude (percentages, ratios, time-speed)',
    'Practice logical reasoning and puzzles',
    'Brush up basics: arrays, strings, loops',
    'Review time complexity (Big O)',
    'Prepare short self-introduction (1 min)',
    'List 2–3 strengths and weaknesses',
  ].slice(0, 6)

  const round2 = [
    'Revise arrays, strings, hash maps, two pointers',
    'Practice 5–10 medium DSA problems',
    'Review OOP concepts (encapsulation, inheritance, polymorphism)',
    hasDSA && 'Revise trees/graphs if applicable',
    'Practice explaining approach before coding',
    'Time yourself on 2 problems (30 min each)',
    'Revise OS: processes, threads, scheduling',
    'Revise DBMS: normalization, indexes, transactions',
  ].filter(Boolean).slice(0, 8)

  const round3 = [
    'Prepare 2 projects with clear problem–solution–impact',
    'Align project tech stack with JD (mention same tools)',
    'Prepare STAR stories for teamwork and deadlines',
    hasWeb && 'Prepare frontend deep-dive (state, hooks, performance)',
    hasData && 'Prepare DB design and query optimization examples',
    hasCloud && 'Prepare deployment/CI or cloud concepts you used',
    hasTesting && 'Prepare testing approach and tools you used',
    'Practice “Tell me about yourself” with project highlights',
  ].filter(Boolean).slice(0, 8)

  const round4 = [
    'Prepare “Why this company?” and “Why this role?”',
    'Prepare 3–5 thoughtful questions for the interviewer',
    'Practice salary expectations (research range)',
    'Prepare situation-based: conflict, failure, learning',
    'Dress appropriately and test setup (camera, mic)',
    'Review company values and recent news',
  ].slice(0, 6)

  return [
    { round: 'Round 1: Aptitude / Basics', items: round1 },
    { round: 'Round 2: DSA + Core CS', items: round2 },
    { round: 'Round 3: Tech interview (projects + stack)', items: round3 },
    { round: 'Round 4: Managerial / HR', items: round4 },
  ]
}

/**
 * 7-day plan adapted to detected skills.
 */
export function generatePlan(extracted) {
  const { categories, isGeneralFresher } = extracted
  const hasReact = categories['Web']?.some((s) => /react/i.test(s)) ?? false
  const hasDSA = (categories['Core CS']?.length ?? 0) > 0
  const hasData = (categories['Data']?.length ?? 0) > 0

  const day1_2 = [
    'Revise core CS: OOP, DBMS, OS, Networks (from JD)',
    'Brush up basics: arrays, strings, hash maps',
    'List all skills from JD and rate yourself 1–5',
  ]
  const day3_4 = [
    'DSA: 5–8 problems (arrays, strings, two pointers)',
    'Practice on a timer; explain approach aloud',
    hasDSA && 'Revise trees/graphs if in JD',
  ].filter(Boolean)
  const day5 = [
    'Map 2 projects to JD requirements',
    'Prepare 2-min project pitch with tech stack',
    'Align resume bullets with JD keywords',
  ]
  const day6 = [
    'Mock: 2 behavioral + 2 technical questions',
    hasReact && 'Prepare: state management, hooks, performance',
    hasData && 'Prepare: indexing, queries, normalization',
    'Record yourself and review',
  ].filter(Boolean)
  const day7 = [
    'Revision: weak areas from self-rating',
    'Re-read JD and company page',
    'Prepare questions for interviewer',
  ]

  return [
    { day: 'Day 1–2', title: 'Basics + core CS', items: day1_2 },
    { day: 'Day 3–4', title: 'DSA + coding practice', items: day3_4 },
    { day: 'Day 5', title: 'Project + resume alignment', items: day5 },
    { day: 'Day 6', title: 'Mock interview questions', items: day6 },
    { day: 'Day 7', title: 'Revision + weak areas', items: day7 },
  ]
}

/**
 * 10 likely interview questions based on detected skills.
 */
export function generateQuestions(extracted) {
  const { categories } = extracted
  const questions = []

  if (categories['Core CS']?.some((s) => /dsa|data structure|algorithm/i.test(s))) {
    questions.push('How would you optimize search in sorted data? When to use binary search?')
    questions.push('Explain time complexity of your approach. Can you improve it?')
  }
  if (categories['Core CS']?.some((s) => /oop/i.test(s))) {
    questions.push('Explain OOP principles. Difference between abstraction and encapsulation?')
  }
  if (categories['Data']?.some((s) => /sql/i.test(s))) {
    questions.push('Explain indexing and when it helps. What are clustered vs non-clustered indexes?')
  }
  if (categories['Data']?.length) {
    questions.push('How would you design a schema for [X]? Discuss normalization.')
  }
  if (categories['Web']?.some((s) => /react/i.test(s))) {
    questions.push('Explain state management options in React (useState, context, Redux).')
    questions.push('What are React hooks? When would you use useMemo or useCallback?')
  }
  if (categories['Web']?.some((s) => /node|express/i.test(s))) {
    questions.push('Explain REST vs GraphQL. How would you design an API for [X]?')
  }
  if (categories['Languages']?.some((s) => /python/i.test(s))) {
    questions.push('Explain Python data structures. List vs tuple, dict, sets. Time complexity?')
  }
  if (categories['Languages']?.some((s) => /java/i.test(s))) {
    questions.push('Explain JVM, garbage collection, or equals vs == in Java.')
  }
  if (categories['Cloud/DevOps']?.length) {
    questions.push('Describe a deployment pipeline. How would you ensure zero-downtime deployment?')
  }
  if (categories['Testing']?.length) {
    questions.push('How do you approach testing? Unit vs integration. Tools you have used.')
  }

  const generic = [
    'Tell me about a challenging bug you fixed and how you approached it.',
    'How do you stay updated with new technologies?',
    'Describe a project where you had to learn something new quickly.',
    'How do you handle disagreements in a team?',
    'Where do you see yourself in 2–3 years?',
    'Why do you want to join this company?',
    'Describe a time you met a tight deadline.',
    'What is your greatest strength and weakness?',
  ]
  let gi = 0
  while (questions.length < 10 && gi < generic.length) {
    const q = generic[gi]
    if (!questions.includes(q)) questions.push(q)
    gi++
  }
  while (questions.length < 10) {
    questions.push(generic[questions.length % generic.length])
  }
  return questions.slice(0, 10)
}

/**
 * Readiness score 0–100:
 * Start 35, +5 per category (max 30), +10 company, +10 role, +10 JD length > 800. Cap 100.
 */
export function computeReadinessScore(extracted, company, role, jdText) {
  let score = 35
  const numCategories = Object.keys(extracted.categories).filter(
    (k) => k !== 'General' && extracted.categories[k]?.[0] !== 'General fresher stack'
  ).length
  score += Math.min(6, numCategories) * 5 // max 6 categories * 5 = 30
  if (company?.trim()) score += 10
  if (role?.trim()) score += 10
  if (jdText && jdText.length > 800) score += 10
  return Math.min(100, Math.max(0, score))
}

/**
 * Run full analysis and return object ready to save.
 */
export function runAnalysis(company, role, jdText) {
  const extracted = extractSkills(jdText)
  const checklist = generateChecklist(extracted)
  const plan = generatePlan(extracted)
  const questions = generateQuestions(extracted)
  const readinessScore = computeReadinessScore(extracted, company, role, jdText)
  return {
    extractedSkills: extracted,
    checklist,
    plan,
    questions,
    readinessScore,
  }
}
