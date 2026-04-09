'use strict';

const { TaskService } = require('../../src/services/TaskService');
const { TaskState } = require('../../src/models/Task');

describe('TaskService', () => {
  let service;

  beforeEach(() => {
    service = new TaskService();
  });

  describe('createTask()', () => {
    it('creates a task and returns it', () => {
      const task = service.createTask({ title: 'New feature', priority: 'HIGH' });
      expect(task.title).toBe('New feature');
      expect(task.state).toBe(TaskState.PENDING);
    });

    it('assigns an incremental id', () => {
      const t1 = service.createTask({ title: 'Task one' });
      const t2 = service.createTask({ title: 'Task two' });
      expect(t2.id).toBeGreaterThan(t1.id);
    });

    // Missing: test that invalid title propagates the error
    // Missing: test that invalid priority propagates the error
    // Missing: test task with dueDate is stored correctly
  });

  describe('getTask()', () => {
    it('returns the task when found', () => {
      const created = service.createTask({ title: 'Find me' });
      const found = service.getTask(created.id);
      expect(found).toBe(created);
    });

    it('throws when the task does not exist', () => {
      expect(() => service.getTask(9999)).toThrow('Task not found: 9999');
    });
  });

  describe('listTasks()', () => {
    it('returns all tasks when no filter is given', () => {
      service.createTask({ title: 'Task A' });
      service.createTask({ title: 'Task B' });
      expect(service.listTasks()).toHaveLength(2);
    });

    // Missing: test filtering by PENDING
    // Missing: test filtering by IN_PROGRESS
    // Missing: test filtering by COMPLETED
    // Missing: test that an unknown stateFilter throws
    // Missing: test empty store returns empty array
  });

  describe('transitionTask()', () => {
    it('transitions a task to the new state', () => {
      const task = service.createTask({ title: 'Workable task' });
      service.transitionTask(task.id, TaskState.IN_PROGRESS);
      expect(task.state).toBe(TaskState.IN_PROGRESS);
    });

    // Missing: test invalid transition throws
    // Missing: test transitioning non-existent task throws
  });

  // Missing entire describe block for deleteTask()
  // Missing entire describe block for assignTask()
  // Missing entire describe block for getTasksByAssignee()
  // Missing entire describe block for getOverdueTasks()
  // Missing entire describe block for getStats()
});
