---
name: qa-plan-review
description: Review QA plans for completeness, accuracy, and technical excellence. Use when the user asks to "review QA plan", "check QA plan quality", or mentions "QA plan audit" or "QA plan feedback".
---

# QA Plan Review

Perform rigorous, professional review of QA plans to ensure technical excellence, comprehensive coverage, and risk mitigation.

## When to Use

- User asks to "review QA plan" or "audit QA plan"
- After orchestrator generates comprehensive QA plan
- User mentions "check QA plan quality" or "validate test coverage"
- Before stakeholder sign-off on QA plan

## Prerequisites

**Required Files**:
- Comprehensive QA plan file (from orchestrator or manual creation)

**Optional Context**:
- Design documents (Confluence)
- Code changes (GitHub PR)
- Requirements (Jira issues)

## Review Framework

Based on `@.cursor/commands/qa-plan-review.md`, review against these criteria:

| Criterion | What to Check |
|-----------|---------------|
| **Structural Integrity** | All required sections present and complete |
| **Technical Depth** | Tests linked to specific components, functions, files |
| **Edge Case Coverage** | Race conditions, error handling, boundary cases |
| **Risk Authenticity** | Mitigations are technically feasible and specific |
| **Traceability** | Links back to requirements, code, design |
| **Completeness** | No gaps between requirements and tests |

## Workflow

### Step 1: Read QA Plan

Read the QA plan file to review:

```bash
# User provides file path
/Users/xuyin/Documents/FeatureTest/QAPlans/qa_plan_comprehensive_login_2026-01-29.md
```

### Step 2: Gather Context (Optional but Recommended)

**Read source documents** to verify claims:

**Atlassian (Requirements)**:
```
Tool: CallMcpTool
Server: user-mcp-atlassian
Tool Name: confluence_get_page
Arguments: { "page_id": "<from QA plan>" }
```

**GitHub (Code Changes)**:
```
Tool: CallMcpTool
Server: user-github
Tool Name: pull_request_read
Arguments: {
  "method": "get_diff",
  "owner": "<owner>",
  "repo": "<repo>",
  "pullNumber": <number>
}
```

**For large contexts**: Save key findings to temp file:
```
.temp_qa_review_analysis_<feature_id>.md
```

### Step 3: Structural Review

Check if all required sections exist:

**Required Sections** (from qa-plan-architect.md):
- [ ] Summary table with all fields
- [ ] Background (Problem Statement, Solution)
- [ ] QA Goals (E2E, FUN, UX, PERF, SEC, ACC, CERT, UPG, INT, AUTO)
- [ ] QA Plan with Test Key Points tables
- [ ] Risk & Mitigation table
- [ ] QA Summary (Code Changes, E2E, Performance, Security, etc.)

**Check formatting**:
- [ ] Tables are properly formatted
- [ ] Priority labels consistent (P0, P1, P2)
- [ ] Status indicators used (✅, ⬜, ❌)
- [ ] Code references include file paths and line numbers

### Step 4: Technical Depth Review

Verify test scenarios are **specific and actionable**:

**❌ Too Generic**:
```
Test: Login works
Expected: User can log in
```

**✅ Specific**:
```
Test: POST /api/login with valid credentials (src/api/auth/login.ts:45)
Expected: 200 OK, JWT token in response.token, expires in 24h
Code Reference: src/api/auth/login.ts:45-67
```

**Check for specificity**:
- [ ] Function names mentioned
- [ ] API endpoints with methods
- [ ] File paths and line numbers
- [ ] Actual data values (hex colors, status codes, timeouts)
- [ ] Database table/column names

### Step 5: Coverage Gap Analysis

**Compare requirements to tests**:

1. **Extract all requirements** from Jira/Confluence references
2. **Extract all test scenarios** from QA plan
3. **Identify gaps**:
   - Requirements without test scenarios
   - Test scenarios without requirement references
   - Edge cases mentioned but not tested

**Example Gap Detection**:
```
Requirement (PROJ-123): "User can reset password"
✅ Tests found:
  - Request password reset
  - Click reset link
  - Submit new password
❌ Missing tests:
  - Expired reset link
  - Multiple reset requests
  - Reset during active session
```

