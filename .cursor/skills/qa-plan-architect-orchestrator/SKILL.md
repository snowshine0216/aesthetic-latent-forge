---
name: qa-plan-architect-orchestrator
description: Orchestrates and consolidates QA plans from Figma, GitHub, and Atlassian sources into a comprehensive user-facing QA plan. Use when the user asks to "consolidate QA plans", "merge QA analysis", or "create final QA plan" after running individual analysis skills.
---

# QA Plan Architect Orchestrator

Consolidate QA plans from Figma design analysis, GitHub PR analysis, and Atlassian requirements analysis into a comprehensive, user-facing QA plan document.

## When to Use

- User has run multiple QA plan generation skills (figma, github, atlassian)
- User asks to "consolidate QA plans" or "merge QA analysis"
- User wants a "comprehensive QA plan" combining all sources
- All partial QA plans are ready for integration

## Prerequisites

At least ONE of the following partial plans should exist:
- `qa_plan_figma_<feature_id>_<date>.md`
- `qa_plan_github_<feature_id>_<date>.md`
- `qa_plan_atlassian_<feature_id>_<date>.md`

## Workflow

### Step 1: Gather Input Plans

**Locate existing partial plans**:
```bash
# Check default location
ls /Users/xuyin/Documents/FeatureTest/QAPlans/qa_plan_*
```

Ask user which plans to consolidate if multiple exist, or auto-detect the most recent set based on `<feature_id>` and `<date>`.

### Step 2: Read and Parse All Plans

Read each available plan file:
1. **Figma plan**: UI components, visual tests, E2E workflows
2. **GitHub plan**: Code changes, risk areas, test scenarios
3. **Atlassian plan**: Requirements, acceptance criteria, business context

**Extract key data from each**:
- Summary metadata (URLs, dates, priorities)
- Test scenarios and key points
- Risk assessments
- Reference data
- Coverage metrics

### Step 3: Consolidate Information

**Merge strategy**:

| Section | Consolidation Approach |
|---------|------------------------|
| **Summary** | Combine all sources into one table |
| **Background** | Use Atlassian (requirements) as primary, add context from others |
| **QA Goals** | Merge all goals, deduplicate, categorize by type (E2E, FUN, UX, PERF, SEC, ACC, CERT, UPG, INT, AUTO) |
| **Test Key Points** | Combine tables from all sources, organize by category |
| **Risk & Mitigation** | Merge risk tables, cross-reference code and design |
| **QA Summary** | Aggregate code changes, testing status, and results |

### Step 4: Generate Comprehensive Plan

Create a markdown file: `qa_plan_comprehensive_<feature_id>_<date>.md`

