/**
 * JobShield - Rule-Based Forensic Detection Engine
 * Deterministic, explainable checks for recruitment scam indicators.
 */

/**
 * Normalizes text for consistent analysis
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  return typeof text === 'string' ? text.trim() : '';
}

/**
 * Safely extracts an exact snippet matching a regex with surrounding context
 * @param {string} text
 * @param {RegExp} regex
 * @param {number} maxLen
 * @returns {string}
 */
function extractSnippet(text, regex, maxLen = 120) {
  const match = text.match(regex);
  if (!match) return '';
  const matchedStr = match[0].trim();
  if (matchedStr.length <= maxLen) return matchedStr;
  return matchedStr.slice(0, maxLen) + '...';
}

/**
 * Rule 1: Registration, training, security deposit, application, onboarding, or offer letter fees.
 * Supports international currency ($/£/€) and Indian context (₹, Rs, INR, UPI, GPay, PhonePe, Paytm).
 */
export function checkUpfrontFees(text) {
  const feeRegex =
    /(?:registration|training|security\s+deposit|laptop\s+deposit|equipment\s+deposit|application|onboarding|processing|verification|offer\s+letter|seat\s+reservation)(?:\s+[\w-]+){0,2}\s*(?:fee|charge|cost|amount|payment|deposit|money)|(?:pay|deposit|remit|transfer)\s+(?:a|an|\$|₹|rs\.?|inr|£|€|\b)\s*([\d,]+|fee)|refundable\s+(?:security\s+)?deposit|(?:via|through|on)\s*(?:upi|gpay|google\s*pay|phonepe|paytm|zelle|crypto)/i;

  const matched = feeRegex.test(text);
  const evidence_quote = matched ? extractSnippet(text, feeRegex) : '';

  return {
    flag: 'Upfront Payment or Security Deposit Demand',
    matched,
    evidence_quote,
    why_it_matters:
      'Legitimate corporate employers NEVER demand upfront registration fees, training charges, offer letter fees, or equipment deposits from applicants. Any upfront fee demand is a primary indicator of recruitment fraud.',
    severity: 'high',
  };
}

/**
 * Rule 2: WhatsApp or Telegram recruitment contact.
 * Distinguishes between high-severity exclusive redirection vs incidental applicant contact request.
 */
export function checkOffPlatformContact(text) {
  // Check for high-severity exclusive redirection (e.g. "Do NOT email... contact on Telegram", "@recruiter handle", t.me / wa.me links)
  const exclusiveRegex =
    /(?:do\s+not\s+email[^\n.]*(?:telegram|whatsapp))|(?:contact|message|reach)\s+(?:us\s+)?(?:exclusively|only|directly)\s+(?:on|via)\s+(?:telegram|whatsapp)|(?:telegram|t\.me)\s*(?::|at|on|via)?\s*(@?[\w_.-]+)|(?:t\.me|wa\.me)\/[\w_.-]+/i;

  const exclusiveMatch = text.match(exclusiveRegex);
  if (exclusiveMatch) {
    return {
      flag: 'Exclusive Off-Platform Messaging (Telegram / WhatsApp)',
      matched: true,
      evidence_quote: extractSnippet(text, exclusiveRegex),
      why_it_matters:
        'Directing candidates exclusively to unmonitored messaging apps like Telegram or WhatsApp bypasses corporate audit trails and prevents recruiter identity verification.',
      severity: 'high',
    };
  }

  // Check for medium/low severity: asking applicant to send their WhatsApp number or handle
  const contactRequestRegex =
    /(?:whatsapp\s+(?:number|contact|id)|(?:submit|share|send|provide)[^\n.]*whatsapp)/i;
  const requestMatch = text.match(contactRequestRegex);

  if (requestMatch) {
    return {
      flag: 'Requests WhatsApp / Messaging Contact Detail',
      matched: true,
      evidence_quote: extractSnippet(text, contactRequestRegex),
      why_it_matters:
        'Recruiter asks for off-platform messaging details. While sometimes used in informal recruitment, enterprise hiring typically relies on official email or applicant tracking portals.',
      severity: 'low',
    };
  }

  return {
    flag: 'Unverified Messaging Contact (Telegram / WhatsApp)',
    matched: false,
    evidence_quote: '',
    why_it_matters:
      'No exclusive messaging redirection or suspicious messaging requirements detected.',
    severity: 'low',
  };
}

/**
 * Rule 3: Free email domains (Gmail/Yahoo/etc.) or lookalike domains when claiming to represent a known company.
 * Note: Does not flag every Gmail address automatically. Only flags if claiming corporate/enterprise status.
 */
