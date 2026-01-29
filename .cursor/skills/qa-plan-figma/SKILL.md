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

**MCP Server Required**: A Figma MCP server must be configured and accessible.

---

## Workflow

### Step 0: Read the Figma Design & Create Reference Materials

**0.1: Fetch Figma Design Data**
- If full nodes are too large, split design into smaller frames
- Extract all relevant design information using Figma MCP tools

**0.2: Create Reference Directory** ⚠️ MANDATORY

Create `_references/` subfolder in the same directory as the QA plan:
```bash
<qa-plan-directory>/_references/
```

**0.3: Save Reference Materials** ⚠️ MANDATORY

Create the following file in `_references/` subfolder:

**Filename**: `figma_metadata_<feature_id>_<YYYY-MM-DD>.md`

**Template**:
```markdown
# Figma Design Metadata: [Feature Name]

**Generated**: [ISO timestamp]
**Figma File**: [URL]
**File Key**: [fileKey]
**Node ID**: [nodeId]
**File Version**: [version if available]

## Frames Analyzed

| Frame Name | Node ID | Dimensions | Components Count |
|------------|---------|------------|------------------|
| [Name] | [ID] | [W×H] | [N] |

## Component Inventory

| Component Type | Count | Variants | Example Node IDs |
|----------------|-------|----------|------------------|
| Button | 5 | Primary, Secondary, Icon | 123:456, 124:457 |
| Input | 8 | Text, Email, Password | 125:458 |
| Toggle | 12 | On/Off | 126:459 |

## Design Tokens Extracted

### Colors
| Token Name | Hex Value | Usage | Observed In |
|------------|-----------|-------|-------------|
| Primary | #0E6FF9 | Interactive elements | Buttons, links, active states |

### Typography
| Style | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| Body | SF Pro Text | 14px | 400 | 18px |

### Spacing
| Token | Value | Usage |
|-------|-------|-------|
| Sidebar width | 240px | Left navigation |
| Toggle size | 36×18px | All toggle switches |

## Interactive Elements Catalog

| Element | Location | States | Actions | Priority |
|---------|----------|--------|---------|----------|
| [Name] | [Frame > Path] | [List] | [List] | P0/P1/P2 |

## Analysis Notes

- [Any assumptions made]
- [Design inconsistencies found]
- [Missing specifications]
- [Recommendations for designers]
```

**0.4: Reference in QA Plan**

Add this section to the QA plan:
```markdown
## 📎 Reference Materials

**Metadata**: `_references/figma_metadata_<feature_id>_<YYYY-MM-DD>.md`
**Design File**: [Figma URL]
**Analysis Date**: [YYYY-MM-DD]
```

---

### Step 1: Analyze Design for Test Scenarios

Extract and document:

**UI Elements**:
- Identify all interactive components (buttons, inputs, toggles, dropdowns, etc.)
- Document component variants and states
- Note design tokens (colors, typography, spacing)
- Catalog icons and visual elements

**User Flows**:
- Map primary user journeys through the interface
- Identify decision points and branching paths
- Document form validation flows
- Note state transitions and animations

---

### Step 1.5: Content Depth Requirements ⚠️ CRITICAL

For EACH test scenario, you MUST include:

1. **Test Key Points**: A list of short key points to test for this scenario.
2. **Expected Results**: Concrete, measurable outcomes with specific values (colors, dimensions, behaviors)
3. **Edge Cases**: At least 2 edge cases per major feature (long text, empty state, error conditions, etc.)
4. **Cross-Platform Considerations**: Browser/device-specific behaviors where applicable

**Example - Shallow vs Comprehensive**:

❌ **BAD** (too shallow - results in ~177-line output):
```markdown
### Toggle switch testing
- Test toggle switch
- Verify it works
- Check states
```

