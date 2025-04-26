// src/utils/validationPatterns.ts

/**
 * Reusable validation patterns for form inputs.
 * Based on patterns used across various report forms.
 */
export const VALIDATION_PATTERNS = {
  /** Allows letters and spaces only. */
  TEXT_ONLY: /^[a-zA-Z\s]*$/,

  /** Allows digits only (positive integers). */
  INTEGER_ONLY: /^\d*$/,

  /** Allows numbers, including optional leading minus and decimal point. */
  NUMBER_ONLY: /^-?\d*\.?\d*$/,

  /** Matches HH:MM format (e.g., 14:30). */
  TIME_HHMM: /^([01]\d|2[0-3]):([0-5]\d)$/,

  /** Matches YYYY-MM-DD format (e.g., 2024-12-31). */
  DATE_YYYYMMDD: /^\d{4}-\d{2}-\d{2}$/,

  /** Matches timezone offset format (e.g., +05, -10). Requires leading + or - and two digits (00-14). */
  TIMEZONE: /^[+-](0\d|1[0-4])$/,

  /** Basic check for latitude format (degrees and optional decimal). Allows 1 or 2 digits before decimal. */
  LATITUDE: /^\d{1,2}(\.\d+)?$/,

  /** Basic check for longitude format (degrees and optional decimal). Allows 1 to 3 digits before decimal. */
  LONGITUDE: /^\d{1,3}(\.\d+)?$/,

  /** Allows course values from 0 to 359 (1 to 3 digits). */
  COURSE: /^\d{1,3}$/,

  /** Allows wind force values from 0 to 12. */
  WIND_FORCE: /^(0|([1-9]|1[0-2]))$/,

  /** Allows sea state values from 0 to 9. */
  SEA_STATE: /^[0-9]$/,

  /** Allows swell height values from 0 to 9. */
  SWELL_HEIGHT: /^[0-9]$/,

  /** Allows text with spaces, hyphens, commas, and periods. */
  TEXT_WITH_COMMON_PUNCTUATION: /^[a-zA-Z\s\-.,]*$/,

  /** Allows positive decimal numbers only. */
  POSITIVE_DECIMAL_ONLY: /^\d*\.?\d*$/,

  /** Allows positive or negative timezone offset up to 2 digits (e.g., +3, -10, 5). Used for filtering. */
  TIMEZONE_FILTER: /^[+-]?\d{0,2}$/,
};

// Export individual patterns for easier import if needed
export const {
  TEXT_ONLY,
  INTEGER_ONLY,
  NUMBER_ONLY,
  TIME_HHMM,
  DATE_YYYYMMDD,
  TIMEZONE,
  LATITUDE,
  LONGITUDE,
  COURSE,
  WIND_FORCE,
  SEA_STATE,
  SWELL_HEIGHT,
  TEXT_WITH_COMMON_PUNCTUATION,
  POSITIVE_DECIMAL_ONLY,
  TIMEZONE_FILTER,
} = VALIDATION_PATTERNS;
