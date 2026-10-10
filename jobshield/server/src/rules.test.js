import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkUpfrontFees,
  checkOffPlatformContact,
  checkFreeEmailDomain,
  checkUnrealisticSalary,
  checkUrgencyPressure,
  checkMissingCompanyDetails,
  runAllRuleChecks,
  computeRuleFallbackScore,
  generateDynamicSummary,
} from './rules.js';

test('Rule 1: checkUpfrontFees detects international and Indian fees (₹, UPI, offer letter fee)', () => {
  const usScam = 'Candidate must remit a refundable security deposit of $150 before onboarding.';
  const indiaScam = 'Pay ₹4,999 mandatory offer letter processing fee via UPI / GPay to confirm selection.';
  const legitimatePost = 'CloudVanguard will never ask for recruitment fees or deposits.';

  const usRes = checkUpfrontFees(usScam);
  assert.equal(usRes.matched, true);
  assert.equal(usRes.severity, 'high');

  const inRes = checkUpfrontFees(indiaScam);
  assert.equal(inRes.matched, true);
  assert.equal(inRes.severity, 'high');
  assert.ok(inRes.evidence_quote.includes('4,999') || inRes.evidence_quote.includes('fee'));

  const legitRes = checkUpfrontFees(legitimatePost);
  assert.equal(legitRes.matched, false);
});

test('Rule 2: checkOffPlatformContact distinguishes exclusive Telegram routing from benign WhatsApp mention', () => {
  const exclusivePost = 'Do not email. Contact HR Director exclusively on Telegram: @apex_recruiter';
  const benignPost = 'Send your resume along with your WhatsApp number for SMS interview updates.';
  const normalPost = 'Submit applications via careers@company.com';

  const exclusiveRes = checkOffPlatformContact(exclusivePost);
  assert.equal(exclusiveRes.matched, true);
  assert.equal(exclusiveRes.severity, 'high');

  const benignRes = checkOffPlatformContact(benignPost);
  assert.equal(benignRes.matched, true);
  assert.equal(benignRes.severity, 'low', 'Asking for applicant WhatsApp contact should be low severity, not high');

  const normRes = checkOffPlatformContact(normalPost);
  assert.equal(normRes.matched, false);
});

test('Rule 3: checkFreeEmailDomain flags corporate claims with Gmail or lookalikes', () => {
  const corporateWithGmail = 'Leading International Technologies Inc. Email resume to hr.global@gmail.com';
  const lookalikeDomain = 'Tata Consultancy Services. Submit to careers@tcs-campus-hiring.com';
  const legitCorporate = 'Acme Technologies Inc. Email careers@acme.com';
  const personalTutor = 'Looking for a math tutor for high school kid. Email john@gmail.com';

  const corpGmailRes = checkFreeEmailDomain(corporateWithGmail);
  assert.equal(corpGmailRes.matched, true);

  const lookalikeRes = checkFreeEmailDomain(lookalikeDomain);
  assert.equal(lookalikeRes.matched, true);

  const legitCorpRes = checkFreeEmailDomain(legitCorporate);
  assert.equal(legitCorpRes.matched, false);

  const personalRes = checkFreeEmailDomain(personalTutor);
  assert.equal(personalRes.matched, false);
});

test('Scoring cap: Score is capped when no fee demand is present', () => {
  // Post with free email, high salary, urgency, and vague entity, but NO fee demand
  const noFeeAmbiguous = `
    Global Talent Network is urgently hiring virtual assistants.
    Earn $65/hour with no experience. Slots are filling fast so apply today.
    Email resume to globaltalent@gmail.com.
  `;
  const rules = runAllRuleChecks(noFeeAmbiguous);
  const scoring = computeRuleFallbackScore(rules);

  assert.ok(scoring.score <= 68, `Score ${scoring.score} must be capped at or below 68 when no payment is demanded`);
  assert.equal(scoring.verdict, 'likely_scam' === scoring.verdict ? 'likely_scam' : 'suspicious');
});

test('Dynamic summary: Does NOT claim upfront fees when no fee rule matched', () => {
  const noFeePost = 'Global Talent Network is hiring remote typing. Email hr@gmail.com';
  const rules = runAllRuleChecks(noFeePost);
  const summary = generateDynamicSummary(rules, 'suspicious');

  assert.ok(!summary.includes('advance funds') && !summary.includes('Upfront financial demand'),
    'Summary must not claim fee demands when none matched');
});
