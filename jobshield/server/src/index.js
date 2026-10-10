import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { runAllRuleChecks, computeRuleFallbackScore } from './rules.js';
import { analyzePostingWithClaude } from './claude.js';
import { createReport, getAllReports } from './report.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';

// 1. CORS Configuration
const allowedOrigins = [
  CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in MVP to avoid dev blocking
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Sensible request size limits
app.use(express.json({ limit: '100kb' }));

// 3. Rate Limiters
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 analyze requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many analysis requests from this IP. Please try again after 15 minutes.',
  },
});

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many reports submitted. Please wait a few minutes before submitting again.',
  },
});

// 4. Health Check Endpoints
const healthHandler = (req, res) => {
  const hasKey = !!(
    process.env.ANTHROPIC_API_KEY &&
    process.env.ANTHROPIC_API_KEY.trim() !== '' &&
    process.env.ANTHROPIC_API_KEY !== 'your_key_here'
  );

  res.json({
    status: 'healthy',
    service: 'JobShield Recruitment Fraud Detection API',
    timestamp: new Date().toISOString(),
    claude_configured: hasKey,
    model: CLAUDE_MODEL,
    in_memory_reports_count: getAllReports().length,
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// 5. Analysis Pipeline Handler
const analyzeHandler = async (req, res) => {
  try {
    const { text } = req.body;

    // Validate request body
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: "text" field must be a non-empty string.',
      });
    }

    const trimmedText = text.trim();
    if (trimmedText.length < 20) {
      return res.status(400).json({
        error: `Job posting text too short (${trimmedText.length} chars). Please provide at least 20 characters for meaningful analysis.`,
      });
    }

    if (trimmedText.length > 15000) {
      return res.status(400).json({
        error: `Job posting exceeds maximum allowable length (15,000 characters). Provided: ${trimmedText.length} chars.`,
      });
    }

    // Step 1: Run deterministic rule checks
    const rule_flags = runAllRuleChecks(trimmedText);

    // Step 2: Check if Claude API key is available
    const hasKey = !!(
      process.env.ANTHROPIC_API_KEY &&
      process.env.ANTHROPIC_API_KEY.trim() !== '' &&
      process.env.ANTHROPIC_API_KEY !== 'your_key_here'
    );

    if (hasKey) {
      try {
        // Step 3: Call Claude Sonnet
        const claudeResult = await analyzePostingWithClaude(trimmedText, rule_flags, {
          timeoutMs: 15000,
        });

        // Step 4: Merge rule flags and model flags, avoiding identical duplicate text
        const existingQuotes = new Set(
          claudeResult.red_flags
            .map((f) => f.evidence_quote && f.evidence_quote.toLowerCase().trim())
            .filter(Boolean)
        );

        const mergedRedFlags = [...claudeResult.red_flags];

        // If a high-severity deterministic rule matched and wasn't quoted by Claude, add it as supporting evidence
        for (const rule of rule_flags) {
          if (
            rule.matched &&
            rule.evidence_quote &&
            !existingQuotes.has(rule.evidence_quote.toLowerCase().trim())
          ) {
            mergedRedFlags.push({
              flag: rule.flag,
              evidence_quote: rule.evidence_quote,
              why_it_matters: rule.why_it_matters,
              is_exact_quote: true,
            });
          }
        }

        return res.json({
          verdict: claudeResult.verdict,
          score: claudeResult.score,
          red_flags: mergedRedFlags,
          advice: claudeResult.advice,
          rule_flags,
          analysis_mode: 'ai',
          metadata: {
            model: CLAUDE_MODEL,
            checked_at: new Date().toISOString(),
          },
        });
      } catch (aiError) {
        console.warn('Claude API invocation failed, transitioning to rule-only fallback:', aiError.message);
        // Fall through to deterministic rule-only fallback
      }
    }

    // Step 5: Rule-Only Fallback Engine
    // Transparently labeled as rule_only - never claimed as AI analysis
    const fallback = computeRuleFallbackScore(rule_flags);

    return res.json({
      verdict: fallback.verdict,
      score: fallback.score,
      red_flags: [], // Empty in rule_only mode: never relabel rule matches as AI citations!
      advice: fallback.advice,
      summary: fallback.summary,
      rule_flags,
      analysis_mode: 'rule_only',
      metadata: {
        engine: 'JobShield Deterministic Rule Engine',
        checked_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Unexpected error during analysis:', err);
    return res.status(500).json({
      error: 'An internal error occurred while analyzing the job posting.',
      details: err.message,
    });
  }
};

app.post('/analyze', analyzeLimiter, analyzeHandler);
app.post('/api/analyze', analyzeLimiter, analyzeHandler);

// 6. Report Endpoints
const reportHandler = (req, res) => {
  try {
    const report = createReport(req.body);
    return res.status(201).json(report);
  } catch (err) {
    return res.status(400).json({
      error: err.message || 'Failed to submit report',
    });
  }
};

app.post('/report', reportLimiter, reportHandler);
app.post('/api/report', reportLimiter, reportHandler);

// Diagnostic reports endpoint
app.get('/api/reports', (req, res) => {
  res.json({
    total: getAllReports().length,
    reports: getAllReports(),
  });
});

// 7. Global 404 & Error Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[JobShield Server] Listening on port ${PORT}`);
    console.log(`[JobShield Server] Claude Model: ${CLAUDE_MODEL}`);
    console.log(`[JobShield Server] Client Origin: ${CLIENT_ORIGIN}`);
  });
}

export default app;
