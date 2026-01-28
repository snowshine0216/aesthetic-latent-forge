---
name: qa-plan-figma
description: Generate QA test plans from Figma designs focusing on UI testing and E2E workflow testing. Use when the user asks to create QA plans from Figma, analyze Figma designs for testing, or mentions "QA plan from design", "Figma testing", or "UI test plan".
---

# QA Plan Generator from Figma Designs

Generate comprehensive QA test plans by analyzing Figma designs, focusing on UI testing and end-to-end workflow testing.

## When to Use

- User provides a Figma URL or file key for QA planning
- User asks to "create QA plan from Figma design"
- User mentions "UI testing from design" or "E2E workflow from Figma"
- Creating test plans based on design specifications

## Prerequisites

**MCP Server Required**: `plugin-figma-figma` must be configured and accessible.

Verify Figma access:
```bash
# Check if Figma MCP is available in the mcps folder
ls /Users/xuyin/.cursor/projects/*/mcps/plugin-figma-figma/
```

## Workflow

### Step 1: Extract Figma URL Components

When user provides a Figma URL, extract:
- **File Key**: The unique identifier for the Figma file
- **Node ID**: The specific node/frame to analyze (format: `123:456` or `123-456`)

**Example URL formats**:
- Design file: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`
- Branch: `https://figma.com/design/:fileKey/branch/:branchKey/:fileName`

For branches, use `branchKey` as the `fileKey`.

### Step 2: Read Design Context

Use the Figma MCP tool to retrieve design information:

```
Tool: CallMcpTool
Server: plugin-figma-figma
Tool Name: get_design_context
Arguments:
{
  "nodeId": "1:2",  // extracted from URL
  "fileKey": "abc123",  // extracted from URL
  "clientLanguages": "typescript,javascript",
  "clientFrameworks": "react,nextjs"
}
```

### Step 3: Analyze Design for Test Scenarios

Extract and document:

**UI Elements**:
- Components and their variants
- Interactive elements (buttons, forms, dropdowns)
- Visual states (hover, active, disabled, error)
- Responsive breakpoints
- Color schemes and themes

**User Flows**:
- Navigation paths
- Form submissions
- Modal/dialog interactions
- Data display patterns
- Error states

### Step 4: Generate QA Plan Structure

Create a markdown file: `qa_plan_figma_<feature_id>_<date>.md`

```markdown
# QA Plan: [Feature Name] - Figma Analysis

## 📊 Summary

| Field | Value |
|-------|-------|
| **Source** | [Figma URL] |
| **Date Generated** | [Current Date] |
| **Node ID** | [Node ID] |
| **File Key** | [File Key] |
| **Framework** | [Detected Framework] |

## 🎨 UI Testing

### Components Identified

| Component | Variants | States | Priority |
|-----------|----------|--------|----------|
| Button | Primary, Secondary | Default, Hover, Active, Disabled | P0 |
| Input Field | Text, Email, Password | Empty, Filled, Error, Focused | P0 |
| Modal | Confirmation, Alert | Open, Closed | P1 |

### Visual Regression Test Points

| Test Point | Expected Result | Priority |
|------------|-----------------|----------|
| Button hover state changes color | Background color changes to [hex] | P0 |
| Form validation displays error | Red border + error message below field | P0 |
| Responsive layout at 768px | Layout switches to mobile view | P1 |

## 🔄 E2E Workflow Testing

### User Journeys

**Journey 1: [Workflow Name]**
1. **Action**: User clicks [Component]
   - **Expected**: [Expected behavior]
   - **Test Data**: [Sample data]

2. **Action**: User enters [Input]
   - **Expected**: [Validation behavior]
   - **Test Data**: [Sample data]

3. **Action**: User submits [Form]
   - **Expected**: [Success state]
   - **Test Data**: [Sample data]

### Interaction Testing

| Interaction | Test Scenario | Expected Result | Priority |
|-------------|--------------|-----------------|----------|
| Click button | User clicks primary CTA | Navigation to next screen | P0 |
| Form input | User types invalid email | Error message appears | P0 |
| Dropdown select | User selects option | Option highlighted, form updates | P1 |

## 📎 Reference Data

### Design Assets

- **Figma File**: [File URL]
- **Node ID**: [Node ID]
- **Component Library**: [If applicable]
- **Design System**: [If applicable]

### Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Primary | #1A73E8 | CTA buttons, links |
| Error | #D93025 | Error states, validation |
| Success | #1E8E3E | Success messages |

### Typography

| Style | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| H1 | Inter | 32px | 700 | Page titles |
| Body | Inter | 16px | 400 | Main content |
| Button | Inter | 14px | 600 | Button text |

### Spacing & Layout

- Grid columns: [Number]
- Gutter width: [Value]
- Breakpoints: Mobile (320px), Tablet (768px), Desktop (1024px)

## 🎯 Test Coverage Summary

- **Total Components**: [Count]
- **Total Test Points**: [Count]
- **Critical (P0)**: [Count]
- **High Priority (P1)**: [Count]
- **Medium Priority (P2)**: [Count]
```

