# Code Review Examples

This document provides example reviews demonstrating the structured output format.

---

## Example 1: Backend API Endpoint

**Code being reviewed:**

```python
# api/routes/users.py
@app.route('/api/users/<id>', methods=['GET'])
def get_user(id):
    user = db.execute("SELECT * FROM users WHERE id = " + id)
    return jsonify(user)
```

**Review output:**

```markdown
# Code Review: Add User API Endpoint

## Summary
This PR adds a GET endpoint for retrieving user data. The implementation has a critical security vulnerability (SQL injection) and lacks proper error handling. The endpoint needs significant changes before merging.

## Findings

### 🔴 Critical Issues

1. **SQL Injection Vulnerability** (api/routes/users.py:3)
   - The `id` parameter is directly concatenated into the SQL query
   - An attacker could inject malicious SQL (e.g., `/api/users/1 OR 1=1`)
   - **Fix:** Use parameterized queries: `db.execute("SELECT * FROM users WHERE id = ?", (id,))`

2. **Missing Error Handling** (api/routes/users.py:3-4)
   - No handling for cases where user doesn't exist
   - Database errors will expose stack traces to clients
   - **Fix:** Add try-catch and return appropriate HTTP status codes (404, 500)

3. **Missing Authentication** (api/routes/users.py:2)
   - Endpoint is publicly accessible without authentication
   - User data is sensitive and should require authentication
   - **Fix:** Add `@require_auth` decorator

### 🟡 Suggestions

1. **Type Validation** (api/routes/users.py:2)
   - The `id` parameter should be validated as an integer
   - **Suggestion:** Add validation: `id = int(id)` with error handling

2. **Return Sensitive Data** (api/routes/users.py:4)
   - Returning all user fields including password hash
   - **Suggestion:** Use a serializer to exclude sensitive fields

### 🟢 Nice to Have

1. **Add Type Hints** (api/routes/users.py:2)
   - Function lacks type hints for parameters and return value
   - **Enhancement:** `def get_user(id: str) -> Response:`

## Detailed Analysis

### Security
- **Critical:** SQL injection vulnerability must be fixed immediately
- **Critical:** Missing authentication exposes user data
- No input validation allows invalid data

### Architecture
- Function is reasonably focused
- Could benefit from separating database logic from route handler
- Consider creating a `UserService` class for business logic

### Performance
- No caching for frequently accessed users
- Consider adding caching layer for better performance

### Readability
- Function is short and clear
- Would benefit from docstring explaining parameters and return value

### Testing
- No tests provided for this endpoint
- Need tests for: valid user, nonexistent user, SQL injection attempts

### Standards
- Missing docstring
- Missing type hints
- Not following project pattern for error responses

## Recommendation
**Request Changes** - Critical security issues must be addressed before this can be merged.

## Suggested Implementation

```python
@app.route('/api/users/<id>', methods=['GET'])
@require_auth
def get_user(id: str) -> Response:
    """Retrieve a user by ID.
    
    Args:
        id: User ID as string
        
    Returns:
        JSON response with user data or error
    """
    try:
        user_id = int(id)
    except ValueError:
        return jsonify({'error': 'Invalid user ID'}), 400
    
    try:
        user = db.execute(
            "SELECT id, email, name, created_at FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify(dict(user)), 200
        
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500
```
```

---

## Example 2: Frontend React Component

**Code being reviewed:**

```tsx
// components/UserList.tsx
import React, { useEffect, useState } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
```

**Review output:**

```markdown
# Code Review: User List Component

## Summary
This PR adds a user list component. The implementation works for the happy path but lacks error handling, TypeScript types, and accessibility features. Good use of hooks and conditional rendering.

## Findings

### 🔴 Critical Issues

1. **Missing Error Handling** (components/UserList.tsx:8-14)
   - Network errors or API failures are not handled
   - Users will see "Loading..." forever if the request fails
   - **Fix:** Add error state and `.catch()` handler

2. **Memory Leak Risk** (components/UserList.tsx:8-14)
   - Effect doesn't clean up if component unmounts during fetch
   - Can cause "setState on unmounted component" warnings
   - **Fix:** Use AbortController to cancel pending requests

### 🟡 Suggestions

1. **Missing TypeScript Types** (components/UserList.tsx:5)
   - `users` array has `any[]` type
   - Reduces type safety and IDE support
   - **Suggestion:** Define `interface User { id: number; name: string }` and type the state

2. **Accessibility** (components/UserList.tsx:17-25)
   - List has no semantic meaning
   - Loading state should announce to screen readers
   - **Suggestion:** Add `role="status"` to loading message, use semantic HTML

3. **Component Testability** (components/UserList.tsx:8)
   - Direct fetch call makes testing difficult
   - **Suggestion:** Extract API call to a custom hook or service

### 🟢 Nice to Have

1. **Empty State** (components/UserList.tsx:17-25)
   - No handling for empty user list
   - **Enhancement:** Add message when `users.length === 0`

2. **Loading State UX** (components/UserList.tsx:19)
   - Basic loading text could be improved
   - **Enhancement:** Use a proper loading spinner component

## Detailed Analysis

### Security
- No sensitive data handling issues
- Consider sanitizing user names if they contain user-generated content

### Architecture
- Component has single responsibility (good)
- Could benefit from separating data fetching logic
- Consider creating a `useUsers` custom hook

### Performance
- Users are fetched on every mount
- Consider caching or using a data fetching library (React Query, SWR)
- List renders efficiently with proper keys

### Readability
- Code is clean and easy to understand
- Variable names are descriptive
- Good use of conditional rendering

### Testing
- No tests provided
- Should test: loading state, successful data display, error handling

### Standards
- Missing TypeScript types
- Component should be memoized if parent re-renders frequently
- Consider using proper CSS modules instead of inline styles

## Recommendation
**Approve with Changes** - Address critical error handling issues, then merge.

## Suggested Implementation

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListProps {}

const UserList: React.FC<UserListProps> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    fetch('/api/users', { signal: abortController.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        return res.json();
      })
      .then((data: User[]) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Failed to load users. Please try again.');
          setLoading(false);
        }
      });

    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <div role="status" aria-live="polite">
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <ul aria-label="User list">
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

export default UserList;
```
```

---

## Example 3: Database Migration

**Code being reviewed:**

```sql
-- migrations/004_add_user_preferences.sql
ALTER TABLE users ADD COLUMN preferences TEXT;
UPDATE users SET preferences = '{}';
```

**Review output:**

```markdown
# Code Review: Add User Preferences Migration

## Summary
This migration adds a preferences column to the users table. The implementation has potential issues with backwards compatibility and lacks a rollback strategy.

## Findings

### 🔴 Critical Issues

1. **No Rollback Migration** (migrations/004_add_user_preferences.sql)
   - Missing `DOWN` migration to undo changes
   - Makes it impossible to rollback if issues arise
   - **Fix:** Add corresponding rollback: `ALTER TABLE users DROP COLUMN preferences;`

2. **No Transaction Wrapper**
   - DDL and DML statements not wrapped in transaction
   - Partial failures could leave database in inconsistent state
   - **Fix:** Wrap in `BEGIN; ... COMMIT;`

### 🟡 Suggestions

1. **Column Nullability** (line 1)
   - Column doesn't specify NULL/NOT NULL
   - Current implementation allows NULL after update
   - **Suggestion:** Explicitly specify: `ADD COLUMN preferences TEXT NOT NULL DEFAULT '{}'`

2. **Default Value Strategy** (line 2)
   - Empty object `{}` may not be valid for all use cases
   - Consider if default should be more specific
   - **Suggestion:** Document what fields are expected in the JSON

3. **Potential Performance Impact** (line 2)
   - `UPDATE` without `WHERE` will lock entire table
   - Could cause downtime on large tables
   - **Suggestion:** If table is large, use batched updates or set DEFAULT instead

### 🟢 Nice to Have

1. **Add Index**
   - If preferences will be queried frequently
   - **Enhancement:** Consider adding GIN index for JSONB queries (if using PostgreSQL)

2. **Documentation**
   - Missing comments explaining the purpose
   - **Enhancement:** Add comment describing preferences structure

## Detailed Analysis

### Security
- No security issues
- Ensure preferences don't contain sensitive data without encryption

### Architecture
- Column addition is straightforward
- Consider if preferences should be a separate table for better normalization

### Performance
- UPDATE on all rows could be slow on large tables
- Setting DEFAULT clause would avoid the UPDATE entirely
- No index added (may or may not be needed)

### Readability
- Migration is clear and simple
- Would benefit from comments

### Testing
- Should test migration on production-sized dataset
- Verify rollback works correctly
- Check performance impact

### Standards
- Missing UP/DOWN separation
- Missing transaction wrapper
- Follows naming convention for migrations

## Recommendation
**Request Changes** - Add rollback migration and transaction wrapper.

## Suggested Implementation

```sql
-- migrations/004_add_user_preferences.sql
-- UP Migration
BEGIN;

-- Add preferences column with default
ALTER TABLE users 
ADD COLUMN preferences TEXT NOT NULL DEFAULT '{}';

-- No UPDATE needed since DEFAULT handles it

-- Optional: Add comment
COMMENT ON COLUMN users.preferences IS 'JSON object storing user preferences (theme, language, etc.)';

COMMIT;

-- DOWN Migration (in separate file or section)
BEGIN;

ALTER TABLE users DROP COLUMN preferences;

COMMIT;
```

**Alternative approach for large tables:**

```sql
-- For tables with millions of rows, use batched approach
BEGIN;

ALTER TABLE users 
ADD COLUMN preferences TEXT;

-- Set default for future rows
ALTER TABLE users 
ALTER COLUMN preferences SET DEFAULT '{}';

-- Update in batches (run separately, not in migration)
-- UPDATE users SET preferences = '{}' 
-- WHERE id >= ? AND id < ? AND preferences IS NULL;

COMMIT;
```
```

---

## Summary

These examples demonstrate:

1. **Structured format** with clear severity levels
2. **Specific feedback** with file/line references
3. **Actionable suggestions** with code examples
4. **Comprehensive analysis** across all dimensions
5. **Constructive tone** that's respectful and helpful
6. **Clear recommendation** on merge readiness