### Step 6: Edge Case & Risk Review

**Check for common edge cases**:

| Category | Edge Cases to Look For |
|----------|------------------------|
| **Authentication** | Concurrent logins, session timeout, password special chars |
| **Data Input** | Empty, null, undefined, very long strings, special characters |
| **API** | Rate limits, timeouts, 4xx/5xx errors, network failures |
| **Database** | Concurrent writes, transaction rollback, constraint violations |
| **UI** | Long text overflow, responsive breakpoints, loading states |

**Verify risk mitigations are specific**:

**❌ Vague Mitigation**:
```
Risk: Security vulnerability
Mitigation: Improve security
```

**✅ Specific Mitigation**:
```
Risk: SQL injection in user search (src/api/users/search.ts:34)
Mitigation: Use parameterized queries with prepared statements (implemented in line 38-42)
Code: src/api/users/search.ts:38-42
```

### Step 7: Generate Review Report

Create review findings file: `qa_plan_review_<feature_id>_<date>.md`

```markdown
# QA Plan Review: [Feature Name]

## 📝 Review Summary

| Field | Value |
|-------|-------|
| **QA Plan Reviewed** | qa_plan_comprehensive_login_2026-01-29.md |
| **Review Date** | [Current Date] |
| **Reviewer** | QA Architect AI |
| **Status** | 🟢 Approved / 🟡 Requires Updates / 🔴 Rejected |

## 🔍 Review Findings

### Overall Assessment

**Status**: 🟡 Requires Updates

**Summary**: The QA plan demonstrates good coverage of functional requirements and includes comprehensive test scenarios. However, several areas need improvement:
- Missing edge case coverage for concurrent operations
- Some test scenarios lack specific code references
- Performance testing targets need clarification
- Security testing could be more thorough

**Overall Score**: 7.5/10

### Strengths ✅

1. **Comprehensive Structure**: All required sections present and well-organized
2. **Good Traceability**: Requirements clearly linked to test scenarios
3. **Risk Assessment**: Technical risks identified with mitigation strategies
4. **Clear Prioritization**: Consistent use of P0, P1, P2 labels

### Areas for Improvement 🟡

#### High Priority Issues

1. **Missing Edge Cases: Concurrent Login Scenarios**
   - **Location**: QA Plan § E2E Workflow Testing → Login Flow
   - **Issue**: No tests for concurrent login from multiple devices
   - **Impact**: Could lead to session management bugs in production
   - **Recommendation**: Add test scenarios:
     - User logs in on Device A, then Device B → Verify session handling
     - User logs in while already logged in → Verify behavior matches design spec
   - **Reference**: Design Doc §4.3 mentions session behavior but not tested

2. **Vague Performance Targets**
   - **Location**: QA Plan § Performance Testing
   - **Issue**: "Login should be fast" is not measurable
   - **Current**: "API response time < 2s"
   - **Recommendation**: Specify p50, p95, p99 percentiles separately
   - **Example**: "p50: <500ms, p95: <2s, p99: <5s under 1000 CCU"

3. **Missing Code References in UI Tests**
   - **Location**: QA Plan § UI Testing → Visual Components
   - **Issue**: Test points don't reference specific component files
   - **Example**: "Button hover state" should reference `src/components/Button.tsx:67-73`
   - **Recommendation**: Add file paths and line numbers for all UI test scenarios

#### Medium Priority Issues

4. **Security Testing Gaps**
   - **Location**: QA Plan § Security Testing
   - **Issue**: Missing tests for:
     - Password reset token expiration
     - Rate limiting on login attempts
     - CSRF protection validation
   - **Recommendation**: Add explicit test scenarios for each security requirement
   - **Reference**: Security review document (link needed)

5. **Incomplete Risk Mitigation Details**
   - **Location**: QA Plan § Risk & Mitigation
   - **Issue**: "Session fixation mitigation: Regenerate session ID" lacks implementation details
   - **Recommendation**: Specify:
     - Which function regenerates session ID?
     - When is it called (before or after login)?
     - How is old session invalidated?
   - **Code Location**: Need reference to actual implementation

6. **Missing Test Data Specifications**
   - **Location**: Multiple sections
   - **Issue**: Test scenarios don't specify exact test data
   - **Recommendation**: Create "Test Data" subsection with:
     - Valid user credentials
     - Invalid input examples
     - Boundary values
     - Special character test cases

### Critical Missing Tests 🔴

7. **Race Condition in Password Reset**
   - **Issue**: Design doc mentions password reset, but QA plan doesn't test race condition scenarios
   - **Missing Test**: What happens if user requests multiple password resets simultaneously?
   - **Recommendation**: Add test scenario for concurrent reset requests
   - **Reference**: Check design doc §5.2 for expected behavior

8. **Database Transaction Rollback**
   - **Issue**: Code changes include database operations but no rollback testing
   - **Missing Test**: Verify transaction rollback on error (e.g., partial user creation failure)
   - **Recommendation**: Add integration test for transaction integrity
   - **Code Reference**: src/models/User.ts:createWithProfile()

### Low Priority Suggestions 💡

9. **Accessibility Testing Detail**
   - **Current**: "Keyboard navigation works"
   - **Suggestion**: Specify exact Tab order and shortcut keys
   - **Enhancement**: Add ARIA attribute validation

10. **Performance Baseline Missing**
    - **Suggestion**: Include current baseline metrics for comparison
    - **Example**: "Current production: p95 = 3.2s, Target: p95 = 2s"

## 🛠️ Action Items

### For QA Plan Author

1. [ ] Add concurrent login test scenarios (Location: E2E Testing section)
   - Reference: Design Doc §4.3
   - Expected test: Login on Device A → Login on Device B → Verify session behavior
   - Expected result: Define based on product requirements (terminate old session or allow both)

2. [ ] Specify performance metrics with percentiles (Location: Performance Testing section)
   - Current: "< 2s response time"
   - Required: "p50: <500ms, p95: <2s, p99: <5s at 1000 CCU"
   - Add load testing methodology

3. [ ] Add code references to all UI test scenarios (Location: UI Testing section)
   - Format: `src/components/Button.tsx:67-73`
   - For each component test, add file path and line numbers
   - Example: "Button hover state (src/components/Button.tsx:67-73)"

4. [ ] Add missing security test scenarios (Location: Security Testing section)
   - Password reset token expiration test
   - Rate limiting test (max 5 attempts per 15 minutes)
   - CSRF protection validation test
   - Reference: Security requirements document

5. [ ] Enhance risk mitigation details (Location: Risk & Mitigation section)
   - Session fixation: Add code reference to regenerateSessionId() function
   - SQL injection: Add specific parameterized query examples
   - XSS prevention: Reference sanitization function

6. [ ] Create Test Data section
   - Valid credentials: List exact test accounts
   - Invalid inputs: List test cases (empty, null, special chars)
   - Boundary values: Max lengths, edge numbers
   - Add section after "Test Key Points"

7. [ ] Add race condition test for password reset (Location: E2E Testing section)
   - Test: Request reset twice within 1 second
   - Expected: Second request invalidates first token OR both tokens valid (per spec)
   - Verify with design doc §5.2

8. [ ] Add database transaction rollback test (Location: Backend Testing section)
   - Test: User creation fails at profile creation step
   - Expected: No user record created, transaction rolled back
   - Code: src/models/User.ts:createWithProfile()

### For Technical Review

9. [ ] Verify session management implementation matches design
   - Review: src/middleware/session.ts
   - Confirm: Session ID regeneration on login
   - Validate: Old session invalidation logic

10. [ ] Review actual performance baselines from production/staging
    - Gather: Current p50, p95, p99 metrics
    - Compare: Against target metrics in QA plan
    - Document: Baseline vs. target in QA plan

## 📊 Coverage Analysis

### Requirements Coverage

| Requirement Source | Total Requirements | Tested | Coverage % | Status |
|--------------------|-------------------|--------|------------|--------|
| PROJ-123 (Jira) | 12 | 11 | 92% | 🟡 Good |
| Design Doc §4 | 8 | 6 | 75% | 🟡 Needs improvement |
| Security Spec | 5 | 3 | 60% | 🔴 Insufficient |

**Missing Coverage**:
- [ ] Requirement: "System locks account after 5 failed attempts" (PROJ-123, AC-4)
- [ ] Requirement: "Password reset link expires in 24 hours" (Design Doc §4.5)

### Test Type Distribution

| Test Type | Count | Coverage % | Status |
|-----------|-------|------------|--------|
| Unit Tests | 45 | 85% | ✅ Good |
| Integration Tests | 12 | 70% | 🟡 Acceptable |
| E2E Tests | 8 | 60% | 🟡 Needs more |
| Performance Tests | 4 | - | ✅ Sufficient |
| Security Tests | 5 | - | 🔴 Insufficient |

### Risk Coverage

| Risk Level | Total Risks | Mitigated | Coverage % |
|------------|-------------|-----------|------------|
| Critical | 3 | 3 | 100% ✅ |
| High | 5 | 4 | 80% 🟡 |
| Medium | 8 | 6 | 75% 🟡 |

**Un-mitigated Risks**:
- High: "User enumeration via error messages" - Mitigation mentioned but not specific
- Medium: "Slow mobile performance" - No concrete optimization plan

## 📎 Reference Materials

### Documents Reviewed

**Design Documents**:
- [User Authentication Design](confluence-url) - Reviewed sections 4.1-4.5
- [API Specification](confluence-url) - Reviewed endpoints
- [Security Requirements](confluence-url) - Reviewed auth requirements

**Code Changes**:
- [GitHub PR #456](github-url) - Reviewed all changed files
- Key files: src/api/auth/login.ts, src/middleware/session.ts

**Requirements**:
- [PROJ-123](jira-url) - Main user story with acceptance criteria
- [PROJ-124](jira-url) - Related: Password reset
- [PROJ-125](jira-url) - Dependency: Rate limiting

### Key Excerpts for Reference

**From Design Doc §4.3 (Session Management)**:
> "When a user logs in from a new device while already authenticated on another device, the system shall maintain both sessions independently. Each session has its own expiration timer (30 minutes of inactivity)."

**Implication**: QA plan must test concurrent sessions are both maintained.

**From Security Spec §2.1 (Rate Limiting)**:
> "Login endpoint must enforce rate limiting of maximum 5 attempts per 15-minute window per IP address."

**Implication**: QA plan must include rate limiting test scenario.

**From PR #456 Commit Message**:
> "Add session ID regeneration on login to prevent session fixation attacks"

**Implication**: QA plan correctly identifies this mitigation but needs code reference.

## 💬 Reviewer Notes

### Positive Observations

- Well-structured document with clear hierarchy
- Good use of tables for test scenarios
- Risk assessment shows understanding of technical challenges
- Prioritization is consistent throughout

### Concerns

- Some test scenarios are too high-level for engineers to execute
- Missing traceability for some code references
- Performance targets need more specificity
- Security testing could be more comprehensive

### Recommendations for Future QA Plans

1. Always include code references (file:line) for each test scenario
2. Specify test data explicitly (don't assume "valid" means the same to everyone)
3. Break down complex E2E tests into specific steps
4. Link each test back to specific acceptance criteria
5. Include baseline metrics for performance comparisons

## 🎯 Next Steps

1. **QA Plan Author**: Address all action items above
2. **Use `qa-plan-refactor` skill**: To systematically implement all action items
3. **Re-review**: After updates, request another review cycle
4. **Stakeholder Review**: Once approved, submit for stakeholder sign-off

## 📝 Sign-off

- **Reviewer**: QA Architect AI
- **Review Complete**: [Timestamp]
- **Status**: 🟡 Requires Updates (see action items above)
- **Re-review Required**: Yes, after action items addressed

---

**Generated by**: `qa-plan-review` skill  
**Review Framework**: Based on @.cursor/commands/qa-plan-review.md  
**Last Updated**: [Timestamp]
```

