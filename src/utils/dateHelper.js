'use strict';

const { validateDateRange } = require('./validator');

/**
 * Format a date to YYYY-MM-DD string.
 */
function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('Expected a valid Date object');
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns true if the given date is strictly before now.
 */
function isOverdue(dueDate) {
  if (!(dueDate instanceof Date) || isNaN(dueDate.getTime())) {
    throw new TypeError('Expected a valid Date object');
  }
  return dueDate < new Date();
}

/**
 * Number of whole days remaining until dueDate (negative if overdue).
 */
function getDaysRemaining(dueDate) {
  if (!(dueDate instanceof Date) || isNaN(dueDate.getTime())) {
    throw new TypeError('Expected a valid Date object');
  }
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((dueDate.getTime() - Date.now()) / msPerDay);
}

/**
 * Given an array of tasks, count how many were completed within [startDate, endDate].
 */
function countCompletedInRange(tasks, startDate, endDate) {
  validateDateRange(startDate, endDate);
  return tasks.filter(
    (t) =>
      t.completedAt instanceof Date &&
      t.completedAt >= startDate &&
      t.completedAt <= endDate
  ).length;
}

/**
 * Group tasks by their state and return counts.
 */
function groupByState(tasks) {
  return tasks.reduce((acc, task) => {
    acc[task.state] = (acc[task.state] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Return tasks whose dueDate falls within the next `days` days.
 */
function getDueSoon(tasks, days = 7) {
  if (!Number.isInteger(days) || days < 0) {
    throw new TypeError('days must be a non-negative integer');
  }
  const now = Date.now();
  const cutoff = now + days * 24 * 60 * 60 * 1000;
  return tasks.filter(
    (t) => t.dueDate instanceof Date && t.dueDate.getTime() > now && t.dueDate.getTime() <= cutoff
  );
}

module.exports = {
  formatDate,
  isOverdue,
  getDaysRemaining,
  countCompletedInRange,
  groupByState,
  getDueSoon,
};
