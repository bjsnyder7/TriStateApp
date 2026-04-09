'use strict';

const { Task, TaskState } = require('../models/Task');
const { validatePositiveInteger } = require('../utils/validator');

let nextId = 1;

class TaskService {
  constructor() {
    this._tasks = new Map();
  }

  /**
   * Create a new task and persist it in memory.
   */
  createTask({ title, description, priority, assigneeId, dueDate }) {
    const task = new Task({
      id: nextId++,
      title,
      description,
      priority,
      assigneeId,
      dueDate,
    });
    this._tasks.set(task.id, task);
    return task;
  }

  /**
   * Retrieve a task by id; throws if not found.
   */
  getTask(id) {
    const task = this._tasks.get(id);
    if (!task) {
      throw new Error(`Task not found: ${id}`);
    }
    return task;
  }

  /**
   * Return all tasks, optionally filtered by state.
   */
  listTasks(stateFilter = null) {
    const all = Array.from(this._tasks.values());
    if (stateFilter) {
      if (!Object.values(TaskState).includes(stateFilter)) {
        throw new Error(`Unknown state filter: ${stateFilter}`);
      }
      return all.filter((t) => t.state === stateFilter);
    }
    return all;
  }

  /**
   * Transition a task to the next state.
   */
  transitionTask(id, newState) {
    const task = this.getTask(id);
    task.transition(newState);
    return task;
  }

  /**
   * Delete a task. Throws if the task is IN_PROGRESS.
   */
  deleteTask(id) {
    const task = this.getTask(id);
    if (task.state === TaskState.IN_PROGRESS) {
      throw new Error(`Cannot delete an in-progress task (id: ${id}). Revert it to PENDING first.`);
    }
    this._tasks.delete(id);
    return true;
  }

  /**
   * Reassign a task to a different user.
   */
  assignTask(id, assigneeId) {
    validatePositiveInteger(assigneeId, 'assigneeId');
    const task = this.getTask(id);
    if (task.state === TaskState.COMPLETED) {
      throw new Error(`Cannot reassign a completed task (id: ${id})`);
    }
    task.assigneeId = assigneeId;
    task.updatedAt = new Date();
    return task;
  }

  /**
   * Return all tasks assigned to a specific user.
   */
  getTasksByAssignee(assigneeId) {
    return Array.from(this._tasks.values()).filter(
      (t) => t.assigneeId === assigneeId
    );
  }

  /**
   * Return all tasks that are past their due date and not yet completed.
   */
  getOverdueTasks() {
    const now = new Date();
    return Array.from(this._tasks.values()).filter(
      (t) => t.dueDate && t.dueDate < now && t.state !== TaskState.COMPLETED
    );
  }

  /**
   * Return summary statistics.
   */
  getStats() {
    const tasks = Array.from(this._tasks.values());
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.state === TaskState.PENDING).length,
      inProgress: tasks.filter((t) => t.state === TaskState.IN_PROGRESS).length,
      completed: tasks.filter((t) => t.state === TaskState.COMPLETED).length,
      overdue: this.getOverdueTasks().length,
    };
  }
}

module.exports = { TaskService };
