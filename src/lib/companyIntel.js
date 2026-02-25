const ENTERPRISE_NAMES = [
  'amazon', 'google', 'microsoft', 'meta', 'apple', 'infosys', 'tcs', 'wipro',
  'accenture', 'capgemini', 'cognizant', 'hcl', 'tech mahindra', 'oracle',
  'ibm', 'salesforce', 'adobe', 'sap', 'dell', 'cisco', 'intel', 'vmware',
  'goldman sachs', 'morgan stanley', 'jp morgan', 'barclays', 'ubs',
];

const INDUSTRY_KEYWORDS = [
  { keywords: ['fintech', 'banking', 'payment', 'finance', 'trading'], industry: 'Financial Services' },
  { keywords: ['healthcare', 'medical', 'pharma', 'clinical'], industry: 'Healthcare' },
  { keywords: ['ecommerce', 'retail', 'marketplace'], industry: 'E‑commerce & Retail' },
  { keywords: ['edtech', 'education', 'learning'], industry: 'Education Technology' },
  { keywords: ['saas', 'cloud', 'enterprise software'], industry: 'Software & SaaS' },
  { keywords: ['product', 'consumer', 'mobile app'], industry: 'Product & Consumer Tech' },
];

function normalizeCompany(name) {
  return (name || '').toLowerCase().trim();
}

export function getCompanySize(companyName) {
  const n = normalizeCompany(companyName);
  if (!n) return { sizeCategory: 'startup', sizeLabel: 'Startup (<200)', maxEmployees: 200 };
  const isEnterprise = ENTERPRISE_NAMES.some((known) => n.includes(known) || known.includes(n));
  if (isEnterprise) return { sizeCategory: 'enterprise', sizeLabel: 'Enterprise (2000+)', maxEmployees: 5000 };
  return { sizeCategory: 'startup', sizeLabel: 'Startup (<200)', maxEmployees: 200 };
}

export function getIndustry(companyName, jdText) {
  const text = `${(companyName || '')} ${(jdText || '')}`.toLowerCase();
  for (const { keywords, industry } of INDUSTRY_KEYWORDS) {
    if (keywords.some((kw) => text.includes(kw))) return industry;
  }
  return 'Technology Services';
}

export function getTypicalHiringFocus(sizeCategory) {
  if (sizeCategory === 'enterprise') {
    return 'Structured DSA and core CS fundamentals; standardized online tests and technical rounds; emphasis on scalability and system design.';
  }
  if (sizeCategory === 'mid') {
    return 'Balance of problem-solving and stack depth; practical coding and system discussion; culture fit and ownership.';
  }
  return 'Practical problem-solving and stack depth; hands-on coding and system discussion; culture fit and adaptability.';
}

export function getCompanyIntel(companyName, jdText) {
  const name = (companyName || '').trim();
  if (!name) return null;
  const { sizeCategory, sizeLabel } = getCompanySize(name);
  return {
    companyName: name,
    industry: getIndustry(name, jdText),
    sizeCategory,
    sizeLabel,
    typicalHiringFocus: getTypicalHiringFocus(sizeCategory),
  };
}
