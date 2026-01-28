---
name: qa-plan-atlassian
description: Generate QA test plans by analyzing Atlassian Confluence design documents and Jira issues to understand requirements and background. Use when the user asks to create QA plans from Confluence, analyze Jira tickets for testing, or mentions "QA plan from requirements", "Confluence analysis", or "Jira issue testing".
---

# QA Plan Generator from Atlassian (Confluence & Jira)

Generate comprehensive QA test plans by analyzing Confluence design documents and Jira issues to understand requirements, acceptance criteria, and project context.

## When to Use

- User provides Confluence page URL or Jira issue key
- User asks to "create QA plan from requirements"
- User mentions "analyze design doc for testing" or "Jira ticket QA"
- Creating test plans based on product specifications

## Prerequisites

**MCP Server Required**: `user-mcp-atlassian` must be configured and accessible.

Verify Atlassian MCP access:
```bash
# Check if Atlassian MCP is available
ls /Users/xuyin/.cursor/projects/*/mcps/user-mcp-atlassian/tools/
```

## Available Atlassian MCP Tools

**Confluence Tools**:
- `confluence_get_page` - Read page content by ID or title
- `confluence_search` - Search pages by keyword
- `confluence_get_page_children` - Get child pages

**Jira Tools**:
- `jira_get_issue` - Read issue details by key
- `jira_search` - Search issues by JQL
- `jira_get_project_issues` - Get all project issues

## Workflow

### Step 1: Extract Atlassian References

**From Confluence URL**: Extract page ID:
```
https://example.atlassian.net/wiki/spaces/TEAM/pages/123456789/Page+Title
→ page_id: 123456789, space_key: TEAM
```

**From Jira Issue URL**: Extract issue key:
```
https://example.atlassian.net/browse/PROJ-123
→ issue_key: PROJ-123
```

### Step 2: Read Design Document from Confluence

Use Atlassian MCP to read the design specification:

```
Tool: CallMcpTool
Server: user-mcp-atlassian
Tool Name: confluence_get_page
Arguments:
{
  "page_id": "123456789",
  "include_metadata": true,
  "convert_to_markdown": true
}
```

**Alternative**: Search by title if page ID unknown:
```
Tool: CallMcpTool
Server: user-mcp-atlassian
Tool Name: confluence_search
Arguments:
{
  "query": "User Authentication Design",
  "space_key": "TEAM",
  "limit": 5
}
```

### Step 3: Read Jira Issue Details

Use Atlassian MCP to read the ticket:

```
Tool: CallMcpTool
Server: user-mcp-atlassian
Tool Name: jira_get_issue
Arguments:
{
  "issue_key": "PROJ-123"
}
```

**Extract from Jira**:
- Issue summary and description
- Acceptance criteria
- Linked issues (related, blocks, blocked by)
- Comments (design clarifications)
- Attachments (mockups, specs)
- Custom fields (story points, sprint, etc.)

### Step 4: Analyze Requirements

**From Confluence Design Doc**:
- Functional requirements
- Non-functional requirements (performance, security)
- Business rules
- User stories
- Technical architecture
- API specifications
- Database schema

**From Jira Issue**:
- User story format: "As a [user], I want [goal], so that [benefit]"
- Acceptance criteria (Given/When/Then format)
- Definition of Done
- Edge cases mentioned in comments
- Dependencies on other issues

### Step 5: Map Requirements to Test Cases

**For each requirement**:
1. **Identify testable conditions**
2. **Define positive test scenarios** (happy path)
3. **Define negative test scenarios** (error cases)
4. **Identify edge cases**
5. **Determine test data needs**

**Example Mapping**:
```
Requirement: User can reset password via email
→ Positive Tests:
  - Valid email receives reset link
  - Reset link works within 24 hours
→ Negative Tests:
  - Invalid email shows error
  - Expired link shows error message
  - Used link cannot be reused
→ Edge Cases:
  - Multiple reset requests
  - Email doesn't exist in system
  - Reset during active session
```

### Step 6: Generate QA Plan Structure

Create a markdown file: `qa_plan_atlassian_<feature_id>_<date>.md`