export function checkFreeEmailDomain(text) {
  const emailRegex = /([a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|protonmail)\.com)/i;
  const emailMatch = text.match(emailRegex);

  // Check for lookalike spoofed corporate domains (e.g., tcs-campus-hiring.com, infosys-recruitment.com)
  const lookalikeRegex =
    /[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\b(?:campus|hiring|careers|drive|placement|recruitment|jobs)\b[a-zA-Z0-9-]*\.(?:com|in|org|net))/i;
  const lookalikeMatch = text.match(lookalikeRegex);

  // Known tech / Indian IT giants keywords
  const corporateKeywords =
    /(?:multinational|technologies|inc\.|ltd|corp|corporation|solutions|consulting|network|global|enterprises|pvt|private limited|fortune|amazon|google|microsoft|tcs|tata\s+consultancy|infosys|wipro|cognizant|accenture|apple|meta|hcl)\b/i;

  const claimsCorporate = corporateKeywords.test(text);

  if (emailMatch && claimsCorporate) {
    return {
      flag: 'Free Webmail Address for Claimed Corporate Role',
      matched: true,
      evidence_quote: emailMatch[0],
      why_it_matters:
        `The posting claims corporate or enterprise standing but directs communications to a free public webmail address (${emailMatch[0]}) rather than an authenticated corporate domain.`,
      severity: 'medium',
    };
  }

  if (lookalikeMatch && claimsCorporate) {
    return {
      flag: 'Potential Lookalike Corporate Email Domain',
      matched: true,
      evidence_quote: lookalikeMatch[0],
      why_it_matters:
        `Email address (${lookalikeMatch[0]}) uses a domain name patterned after an established firm, which may indicate a lookalike domain created for impersonation.`,
      severity: 'medium',
    };
  }

  return {
    flag: 'Free Webmail Address for Claimed Corporate Role',
    matched: false,
    evidence_quote: '',
    why_it_matters:
      'No conflicting public webmail addresses or lookalike recruitment domains detected.',
    severity: 'low',
  };
}

/**
 * Rule 4: Unrealistic salaries for fresher positions.
 * Note: Does not treat every high salary as fraud; specifically checks entry-level/fresher context.
 */
export function checkUnrealisticSalary(text) {
  const isFresherOrEntry =
    /(?:fresh(?:er|ers)?|entry[- ]level|no experience|student|no degree|intern(?:ship)?|high school)\b/i.test(
      text
    );

  // High hourly rates like $40-$120/hr or ₹2,000-₹10,000/day for generic typing/data entry
  const highHourlyRegex =
    /(?:\$|£|€)\s*([4-9]\d|\d{3,})\s*(?:\/|\s*per\s*)(?:hr|hour)|(?:₹|rs\.?|inr)\s*([2-9]\d{3,}|\d{5,})\s*(?:\/|\s*per\s*)(?:day|hr|hour)/i;
  const isBasicTask =
    /(?:data entry|typing|form fill|virtual assistant|copy paste|sms sending|transcription|ad posting)/i.test(
      text
    );

  const hourlyMatch = text.match(highHourlyRegex);
  const matched = !!(isFresherOrEntry && isBasicTask && hourlyMatch);

  return {
    flag: 'Unrealistic Compensation for Entry-Level / Fresher Role',
    matched,
    evidence_quote: matched && hourlyMatch ? extractSnippet(text, highHourlyRegex) : '',
    why_it_matters:
      'Exaggerated wages for unskilled entry-level work (e.g., $45+/hr for basic data entry or typing) are classic bait used to lure candidates into lowering their scrutiny.',
    severity: 'medium',
  };
}

/**
 * Rule 5: Urgency or pressure language (e.g., "pay today", "limited slots", "immediate payment").
 */
export function checkUrgencyPressure(text) {
  const urgencyRegex =
    /(?:pay|deposit|remit|transfer)\s+(?:today|immediately|now|before\s+\d+)|limited\s+slots\s+(?:remaining|left)|immediate\s+(?:payment|deposit|registration\s+fee|transfer)|slots\s+are\s+filling\s+fast|urgent\s+hiring\s*[-—:]\s*register\s+today/i;

  const matched = urgencyRegex.test(text);
  const evidence_quote = matched ? extractSnippet(text, urgencyRegex) : '';

  return {
    flag: 'Artificial Urgency and Payment Pressure',
    matched,
    evidence_quote,
    why_it_matters:
      'Scammers fabricate artificial scarcity and immediate payment deadlines to induce hasty decisions before applicants can conduct due diligence.',
    severity: 'medium',
  };
}

/**
 * Rule 6: Missing company name or verifiable company address.
 * Flags when claiming to be a "Leading International Firm" or "Top MNC" with zero verifiable company details.
 */
export function checkMissingCompanyDetails(text) {
  const claimsPrestige =
    /(?:leading\s+(?:international|multinational|corporate|it|firm)|top\s+mnc|prestigious\s+firm|confidential\s+client|reputed\s+organization)\b/i.test(
      text
    );

  // Check for physical street address format
  const hasPhysicalAddress =
    /\b\d{1,5}\s+[a-zA-Z\s,.-]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|suite|floor|building)\b/i.test(
      text
    );

  // Check if official company website domain is provided
  const hasCompanyDomain =
    /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:com|org|io|net|co|in|edu)\b/i.test(text);

  const matched = claimsPrestige && !hasPhysicalAddress && !hasCompanyDomain;

  return {
    flag: 'Unverifiable Corporate Entity & Missing Physical Address',
    matched,
    evidence_quote: matched
      ? extractSnippet(
          text,
          /(?:leading\s+(?:international|multinational|corporate|it|firm)|top\s+mnc|prestigious\s+firm)/i
        )
      : '',
    why_it_matters:
      'Claiming high corporate prestige while omitting verifiable corporate headquarters or official web domains prevents independent background verification.',
    severity: 'low',
  };
}

