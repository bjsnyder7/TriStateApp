'use strict';

const { validateEmail } = require('../utils/validator');

const UserRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
};

class User {
  constructor({ id, name, email, role = UserRole.MEMBER }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('User name must be a non-empty string');
    }
    validateEmail(email);

    if (!Object.values(UserRole).includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${Object.values(UserRole).join(', ')}`);
    }

    this.id = id;
    this.name = name.trim();
    this.email = email.toLowerCase();
    this.role = role;
    this.createdAt = new Date();
    this.isActive = true;
  }

  hasPermission(action) {
    const permissions = {
      [UserRole.ADMIN]: ['create', 'read', 'update', 'delete', 'assign'],
      [UserRole.MEMBER]: ['create', 'read', 'update'],
      [UserRole.VIEWER]: ['read'],
    };
    return (permissions[this.role] || []).includes(action);
  }

  deactivate() {
    if (!this.isActive) {
      throw new Error(`User ${this.id} is already deactivated`);
    }
    this.isActive = false;
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }
}

module.exports = { User, UserRole };