```markdown
# QA Plan: [Feature Name] - Requirements Analysis

## 📊 Summary

| Field | Value |
|-------|-------|
| **Jira Issue** | [PROJ-123](jira-url) |
| **Confluence Page** | [Design Doc](confluence-url) |
| **Date Generated** | [Current Date] |
| **Feature Type** | [New Feature / Bug Fix / Enhancement] |
| **Priority** | [P0 / P1 / P2] |
| **Target Release** | [Version] |

## 📋 Background

### Problem Statement

[Describe the problem this feature solves]

### Solution Overview

[High-level description of the solution approach]

### Business Impact

- **User Benefit**: [How users benefit]
- **Business Value**: [Revenue, efficiency, compliance, etc.]
- **Success Metrics**: [How success is measured]

## 🎯 Requirements Summary

### Functional Requirements

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| FR-1 | User can log in with email and password | P0 | [PROJ-123] |
| FR-2 | System validates email format | P0 | [Design Doc] |
| FR-3 | Failed login shows error message | P0 | [PROJ-123] |

### Non-Functional Requirements

| ID | Requirement | Target | Source |
|----|-------------|--------|--------|
| NFR-1 | Login response time < 2s | < 2000ms | [Design Doc] |
| NFR-2 | Support 1000 concurrent users | 1000 CCU | [Design Doc] |
| NFR-3 | 99.9% uptime | 99.9% | [SLA] |

### Acceptance Criteria

**From Jira Issue [PROJ-123]**:

- [ ] Given valid credentials, when user logs in, then user is redirected to dashboard
- [ ] Given invalid credentials, when user logs in, then error message is displayed
- [ ] Given user is already logged in, when accessing login page, then redirect to dashboard
- [ ] Given password reset requested, when user clicks email link, then password reset form appears

## 🧪 Test Scenarios

### Feature: User Authentication

#### Positive Scenarios (Happy Path)

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| AUTH-001 | Successful login | User has valid credentials | User enters email and password and clicks "Login" | User is redirected to dashboard, session created | P0 |
| AUTH-002 | Logout | User is logged in | User clicks "Logout" | User is logged out, redirected to login page | P0 |

#### Negative Scenarios (Error Cases)

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| AUTH-003 | Invalid email | User enters invalid email format | User submits form | Error message: "Invalid email format" | P0 |
| AUTH-004 | Wrong password | User enters wrong password | User submits form | Error message: "Invalid credentials" | P0 |
| AUTH-005 | Account locked | User account is locked | User tries to login | Error message: "Account locked" | P1 |

#### Edge Cases

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| AUTH-006 | Concurrent logins | User logged in on device A | User logs in on device B | Session on device A terminated or both active (per spec) | P1 |
| AUTH-007 | Session timeout | User inactive for 30 minutes | User tries to perform action | Redirect to login with message | P1 |
| AUTH-008 | Special characters in password | Password contains special chars | User logs in | Login succeeds if correct | P2 |

### Feature: Password Reset

#### Positive Scenarios

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| RESET-001 | Request reset | User has registered email | User enters email and clicks "Reset" | Reset email sent | P0 |
| RESET-002 | Use reset link | User received reset email | User clicks link | Password reset form appears | P0 |

#### Negative Scenarios

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| RESET-003 | Expired link | Reset link is >24 hours old | User clicks link | Error: "Link expired" | P1 |
| RESET-004 | Reused link | Link already used | User clicks link again | Error: "Link invalid" | P1 |

## 🔍 Integration Points

| Integration | Description | Test Requirement |
|-------------|-------------|------------------|
| Email Service | Send password reset emails | Verify email delivery, content, timing |
| Database | Store user credentials securely | Verify hashing, salting, storage |
| Session Management | Maintain user sessions | Test session creation, expiration, invalidation |
| Audit Log | Log authentication events | Verify all login attempts logged |

## ⚠️ Risk Assessment

### Technical Risks

| Risk | Impact | Likelihood | Mitigation | Reference |
|------|--------|------------|------------|-----------|
| Password reset emails go to spam | High | Medium | Test with multiple email providers | [Design Doc §4.2] |
| Session fixation attack | Critical | Low | Regenerate session ID on login | [Security Review] |
| Brute force attacks | High | High | Implement rate limiting | [PROJ-125] |

### Data Risks

| Risk | Impact | Likelihood | Mitigation | Reference |
|------|--------|------------|------------|-----------|
| Plain text password storage | Critical | Low | Code review, security scan | [Security Standards] |
| User enumeration via error messages | Medium | Medium | Generic error messages | [Design Doc §5.1] |

## 📊 Test Coverage Matrix

### By Requirement

| Requirement | Test IDs | Coverage |
|-------------|----------|----------|
| FR-1: Login | AUTH-001 to AUTH-008 | 100% |
| FR-2: Email validation | AUTH-003 | 100% |
| FR-3: Error messages | AUTH-004, AUTH-005 | 100% |

### By Component

| Component | Test Type | Test IDs | Priority |
|-----------|-----------|----------|----------|
| Login Form | Unit | UNIT-001 to UNIT-005 | P0 |
| Auth Service | Integration | INT-001 to INT-003 | P0 |
| Email Service | Integration | INT-004 to INT-006 | P1 |
| User Flow | E2E | E2E-001 to E2E-003 | P0 |

## 📋 Test Data Requirements

### User Accounts

| Account Type | Email | Password | Role | Purpose |
|--------------|-------|----------|------|---------|
| Valid user | test@example.com | ValidPass123! | User | Happy path testing |
| Admin user | admin@example.com | AdminPass123! | Admin | Admin functionality |
| Locked account | locked@example.com | LockedPass123! | User | Locked account testing |
| Inactive account | inactive@example.com | InactivePass123! | User | Inactive account testing |

### Test Inputs

| Input Field | Valid Values | Invalid Values | Edge Cases |
|-------------|--------------|----------------|------------|
| Email | user@example.com | invalid-email, @example.com | email+tag@example.com |
| Password | Pass123! | 123, short | 255 char password |

## 📎 Reference Data

### Source Documents

**Confluence Pages**:
- [User Authentication Design](confluence-url) - Main design doc
- [API Specification](confluence-url) - API endpoints
- [Security Requirements](confluence-url) - Security standards

**Jira Issues**:
- [PROJ-123](jira-url) - Main user story
- [PROJ-124](jira-url) - Related: Password reset
- [PROJ-125](jira-url) - Dependency: Rate limiting

### Related Issues

| Issue Key | Type | Status | Relationship |
|-----------|------|--------|--------------|
| PROJ-124 | Story | In Progress | Related |
| PROJ-125 | Task | Done | Blocks |
| PROJ-126 | Bug | Open | Related |

### Design Artifacts

- Architecture Diagram: [Link or attachment]
- Database Schema: [Link or attachment]
- API Spec: [Link or attachment]
- Mockups: [Link or attachment]

### Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| Product Owner | [Name] | Requirements approval |
| Tech Lead | [Name] | Technical design |
| QA Lead | [Name] | Test strategy |
| Security | [Name] | Security review |

## 🎯 Definition of Done

### Development Done

- [ ] All acceptance criteria met
- [ ] Unit tests written and passing
- [ ] Code review completed
- [ ] Documentation updated

### QA Done

- [ ] All P0 test cases executed
- [ ] All P1 test cases executed (if time permits)
- [ ] No critical or high severity bugs open
- [ ] Regression testing completed
- [ ] Performance testing passed (if applicable)

### Release Ready

- [ ] Sign-off from Product Owner
- [ ] Sign-off from QA Lead
- [ ] Deployment plan reviewed
- [ ] Rollback plan documented

## 🔄 Dependencies

### Upstream Dependencies

| Dependency | Status | Impact | Contact |
|------------|--------|--------|---------|
| Rate limiting service | In Dev | Blocks testing of rate limits | [Team] |
| Email service upgrade | Done | Required for testing emails | [Team] |

### Downstream Impact

| Affected Feature | Impact | Action Required |
|------------------|--------|-----------------|
| User profile | Session changes may affect profile | Regression test profile |
| Admin dashboard | Auth changes may affect admin access | Test admin workflows |

## 📈 Test Execution Plan

### Phase 1: Unit Testing (Dev Environment)

- Timeline: Week 1
- Owner: Development Team
- Focus: Individual functions and components

### Phase 2: Integration Testing (Test Environment)

- Timeline: Week 2
- Owner: QA Team
- Focus: Service interactions and data flow

### Phase 3: E2E Testing (Staging Environment)

- Timeline: Week 3
- Owner: QA Team
- Focus: User workflows and acceptance criteria

### Phase 4: UAT (Staging Environment)

- Timeline: Week 4
- Owner: Product Team + QA
- Focus: Business requirements validation

## 💡 Notes & Clarifications

### Open Questions

1. What happens if user changes email during password reset?
2. Should we allow social login (Google, GitHub)?
3. What is the password complexity requirement?

**Action**: Follow up on Jira issue or Confluence page comments.

### Assumptions

1. Email service is reliable and available
2. Database has appropriate indexes on email field
3. HTTPS is enforced for all auth endpoints

### Out of Scope

- Social login integration (deferred to [PROJ-200])
- Multi-factor authentication (deferred to [PROJ-201])
- Password strength meter (nice-to-have)
```

