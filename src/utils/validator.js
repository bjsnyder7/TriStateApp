'use strict';

const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TITLE_LENGTH = 200;
const MIN_TITLE_LENGTH = 3;

function validateTaskTitle(title) {
  if (typeof title !== 'string') {
    throw new TypeError('Task title must be a string');
  }
  const trimmed = title.trim();
  if (trimmed.length < MIN_TITLE_LENGTH) {
    throw new Error(`Task title must be at least ${MIN_TITLE_LENGTH} characters`);
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new Error(`Task title must not exceed ${MAX_TITLE_LENGTH} characters`);
  }
  return true;
}

function validateEmail(email) {
  if (typeof email !== 'string') {
    throw new TypeError('Email must be a string');
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new Error(`Invalid email address: ${email}`);
  }
  return true;
}

function validatePriority(priority) {
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority: ${priority}. Must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  return true;
}

function validateDateRange(startDate, endDate) {
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    throw new TypeError('startDate must be a valid Date');
  }
  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    throw new TypeError('endDate must be a valid Date');
  }
  if (startDate >= endDate) {
    throw new Error('startDate must be before endDate');
  }
  return true;
}

function validatePositiveInteger(value, fieldName = 'value') {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${fieldName} must be a positive integer`);
  }
  return true;
}

module.exports = {
  validateTaskTitle,
  validateEmail,
  validatePriority,
  validateDateRange,
  validatePositiveInteger,
  VALID_PRIORITIES,
};
