import mongoSanitize from 'express-mongo-sanitize';

/**
 * Cybersecurity Middleware: Prevents NoSQL Injection Attacks
 * Strips out prohibited characters ($ and .) from request body, query, and params.
 */
export const noSqlSanitizer = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[CYBER SECURITY ALERT] Sanitized prohibited NoSQL payload key: "${key}" from IP: ${req.ip}`);
  },
});

/**
 * Cybersecurity Middleware: Prevents Cross-Site Scripting (XSS) Attacks
 * Recursively sanitizes string inputs in request body, query, and params.
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol URIs
    .replace(/onload=/gi, '') // Remove inline event handlers
    .replace(/onerror=/gi, '')
    .replace(/onclick=/gi, '');
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
};

export const xssSanitizer = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};
