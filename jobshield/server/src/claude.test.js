import test from 'node:test';
import assert from 'node:assert/strict';
import {
  verifyQuoteInText,
  validateAndCleanModelResponse,
  analyzePostingWithClaude,
} from './claude.js';

test('verifyQuoteInText correctly verifies quotes against source text', () => {
  const text = 'Candidates must pay a refundable security deposit of $150.';
  assert.equal(verifyQuoteInText('refundable security deposit', text), true);
  assert.equal(verifyQuoteInText('deposit of $150', text), true);
  assert.equal(verifyQuoteInText('invented phrase that does not exist', text), false);
  assert.equal(verifyQuoteInText('', text), false);
  assert.equal(verifyQuoteInText('ab', text), false, 'Quotes shorter than 3 chars should not match');
});

test('validateAndCleanModelResponse enforces valid enum and score ranges', () => {
  const originalText = 'Apex Global requires $150 refundable deposit on Telegram.';

  const validRaw = {
    verdict: 'likely_scam',
    score: 85,
    red_flags: [
      {
        flag: 'Fee Demand',
        evidence_quote: '$150 refundable deposit',
        why_it_matters: 'Upfront fees are fraudulent.',
      },
      {
        flag: 'Made-up quote',
        evidence_quote: 'completely fabricated line',
        why_it_matters: 'Should be converted to non-quote explanation.',
      },
    ],
    advice: 'Do not pay.',
  };

  const cleaned = validateAndCleanModelResponse(validRaw, originalText);
  assert.equal(cleaned.verdict, 'likely_scam');
  assert.equal(cleaned.score, 85);
  assert.equal(cleaned.red_flags.length, 2);

  // First flag has exact quote verified
  assert.equal(cleaned.red_flags[0].is_exact_quote, true);
  assert.equal(cleaned.red_flags[0].evidence_quote, '$150 refundable deposit');

  // Second flag had fabricated quote: must have is_exact_quote false and quote cleared
  assert.equal(cleaned.red_flags[1].is_exact_quote, false);
  assert.equal(cleaned.red_flags[1].evidence_quote, '');
  assert.ok(cleaned.red_flags[1].why_it_matters.includes('Observed pattern'));
});

test('validateAndCleanModelResponse throws on invalid verdict or object', () => {
  assert.throws(() => {
    validateAndCleanModelResponse({ verdict: 'unknown_garbage' }, 'Some text');
  }, /Invalid verdict/);

  assert.throws(() => {
    validateAndCleanModelResponse(null, 'Some text');
  }, /not a valid JSON object/);
});

test('analyzePostingWithClaude throws clear error when ANTHROPIC_API_KEY is not configured', async () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;

  try {
    await analyzePostingWithClaude('Job posting text here');
    assert.fail('Should have thrown NO_API_KEY error');
  } catch (err) {
    assert.equal(err.code, 'NO_API_KEY');
    assert.ok(err.message.includes('ANTHROPIC_API_KEY'));
  } finally {
    process.env.ANTHROPIC_API_KEY = originalKey;
  }
});