### Step 8: Save Reference Data

Create reference file: `qa_plan_review_<feature_id>_<date>_references.md`

Include:
- Relevant excerpts from design docs
- Code snippets from PR
- Acceptance criteria from Jira
- Security requirements
- Any other context useful for refactoring

## Review Criteria Details

### Structural Integrity

**Check**:
- All sections from qa-plan-architect.md template present
- Tables properly formatted (markdown syntax)
- Consistent heading levels (H2 for main sections, H3 for subsections)
- Summary table has all required fields

### Technical Depth

**Good indicators**:
- Function names: `validatePassword()`, `createUser()`
- File paths: `src/api/auth/login.ts:45-67`
- API endpoints with methods: `POST /api/login`
- Database tables: `users`, `sessions`
- Specific values: `#1A73E8`, `200 OK`, `24 hours`

**Red flags**:
- Generic descriptions: "Test login functionality"
- No code references: "The login feature works"
- Vague outcomes: "Should work correctly"

### Edge Case Coverage

**Essential edge cases by domain**:

**Authentication**:
- Concurrent sessions
- Session timeout
- Invalid credentials (various formats)
- Account lockout after failed attempts
- Special characters in password

**API**:
- Rate limiting exceeded
- Network timeout
- Invalid request format
- Unauthorized access attempts
- Large payloads