✅ **GOOD** (comprehensive - target 500-1000+ lines):
```markdown
### Toggle Switch Interaction (P0)

**Test Scenarios**:
1. **Enable Feature via Toggle**
   - Click toggle in disabled state (gray background)
   - Verify visual feedback: toggle handle moves right, background changes to #0E6FF9
   - Verify label updates if applicable
   - Save configuration
   - Reload page
   - Verify toggle state persists as enabled
   
2. **Disable Feature via Toggle**
   - Click toggle in enabled state
   - Verify visual feedback: handle moves left, background changes to gray (#D7D7D8)
   - Verify dependent fields become disabled if applicable
   - Test runtime behavior reflects disabled state

3. **Keyboard Interaction**
   - Tab to toggle switch
   - Verify focus indicator visible (outline or ring)
   - Press Space or Enter key
   - Verify toggle state changes
   - Verify screen reader announces "Toggle switched on/off"

4. **Disabled State**
   - Render toggle in disabled state
   - Verify toggle appears grayed out with reduced opacity
   - Verify cursor changes to not-allowed
   - Verify click/keyboard interaction has no effect
   - Verify tooltip explains why disabled (if applicable)

5. **Edge Cases**
   - Toggle during network latency (slow save)
     - Verify loading indicator shown
     - Verify toggle temporarily disabled during save
     - Test optimistic UI vs server confirmation
     - Handle save failure gracefully (revert + error message)
   - Multiple rapid toggles (stress test)
     - Click toggle 10 times rapidly
     - Verify final state matches last action
     - Verify no race conditions or state corruption

**Expected Results**:
- Toggle dimensions: 36×18px (all toggles consistent)
- Enabled color: #0E6FF9 (primary blue)
- Disabled color: #D7D7D8 (border gray)
- State persistence: 100% after page reload
- Keyboard accessibility: Full control via Space/Enter
- Screen reader support: Clear state announcements
```

**Quality Target**: Comprehensive QA plans should be **500-1000+ lines** depending on design complexity.

---

### Step 2: Generate QA Plan Structure

Create a markdown file: `qa_plan_figma_<feature_id>_<date>.md`

```markdown
# QA Plan: [Feature Name] (Figma) — [Feature ID]

## 📊 Summary

| Field | Value |
|-------|-------|
| **Source** | [Figma URL] |
| **Date Generated** | [Current Date] |
| **Node ID** | [Node ID] |
| **File Key** | [File Key] |
| **Framework** | [Detected Framework] |
| **Related Docs** | [Links to other QA plans] |

---

## 🎨 UI Testing

### Components Identified

| Component | Variants / Notes | Key States to Validate | Priority |
|-----------|------------------|------------------------|----------|
| Button | Primary, Secondary | Default, Hover, Active, Disabled | P0 |
| Input Field | Text, Email, Password | Empty, Filled, Error, Focused | P0 |
| Modal | Confirmation, Alert | Open, Closed | P1 |

### Visual Regression / Design Fidelity Test Points

| Test Point | Expected Result | Priority |
|------------|-----------------|----------|
| Button hover state changes color | Background color changes to [hex] | P0 |
| Form validation displays error | Red border + error message below field | P0 |
| Responsive layout at 768px | Layout switches to mobile view | P1 |

---

## 🔄 E2E Workflow Testing

### User Journeys

#### Journey 1: [Workflow Name]
1. **Action**: User clicks [Component]
   - **Expected**: [Expected behavior]
   - **Priority**: P0
   
2. **Action**: User enters [Input]
   - **Expected**: [Validation behavior]
   - **Priority**: P0
   
3. **Action**: User submits [Form]
   - **Expected**: [Success state]
   - **Priority**: P0

### Interaction Testing

| Interaction | Test Scenario | Expected Result | Priority |
|-------------|---------------|-----------------|----------|
| Click button | User clicks primary CTA | Navigation to next screen | P0 |
| Form input | User types invalid email | Error message appears | P0 |
| Dropdown select | User selects option | Option highlighted, form updates | P1 |

---

## 📎 Reference Data (Design Tokens & Specs)

### Color Palette (variables observed)

| Token | Value | Usage Notes |
|-------|------:|-------------|
| Primary accent | #0E6FF9 | Primary buttons, active indicators |
| Error | #D9232E | Error borders/text |

### Typography (variables observed)

| Style | Font | Size | Weight | Line Height | Usage |
|-------|------|-----:|-------:|------------:|-------|
| Body | SF Pro Text | 14 | 400 | 18 | Default content |
| Body Semibold | SF Pro Text | 14 | 600 | 18 | Labels / emphasis |

### Spacing & Layout (key measurements)

- **Sidebar**: 240px width
- **Grid**: 1408×844; **header row** 37px; **status bar** 44px
- **Toggle**: 36×18px

---

## 📋 Test Data Requirements ⚠️ REQUIRED

For comprehensive testing, ensure test environment includes:

1. **[Entity Type 1]**:
   - Minimum [X] items
   - Variations: [short names, long names, special characters]
   - Purpose: [Grid rendering, overflow testing]

2. **[Entity Type 2]**:
   - [Specific requirements]

---

## ♿ Accessibility Testing ⚠️ REQUIRED

### Keyboard Navigation Flows

1. **[Component Name] Navigation**:
   - Tab to [component]
   - Use arrow keys to navigate
   - Press Enter to select
   - Verify focus visible at all times

### Screen Reader Announcements

- **[Component]**: "[Expected announcement]"
- **[State Change]**: "[Expected announcement]"

---

## 🌐 Cross-Browser Compatibility ⚠️ REQUIRED

| Browser | Version | Specific Test Focus |
|---------|---------|---------------------|
| Chrome | Latest | Primary validation, performance |
| Firefox | Latest | Font rendering, layout precision |
| Safari | Latest | Platform fonts, animations |
| Edge | Latest | Fallback fonts, Windows-specific |

---

## ⚡ Performance Benchmarks ⚠️ REQUIRED

| Component | Metric | Target | Measurement Method | Priority |
|-----------|--------|--------|-------------------|----------|
| [Component] | First paint | < 100ms | Chrome DevTools | P0 |
| [Component] | Time to interactive | < 500ms | Lighthouse | P0 |
| Grid (100 rows) | Initial render | < 200ms | Performance API | P1 |

---

## 🎯 Test Coverage Summary

- **Total components covered**: [Count]
- **Critical (P0)**: [Count] test points
- **High (P1)**: [Count] test points
- **Medium (P2)**: [Count] test points

---

## 📎 Reference Materials

**Metadata**: `_references/figma_metadata_<feature_id>_<YYYY-MM-DD>.md`
**Design File**: [Figma URL]
**Analysis Date**: [YYYY-MM-DD]
```