## Output File Handling

**Default Location**: Confirm with user or use:
```
/Users/xuyin/Documents/FeatureTest/QAPlans/
```

**Naming Convention**:
```
qa_plan_figma_<feature_id>_<YYYY-MM-DD>.md
```

## Reference Data to Preserve

Save critical information for downstream skills (orchestrator, review):

1. **Design Specifications**
   - Component hierarchy
   - Interactive elements
   - State variations
   - Design tokens (colors, spacing, typography)

2. **Visual Assets**
   - Screenshot URLs
   - Asset download links
   - Icon references

3. **Design Context**
   - Framework recommendations
   - Code snippets (if generated)
   - Implementation notes

4. **Metadata**
   - Figma file version
   - Last modified date
   - Design system version

## Best Practices

### Be Specific
- Reference exact component names from Figma
- Include hex codes for colors
- Specify pixel values for spacing
- Document all interactive states

### Think Like a QA Engineer
- Identify edge cases in UI (long text, empty states)
- Consider accessibility (keyboard navigation, screen readers)
- Check for responsive behavior at various breakpoints
- Validate error states and loading states

### Structure for Automation
- Use clear, actionable test descriptions
- Include specific selectors/identifiers
- Document expected vs. actual behavior
- Prioritize tests (P0, P1, P2)

## Error Handling

**If Figma URL is invalid**:
1. Inform user the URL format is incorrect
2. Request correct format: `https://figma.com/design/:fileKey/:fileName?node-id=X-Y`

**If node ID is missing**:
1. Try to get file metadata first
2. Ask user to specify which frame/component to analyze

**If MCP server is unavailable**:
1. Verify MCP server configuration
2. Check Figma API key is valid
3. Suggest manual design analysis as fallback

## Integration with Other Skills

This skill outputs data consumed by:
- `qa-plan-architect-orchestrator`: Merges with code and Jira analysis
- `qa-plan-review`: Reviews completeness of UI test coverage
- `xmind-generator`: Visualizes test scenarios in mind map format

## Example Usage

**User Request**:
> "Create QA plan from this Figma design: https://figma.com/design/abc123/LoginFlow?node-id=1-2"

**Skill Actions**:
1. Extract fileKey: `abc123`, nodeId: `1:2`
2. Call Figma MCP `get_design_context`
3. Analyze UI components (form inputs, buttons, validation)
4. Document E2E login flow
5. Generate `qa_plan_figma_login_2026-01-29.md`
6. Save reference data for orchestrator

## Notes

- Always check if `forceCode` should be true if design is large
- Use `disableCodeConnect` only if user explicitly requests
- For complex designs, process frame by frame
- Document all assumptions made during analysis
