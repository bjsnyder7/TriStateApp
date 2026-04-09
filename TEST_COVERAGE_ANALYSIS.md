# Test Coverage Analysis — TriStateApp

> Generated: 2026-04-09  
> Test runner: Jest 29  
> Command: `npm run test:coverage`

---

## Summary

| Metric     | Current | Target |
|------------|---------|--------|
| Statements | 30.4%   | ≥ 80%  |
| Branches   | 18.6%   | ≥ 75%  |
| Functions  | 22.2%   | ≥ 80%  |
| Lines      | 31.5%   | ≥ 80%  |

**15 tests across 3 test files.** Three source files have 0% coverage. Branch coverage is the lowest metric and the most actionable gap.

---

## Per-file Breakdown

| File                       | Stmts | Branches | Funcs | Lines | Priority |
|----------------------------|-------|----------|-------|-------|----------|
| `src/models/Task.js`       | 76%   | 56%      | 57%   | 81%   | Medium   |
| `src/models/User.js`       | 0%    | 0%       | 0%    | 0%    | High     |
| `src/services/TaskService.js` | 41% | 29%    | 31%   | 42%   | High     |
| `src/services/UserService.js` | 0%  | 0%     | 0%    | 0%    | High     |
| `src/utils/validator.js`   | 52%   | 26%      | 60%   | 52%   | High     |
| `src/utils/dateHelper.js`  | 0%    | 0%       | 0%    | 0%    | Medium   |

---

## Improvement Areas (Prioritised)

### 1. `src/utils/validator.js` — Error-path branches (HIGH)

**Why it matters:** Validators are called everywhere in the codebase. Untested error branches mean invalid data could silently slip through or produce misleading errors in production.

**What's missing:**

- `validateTaskTitle`: only the happy path is tested indirectly through `Task`. Missing:
  - Non-string input → `TypeError`
  - Title shorter than 3 characters → `Error`
  - Title exactly 3 and 200 characters (boundary values)
  - Title longer than 200 characters → `Error`

- `validatePriority`: zero direct tests. Missing:
  - Each valid priority string passes
  - Any invalid string throws

- `validateDateRange`: zero tests. Missing:
  - Non-Date arguments throw `TypeError`
  - `startDate >= endDate` throws `Error`
  - Valid range returns `true`

- `validatePositiveInteger`: zero tests. Missing:
  - Zero, negative numbers, floats, strings all throw

**Suggested test file:** `tests/utils/validator.test.js` (currently has 2 tests; needs ~15 more)

---

### 2. `src/models/User.js` — Completely untested (HIGH)

**Why it matters:** `User` is the second core domain model. Permission checks gate every write operation in `UserService`; if `hasPermission()` has a bug it won't be caught.

**What's missing (entire file):**

- Constructor happy paths for each `UserRole`
- Constructor validation: empty name, invalid email, unknown role all throw
- `hasPermission()` for every (`role`, `action`) combination — especially the boundaries:
  - VIEWER cannot `update`
  - MEMBER cannot `delete` or `assign`
  - ADMIN can do everything
- `deactivate()` sets `isActive = false`
- Calling `deactivate()` twice throws
- `toJSON()` serialises correctly and does not expose internal state

**Suggested test file:** `tests/models/User.test.js` (new file, ~20 tests)

---

### 3. `src/services/TaskService.js` — Service methods untested (HIGH)

**Why it matters:** `TaskService` is the primary integration layer. Several methods — `deleteTask`, `assignTask`, `getOverdueTasks`, `getStats` — have zero test coverage.

**What's missing:**

- `listTasks(stateFilter)`:
  - Returns only PENDING tasks when filtered
  - Returns only IN_PROGRESS tasks when filtered
  - Throws on unknown filter string
  - Returns `[]` on empty store

- `deleteTask(id)`:
  - Deletes a PENDING task successfully
  - Deletes a COMPLETED task successfully
  - **Throws** when task is IN_PROGRESS (this error path is entirely uncovered)
  - Throws when id doesn't exist

- `assignTask(id, assigneeId)`:
  - Assigns a task to a valid user id
  - Throws on non-positive `assigneeId`
  - **Throws** when task is already COMPLETED

- `getTasksByAssignee(assigneeId)`:
  - Returns only tasks belonging to that assignee
  - Returns `[]` when none match