```markdown
# Comprehensive QA Plan: [Feature Name]

## 📊 Summary

| Field | Value |
|-------|-------|
| **Feature Link** | [Jira/Confluence URL] |
| **Release Version** | [Version] |
| **QA Owner** | [Name/Team] |
| **SE Design Link** | [Confluence Design Doc] |
| **UX Design Link** | [Figma URL] |
| **GitHub PR Link** | [PR URL] |
| **Date Generated** | [Current Date] |
| **Plan Status** | Draft / In Review / Approved |

## 📝 Background

### Key Problem Statement

[From Atlassian requirements - What problem are we solving?]

### Solution

[High-level solution approach combining design, implementation, and requirements]

### Business Context

- **User Impact**: [Who benefits and how]
- **Technical Scope**: [What systems/components affected]
- **Dependencies**: [What this relies on]

## 🎯 QA Goals

### E2E: End to End

1. Verify complete user workflows from entry to completion
2. Validate data flow across all system layers
3. Test integration between frontend, backend, and external services
4. Confirm session management and state persistence

### FUN: Functionality

1. Validate all functional requirements from [Jira issue]
2. Verify business logic correctness
3. Test API endpoints with various inputs
4. Confirm database operations (CRUD)
5. Validate error handling and edge cases

### UX: User Experience

1. Verify UI matches Figma designs with pixel-perfect accuracy
2. Test responsive design across devices (mobile, tablet, desktop)
3. Validate interactive elements (hover, focus, active states)
4. Test loading states and transitions
5. Verify error messages are user-friendly
6. Confirm accessibility features (keyboard navigation, screen readers)

### PERF: Performance

1. Measure page load time (target: < 3s)
2. Test API response times (target: < 2s for critical endpoints)
3. Validate rendering performance (60fps for animations)
4. Load test concurrent users (target: [X] CCU)
5. Monitor memory usage and potential leaks

### SEC: Security

1. Verify authentication and authorization mechanisms
2. Test input validation and sanitization
3. Check for XSS, CSRF, SQL injection vulnerabilities
4. Validate secure data transmission (HTTPS)
5. Test session timeout and invalidation
6. Verify sensitive data encryption

### ACC: Accessibility

1. Validate WCAG 2.1 Level AA compliance
2. Test keyboard-only navigation
3. Verify screen reader compatibility
4. Check color contrast ratios
5. Test focus indicators
6. Validate ARIA labels and roles

### CER: Platform Certifications

1. [If applicable: Verify compliance with platform standards]
2. [E.g., Apple App Store guidelines, Google Play policies]
3. [Browser compatibility: Chrome, Firefox, Safari, Edge]

### UPG: Upgrade and Compatibility

1. Test database migration scripts (up and down)
2. Verify backward compatibility with previous version
3. Test rollback procedures
4. Validate data migration integrity
5. Check API version compatibility

### INT: Internationalization

1. Verify all user-facing text is translatable
2. Test RTL language support (if applicable)
3. Validate date/time formatting for different locales
4. Test currency formatting
5. Verify timezone handling

### AUTO: Automation

1. Create automated unit tests (target: 80%+ coverage)
2. Develop integration test suite
3. Build E2E test automation for critical paths
4. Set up CI/CD pipeline tests
5. Configure regression test suite

## 🧪 QA Plan: Test Key Points

### UI Testing (from Figma)

#### Visual Components

| Priority | Related Code Change | Test Key Points | Expected Results |
|----------|---------------------|-----------------|------------------|
| P0 | `src/components/LoginForm.tsx` | Login form renders with correct styling | Form matches Figma design: email field, password field, submit button with primary color |
| P0 | `src/components/Button.tsx` | Button hover state | Background changes to hover color (#1A73E8 → #1557B0) |
| P0 | `src/components/Input.tsx` | Input validation error state | Red border (#D93025), error message appears below field |
| P1 | `src/layouts/AppLayout.tsx` | Responsive layout at 768px breakpoint | Layout switches to mobile view, navigation collapses |

#### Interactive Elements

| Priority | Related Code Change | Test Key Points | Expected Results |
|----------|---------------------|-----------------|------------------|
| P0 | `src/components/Form.tsx` | Form submission flow | On submit, loading state → success message → redirect |
| P0 | `src/components/Modal.tsx` | Modal open/close | Modal opens on trigger, closes on X click or overlay click |
| P1 | `src/components/Dropdown.tsx` | Dropdown selection | Options display, selection highlights, value updates |

### Backend Testing (from GitHub)

#### API Endpoints

| Priority | Related Code Change | Test Key Points | Expected Results |
|----------|---------------------|-----------------|------------------|
| P0 | `src/api/auth/login.ts` | POST /api/auth/login with valid credentials | 200 OK, JWT token returned, user object in response |
| P0 | `src/api/auth/login.ts` | POST /api/auth/login with invalid credentials | 401 Unauthorized, error message: "Invalid credentials" |
| P0 | `src/api/users/create.ts` | POST /api/users with valid data | 201 Created, user ID returned |
| P1 | `src/api/users/create.ts` | POST /api/users with duplicate email | 409 Conflict, error message: "Email already exists" |

#### Database Operations

| Priority | Related Code Change | Test Key Points | Expected Results |
|----------|---------------------|-----------------|------------------|
| P0 | `db/migrations/001_add_users.sql` | Migration up executes | Users table created with correct schema |
| P0 | `src/models/User.ts` | User.create() with valid data | Record inserted, ID generated, timestamps set |
| P1 | `src/models/User.ts` | User.findByEmail() | Returns user if exists, null if not |

#### Business Logic

| Priority | Related Code Change | Test Key Points | Expected Results |
|----------|---------------------|-----------------|------------------|
| P0 | `src/services/auth.ts:validatePassword()` | Password validation with valid password | Returns true |
| P0 | `src/services/auth.ts:validatePassword()` | Password validation with incorrect password | Returns false |
| P0 | `src/services/email.ts:sendPasswordReset()` | Send password reset email | Email sent with reset link, link expires in 24h |

### E2E Workflow Testing (from Figma + GitHub)

#### User Registration & Login Flow

| Priority | Related Code Change | Test Key Points | Expected Results |
|----------|---------------------|-----------------|------------------|
| P0 | Full flow: UI + API + DB | User visits signup, fills form, submits | Account created, confirmation email sent, redirect to login |
| P0 | Full flow: UI + API + DB | User logs in with new credentials | Session created, redirect to dashboard, user data displayed |
| P0 | Full flow: UI + API + DB | User logs out | Session destroyed, redirect to login page |

#### Password Reset Flow

| Priority | Related Code Change | Test Key Points | Expected Results |
|----------|---------------------|-----------------|------------------|
| P0 | Full flow: UI + Email + API | User requests password reset | Reset email sent with valid link |
| P0 | Full flow: Email + UI + API | User clicks reset link | Redirected to reset form, token validated |
| P0 | Full flow: UI + API + DB | User submits new password | Password updated, auto-login, redirect to dashboard |

### Functional Requirements Testing (from Atlassian)

#### Acceptance Criteria from [JIRA-123]

| Priority | Acceptance Criteria | Test Key Points | Expected Results |
|----------|---------------------|-----------------|------------------|
| P0 | Given valid credentials, when user logs in, then redirect to dashboard | Login flow with test user | User redirected to `/dashboard`, session active |
| P0 | Given invalid credentials, when user logs in, then show error | Login with wrong password | Error message displayed, no redirect |
| P1 | Given user is logged in, when accessing login page, then redirect to dashboard | Navigate to `/login` while logged in | Auto-redirect to `/dashboard` |

### Performance Testing

| Priority | Test Key Points | Expected Results | Measurement Method |
|----------|-----------------|------------------|-------------------|
| P0 | Login API response time | < 2 seconds (p95) | Load test with 100 concurrent users |
| P1 | Page load time (dashboard) | < 3 seconds (p95) | Lighthouse CI |
| P1 | Database query time (user lookup) | < 100ms (p95) | APM monitoring |

### Security Testing

| Priority | Test Key Points | Expected Results | Reference |
|----------|-----------------|------------------|-----------|
| P0 | Password stored securely | Bcrypt hashing, salted | Code: `src/services/auth.ts:42` |
| P0 | SQL injection prevention | Parameterized queries used | Code: `src/models/User.ts` |
| P0 | XSS prevention | Input sanitized, output escaped | Code: `src/utils/sanitize.ts` |
| P1 | CSRF protection | CSRF token validated | Code: `src/middleware/csrf.ts` |

### Accessibility Testing

| Priority | Test Key Points | Expected Results | WCAG Criterion |
|----------|-----------------|------------------|----------------|
| P0 | Keyboard navigation | All interactive elements accessible via Tab | 2.1.1 Keyboard |
| P0 | Screen reader labels | All form fields have labels | 4.1.2 Name, Role, Value |
| P1 | Color contrast | Text contrast ratio ≥ 4.5:1 | 1.4.3 Contrast |

## ⚠️ Risk & Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation Strategy | Code/Design Reference |
|------|--------|------------|---------------------|----------------------|
| Password reset emails go to spam | High | Medium | Test with multiple email providers, add SPF/DKIM | `src/services/email.ts`, [Design Doc §4.2] |
| Session fixation vulnerability | Critical | Low | Regenerate session ID on login | `src/middleware/session.ts:34`, [Security Review] |
| Database migration fails in production | Critical | Low | Test on staging, backup before migration, rollback plan | `db/migrations/001_add_users.sql` |
| UI breaks on older browsers | Medium | Medium | Cross-browser testing, polyfills | [Figma: Browser Support] |
| API rate limit bypass | High | Medium | Implement rate limiting with Redis | `src/middleware/rateLimit.ts`, [PROJ-125] |

### Data Risks

| Risk | Impact | Likelihood | Mitigation Strategy | Code/Design Reference |
|------|--------|------------|---------------------|----------------------|
| User enumeration via error messages | Medium | Medium | Use generic error messages | `src/api/auth/login.ts:67`, [Design Doc §5.1] |
| Sensitive data in logs | High | Low | Sanitize logs, audit log configuration | `src/utils/logger.ts` |

### UX Risks

| Risk | Impact | Likelihood | Mitigation Strategy | Design Reference |
|------|--------|------------|---------------------|------------------|
| Confusing error messages | Medium | High | UX review of all error states | [Figma: Error States] |
| Slow page load on mobile | High | Medium | Performance optimization, lazy loading | [Design Doc: Performance] |

## 📊 QA Summary

### Code Changes Summary

| File Path | Change Type | Lines Changed | Risk Level | Test Status |
|-----------|-------------|---------------|------------|-------------|
| `src/api/auth/login.ts` | New Feature | +120, -5 | High | ✅ Tested |
| `src/components/LoginForm.tsx` | New Feature | +78, -0 | Medium | ✅ Tested |
| `db/migrations/001_add_users.sql` | New Schema | +45, -0 | High | ✅ Tested |
| `src/middleware/session.ts` | Modified | +23, -12 | High | ⬜ Pending |
| `src/utils/validation.ts` | New Utility | +34, -0 | Low | ⬜ Pending |

### E2E Testing & Functionality

**Status**: ✅ In Progress

| Test Category | Total Tests | Passed | Failed | Blocked | Coverage |
|---------------|-------------|--------|--------|---------|----------|
| UI Components | 15 | 12 | 2 | 1 | 80% |
| API Endpoints | 20 | 18 | 0 | 2 | 90% |
| E2E Workflows | 8 | 5 | 1 | 2 | 62% |
| Acceptance Criteria | 10 | 8 | 1 | 1 | 80% |

**Currently Open Defects**:
- [BUG-789]: Login button disabled state not showing correctly (Priority: P1)
- [BUG-790]: Reset email not sent for non-existent users (Priority: P2)

**Limitations**:
- Social login (Google, GitHub) not implemented in this release
- Multi-factor authentication deferred to future release
- Password strength meter not included

### Performance

**Status**: ✅ Passed

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Login API response time (p95) | < 2s | 1.2s | ✅ Pass |
| Dashboard page load (p95) | < 3s | 2.5s | ✅ Pass |
| Database query time (p95) | < 100ms | 65ms | ✅ Pass |
| Concurrent users supported | 1000 | 1200 | ✅ Pass |

**Load Testing Summary**:
- Tested with 1200 concurrent users
- No errors under normal load
- Response time degrades at >2000 users (acceptable)

### Security

**Status**: ✅ Passed

1. ✅ Password hashing: Bcrypt with 10 rounds
2. ✅ SQL injection: Parameterized queries used throughout
3. ✅ XSS prevention: Input sanitization and output escaping
4. ✅ CSRF protection: Token-based protection enabled
5. ✅ HTTPS enforcement: All endpoints require HTTPS
6. ⬜ Security audit: Scheduled for next sprint

### Platform Certifications

**Status**: ✅ Passed

1. ✅ Browser compatibility: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
2. ✅ Mobile compatibility: iOS 14+, Android 10+
3. N/A App store compliance (not applicable for web app)

### Upgrade and Compatibility

**Status**: ✅ Passed

1. ✅ Database migration tested: Up and down migrations work
2. ✅ Backward compatibility: New API version maintains old endpoints
3. ✅ Rollback plan: Tested rollback procedure on staging
4. ✅ Data integrity: No data loss during migration

### Internationalization

**Status**: ⬜ Pending

1. ⬜ Translation files: Awaiting localization team
2. ⬜ RTL support: Not tested yet
3. ✅ Date/time formatting: Using i18n library
4. ✅ Timezone handling: UTC stored, local display

### Automation

**Status**: ✅ In Progress

1. ✅ Unit tests: 85% coverage (target: 80%+)
2. ✅ Integration tests: 12 tests covering critical paths
3. ⬜ E2E automation: 5 tests automated (target: 8)
4. ✅ CI/CD pipeline: Tests run on every PR
5. ✅ Regression suite: 30 tests running nightly

### Accessibility

**Status**: ⬜ Pending

1. ⬜ WCAG 2.1 AA compliance: Audit scheduled
2. ✅ Keyboard navigation: All interactive elements accessible
3. ✅ Screen reader labels: All forms properly labeled
4. ⬜ Color contrast: Some areas need improvement
5. ✅ Focus indicators: Visible focus states implemented

## 📎 Consolidated Reference Data

### Source Documents

**Design & Requirements**:
- [Figma Design](figma-url)
- [Confluence Design Doc](confluence-url)
- [API Specification](confluence-url)

**Implementation**:
- [GitHub PR #456](github-pr-url)
- [Commit History](github-commits-url)

**Project Management**:
- [Jira Epic: PROJ-100](jira-url)
- [User Story: PROJ-123](jira-url)
- [Related Issues](jira-filter-url)

### Stakeholders

| Role | Name | Responsibility | Contact |
|------|------|----------------|---------|
| Product Owner | [Name] | Requirements approval | @username |
| Tech Lead | [Name] | Technical design | @username |
| QA Lead | [Name] | Test strategy | @username |
| UX Designer | [Name] | Design validation | @username |
| Security | [Name] | Security review | @username |

### Test Data

**User Accounts** (Test Environment):
- Test User: `testuser@example.com` / `TestPass123!`
- Admin User: `admin@example.com` / `AdminPass123!`
- Locked Account: `locked@example.com` / `LockedPass123!`

**API Endpoints**:
- Base URL: `https://staging.example.com/api`
- Auth: JWT token in `Authorization: Bearer <token>` header

