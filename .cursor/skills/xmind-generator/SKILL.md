---
name: xmind-generator
description: Generate XMind mind maps from QA plans, test scenarios, or any structured content with hierarchical drill-down to bullet-level detail. Use when the user asks to "create mind map", "visualize QA plan", "generate XMind", or mentions "mind map visualization".
---

# XMind Mind Map Generator

Generate XMind mind maps from QA plans, test scenarios, requirements, or any structured content with hierarchical visualization.

## When to Use

- User asks to "create mind map from QA plan"
- User wants to "visualize test scenarios" or "visualize requirements"
- User mentions "generate XMind" or "create mind map"
- User wants hierarchical visualization of QA data
- After consolidating QA plans with orchestrator

## Prerequisites

**MCP Server Required**: `user-xmind-generator` must be configured and accessible.

**Configuration** (from README.md):
```json
"xmind-generator": {
  "type": "stdio",
  "command": "/Users/xuyin/.nvm/versions/node/v22.21.1/bin/node",
  "args": ["/Users/xuyin/Documents/Repository/xmind-generator-mcp/dist/index.js"],
  "env": {
    "outputPath": "/Users/xuyin/Documents/FeatureTest/QAPlans",
    "autoOpenFile": "false"
  }
}
```

## XMind Structure

XMind mind maps are hierarchical with:
- **Root Topic**: Main title (e.g., "QA Plan: Login Feature")
- **Main Topics**: Primary categories (e.g., "UI Testing", "Backend Testing")
- **Subtopics**: Subcategories or test scenarios
- **Children**: Drill down to bullet-level detail
- **Labels**: Tags for categorization (e.g., "P0", "Security", "Performance")
- **Markers**: Visual indicators (e.g., "Priority.high", "Task.done")
- **Relationships**: Connections between topics (e.g., dependency arrows)

## Workflow

### Step 1: Analyze Input Content

**From QA Plan**: Parse markdown structure
```markdown
# QA Plan: Login Feature
## UI Testing
### Components
- Button (P0)
- Input Field (P0)
## Backend Testing
### API Endpoints
- POST /api/login (P0)
```

**Extract**:
- Hierarchy levels (H1 → Root, H2 → Main, H3 → Sub, bullets → children)
- Priorities (P0, P1, P2) → Labels
- Status indicators (✅, ⬜, ❌) → Markers
- Related items → Relationships

### Step 2: Build Mind Map Structure

**Hierarchical Mapping**:

```
Root: "QA Plan: [Feature Name]"
├─ Main Topic 1: "UI Testing"
│  ├─ Subtopic: "Components"
│  │  ├─ Child: "Button - hover state" [P0] [✅]
│  │  └─ Child: "Input - validation" [P0] [⬜]
│  └─ Subtopic: "E2E Workflows"
│     └─ Child: "Login flow" [P0] [✅]
└─ Main Topic 2: "Backend Testing"
   ├─ Subtopic: "API Endpoints"
   │  └─ Child: "POST /api/login" [P0] [✅]
   └─ Subtopic: "Database"
      └─ Child: "User table queries" [P1] [⬜]
```

### Step 3: Generate XMind

Use XMind MCP tool:

```
Tool: CallMcpTool
Server: user-xmind-generator
Tool Name: generate-mind-map
Arguments:
{
  "title": "QA Plan: Login Feature",
  "filename": "qa_plan_login_2026-01-29",
  "outputPath": "/Users/xuyin/Documents/FeatureTest/QAPlans",
  "topics": [
    {
      "title": "UI Testing",
      "ref": "ui-testing",
      "labels": ["Category"],
      "children": [
        {
          "title": "Components",
          "ref": "ui-components",
          "children": [
            {
              "title": "Button - hover state changes color",
              "labels": ["P0"],
              "markers": ["Task.done"],
              "note": "Expected: Background changes to #1557B0"
            },
            {
              "title": "Input - validation error display",
              "labels": ["P0"],
              "markers": ["Task.ongoing"],
              "note": "Expected: Red border + error message"
            }
          ]
        }
      ]
    },
    {
      "title": "Backend Testing",
      "ref": "backend-testing",
      "labels": ["Category"],
      "children": [...]
    }
  ],
  "relationships": [
    {
      "title": "depends on",
      "from": "ui-login-form",
      "to": "api-login-endpoint"
    }
  ]
}
```

## Content-to-XMind Mapping

### From Comprehensive QA Plan

| QA Plan Section | XMind Structure | Details |
|-----------------|-----------------|---------|
| **Summary** | Root node with note | Include metadata in root note |
| **Background** | Main topic "Background" | Problem statement + solution as subtopics |
| **QA Goals** | Main topics by category | E2E, FUN, UX, PERF, SEC, ACC, etc. |
| **Test Key Points** | Subtopics by priority | P0, P1, P2 as branches |
| **Risk & Mitigation** | Main topic "Risks" | Each risk as subtopic with mitigation as child |
| **QA Summary** | Main topic "Summary" | Status, defects, coverage as subtopics |

### Labels (Tags)

Use labels to categorize topics:

| Label | Usage | Example Topics |
|-------|-------|----------------|
| **P0** | Critical priority tests | Login API, Auth validation |
| **P1** | High priority tests | Error handling, edge cases |
| **P2** | Medium priority tests | Nice-to-have features |
| **UI** | UI-related tests | Component tests, visual tests |
| **API** | Backend API tests | Endpoint tests, integration |
| **Security** | Security tests | Auth, validation, encryption |
| **Performance** | Performance tests | Load tests, response times |

### Markers (Visual Indicators)

Use markers to show status and type:

| Marker | Usage | Visual |
|--------|-------|--------|
| **Task.done** | Test completed, passing | ✅ Green checkmark |
| **Task.ongoing** | Test in progress | 🔄 In progress |
| **Task.todo** | Test not started | ⬜ To do |
| **Priority.high** | High priority item | 🔴 Red flag |
| **Priority.medium** | Medium priority | 🟡 Yellow flag |
| **Priority.low** | Low priority | 🟢 Green flag |
| **Arrow.refresh** | Requires retest | 🔄 Refresh arrow |

### Relationships (Connections)

Use relationships to show dependencies:

```javascript
{
  "relationships": [
    {
      "title": "depends on",
      "from": "ui-login-form",
      "to": "api-login-endpoint"
    },
    {
      "title": "blocks",
      "from": "rate-limiting",
      "to": "login-testing"
    },
    {
      "title": "related to",
      "from": "password-reset",
      "to": "email-service"
    }
  ]
}
```

## Detailed Example: Full QA Plan to XMind

### Input: QA Plan Markdown

```markdown
# QA Plan: User Authentication

## UI Testing
### Login Form
- Email input validation (P0) ✅
- Password input masking (P0) ✅
- Submit button states (P0) ⬜

## Backend Testing
### API Endpoints
- POST /api/login (P0) ✅
- POST /api/logout (P0) ⬜

## Risks
- Session fixation (High)
  - Mitigation: Regenerate session ID
```

### Output: XMind Structure

```javascript
{
  "title": "QA Plan: User Authentication",
  "filename": "qa_plan_auth_2026-01-29",
  "topics": [
    {
      "title": "UI Testing",
      "ref": "ui-testing",
      "labels": ["UI"],
      "markers": ["Priority.high"],
      "children": [
        {
          "title": "Login Form",
          "ref": "login-form",
          "children": [
            {
              "title": "Email input validation",
              "labels": ["P0"],
              "markers": ["Task.done"],
              "note": "Test: Valid/invalid email formats\nExpected: Error message for invalid"
            },
            {
              "title": "Password input masking",
              "labels": ["P0"],
              "markers": ["Task.done"],
              "note": "Test: Password field shows dots\nExpected: Characters hidden"
            },
            {
              "title": "Submit button states",
              "labels": ["P0"],
              "markers": ["Task.todo"],
              "note": "Test: Enabled/disabled/loading states\nExpected: Button responds appropriately"
            }
          ]
        }
      ]
    },
    {
      "title": "Backend Testing",
      "ref": "backend-testing",
      "labels": ["API"],
      "markers": ["Priority.high"],
      "children": [
        {
          "title": "API Endpoints",
          "ref": "api-endpoints",
          "children": [
            {
              "title": "POST /api/login",
              "ref": "api-login",
              "labels": ["P0"],
              "markers": ["Task.done"],
              "note": "Test: Valid credentials\nExpected: 200 OK, JWT token"
            },
            {
              "title": "POST /api/logout",
              "ref": "api-logout",
              "labels": ["P0"],
              "markers": ["Task.todo"],
              "note": "Test: Logout with valid session\nExpected: 200 OK, session destroyed"
            }
          ]
        }
      ]
    },
    {
      "title": "Risks & Mitigation",
      "ref": "risks",
      "labels": ["Security"],
      "markers": ["Priority.high"],
      "children": [
        {
          "title": "Session fixation vulnerability",
          "labels": ["High", "Security"],
          "markers": ["Priority.high"],
          "children": [
            {
              "title": "Mitigation: Regenerate session ID on login",
              "markers": ["Task.done"],
              "note": "Implemented in: src/middleware/session.ts"
            }
          ]
        }
      ]
    }
  ],
  "relationships": [
    {
      "title": "depends on",
      "from": "login-form",
      "to": "api-login"
    }
  ]
}
```

## Drill-Down Strategies

### Bullet-Level Detail

For each test point, drill down to:
1. **Test Scenario**: What to test
2. **Test Steps**: How to test (if complex)
3. **Expected Result**: What should happen
4. **Test Data**: Sample inputs
5. **Code Reference**: Where the code is

**Example**:
```
Main: "Login API Testing"
├─ "POST /api/login - Valid credentials"
│  ├─ "Test Steps"
│  │  ├─ "1. Send POST with valid email/password"
│  │  ├─ "2. Verify response status"
│  │  └─ "3. Check token in response"
│  ├─ "Expected Result"
│  │  ├─ "Status: 200 OK"
│  │  ├─ "Body contains JWT token"
│  │  └─ "Token is valid for 24h"
│  ├─ "Test Data"
│  │  └─ "Email: test@example.com, Password: Test123!"
│  └─ "Code Reference"
│     └─ "src/api/auth/login.ts:45-67"
```