- `getOverdueTasks()`:
  - Returns tasks past their `dueDate` that are not COMPLETED
  - Does not return tasks with no `dueDate`
  - Does not return COMPLETED tasks even if past due

- `getStats()`:
  - Counts are correct across all three states
  - `overdue` count is correct

**Suggested test file:** `tests/services/TaskService.test.js` (currently 7 tests; needs ~18 more)

---

### 4. `src/services/UserService.js` — Completely untested (HIGH)

**Why it matters:** Handles user lifecycle including role promotion, which is a security-sensitive operation.

**What's missing (entire file):**

- `createUser()`: happy path, duplicate email throws
- `getUser()`: found and not-found cases
- `listUsers(roleFilter)`: all active users, filtered by role, unknown role throws
- `updateRole()`: requester without ADMIN role is rejected; valid promotion succeeds
- `deactivateUser()`: sets user inactive; double-deactivation throws
- `getRoleStats()`: correct counts, excludes inactive users

**Suggested test file:** `tests/services/UserService.test.js` (new file, ~20 tests)

---

### 5. `src/models/Task.js` — Error paths and missing methods (MEDIUM)

**Why it matters:** The state machine is the core business rule of the app. Every invalid transition must be provably rejected.

**What's missing:**

- `transition()` error paths:
  - `PENDING → COMPLETED` throws (must start first)
  - `COMPLETED → IN_PROGRESS` throws (can't reopen a completed task)
  - `start()` called twice in a row throws

- `revert()` method: zero tests
  - IN_PROGRESS → PENDING works
  - Calling `revert()` from PENDING throws

- `isOverdue()`:
  - Returns `false` when no `dueDate` is set
  - Returns `false` when task is COMPLETED (even if past due)
  - Returns `true` when `dueDate` is in the past and state is not COMPLETED
  - Returns `false` when `dueDate` is in the future

- Constructor validation (currently tested only via Task indirectly):
  - Title shorter than 3 characters throws
  - Invalid priority throws
  - Title of type number throws TypeError

- `toJSON()`:
  - All fields are present
  - `completedAt` is null before completion, Date after

**Suggested test file:** `tests/models/Task.test.js` (currently 8 tests; needs ~14 more)

---

### 6. `src/utils/dateHelper.js` — Completely untested (MEDIUM)

**Why it matters:** Utility functions with date arithmetic are notoriously bug-prone. `getDueSoon` and `countCompletedInRange` involve range logic that needs boundary testing.

**What's missing (entire file):**

- `formatDate()`: valid date, invalid date throws, zero-padded month/day
- `isOverdue()`: past date returns true, future date returns false, invalid input throws
- `getDaysRemaining()`: positive and negative values, invalid input throws
- `countCompletedInRange()`: tasks inside/outside/on the boundary of the range
- `groupByState()`: empty array, mixed states
- `getDueSoon()`: tasks within window, tasks outside window, negative `days` throws

**Suggested test file:** `tests/utils/dateHelper.test.js` (new file, ~18 tests)

---

## Cross-cutting Gaps

Beyond individual files, the test suite lacks:

| Gap | Description |
|-----|-------------|
| **Integration tests** | No test exercises `UserService` + `TaskService` together (e.g. assign a task to a real user, then deactivate the user). |
| **Boundary value testing** | Title length boundaries (2/3/200/201 chars) are unexercised. |
| **Empty-collection edge cases** | `listTasks()`, `getTasksByAssignee()`, `listUsers()` are never called on empty stores. |
| **Concurrency / ID collisions** | The global `nextId` counter in `TaskService` and `UserService` is never reset between tests (use `beforeEach` with fresh instances and reset the counter). |

---

## Recommended Next Steps

1. Add `tests/models/User.test.js` and `tests/utils/dateHelper.test.js` — these are new files with zero coverage today.
2. Expand `tests/utils/validator.test.js` to cover all five exported functions with both happy-path and error branches.
3. Expand `tests/services/TaskService.test.js` with blocks for `deleteTask`, `assignTask`, `getOverdueTasks`, and `getStats`.
4. Add `tests/services/UserService.test.js`, paying special attention to the `updateRole` permission check.
5. Add a `tests/integration/` directory with at least one end-to-end flow (create user → create task → assign → complete → verify stats).
6. Set a coverage threshold in `package.json` (≥ 80% lines/functions, ≥ 75% branches) so CI fails automatically when coverage regresses.
