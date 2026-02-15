/**
 * Company Intel + Round Mapping. Heuristic only, no external APIs or scraping.
 */

import type { ExtractedSkills } from './jdAnalysis';

export type CompanySizeCategory = 'Startup' | 'Mid-size' | 'Enterprise';

const ENTERPRISE_NAMES = [
  'amazon', 'microsoft', 'google', 'meta', 'apple', 'infosys', 'tcs', 'tata consultancy',
  'wipro', 'hcl', 'accenture', 'capgemini', 'ibm', 'oracle', 'sap', 'cognizant',
  'dell', 'cisco', 'salesforce', 'adobe', 'netflix', 'uber', 'paypal', 'intel',
  'nvidia', 'qualcomm', 'vmware', 'servicenow', 'atlassian', 'twilio', 'linkedin',
  'goldman sachs', 'morgan stanley', 'jpmorgan', 'jpmorgan chase', 'mckinsey', 'bcg', 'bain',
];

const MID_SIZE_HINTS = ['ltd', 'limited', 'pvt', 'private', 'corp', 'solutions', 'technologies'];

export type CompanyIntel = {
  companyName: string;
  industry: string;
  sizeCategory: CompanySizeCategory;
  typicalHiringFocus: string;
};

export function inferIndustry(companyName: string, _jdText?: string): string {
  const lower = companyName.trim().toLowerCase();
  if (lower.includes('bank') || lower.includes('finance') || lower.includes('capital')) return 'Financial Services';
  if (lower.includes('health') || lower.includes('pharma') || lower.includes('medical')) return 'Healthcare';
  if (lower.includes('retail') || lower.includes('ecommerce') || lower.includes('e-commerce')) return 'Retail & E-commerce';
  if (lower.includes('edu') || lower.includes('learning')) return 'Education & EdTech';
  return 'Technology Services';
}

export function getSizeCategory(companyName: string): CompanySizeCategory {
  const lower = companyName.trim().toLowerCase();
  if (!lower) return 'Startup';
  const isEnterprise = ENTERPRISE_NAMES.some(n => lower.includes(n));
  if (isEnterprise) return 'Enterprise';
  const isMidHint = MID_SIZE_HINTS.some(h => lower.includes(h)) && lower.length > 8;
  if (isMidHint) return 'Mid-size';
  return 'Startup';
}

export function getTypicalHiringFocus(size: CompanySizeCategory): string {
  if (size === 'Enterprise') {
    return 'Structured DSA and core CS fundamentals; emphasis on algorithms, system design basics, and consistent process.';
  }
  if (size === 'Mid-size') {
    return 'Balance of problem-solving, stack depth, and ownership; often practical coding and system discussion.';
  }
  return 'Practical problem-solving and stack depth; hands-on coding and how you build and ship features.';
}

export function buildCompanyIntel(companyName: string, jdText?: string): CompanyIntel {
  const name = companyName.trim() || 'Company';
  const size = getSizeCategory(companyName);
  return {
    companyName: name,
    industry: inferIndustry(companyName, jdText),
    sizeCategory: size,
    typicalHiringFocus: getTypicalHiringFocus(size),
  };
}

export type RoundMappingItem = {
  round: number;
  title: string;
  description: string;
  whyItMatters: string;
};

export function buildRoundMapping(
  companyName: string,
  extractedSkills: ExtractedSkills
): RoundMappingItem[] {
  const size = getSizeCategory(companyName);
  const { byCategory } = extractedSkills;
  const hasDSA = (byCategory['Core CS']?.length ?? 0) > 0;
  const hasWeb = (byCategory['Web']?.length ?? 0) > 0;
  const hasData = (byCategory['Data']?.length ?? 0) > 0;

  if (size === 'Enterprise' && hasDSA) {
    return [
      {
        round: 1,
        title: 'Online Test (DSA + Aptitude)',
        description: 'Timed test on data structures, algorithms, and quantitative aptitude.',
        whyItMatters: 'Filters for baseline problem-solving and speed; often elimination round.',
      },
      {
        round: 2,
        title: 'Technical (DSA + Core CS)',
        description: 'Coding problems and core CS (OS, DBMS, networks) discussion.',
        whyItMatters: 'Validates depth in fundamentals and ability to code under discussion.',
      },
      {
        round: 3,
        title: 'Tech + Projects',
        description: 'Project deep-dive, design discussion, and system thinking.',
        whyItMatters: 'Shows how you apply knowledge and communicate trade-offs.',
      },
      {
        round: 4,
        title: 'HR',
        description: 'Behavioral fit, motivation, and team alignment.',
        whyItMatters: 'Ensures culture fit and long-term alignment with the role.',
      },
    ];
  }

  if (size === 'Enterprise') {
    return [
      {
        round: 1,
        title: 'Aptitude / Screening',
        description: 'Quantitative and logical reasoning, basic screening.',
        whyItMatters: 'Initial filter for analytical ability.',
      },
      {
        round: 2,
        title: 'Technical Interview',
        description: 'Core CS and role-specific technical discussion.',
        whyItMatters: 'Assesses fundamentals and domain readiness.',
      },
      {
        round: 3,
        title: 'Projects & HR',
        description: 'Project discussion and behavioral fit.',
        whyItMatters: 'Combined technical depth and culture fit.',
      },
    ];
  }

  if ((size === 'Startup' || size === 'Mid-size') && (hasWeb || hasData)) {
    return [
      {
        round: 1,
        title: 'Practical coding',
        description: 'Hands-on coding or take-home aligned with stack (e.g. React, Node, SQL).',
        whyItMatters: 'Proves you can ship; often the main technical signal.',
      },
      {
        round: 2,
        title: 'System discussion',
        description: 'How you’d build or improve a feature; trade-offs and design.',
        whyItMatters: 'Shows judgment and communication beyond code.',
      },
      {
        round: 3,
        title: 'Culture fit',
        description: 'Motivation, working style, and team fit.',
        whyItMatters: 'Startups weigh fit and ownership heavily.',
      },
    ];
  }

  if (size === 'Mid-size') {
    return [
      {
        round: 1,
        title: 'Technical screening',
        description: 'Coding or technical discussion based on role.',
        whyItMatters: 'Efficient first filter for technical bar.',
      },
      {
        round: 2,
        title: 'Deep-dive + Fit',
        description: 'Projects, problem-solving, and behavioral alignment.',
        whyItMatters: 'Balances depth and team fit in fewer rounds.',
      },
    ];
  }

  return [
    {
      round: 1,
      title: 'Technical + Fit',
      description: 'Coding or problem-solving and motivation.',
      whyItMatters: 'Startups often combine technical and fit in one or two rounds.',
    },
  ];
}
