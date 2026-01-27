# Code Review Standards

This document provides detailed coding standards for each review dimension.

## Security Standards

### Input Validation

**Always validate:**
- User inputs before processing
- File uploads (type, size, content)
- API request parameters
- Database query parameters

**Validation techniques:**
- Whitelist validation (prefer over blacklist)
- Type checking and conversion
- Length and range limits
- Format validation (email, URL, etc.)

### Authentication & Authorization

**Requirements:**
- Use established authentication libraries (don't roll your own)
- Implement proper session management
- Enforce authorization checks at every endpoint
- Use principle of least privilege

**Anti-patterns:**
- Trusting client-side validation alone
- Using predictable session identifiers
- Missing authorization checks on sensitive operations
- Hardcoded credentials or API keys

### Data Protection

**Sensitive data handling:**
- Encrypt data at rest and in transit
- Use environment variables for secrets
- Implement proper key management
- Hash passwords with modern algorithms (bcrypt, Argon2)
- Sanitize data before logging

### Common Vulnerabilities

**SQL Injection:**
- Use parameterized queries or ORMs
- Never concatenate user input into SQL
- Validate and sanitize all inputs

**Cross-Site Scripting (XSS):**
- Escape output based on context (HTML, JS, URL)
- Use Content Security Policy headers
- Sanitize user-generated content

**Cross-Site Request Forgery (CSRF):**
- Implement CSRF tokens
- Validate origin and referer headers
- Use SameSite cookie attribute

---

## Architecture Standards

### Function Design

**Single Responsibility Principle:**
- Each function should do one thing well
- If you need "and" to describe it, it's doing too much
- Max 50 lines per function (guideline, not hard rule)

**Function signatures:**
- Clear, descriptive names (verbs for actions)
- Limit parameters (3-4 max, use objects for more)
- Consistent parameter ordering
- Return values should be predictable

### Code Organization

**Module structure:**
- Group related functionality
- Clear public vs private interfaces
- Minimize dependencies between modules
- Use dependency injection for testability

**File organization:**
```
src/
├── components/     # UI components
├── services/       # Business logic
├── utils/          # Shared utilities
├── types/          # Type definitions
├── tests/          # Test files
└── config/         # Configuration
```

### Error Handling

**Consistent strategy:**
- Use exceptions for exceptional cases
- Return error values for expected failures
- Never silently swallow errors
- Provide context in error messages

**Error propagation:**
- Handle errors at appropriate levels
- Don't catch and re-throw without adding value
- Log errors with sufficient context
- Return user-friendly error messages

### State Management

**Principles:**
- Minimize mutable state
- Make state changes explicit
- Centralize state when appropriate
- Use immutable data structures when possible

---

## Performance Standards

### Algorithmic Efficiency

**Time complexity:**
- Avoid O(n²) or worse unless n is guaranteed small
- Use appropriate data structures (hash tables, trees)
- Consider trade-offs between time and space

**Database queries:**
- Use indexes on frequently queried columns
- Avoid N+1 queries (use joins or batch loading)
- Limit result sets appropriately
- Use query explanation tools to analyze

### Resource Management

**Memory:**
- Release resources when done (close files, connections)
- Avoid memory leaks (event listeners, closures)
- Use streaming for large data sets
- Limit cache sizes

**Network:**
- Minimize request count (batching, bundling)
- Use compression for large payloads
- Implement timeouts on external calls
- Cache responses when appropriate

### Optimization Guidelines

**When to optimize:**
- Profile before optimizing
- Focus on bottlenecks, not micro-optimizations
- Measure impact of changes
- Don't sacrifice readability without good reason

**Caching strategy:**
- Cache expensive computations
- Use appropriate TTL values
- Implement cache invalidation
- Consider cache size limits

---

## Readability Standards

### Naming Conventions

**Variables:**
- Use descriptive names (`userEmail` not `ue`)
- Booleans should be questions (`isValid`, `hasPermission`)
- Arrays/lists should be plural (`users`, `items`)
- Avoid abbreviations unless universally known

**Functions:**
- Use verb phrases (`calculateTotal`, `fetchUser`)
- Name should describe what it does
- Async functions can use `async` prefix or suffix
- Event handlers: `handleClick`, `onSubmit`

**Classes:**
- Use nouns or noun phrases
- PascalCase for classes
- Descriptive and specific names

### Code Structure

**Formatting:**
- Consistent indentation (2 or 4 spaces)
- Blank lines to separate logical sections
- One statement per line
- Line length limit (80-120 characters)

**Comments:**
- Explain "why," not "what"
- Document complex algorithms
- Update comments when code changes
- Remove commented-out code

**Documentation:**
- Document public APIs
- Include parameter descriptions
- Specify return values and types
- Note exceptions/errors thrown

### Complexity Management

**Keep it simple:**
- Avoid deep nesting (max 3-4 levels)
- Early returns to reduce nesting
- Extract complex conditions to named variables
- Break complex expressions into steps

---

## Testing Standards

### Test Coverage

**What to test:**
- Happy path (expected usage)
- Edge cases (boundary values, empty inputs)
- Error cases (invalid inputs, failures)
- Integration points (external services)

**Coverage goals:**
- Critical business logic: 90%+
- Utilities and helpers: 80%+
- UI components: 70%+
- Overall codebase: 70%+

### Test Quality

**Test structure (AAA pattern):**
```
// Arrange: Set up test data and preconditions
const user = createTestUser();

// Act: Execute the code being tested
const result = processUser(user);

// Assert: Verify the outcome
expect(result.isValid).toBe(true);
```

**Test characteristics:**
- Independent (no shared state between tests)
- Fast (milliseconds, not seconds)
- Deterministic (same result every time)
- Isolated (mock external dependencies)

### Test Types

**Unit tests:**
- Test individual functions/methods
- Mock all dependencies
- Focus on single responsibility
- Fast execution

**Integration tests:**
- Test component interactions
- Use real dependencies where practical
- Test critical user flows
- May be slower

**End-to-end tests:**
- Test complete workflows
- Use production-like environment
- Cover critical business scenarios
- Slowest but highest confidence

---

## Language-Specific Standards

### Python

```python
# Type hints
def calculate_total(items: list[Item]) -> Decimal:
    """Calculate the total price of items."""
    return sum(item.price for item in items)

# Context managers
with open('file.txt') as f:
    content = f.read()

# List comprehensions (when readable)
squared = [x**2 for x in numbers if x > 0]

# Not:
squared = []
for x in numbers:
    if x > 0:
        squared.append(x**2)
```

### JavaScript/TypeScript

```typescript
// TypeScript strict mode
interface User {
  id: string;
  email: string;
  name?: string;
}

// Async/await
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

// Modern ES6+
const { id, email } = user;
const users = [...oldUsers, newUser];
const filtered = users.filter(u => u.isActive);
```

### Go

```go
// Error handling
func ReadFile(path string) ([]byte, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("read file %s: %w", path, err)
    }
    return data, nil
}

// Context usage
func FetchData(ctx context.Context) error {
    req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
    // ...
}

// Defer for cleanup
func ProcessFile(path string) error {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close()
    // ...
}
```

---

## Review Severity Guidelines

### 🔴 Critical (Must Fix)

**Security:**
- SQL injection vulnerabilities
- XSS vulnerabilities
- Hardcoded secrets
- Missing authentication/authorization

**Correctness:**
- Logic errors causing incorrect behavior
- Data corruption risks
- Breaking changes without migration
- Race conditions

**Reliability:**
- Unhandled error cases
- Memory leaks
- Resource exhaustion risks

### 🟡 Suggestion (Should Improve)

**Maintainability:**
- High complexity (could be simplified)
- Code duplication
- Poor naming
- Missing tests

**Performance:**
- N+1 query problems
- Inefficient algorithms
- Missing indexes
- Unnecessary work

**Design:**
- Violations of SOLID principles
- Tight coupling
- Missing abstractions

### 🟢 Nice to Have (Optional)

**Style:**
- Minor formatting inconsistencies
- Comment improvements
- Additional documentation

**Enhancement:**
- Additional test cases
- Performance micro-optimizations
- Refactoring opportunities