### Dependencies

| Dependency | Version | Status | Notes |
|------------|---------|--------|-------|
| Node.js | 22.x | ✅ | Required runtime |
| PostgreSQL | 15.x | ✅ | Database |
| Redis | 7.x | ✅ | Session store |
| Email Service | Sendgrid v3 | ✅ | Email delivery |

## 🎯 Sign-off Checklist

### Development Team

- [x] All code reviewed and merged
- [x] Unit tests passing (85% coverage)
- [x] Documentation updated
- [x] No high-severity linter errors

### QA Team

- [ ] All P0 tests executed and passed
- [ ] All P1 tests executed (90%+ passed)
- [ ] No critical bugs open
- [ ] Regression testing completed
- [ ] Performance benchmarks met

### Product Team

- [ ] All acceptance criteria validated
- [ ] UX reviewed and approved
- [ ] Documentation reviewed
- [ ] Release notes drafted

### Security Team

- [ ] Security scan completed
- [ ] No critical vulnerabilities
- [ ] Penetration testing passed (if required)

### Release Readiness

- [ ] Deployment plan reviewed
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Support team notified

## 📝 Notes

**Generated by**: QA Plan Architect Orchestrator  
**Sources**: Figma + GitHub + Atlassian  
**Last Updated**: [Timestamp]  
**Version**: 1.0

