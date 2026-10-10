import type { AnalysisResponse, RedFlag, RuleFlag, VerdictType } from '../types';

export function runClientSideAnalysis(text: string): AnalysisResponse {
  const lower = text.toLowerCase();
  const ruleFlags: RuleFlag[] = [];
  const redFlags: RedFlag[] = [];

  // 1. Upfront Fee / Security Deposit Check (including Indian context: ₹, UPI, offer letter fee)
  const feeRegex =
    /(?:registration|training|security\s+deposit|laptop\s+deposit|equipment\s+deposit|application|onboarding|processing|verification|offer\s+letter|seat\s+reservation)(?:\s+[\w-]+){0,2}\s*(?:fee|charge|cost|amount|payment|deposit|money)|(?:pay|deposit|remit|transfer)\s+(?:a|an|\$|₹|rs\.?|inr|£|€|\b)\s*([\d,]+|fee)|refundable\s+(?:security\s+)?deposit|(?:via|through|on)\s*(?:upi|gpay|google\s*pay|phonepe|paytm|zelle|crypto)/i;
  const feeMatch = text.match(feeRegex);
  const feeFound = !!feeMatch;

  ruleFlags.push({
    flag: 'Upfront Payment or Security Deposit Demand',
    matched: feeFound,
    evidence_quote: feeFound ? (feeMatch ? feeMatch[0].trim() : '') : '',
    why_it_matters:
      'Legitimate corporate employers NEVER demand upfront registration fees, training deposits, offer letter fees, or equipment security deposits from job applicants. Any payment request is a primary indicator of recruitment fraud.',
    severity: 'high',
  });

  // 2. Off-platform Chat (Telegram / WhatsApp) - Distinguish exclusive redirection from simple contact request
  const exclusiveRegex =
    /(?:do\s+not\s+email[^\n.]*(?:telegram|whatsapp))|(?:contact|message|reach)\s+(?:us\s+)?(?:exclusively|only|directly)\s+(?:on|via)\s+(?:telegram|whatsapp)|(?:telegram|t\.me)\s*(?::|at|on|via)?\s*(@?[\w_.-]+)|(?:t\.me|wa\.me)\/[\w_.-]+/i;
  const exclusiveMatch = text.match(exclusiveRegex);

  const contactRequestRegex =
    /(?:whatsapp\s+(?:number|contact|id)|(?:submit|share|send|provide)[^\n.]*whatsapp)/i;
  const requestMatch = text.match(contactRequestRegex);

  const isExclusiveChat = !!exclusiveMatch;
  const isContactRequest = !isExclusiveChat && !!requestMatch;

  if (isExclusiveChat) {
    ruleFlags.push({
      flag: 'Exclusive Off-Platform Messaging (Telegram / WhatsApp)',
      matched: true,
      evidence_quote: exclusiveMatch ? exclusiveMatch[0].trim() : '',
      why_it_matters:
        'Directing candidates exclusively to unmonitored messaging apps like Telegram or WhatsApp bypasses corporate audit trails and prevents recruiter identity verification.',
      severity: 'high',
    });
  } else if (isContactRequest) {
    ruleFlags.push({
      flag: 'Requests WhatsApp / Messaging Contact Detail',
      matched: true,
      evidence_quote: requestMatch ? requestMatch[0].trim() : '',
      why_it_matters:
        'Recruiter asks for off-platform messaging details. While sometimes used in informal recruitment, enterprise hiring typically relies on official email or applicant tracking portals.',
      severity: 'low',
    });
  } else {
    ruleFlags.push({
      flag: 'Unverified Messaging Contact (Telegram / WhatsApp)',
      matched: false,
      evidence_quote: '',
      why_it_matters:
        'No exclusive messaging redirection or suspicious messaging requirements detected.',
      severity: 'low',
    });
  }

  // 3. Free Email Domains Claiming Corporate/Established Identity or Lookalikes
  const freeEmailRegex = /[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|protonmail)\.com/i;
  const emailMatch = text.match(freeEmailRegex);
  const lookalikeRegex =
    /[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\b(?:campus|hiring|careers|drive|placement|recruitment|jobs)\b[a-zA-Z0-9-]*\.(?:com|in|org|net))/i;
  const lookalikeMatch = text.match(lookalikeRegex);

  const claimsCompany =
    /(?:multinational|technologies|inc\.|ltd|corp|corporation|solutions|consulting|network|global|enterprises|pvt|private limited|fortune|amazon|google|microsoft|tcs|tata\s+consultancy|infosys|wipro|cognizant|accenture|apple|meta|hcl)/i.test(
      text
    );
  const freeEmailSuspicious = !!((emailMatch || lookalikeMatch) && claimsCompany);

  ruleFlags.push({
    flag: lookalikeMatch ? 'Potential Lookalike Corporate Email Domain' : 'Free Webmail Address for Claimed Corporate Role',
    matched: freeEmailSuspicious,
    evidence_quote: freeEmailSuspicious ? (lookalikeMatch ? lookalikeMatch[0] : emailMatch ? emailMatch[0] : '') : '',
    why_it_matters:
      'Legitimate corporate employers recruit using custom domain addresses (@company.com). Free webmail or lookalike domains are commonly used to impersonate established employers.',
    severity: 'medium',
  });

  // 4. Unrealistic Fresher Compensation
  const highSalaryRegex =
    /(?:\$|£|€)\s*([4-9]\d|\d{3,})\s*(?:\/|\s*per\s*)(?:hr|hour)|(?:₹|rs\.?|inr)\s*([2-9]\d{3,}|\d{5,})\s*(?:\/|\s*per\s*)(?:day|hr|hour)/i;
  const salaryMatch = text.match(highSalaryRegex);
  const isFresher = /(?:fresh|student|no experience|entry-level|no degree|intern)/i.test(lower);
  const isBasicTask = /(?:data entry|typing|form fill|virtual assistant|copy paste|sms sending|transcription|ad posting)/i.test(lower);
  const unrealisticComp = !!(salaryMatch && isFresher && isBasicTask);

  ruleFlags.push({
    flag: 'Unrealistic Compensation for Entry-Level / Fresher Role',
    matched: unrealisticComp,
    evidence_quote: unrealisticComp && salaryMatch ? salaryMatch[0] : '',
    why_it_matters:
      'Compensation far exceeds fair market value for unskilled entry-level work, commonly used as bait to lower scrutiny.',
    severity: 'medium',
  });

  // 5. Artificial Urgency / Pressure
  const urgencyRegex =
    /(?:pay|deposit|remit|transfer)\s+(?:today|immediately|now|before\s+\d+)|limited\s+slots\s+(?:remaining|left)|immediate\s+(?:payment|deposit|registration\s+fee|transfer)|slots\s+are\s+filling\s+fast|urgent\s+hiring\s*[-—:]\s*register\s+today/i;
  const urgencyMatch = text.match(urgencyRegex);
  const urgencyFound = !!urgencyMatch;

  ruleFlags.push({
    flag: 'Artificial Urgency and Payment Pressure',
    matched: urgencyFound,
    evidence_quote: urgencyFound && urgencyMatch ? urgencyMatch[0] : '',
    why_it_matters:
      'Scammers fabricate artificial deadlines to rush applicants into impulsive actions before researching the organization.',
    severity: 'medium',
  });

  // 6. Missing Verifiable Address or Real Entity
  const hasAddress = /\b\d{1,5}\s+[a-zA-Z\s,.-]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|suite|floor|building)\b/i.test(text);
  const claimsLeadingMnc = /(?:leading\s+(?:international|multinational|corporate|it|firm)|top\s+mnc|prestigious\s+firm|confidential\s+client)/i.test(text);
  const missingIdentity = claimsLeadingMnc && !hasAddress;

  ruleFlags.push({
    flag: 'Unverifiable Corporate Entity & Missing Physical Address',
    matched: missingIdentity,
    evidence_quote: missingIdentity ? 'Leading International Talent Network' : '',
    why_it_matters:
      'Absence of a physical corporate office or registered legal business name prevents verification on public registries.',
    severity: 'low',
  });

  // Calculate score & verdict
  let score = 10;
  if (feeFound) score += 40;
  if (isExclusiveChat) score += 30;
  else if (isContactRequest) score += 10;
  if (freeEmailSuspicious) score += 18;
  if (unrealisticComp) score += 15;
  if (urgencyFound) score += 12;
  if (missingIdentity) score += 8;

  // Strict score capping: If NO fee demand is present, cap score at 68
  if (!feeFound && score > 68) {
    score = 68;
  }

  score = Math.min(Math.max(score, 5), 98);

  let verdict: VerdictType = 'likely_real';
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

  // Dynamic summary strictly from matched flags
  const summaryParts: string[] = [];
  const matchedRules = ruleFlags.filter((r) => r.matched);

  if (matchedRules.length === 0 || verdict === 'likely_real') {
    summaryParts.push('No suspicious fee demands, unverified contact channels, or known recruitment fraud signatures were detected in this posting text.');
  } else {
    if (feeFound) {
      summaryParts.push(`Upfront financial demand detected (${feeMatch ? `"${feeMatch[0].trim()}"` : 'fee/deposit'}). Legitimate employers never charge candidates for onboarding, training, or equipment.`);
    }
    if (isExclusiveChat) {
      summaryParts.push(`Recruitment directs communication exclusively to off-platform channels (${exclusiveMatch ? `"${exclusiveMatch[0].trim()}"` : 'Telegram'}).`);
    } else if (isContactRequest) {
      summaryParts.push('Posting requests applicant WhatsApp contact number.');
    }
    if (freeEmailSuspicious) {
      summaryParts.push(`Recruiter uses an unverified or lookalike email address (${lookalikeMatch ? lookalikeMatch[0] : emailMatch ? emailMatch[0] : 'public inbox'}) while claiming corporate standing.`);
    }
    if (unrealisticComp && salaryMatch) {
      summaryParts.push(`Compensation claims ("${salaryMatch[0]}") appear unusually high for entry-level tasks.`);
    }
    if (urgencyFound && urgencyMatch) {
      summaryParts.push(`Artificial time pressure ("${urgencyMatch[0]}") detected.`);
    }
    if (missingIdentity) {
      summaryParts.push('Corporate identity cannot be independently verified from the text.');
    }
  }

  const summary = summaryParts.join(' ');

  return {
    verdict,
    score,
    red_flags: redFlags, // in rule-only mode, red_flags is empty so UI does not show fake AI citations!
    rule_flags: ruleFlags,
    advice,
    summary,
    analysis_mode: 'demo',
    metadata: {
      checked_at: new Date().toISOString(),
      char_count: text.length,
    },
  };
}
