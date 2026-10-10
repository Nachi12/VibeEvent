/**
 * JobShield - In-Memory Reports Store (MVP)
 * Stores anonymous scam reports submitted by users during this runtime session.
 * Explicitly ephemeral: not persisted across server restarts.
 */

const inMemoryReports = [];

/**
 * Validates and records an anonymous report
 * @param {Object} payload
 * @returns {Object} Report submission result
 */
export function createReport(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid report payload');
  }

  const { job_text, verdict, score, category, reporter_notes } = payload;

  if (!job_text || typeof job_text !== 'string' || job_text.trim().length < 10) {
    throw new Error('A valid job posting excerpt (at least 10 characters) is required to file a report.');
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    throw new Error('A report category is required.');
  }

  // Generate unique report ID
  const report_id = `REP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  const reportRecord = {
    report_id,
    timestamp,
    category: category.trim().slice(0, 100),
    verdict: typeof verdict === 'string' ? verdict.trim() : 'unspecified',
    score: typeof score === 'number' ? score : null,
    // Store truncated excerpt for review, avoiding sensitive data
    job_text_snippet: job_text.trim().slice(0, 1000),
    reporter_notes: typeof reporter_notes === 'string' ? reporter_notes.trim().slice(0, 500) : '',
  };

  inMemoryReports.push(reportRecord);

  return {
    success: true,
    report_id,
    timestamp,
    message: 'Report recorded successfully. Stored in-memory for the current demo session.',
    stored_count: inMemoryReports.length,
  };
}

/**
 * Returns all currently stored reports (for diagnostic/demo verification)
 * @returns {Array<Object>}
 */
export function getAllReports() {
  return [...inMemoryReports];
}

/**
 * Resets in-memory reports (useful for unit testing)
 */
export function clearReports() {
  inMemoryReports.length = 0;
}
