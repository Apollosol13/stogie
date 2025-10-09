/**
 * Secure Logger Utility
 * Automatically redacts sensitive information from logs
 */

// Patterns to redact
const REDACT_PATTERNS = {
  // JWT tokens (Bearer xxx...)
  jwt: /Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi,
  
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Tokens in various formats
  token: /(token|jwt|accessToken|refreshToken)["']?\s*[:=]\s*["']?[\w-]+\.[\w-]+\.[\w-]+/gi,
  
  // API keys (common patterns)
  apiKey: /(api[_-]?key|apikey|key)["']?\s*[:=]\s*["']?[a-zA-Z0-9_-]{20,}/gi,
  
  // Passwords
  password: /(password|passwd|pwd)["']?\s*[:=]\s*["']?[^\s"',}]+/gi,
  
  // Authorization headers
  authHeader: /(authorization)["']?\s*[:=]\s*["']?Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi,
};

/**
 * Redact sensitive information from a string
 */
function redactString(str) {
  if (typeof str !== 'string') return str;
  
  let redacted = str;
  
  // Apply all redaction patterns
  redacted = redacted.replace(REDACT_PATTERNS.jwt, 'Bearer [REDACTED]');
  redacted = redacted.replace(REDACT_PATTERNS.email, '[REDACTED_EMAIL]');
  redacted = redacted.replace(REDACT_PATTERNS.token, '$1: "[REDACTED]"');
  redacted = redacted.replace(REDACT_PATTERNS.apiKey, '$1: "[REDACTED]"');
  redacted = redacted.replace(REDACT_PATTERNS.password, '$1: "[REDACTED]"');
  redacted = redacted.replace(REDACT_PATTERNS.authHeader, '$1: "Bearer [REDACTED]"');
  
  return redacted;
}

/**
 * Redact sensitive fields from objects
 */
function redactObject(obj) {
  if (obj === null || obj === undefined) return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item));
  }
  
  // Handle non-objects (strings, numbers, etc)
  if (typeof obj !== 'object') {
    return typeof obj === 'string' ? redactString(obj) : obj;
  }
  
  // Handle objects
  const redacted = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Redact sensitive field names
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('token') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('authorization') ||
      lowerKey.includes('jwt') ||
      lowerKey.includes('apikey') ||
      lowerKey.includes('api_key')
    ) {
      redacted[key] = '[REDACTED]';
    }
    // Redact email fields
    else if (lowerKey === 'email' || lowerKey === 'user_email') {
      redacted[key] = '[REDACTED_EMAIL]';
    }
    // Recursively redact nested objects/arrays
    else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactObject(value);
    }
    // Redact strings that might contain sensitive data
    else if (typeof value === 'string') {
      redacted[key] = redactString(value);
    }
    // Keep other values as-is
    else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

/**
 * Format arguments for logging
 */
function formatArgs(args) {
  return args.map(arg => {
    if (typeof arg === 'string') {
      return redactString(arg);
    } else if (typeof arg === 'object' && arg !== null) {
      return redactObject(arg);
    }
    return arg;
  });
}

/**
 * Safe logger that redacts sensitive information
 */
const logger = {
  info: (...args) => {
    const redacted = formatArgs(args);
    console.log('[INFO]', ...redacted);
  },
  
  warn: (...args) => {
    const redacted = formatArgs(args);
    console.warn('[WARN]', ...redacted);
  },
  
  error: (...args) => {
    const redacted = formatArgs(args);
    console.error('[ERROR]', ...redacted);
  },
  
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      const redacted = formatArgs(args);
      console.log('[DEBUG]', ...redacted);
    }
  },
  
  // Raw console access for when you explicitly don't want redaction
  // Use sparingly and carefully!
  raw: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  }
};

export default logger;