**Next Steps**:
1. Complete pending automation tests
2. Address internationalization gaps
3. Schedule accessibility audit
4. Final security review
5. Obtain stakeholder sign-offs
```

## Output File Handling

**Default Location**: Confirm with user or use:
```
/Users/xuyin/Documents/FeatureTest/QAPlans/
```

**Naming Convention**:
```
qa_plan_comprehensive_<feature_id>_<YYYY-MM-DD>.md
```

## Consolidation Best Practices

### Avoid Duplication

When merging test scenarios:
- If Figma and GitHub both mention "button click", merge into one test
- Keep the most specific version (e.g., GitHub's technical details + Figma's visual details)

### Maintain Traceability

Always link back to sources:
- Test scenarios → Original file (Figma/GitHub/Atlassian)
- Risk items → Code references or design sections
- Requirements → Jira issue keys

### Prioritize Consistently

Use a unified priority system:
- **P0 (Critical)**: Must work for release, blocks production
- **P1 (High)**: Important for user experience, should be fixed
- **P2 (Medium)**: Nice-to-have, can be deferred
- **P3 (Low)**: Minor issues, future improvement

### Fill Gaps

Identify and address gaps between sources:
- **Code without design**: Flag for UX review
- **Design without code**: Flag as not implemented
- **Requirements without tests**: Create missing test scenarios

### Cross-Reference Risks

Correlate risks across sources:
- **Design risk**: "Button too small" + **Code risk**: "No click handler validation" → **Combined risk**: "User may accidentally trigger actions"

## Integration with Other Skills

This skill outputs data consumed by:
- `qa-plan-review`: Reviews the consolidated plan for completeness
- `qa-plan-refactor`: Updates the plan based on review feedback
- `xmind-generator`: Creates visual representation of the entire plan

**Input from**:
- `qa-plan-figma`: UI and visual testing requirements
- `qa-plan-github`: Code change analysis and technical testing
- `qa-plan-atlassian`: Requirements and acceptance criteria

## Error Handling

**If no partial plans found**:
1. Ask user to run individual QA plan generation skills first
2. Provide guidance on which skill to use for each source

**If plans are inconsistent**:
1. Document the inconsistencies in "Notes" section
2. Flag for clarification
3. Use most recent or most detailed information

**If critical data is missing**:
1. Document as "TODO" or "Pending"
2. List in "Open Questions" section
3. Assign action items for follow-up

## Advanced Features

### Smart Merging

Detect and merge similar test scenarios:
```
Figma: "Test button hover state changes color"
GitHub: "Button.tsx hover changes background to #1557B0"
→ Merged: "Button hover state changes background color to #1557B0 (from Figma design)"
```

### Gap Detection

Identify missing coverage:
- Requirements in Jira without test scenarios
- Code changes without corresponding tests
- Design components without implementation

### Risk Correlation

Link related risks:
```
Design: "Password field not masked"
Code: "Password sent in plain text"
→ Combined Critical Risk: "Password security vulnerability"
```

## Example Usage

**User Request**:
> "Consolidate all QA plans for the login feature"

**Skill Actions**:
1. Find all QA plan files with "login" in name
2. Read `qa_plan_figma_login_2026-01-29.md`
3. Read `qa_plan_github_login_2026-01-29.md`
4. Read `qa_plan_atlassian_login_2026-01-29.md`
5. Extract and merge all test scenarios
6. Consolidate risks and mitigations
7. Create summary tables with aggregate data
8. Generate `qa_plan_comprehensive_login_2026-01-29.md`
9. Present summary to user

## Notes

- This is the **final QA plan** document for stakeholder review
- Ensure all sections align with the format in `@.cursor/commands/qa-plan-architect.md`
- The plan should be ready for review by `qa-plan-review` skill
- Include enough detail for engineers to understand test scope
- Keep language professional and user-facing