## Output File Handling

**Default Location**: Confirm with user or use:
```
/Users/xuyin/Documents/FeatureTest/QAPlans/
```

**Naming Convention**:
```
qa_plan_atlassian_<feature_id>_<YYYY-MM-DD>.md
```

## Advanced Analysis Techniques

### Extract Acceptance Criteria

Look for common formats in Jira:
- **Given/When/Then** (BDD format)
- Bulleted lists starting with "User can..."
- Checklist items in description or comments

### Identify Implicit Requirements

Read between the lines:
- Performance expectations (if "real-time" mentioned)
- Security needs (if handling PII)
- Scalability (if "many users" mentioned)

### Find Related Context

Use `confluence_search` to find:
- Related design documents
- Architecture decisions
- Previous similar features
- Security guidelines

Use `jira_search` to find:
- Linked issues
- Similar past issues
- Known bugs in the area

### Process Large Documents

If Confluence page is very large:
1. Save full content to temp file
2. Extract key sections (Requirements, Acceptance Criteria, Technical Design)
3. Process each section separately
4. Consolidate findings

## Integration with Other Skills

This skill outputs data consumed by:
- `qa-plan-architect-orchestrator`: Merges with Figma and GitHub analysis
- `qa-plan-review`: Reviews requirements coverage completeness
- `xmind-generator`: Visualizes requirement dependencies in mind map