**Database**:
- Concurrent writes (race conditions)
- Transaction rollback scenarios
- Unique constraint violations
- Foreign key constraint violations
- Deadlock scenarios

**UI**:
- Very long text (overflow handling)
- Empty states
- Loading states
- Error states
- Responsive breakpoints

### Risk Authenticity

**Verify mitigations are**:
1. **Technically feasible**: Can actually be implemented
2. **Specific**: References code/design
3. **Testable**: Can be verified
4. **Complete**: Addresses the full risk

**Example good mitigation**:
```
Risk: SQL injection in user search
Impact: Critical
Mitigation:
  - Use parameterized queries (src/db/users.ts:34)
  - Input validation with zod schema (src/schemas/user.ts:12)
  - Test: Send malicious SQL in search query
  - Expected: Query fails safely, no injection
```

## Integration with Other Skills

**Input from**:
- `qa-plan-architect-orchestrator`: Comprehensive plan to review
- `qa-plan-figma`: Design analysis for UI verification
- `qa-plan-github`: Code analysis for technical verification
- `qa-plan-atlassian`: Requirements for coverage verification

**Output to**:
- `qa-plan-refactor`: Action items for systematic updates

## Error Handling

**If QA plan file not found**:
1. Ask user to provide file path
2. List available QA plan files in default directory
3. Confirm which file to review

