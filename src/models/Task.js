'use strict';

const { validateTaskTitle, validatePriority } = require('../utils/validator');

const TaskState = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

// Which transitions are allowed from each state
const VALID_TRANSITIONS = {
  [TaskState.PENDING]: [TaskState.IN_PROGRESS],
  [TaskState.IN_PROGRESS]: [TaskState.COMPLETED, TaskState.PENDING],
  [TaskState.COMPLETED]: [],
};

class Task {
  constructor({ id, title, description = '', priority = 'MEDIUM', assigneeId = null, dueDate = null }) {
    validateTaskTitle(title);
    validatePriority(priority);

    this.id = id;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.assigneeId = assigneeId;
    this.dueDate = dueDate ? new Date(dueDate) : null;
    this.state = TaskState.PENDING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.completedAt = null;
    this.history = [{ state: TaskState.PENDING, at: this.createdAt }];
  }

  transition(nextState) {
    const allowed = VALID_TRANSITIONS[this.state];
    if (!allowed) {
      throw new Error(`Unknown current state: ${this.state}`);
    }
    if (!allowed.includes(nextState)) {
      throw new Error(
        `Invalid transition: ${this.state} → ${nextState}. ` +
        `Allowed: [${allowed.join(', ') || 'none'}]`
      );
    }
    this.state = nextState;
    this.updatedAt = new Date();
    if (nextState === TaskState.COMPLETED) {
      this.completedAt = this.updatedAt;
    } else {
      this.completedAt = null;
    }
    this.history.push({ state: nextState, at: this.updatedAt });
    return this;
  }

  start() {
    return this.transition(TaskState.IN_PROGRESS);
  }

  complete() {
    return this.transition(TaskState.COMPLETED);
  }

  revert() {
    return this.transition(TaskState.PENDING);
  }

  isOverdue() {
    if (!this.dueDate) return false;
    if (this.state === TaskState.COMPLETED) return false;
    return new Date() > this.dueDate;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      assigneeId: this.assigneeId,
      dueDate: this.dueDate,
      state: this.state,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
      history: this.history,
    };
  }
}

module.exports = { Task, TaskState, VALID_TRANSITIONS };