---

## Quality Checklist (Run Before Completing) ⚠️ MANDATORY

Before marking the QA plan complete, verify:

- [ ] **Depth**: Each P0 scenario has ≥4 detailed test steps
- [ ] **Coverage**: All interactive components from Figma have test scenarios
- [ ] **Phases**: Test execution priorities defined (3 phases minimum)
- [ ] **Test Data**: Test data requirements documented with specific counts
- [ ] **Accessibility**: Keyboard navigation flows documented for major components
- [ ] **Cross-Browser**: Browser compatibility matrix completed
- [ ] **Performance**: Performance benchmarks defined for key interactions
- [ ] **References**: Metadata file created in `_references/` subfolder with proper naming
- [ ] **Line Count**: QA plan is ≥500 lines for complex designs (target 500-1000+ lines)
- [ ] **Edge Cases**: At least 2 edge cases documented per major feature
- [ ] **Expected Results**: All test scenarios include concrete, measurable outcomes

**Target**: Comprehensive QA plans should be **500-1000+ lines** depending on design complexity.

---

## Output File Handling

**Default Location**: Confirm with user or use:
```
<project-root>/grimoire/qas/features/<feature_id>/qa_plan_figma_<feature_id>_<YYYY-MM-DD>.md
```

**Naming Convention**:
```
qa_plan_figma_<feature_id>_<YYYY-MM-DD>.md
```

**Reference Materials Location**:
```
<project-root>/grimoire/qas/features/<feature_id>/_references/figma_metadata_<feature_id>_<YYYY-MM-DD>.md
```

---

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

---

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

---

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

---

## Integration with Other Skills

This skill outputs data consumed by:
- `qa-plan-architect-orchestrator`: Merges with code and Jira analysis
- `qa-plan-review`: Reviews completeness of UI test coverage
- `xmind-generator`: Visualizes test scenarios in mind map format

---

## Example Usage

**User Request**:
> "Create QA plan from this Figma design: https://figma.com/design/abc123/LoginFlow?node-id=1-2"

**Skill Actions**:
1. Extract fileKey: `abc123`, nodeId: `1:2`
2. Call Figma MCP `get_design_context`
3. Create `_references/` directory
4. Save `figma_metadata_login_2026-01-29.md`
5. Analyze UI components (form inputs, buttons, validation)
6. Document E2E login flow with comprehensive test scenarios
7. Generate `qa_plan_figma_login_2026-01-29.md` (target 500+ lines)
8. Run quality checklist before completion

---

## Notes

- Always check if `forceCode` should be true if design is large
- Use `disableCodeConnect` only if user explicitly requests
- For complex designs, process frame by frame
- Document all assumptions made during analysis
- Ensure metadata file is created BEFORE generating QA plan
- Reference the metadata file in the QA plan's Reference Materials section
