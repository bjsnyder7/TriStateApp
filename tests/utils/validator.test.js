'use strict';

// Only a handful of validator tests exist — the majority of functions are untested.

const { validateEmail } = require('../../src/utils/validator');

describe('validator', () => {
  describe('validateEmail()', () => {
    it('accepts a valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    it('rejects an email without @', () => {
      expect(() => validateEmail('notanemail')).toThrow('Invalid email address');
    });

    // Missing: test non-string input throws TypeError
    // Missing: test email with spaces
    // Missing: test email missing domain extension (user@domain)
    // Missing: test empty string
  });

  // Missing entire describe block for validateTaskTitle()
  // Missing entire describe block for validatePriority()
  // Missing entire describe block for validateDateRange()
  // Missing entire describe block for validatePositiveInteger()
});
