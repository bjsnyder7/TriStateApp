'use strict';

const { Task, TaskState } = require('../../src/models/Task');

describe('Task model', () => {
  describe('constructor', () => {
    it('creates a task with default state PENDING', () => {
      const task = new Task({ id: 1, title: 'Write tests' });
      expect(task.state).toBe(TaskState.PENDING);
      expect(task.title).toBe('Write tests');
      expect(task.id).toBe(1);
    });

    it('applies default priority MEDIUM', () => {
      const task = new Task({ id: 1, title: 'Write tests' });
      expect(task.priority).toBe('MEDIUM');
    });

    it('accepts a custom priority', () => {
      const task = new Task({ id: 2, title: 'Urgent fix', priority: 'HIGH' });
      expect(task.priority).toBe('HIGH');
    });

    it('stores a dueDate as a Date object', () => {
      const due = '2025-12-31';
      const task = new Task({ id: 3, title: 'Deadline task', dueDate: due });
      expect(task.dueDate).toBeInstanceOf(Date);
    });

    // Missing: test that invalid title throws
    // Missing: test that invalid priority throws
    // Missing: test that null/undefined title throws
    // Missing: test that title at boundary lengths (2 chars, 3 chars, 200 chars, 201 chars)
  });

  describe('start()', () => {
    it('transitions PENDING → IN_PROGRESS', () => {
      const task = new Task({ id: 1, title: 'My task' });
      task.start();
      expect(task.state).toBe(TaskState.IN_PROGRESS);
    });

    it('records the transition in history', () => {
      const task = new Task({ id: 1, title: 'My task' });
      task.start();
      expect(task.history).toHaveLength(2);
      expect(task.history[1].state).toBe(TaskState.IN_PROGRESS);
    });

    // Missing: test calling start() twice throws
    // Missing: test calling start() on a COMPLETED task throws
  });

  describe('complete()', () => {
    it('transitions IN_PROGRESS → COMPLETED and sets completedAt', () => {
      const task = new Task({ id: 1, title: 'My task' });
      task.start();
      task.complete();
      expect(task.state).toBe(TaskState.COMPLETED);
      expect(task.completedAt).toBeInstanceOf(Date);
    });

    // Missing: test that completing a PENDING task (without starting) throws
    // Missing: test that completing an already-COMPLETED task throws
  });

  // Missing entire describe block for revert()
  // Missing entire describe block for isOverdue()
  // Missing entire describe block for toJSON()
});