## Error Handling

**If Confluence page not found**:
1. Verify page ID or title
2. Check space key is correct
3. Verify user has access permissions
4. Try searching for the page by keyword

**If Jira issue not found**:
1. Verify issue key format (PROJ-123)
2. Check if issue exists and is accessible
3. Verify user has project access

**If MCP server is unavailable**:
1. Ask user to provide Confluence content manually
2. Ask user to copy Jira issue details
3. Process provided text content

**If content is too large**:
1. Process in chunks
2. Save to temp file for context management
3. Focus on most relevant sections first

## Best Practices

### Focus on Testable Requirements

Convert vague requirements into testable conditions:
- Vague: "System should be fast"
- Testable: "Login response time < 2 seconds"

### Think Like a Product Owner

Consider:
- What is the user trying to achieve?
- What could go wrong from user's perspective?
- What are the business rules?
- What are regulatory/compliance needs?

### Map to Test Pyramid

For each requirement, determine:
- **Unit tests**: Individual function behavior
- **Integration tests**: Component interactions
- **E2E tests**: Complete user workflows

### Document Ambiguities

If requirements are unclear:
1. Document the ambiguity
2. List possible interpretations
3. Flag for clarification
4. Propose default assumption for testing

## Example Usage

**User Request**:
> "Create QA plan from this Jira ticket: PROJ-456 and the design doc in Confluence"

**Skill Actions**:
1. Read Jira issue PROJ-456 via Atlassian MCP
2. Extract Confluence link from issue or ask user
3. Read Confluence page via Atlassian MCP
4. Extract requirements, acceptance criteria
5. Map to test scenarios
6. Identify dependencies and risks
7. Generate `qa_plan_atlassian_user-auth_2026-01-29.md`
8. Save reference data for orchestrator

## Notes

- Always extract acceptance criteria verbatim from Jira
- Link each test scenario back to specific requirement
- Preserve Jira issue keys for traceability
- Include all stakeholder information for collaboration
- Flag any security-sensitive requirements