**If source documents unavailable**:
1. Review based on QA plan alone
2. Note that verification against sources couldn't be done
3. Recommend follow-up verification

**If QA plan is too large**:
1. Process in sections (save findings to temp file)
2. Review summary sections first
3. Deep-dive into specific areas user is concerned about

## Best Practices

### Be Constructive

- Always start with positive findings
- Frame issues as "opportunities for improvement"
- Provide specific, actionable recommendations
- Include examples of how to fix issues

### Be Thorough

- Check every section against template
- Verify technical claims when possible
- Look for gaps between requirements and tests
- Consider edge cases that might be missed

### Be Specific

- Reference exact locations (section names, line numbers)
- Provide concrete examples of improvements
- Link to source documents
- Suggest exact wording or test scenarios

### Think Like a Stakeholder

Consider different perspectives:
- **QA Engineer**: Can they execute these tests?
- **Developer**: Are code references accurate?
- **Product Manager**: Are requirements covered?
- **Security**: Are risks properly addressed?

## Example Usage

**User Request**:
> "Review the comprehensive QA plan for the login feature"

**Skill Actions**:
1. Read `qa_plan_comprehensive_login_2026-01-29.md`
2. Read referenced design doc from Confluence (optional)
3. Read referenced PR from GitHub (optional)
4. Check structural integrity (all sections present)
5. Review technical depth (code references specific)
6. Analyze coverage gaps (requirements vs tests)
7. Evaluate edge case coverage
8. Assess risk mitigations
9. Generate review findings
10. Create action items list
11. Save review report and reference materials
12. Present summary to user

## Notes

- Review is based on standards in `qa-plan-architect.md` command
- Focus on actionable feedback, not just finding problems
- Always provide specific recommendations with examples
- Link findings to source documents when available
- Update review status after refactoring addresses issues
