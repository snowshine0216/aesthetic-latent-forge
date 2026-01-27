---
name: code-review
description: Review code for security, performance, readability, testing, architecture, and coding standards. Use when reviewing pull requests, examining code changes, analyzing commits, or when the user asks for a code review.
---

# Code Review

## Instructions

When reviewing code, follow this systematic approach:

### 1. Initial Assessment

- Understand the purpose of the changes
- Identify the scope and files affected
- Note the programming languages involved

### 2. Structured Review Process

Evaluate code across these dimensions in order:

**Security** → **Architecture** → **Performance** → **Readability** → **Testing** → **Standards**

For each dimension, provide findings using severity levels:
- 🔴 **Critical**: Must fix before merge (security issues, bugs, breaking changes)
- 🟡 **Suggestion**: Should improve (performance, maintainability)
- 🟢 **Nice to have**: Optional enhancements (style improvements)

### 3. Review Checklist

Copy and complete this checklist for each review:

```
Code Review Checklist:
- [ ] Security: No vulnerabilities or unsafe patterns
- [ ] Architecture: Design is sound and maintainable
- [ ] Performance: No obvious bottlenecks or inefficiencies
- [ ] Readability: Code is clear and well-documented
- [ ] Testing: Adequate test coverage and quality
- [ ] Standards: Follows project conventions
```

## Output Format

Structure your review report as:

```markdown
# Code Review: [PR/Branch Name]

## Summary
[One paragraph overview: what changed, overall quality, key concerns]

## Findings

### 🔴 Critical Issues
[List critical issues with specific file/line references]

### 🟡 Suggestions
[List improvement suggestions with rationale]

### 🟢 Nice to Have
[Optional enhancements]

## Detailed Analysis

### Security
[Security-specific findings]

### Architecture
[Design and structure findings]

### Performance
[Performance-related findings]

### Readability
[Code clarity and documentation findings]

### Testing
[Test coverage and quality findings]

### Standards
[Coding standards compliance]

## Recommendation
[Overall: Approve / Approve with changes / Request changes]
```

## Review Standards

### Security Review

Check for:
- **Input validation**: All user inputs are validated and sanitized
- **Authentication/Authorization**: Proper access controls are enforced
- **Sensitive data**: No hardcoded secrets, proper encryption for sensitive data
- **Injection vulnerabilities**: SQL injection, XSS, command injection prevention
- **Error handling**: Errors don't leak sensitive information
- **Dependencies**: No known vulnerable dependencies

### Architecture Review

Check for:
- **Single Responsibility**: Functions/classes have clear, focused purposes
- **DRY principle**: No unnecessary code duplication
- **Coupling**: Appropriate separation of concerns
- **Extensibility**: Design allows for future changes
- **Error handling**: Comprehensive and consistent error handling
- **State management**: State changes are predictable and well-managed

### Performance Review

Check for:
- **Algorithmic complexity**: Reasonable time/space complexity
- **Database queries**: N+1 queries, missing indexes, inefficient joins
- **Caching**: Appropriate use of caching for expensive operations
- **Memory leaks**: Proper resource cleanup and disposal
- **Unnecessary work**: Redundant calculations, excessive loops
- **Lazy loading**: Defer expensive operations when possible

### Readability Review

Check for:
- **Naming**: Variables, functions, classes have descriptive names
- **Function length**: Functions are appropriately sized (generally <50 lines)
- **Complexity**: Cyclomatic complexity is reasonable
- **Comments**: Complex logic is explained, not obvious code
- **Documentation**: Public APIs are documented
- **Consistency**: Code style is consistent with project conventions

### Testing Review

Check for:
- **Coverage**: Critical paths and edge cases are tested
- **Test quality**: Tests are clear, focused, and maintainable
- **Test types**: Appropriate mix of unit, integration, e2e tests
- **Mocking**: Dependencies are appropriately mocked/stubbed
- **Test data**: Test data is realistic and covers edge cases
- **Assertions**: Tests verify correct behavior, not implementation

### Standards Review

Check for:
- **Code style**: Follows project linting rules and formatters
- **File organization**: Files are in appropriate directories
- **Import order**: Imports are organized consistently
- **Naming conventions**: Follows project naming patterns
- **Documentation**: Follows project documentation standards
- **Commit messages**: Clear and descriptive (if reviewing commits)

## Language-Specific Considerations

### Python
- PEP 8 compliance
- Type hints for function signatures
- Context managers for resource handling
- List comprehensions over loops where appropriate

### JavaScript/TypeScript
- TypeScript strict mode compliance
- Proper async/await usage
- ESLint rule compliance
- Modern ES6+ features where appropriate

### Go
- Error handling (don't ignore errors)
- Goroutine and channel safety
- Context usage for cancellation
- Proper defer usage

### Java
- Exception handling patterns
- Stream API usage
- Null safety considerations
- Memory management

### Rust
- Ownership and borrowing correctness
- Error handling with Result/Option
- Unsafe code justification
- Clippy warnings addressed

## Common Red Flags

Watch for these issues:

- **Magic numbers**: Unexplained numeric constants
- **God classes/functions**: Overly large or complex units
- **Commented-out code**: Dead code that should be removed
- **TODO comments**: Unfinished work
- **Copy-paste code**: Duplicated logic that should be extracted
- **Overly clever code**: Complex one-liners that sacrifice clarity
- **Missing error handling**: Unchecked return values or exceptions
- **Race conditions**: Concurrent access without synchronization

## Providing Constructive Feedback

When writing feedback:

1. **Be specific**: Reference exact files, lines, and code patterns
2. **Explain why**: Don't just say "fix this," explain the issue and impact
3. **Suggest solutions**: Offer concrete alternatives when possible
4. **Be respectful**: Critique the code, not the person
5. **Acknowledge good work**: Note positive aspects and improvements
6. **Prioritize**: Focus on high-impact issues first

## Example Feedback

**Bad feedback:**
```
This function is bad. Fix it.
```

**Good feedback:**
```
🟡 Suggestion: The `processUserData` function (line 45-78) handles multiple responsibilities:
data validation, transformation, and database operations. Consider splitting into
separate functions for better testability and maintainability:
- `validateUserData(data)` → validation logic
- `transformUserData(data)` → transformation logic  
- `saveUserData(data)` → database operations
```

## Additional Resources

For comprehensive coding standards covering each focus area in detail, see [STANDARDS.md](STANDARDS.md).

For example reviews demonstrating the output format, see [EXAMPLES.md](EXAMPLES.md).
