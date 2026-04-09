'use strict';

const { User, UserRole } = require('../models/User');

let nextUserId = 1;

class UserService {
  constructor() {
    this._users = new Map();
  }

  /**
   * Create a new user. Email must be unique.
   */
  createUser({ name, email, role }) {
    const existing = this._findByEmail(email);
    if (existing) {
      throw new Error(`A user with email ${email} already exists`);
    }
    const user = new User({ id: nextUserId++, name, email, role });
    this._users.set(user.id, user);
    return user;
  }

  /**
   * Retrieve a user by id; throws if not found.
   */
  getUser(id) {
    const user = this._users.get(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }
    return user;
  }

  /**
   * Return all active users, optionally filtered by role.
   */
  listUsers(roleFilter = null) {
    const all = Array.from(this._users.values()).filter((u) => u.isActive);
    if (roleFilter) {
      if (!Object.values(UserRole).includes(roleFilter)) {
        throw new Error(`Unknown role filter: ${roleFilter}`);
      }
      return all.filter((u) => u.role === roleFilter);
    }
    return all;
  }

  /**
   * Update a user's role (admin only).
   */
  updateRole(requesterId, targetId, newRole) {
    const requester = this.getUser(requesterId);
    if (!requester.hasPermission('assign')) {
      throw new Error(`User ${requesterId} does not have permission to change roles`);
    }
    if (!Object.values(UserRole).includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`);
    }
    const target = this.getUser(targetId);
    target.role = newRole;
    return target;
  }

  /**
   * Deactivate a user account.
   */
  deactivateUser(id) {
    const user = this.getUser(id);
    user.deactivate();
    return user;
  }

  /**
   * Return counts grouped by role.
   */
  getRoleStats() {
    const users = Array.from(this._users.values()).filter((u) => u.isActive);
    return users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});
  }

  _findByEmail(email) {
    const normalised = email.toLowerCase();
    return Array.from(this._users.values()).find((u) => u.email === normalised) || null;
  }
}

module.exports = { UserService };