### Organize by Priority

Create priority-based branches:

```
Root: "QA Plan"
├─ "P0 - Critical Tests" [Priority.high]
│  ├─ "Login with valid credentials"
│  ├─ "Logout clears session"
│  └─ "Password validation works"
├─ "P1 - High Priority" [Priority.medium]
│  ├─ "Error messages display"
│  └─ "Session timeout works"
└─ "P2 - Medium Priority" [Priority.low]
   └─ "Remember me checkbox"
```

### Organize by Status

Create status-based branches:

```
Root: "Test Execution Status"
├─ "Completed ✅" [Task.done]
│  ├─ "Login API tests"
│  └─ "UI component tests"
├─ "In Progress 🔄" [Task.ongoing]
│  ├─ "Performance tests"
│  └─ "Security scan"
└─ "Not Started ⬜" [Task.todo]
   └─ "Accessibility audit"
```

## Best Practices

### Keep Hierarchies Manageable

- **Max depth**: 5 levels for readability
- **Nodes per level**: 3-7 for visual clarity
- **Group related items**: Use categories to organize

### Use Visual Indicators Effectively

- **Colors via labels**: Consistent color coding (P0=red, P1=yellow, P2=green)
- **Markers for status**: Quick visual scanning
- **Relationships sparingly**: Only for key dependencies

### Include Context in Notes

Add detailed information in notes:
- Test steps
- Expected results
- Code references
- Links to documentation
- Related Jira issues

**Example Note**:
```
Test: POST /api/login with valid credentials

Steps:
1. Send POST request to /api/login
2. Body: {"email": "test@example.com", "password": "Test123!"}
3. Verify response status and token

Expected:
- Status: 200 OK
- Response: {"token": "<jwt>", "user": {...}}
- Token is valid JWT

Reference:
- Code: src/api/auth/login.ts:45-67
- Design: Confluence page 123456
- Jira: PROJ-123
```

### Reference IDs for Relationships

Always use `ref` field for topics that will be referenced:

```javascript
{
  "title": "Login API",
  "ref": "api-login",  // Can be referenced in relationships
  "children": [...]
}
```

## Integration with Other Skills

This skill consumes data from:
- `qa-plan-architect-orchestrator`: Comprehensive QA plan
- `qa-plan-figma`: UI test scenarios
- `qa-plan-github`: Code change analysis
- `qa-plan-atlassian`: Requirements and acceptance criteria

**Input from**:
- Any markdown QA plan file
- Structured JSON test data
- Requirements documents

## Error Handling

**If XMind MCP is unavailable**:
1. Verify MCP server configuration in README
2. Check if `xmind-generator-mcp` is installed
3. Provide fallback: Generate markdown outline instead

**If output path doesn't exist**:
1. Use default temp directory
2. Inform user where file was saved
3. Offer to move file to desired location

**If structure is too complex**:
1. Simplify hierarchy
2. Group items into categories
3. Create multiple mind maps if needed

## Output File Handling

**Default Location** (from config):
```
/Users/xuyin/Documents/FeatureTest/QAPlans/
```

**Naming Convention**:
```
qa_plan_<feature_id>_<YYYY-MM-DD>.xmind
```

**Auto-open**: Disabled by default (set in config)

## Example Usage

**User Request**:
> "Generate XMind mind map from the comprehensive QA plan for login feature"

**Skill Actions**:
1. Read `qa_plan_comprehensive_login_2026-01-29.md`
2. Parse markdown structure
3. Extract hierarchy, priorities, status
4. Build topics array with children
5. Add labels (P0, P1, P2, UI, API, Security)
6. Add markers (Task.done, Task.todo, Priority.high)
7. Create relationships (dependencies)
8. Call XMind MCP `generate-mind-map`
9. Inform user: "Mind map saved to /Users/xuyin/Documents/FeatureTest/QAPlans/qa_plan_login_2026-01-29.xmind"

## Advanced Features

### Multi-View Mind Maps

Create different views for different audiences:

1. **Executive View**: High-level summary
   - Root: Feature name
   - Level 1: Status (Done, In Progress, Blocked)
   - Level 2: Key metrics

2. **Engineer View**: Technical details
   - Root: Feature name
   - Level 1: Component (UI, API, DB)
   - Level 2: Files changed
   - Level 3: Test scenarios

3. **QA View**: Test execution focus
   - Root: Feature name
   - Level 1: Priority (P0, P1, P2)
   - Level 2: Test scenarios
   - Level 3: Steps and expected results

### Dynamic Updates

For iterative testing, update mind map:
1. Read existing QA plan
2. Merge with new test results
3. Update markers (change todo → done)
4. Regenerate mind map

## Notes

- XMind files are in `.xmind` format (can be opened in XMind desktop app)
- Mind maps are visual, so focus on clarity over completeness
- Use relationships to show test dependencies
- Keep notes concise but informative
- Export as PNG/PDF for sharing if needed
