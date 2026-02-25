export function generateRoundMapping(extractedSkills, companySize) {
  const size = companySize || 'startup';
  const categories = extractedSkills?.categories ?? {};
  const hasDSA = categories['Core CS']?.some((s) => /dsa|algorithm|data structure/i.test(s)) ?? false;
  const hasReactNode = categories['Web']?.some((s) => /react|node|express/i.test(s)) ?? false;

  if (size === 'enterprise' && hasDSA) {
    return [
      { roundNumber: 1, title: 'Online Test (DSA + Aptitude)', description: 'Coding and aptitude on a platform; time-bound.', whyItMatters: 'Filters for baseline problem-solving and logical ability before face-to-face rounds.' },
      { roundNumber: 2, title: 'Technical (DSA + Core CS)', description: 'Data structures, algorithms, and core CS concepts.', whyItMatters: 'Validates fundamentals that scale to system design and code quality.' },
      { roundNumber: 3, title: 'Tech + Projects', description: 'Deep dive into projects, design, and trade-offs.', whyItMatters: 'Shows how you apply knowledge in real systems and handle ambiguity.' },
      { roundNumber: 4, title: 'HR', description: 'Behavioural fit, expectations, and culture.', whyItMatters: 'Ensures alignment with company values and long-term fit.' },
    ];
  }
  if (size === 'enterprise') {
    return [
      { roundNumber: 1, title: 'Aptitude / Screening', description: 'Quantitative and logical reasoning.', whyItMatters: 'Initial filter for analytical readiness.' },
      { roundNumber: 2, title: 'Technical', description: 'Core CS and role-specific topics.', whyItMatters: 'Assesses technical depth and clarity of thought.' },
      { roundNumber: 3, title: 'Projects & Discussion', description: 'Projects, design, and problem-solving.', whyItMatters: 'Evaluates practical application and communication.' },
      { roundNumber: 4, title: 'HR', description: 'Fit and expectations.', whyItMatters: 'Confirms mutual fit and expectations.' },
    ];
  }
  if ((size === 'startup' || size === 'mid') && hasReactNode) {
    return [
      { roundNumber: 1, title: 'Practical coding', description: 'Hands-on coding or take-home; stack-aligned.', whyItMatters: 'Startups need to see you ship; this round shows execution.' },
      { roundNumber: 2, title: 'System discussion', description: 'Architecture, trade-offs, and past work.', whyItMatters: 'Reveals how you think about systems and priorities.' },
      { roundNumber: 3, title: 'Culture fit', description: 'Values, teamwork, and motivation.', whyItMatters: 'Small teams depend on alignment and communication.' },
    ];
  }
  if (size === 'startup' || size === 'mid') {
    return [
      { roundNumber: 1, title: 'Screening / Coding', description: 'Short coding or problem-solving.', whyItMatters: 'Quick check of problem-solving and coding clarity.' },
      { roundNumber: 2, title: 'Technical deep-dive', description: 'Core skills and projects.', whyItMatters: 'Validates depth in areas that matter for the role.' },
      { roundNumber: 3, title: 'Culture fit', description: 'Motivation and teamwork.', whyItMatters: 'Ensures you and the team can work well together.' },
    ];
  }
  return [
    { roundNumber: 1, title: 'Technical screening', description: 'Coding or conceptual.', whyItMatters: 'Baseline technical assessment.' },
    { roundNumber: 2, title: 'Technical + Projects', description: 'Skills and experience.', whyItMatters: 'Depth and relevance of experience.' },
    { roundNumber: 3, title: 'HR / Fit', description: 'Expectations and values.', whyItMatters: 'Mutual fit and clarity.' },
  ];
}
