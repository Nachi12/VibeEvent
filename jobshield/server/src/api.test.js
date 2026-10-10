import test from 'node:test';
import assert from 'node:assert/strict';
import app from './index.js';

// Helper to make internal requests using http or supertest-like fetch
// We can start a temporary server on an ephemeral port
let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /health returns healthy status and metadata', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'healthy');
  assert.equal(data.service, 'JobShield Recruitment Fraud Detection API');
  assert.ok(typeof data.claude_configured === 'boolean');
  assert.ok(typeof data.model === 'string');
});

test('POST /analyze rejects empty or short inputs with HTTP 400', async () => {
  const resEmpty = await fetch(`${baseUrl}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '' }),
  });
  assert.equal(resEmpty.status, 400);

  const resShort = await fetch(`${baseUrl}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'too short' }),
  });
  assert.equal(resShort.status, 400);
  const shortData = await resShort.json();
  assert.ok(shortData.error.includes('too short'));
});

test('POST /analyze processes suspicious posting and returns structured response', async () => {
  const suspiciousText =
    'Apex Global is hiring remote data entry freshers. Earn $45/hour. Pay refundable security deposit of $150 before start. Contact exclusively on Telegram @apex_recruiter.';

  const res = await fetch(`${baseUrl}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: suspiciousText }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();

  assert.ok(['likely_real', 'suspicious', 'likely_scam'].includes(data.verdict));
  assert.ok(typeof data.score === 'number');
  assert.ok(data.score >= 0 && data.score <= 100);
  assert.ok(Array.isArray(data.red_flags));
  assert.ok(Array.isArray(data.rule_flags));
  assert.ok(typeof data.advice === 'string');
  assert.ok(['ai', 'rule_only'].includes(data.analysis_mode));

  // In suspicious posting with $150 deposit and Telegram, score must be high risk
  assert.equal(data.verdict, 'likely_scam');
  assert.ok(data.score >= 66);
});

test('POST /analyze processes plausible posting', async () => {
  const plausibleText =
    'CloudVanguard Technologies Inc. Headquarters: 450 Mission Street, San Francisco. Junior Frontend Developer $68k-$78k. Apply via careers@cloudvanguard.com. We never ask for recruitment fees.';

  const res = await fetch(`${baseUrl}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: plausibleText }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.verdict, 'likely_real');
  assert.ok(data.score <= 30);
});

test('POST /report creates an in-memory report and returns report ID', async () => {
  const reportPayload = {
    job_text: 'Recruiter asked for payment via Telegram handle @fake_jobs',
    verdict: 'likely_scam',
    score: 85,
    category: 'Upfront Fee / Security Deposit Extortion',
    reporter_notes: 'Demanded ₹2500 on UPI',
  };

  const res = await fetch(`${baseUrl}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportPayload),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.report_id.startsWith('REP-'));
  assert.ok(typeof data.timestamp === 'string');

  // Verify diagnostic endpoint
  const getReports = await fetch(`${baseUrl}/api/reports`);
  const diagData = await getReports.json();
  assert.ok(diagData.total >= 1);
});