/**
 * Executes all 6 deterministic rules on the job posting
 * @param {string} text
 * @returns {Array<Object>} List of structured rule indicators
 */
export function runAllRuleChecks(text) {
  const clean = normalizeText(text);

  return [
    checkUpfrontFees(clean),
    checkOffPlatformContact(clean),
    checkFreeEmailDomain(clean),
    checkUnrealisticSalary(clean),
    checkUrgencyPressure(clean),
    checkMissingCompanyDetails(clean),
  ];
}

/**
 * Dynamically builds a contextual summary based STRICTLY on matched rules
 * Avoids claiming upfront fees if Rule 01 did not match!
 * @param {Array<Object>} ruleFlags
 * @param {'likely_real' | 'suspicious' | 'likely_scam'} verdict
 * @returns {string}
 */
export function generateDynamicSummary(ruleFlags, verdict) {
  const matched = ruleFlags.filter((r) => r.matched);

  if (matched.length === 0 || verdict === 'likely_real') {
    return 'No suspicious fee demands, unverified contact channels, or known recruitment fraud signatures were detected in this posting text.';
  }

  const parts = [];

  const feeRule = matched.find((r) => r.flag.includes('Upfront Payment'));
  if (feeRule) {
    parts.push(
      `Upfront financial demand detected (${feeRule.evidence_quote ? `"${feeRule.evidence_quote}"` : 'fee/deposit'}). Legitimate employers never charge candidates for onboarding, training, or equipment.`
    );
  }

  const contactRule = matched.find((r) => r.flag.includes('Messaging') || r.flag.includes('WhatsApp'));
  if (contactRule) {
    parts.push(
      `Recruitment directs communication to off-platform channels (${contactRule.evidence_quote ? `"${contactRule.evidence_quote}"` : 'Telegram/WhatsApp'}).`
    );
  }

  const emailRule = matched.find((r) => r.flag.includes('Webmail') || r.flag.includes('Lookalike'));
  if (emailRule) {
    parts.push(
      `Recruiter uses an unverified or lookalike email address (${emailRule.evidence_quote ? `"${emailRule.evidence_quote}"` : 'public inbox'}) while claiming corporate identity.`
    );
  }

  const salaryRule = matched.find((r) => r.flag.includes('Unrealistic Compensation'));
  if (salaryRule) {
    parts.push(
      `Compensation claims (${salaryRule.evidence_quote ? `"${salaryRule.evidence_quote}"` : 'elevated pay'}) appear disproportionate for entry-level scope.`
    );
  }

  const urgencyRule = matched.find((r) => r.flag.includes('Urgency'));
  if (urgencyRule) {
    parts.push(
      `High-pressure deadlines (${urgencyRule.evidence_quote ? `"${urgencyRule.evidence_quote}"` : 'immediate payment'}) detected.`
    );
  }

  const coRule = matched.find((r) => r.flag.includes('Unverifiable Corporate'));
  if (coRule) {
    parts.push('Corporate identity cannot be independently verified from the text.');
  }

  return parts.join(' ');
}

/**
 * Computes an explainable deterministic fallback risk score (0-100) and verdict
 * Strict scoring rule: Caps score at 68 when NO upfront payment demand is present.
 * @param {Array<Object>} ruleFlags
 * @returns {{ score: number, verdict: 'likely_real' | 'suspicious' | 'likely_scam', advice: string, summary: string }}
 */
export function computeRuleFallbackScore(ruleFlags) {
  let score = 10;

  const feeRule = ruleFlags.find((r) => r.flag.includes('Upfront Payment'));
  const hasFeeDemand = feeRule && feeRule.matched;

  for (const rule of ruleFlags) {
    if (!rule.matched) continue;
    if (rule.severity === 'high') score += 40;
    else if (rule.severity === 'medium') score += 18;
    else if (rule.severity === 'low') score += 8;
  }

  // Cap score when NO upfront payment demand is present!
  // A score of 70+ requires an actual fee demand or severe high-risk factor.
  if (!hasFeeDemand && score > 68) {
    score = 68;
  }

  score = Math.min(Math.max(score, 5), 98);

  let verdict = 'likely_real';
  let advice =
    'Standard recruitment indicators present. No upfront fees or extortion mechanisms detected in the posting text.';

  if (score >= 66) {
    verdict = 'likely_scam';
    advice =
      'High-risk fraud signals detected (e.g. upfront fee demand or unverified off-platform contact). Do NOT transfer money or share identity documents.';
  } else if (score >= 31) {
    verdict = 'suspicious';
    advice =
      'Suspicious patterns found (e.g. public webmail or unverified corporate profile). Verify the employer on LinkedIn or corporate registries before proceeding.';
  }

  const summary = generateDynamicSummary(ruleFlags, verdict);

  return { score, verdict, advice, summary };
}
