---
name: qa-plan-refactor
description: Systematically refactor QA plans based on review feedback by addressing action items and updating documentation. Use when the user asks to "update QA plan", "fix QA plan issues", "implement review feedback", or mentions "refactor QA plan".
---

# QA Plan Refactor

Systematically refactor QA plans based on professional review feedback, ensuring all action items are addressed and the plan meets quality standards.

## When to Use

- User asks to "update QA plan based on review"
- After `qa-plan-review` skill generates review findings
- User mentions "implement review feedback" or "fix QA plan issues"
- User wants to "address action items" from review

## Prerequisites

**Required Files**:
- QA Plan file to refactor
- Review findings file (from `qa-plan-review` skill)

**Optional**:
- Design documents (for clarification)
- Code repository (for verification)
- Requirements documents (for coverage checks)

## Workflow Overview

Based on `@.cursor/commands/qa-plan-refactor.md`, follow this systematic approach:

1. **Read QA Plan** + **Review Findings**
2. **Extract Action Items** from review
3. **Implement Each Action Item** systematically
4. **Update Original QA Plan**
5. **Update Review Findings** (mark items complete)
6. **Update Review Status** (if all items resolved)

## Detailed Workflow

### Step 1: Read Files

**Read QA Plan**:
```bash
/Users/xuyin/Documents/FeatureTest/QAPlans/qa_plan_comprehensive_login_2026-01-29.md
```

**Read Provided Materials**:
- use `github` MCP to read the associated pr
- use `atlassian` MCP to read the associated design document and jira issues
- use `figma` MCP to read the associated figma design
**Read Review Findings**:
```bash
/Users/xuyin/Documents/FeatureTest/QAPlans/qa_plan_review_login_2026-01-29.md
```

**Read Reference Materials** (if available):
```bash
/Users/xuyin/Documents/FeatureTest/QAPlans/qa_plan_review_login_2026-01-29_references.md
```

### Step 2: Extract Action Items

Parse the **🛠️ Action Items** section from review:

```markdown
## 🛠️ Action Items

### For QA Plan Author

1. [ ] Add concurrent login test scenarios (Location: E2E Testing section)
2. [ ] Specify performance metrics with percentiles (Location: Performance Testing section)
3. [ ] Add code references to all UI test scenarios (Location: UI Testing section)
...
```

Create internal checklist:
```
TODO:
- [ ] Action 1: Add concurrent login tests
- [ ] Action 2: Specify performance percentiles  
- [ ] Action 3: Add UI test code references
...
```

### Step 3: Implement Action Items

For **each action item**, follow this process:

#### Action Item Processing Template

**Action**: [Description from review]

**Steps**:
1. **Locate**: Find exact section in QA plan
2. **Gather Context**: Read reference materials if needed
3. **Verify**: Check code/design if action is vague
4. **Update**: Make specific changes to QA plan
5. **Validate**: Ensure update addresses the issue

#### Example: Adding Missing Test Scenario

**Action Item from Review**:
```
1. [ ] Add concurrent login test scenarios (Location: E2E Testing section)
   - Reference: Design Doc §4.3
   - Expected test: Login on Device A → Login on Device B → Verify session behavior
   - Expected result: Both sessions maintained independently
```

**Implementation**:

1. **Locate** section in QA plan:
   - Find: `## E2E Workflow Testing`
   - Subsection: `### User Login Flow`

2. **Verify requirement** (optional - only if action is vague):
   ```
   Tool: CallMcpTool (if needed to check design doc)
   ```

3. **Update QA plan** with new test scenario:

**Original**:
```markdown
### User Login Flow

| Priority | Test Scenario | Expected Result |
|----------|---------------|-----------------|
| P0 | Login with valid credentials | User redirected to dashboard |
| P0 | Login with invalid credentials | Error message displayed |
```

**Updated**:
```markdown
### User Login Flow

| Priority | Related Code Change | Test Key Points | Expected Results |
|----------|---------------------|-----------------|------------------|
| P0 | src/api/auth/login.ts | Login with valid credentials | 200 OK, JWT token, redirect to dashboard |
| P0 | src/api/auth/login.ts | Login with invalid credentials | 401 Unauthorized, error message displayed |
| P1 | src/middleware/session.ts:34 | Concurrent login: User logs in on Device A, then Device B while session A active | Both sessions maintained independently per Design Doc §4.3, each with 30min inactivity timeout |
| P1 | src/middleware/session.ts:34 | Concurrent login: Verify both sessions can make API calls | Both sessions valid, requests succeed with respective tokens |
```

#### Example: Enhancing Technical Specificity

**Action Item from Review**:
```
3. [ ] Add code references to all UI test scenarios (Location: UI Testing section)
   - Format: `src/components/Button.tsx:67-73`
   - For each component test, add file path and line numbers
```

**Implementation**:

**Original**:
```markdown
## UI Testing

### Components

| Priority | Test Key Points | Expected Results |
|----------|-----------------|------------------|
| P0 | Button hover state | Color changes |
| P0 | Input validation error | Error message appears |
```

**Updated**:
```markdown
## UI Testing

### Components

| Priority | Related Code Change | Test Key Points | Expected Results |
|----------|---------------------|-----------------|------------------|
| P0 | src/components/Button.tsx:67-73 | Button hover state changes color | Background changes from #1A73E8 to #1557B0, transition 200ms |
| P0 | src/components/Input.tsx:45-58 | Input validation error display | Red border (#D93025), error message appears below field with 300ms fade-in |
```

### Step 4: Systematic Updates

**For each action item**:

1. **Update QA Plan**: Make the required changes
2. **Track Progress**: Keep internal checklist
3. **Maintain Consistency**: Ensure formatting matches existing style
4. **Preserve Traceability**: Keep all existing references intact

**Update Strategies by Action Type**:

| Action Type | Update Strategy |
|-------------|-----------------|
| **Add missing test** | Insert new row in appropriate table, maintain priority order |
| **Enhance specificity** | Add code references, specific values, file paths |
| **Fix vague language** | Replace with concrete, measurable descriptions |
| **Add technical details** | Include function names, API endpoints, exact values |
| **Fill coverage gaps** | Add test scenarios for uncovered requirements |
| **Improve risk mitigation** | Add code references, specific implementation details |

### Step 5: Update Review Findings

After implementing all action items, update the review findings file:

**Find the Action Items section**:
```markdown
## 🛠️ Action Items

### For QA Plan Author

1. [ ] Add concurrent login test scenarios
2. [ ] Specify performance metrics with percentiles
3. [ ] Add code references to all UI test scenarios
```

**Update checkboxes** for completed items:
```markdown
## 🛠️ Action Items

### For QA Plan Author

1. [x] Add concurrent login test scenarios ✅
   - Added to E2E Testing § User Login Flow
   - Test scenario: Concurrent login on Device A and B
   - Reference: Design Doc §4.3
   
2. [x] Specify performance metrics with percentiles ✅
   - Updated Performance Testing section
   - Specified p50, p95, p99 targets: p50: <500ms, p95: <2s, p99: <5s
   
3. [x] Add code references to all UI test scenarios ✅
   - All UI tests now include file paths and line numbers
   - Format: src/components/Component.tsx:line-line
```

### Step 6: Update Review Status

**Find the Review Summary section**:
```markdown
## 📝 Review Summary

| Field | Value |
|-------|-------|
| **Status** | 🟡 Requires Updates |
```

**If all action items resolved**, update status:
```markdown
## 📝 Review Summary

| Field | Value |
|-------|-------|
| **Status** | 🟢 Approved ✅ |
| **Updated** | [Current Date/Time] |
| **All Action Items Addressed** | Yes |
```

**Add update note**:
```markdown
## 📝 Update Log

### Update 2026-01-29 14:30

**Status Changed**: 🟡 Requires Updates → 🟢 Approved

**Action Items Addressed**:
- ✅ All 10 action items completed
- ✅ QA plan updated with enhanced test scenarios
- ✅ All code references added
- ✅ Performance metrics specified with percentiles
- ✅ Security test scenarios enhanced

**Changes Made**:
- Added 5 new test scenarios for edge cases
- Enhanced 15 existing tests with code references
- Added Test Data section with specific values
- Updated Risk & Mitigation with implementation details

**Ready for**: Stakeholder review and sign-off
```

## Refactor Principles

### Direct Mapping

**Every edit must map to an action item**:
- Don't add content not requested in review
- Don't remove content unless review flagged it as incorrect
- Stay focused on addressing review feedback

### Technical Accuracy

**Never "blindly" fix**:
- If action asks for code reference, verify the file/function exists
- Use GitHub MCP to check actual code when uncertain
- Consult design docs when clarification needed
- Ask user if action item is ambiguous

### Maintain Integrity

**Preserve QA plan structure**:
- Keep all existing sections
- Maintain table formatting
- Preserve priority labels (P0, P1, P2)
- Keep existing references intact

### Completeness

**Only mark complete when**:
- Change is actually saved in QA plan
- Change fully addresses the action item
- Change is verified (if technical claim)
- Change maintains consistency with rest of document

## Advanced Scenarios

### Scenario 1: Action Requires External Data

**Action**: "Verify session management implementation matches design"

**Steps**:
1. Read design doc via Atlassian MCP (if not vague)
2. Read code via GitHub MCP (if file reference provided)
3. Compare design spec vs. implementation
4. Update QA plan with findings
5. If mismatch found, flag for developer review

### Scenario 2: Action Item is Vague

**Action**: "Improve performance testing"

**Steps**:
1. Check review for more context
2. Check reference materials for specifics
3. If still unclear, **ask user** for clarification:
   > "The review mentions 'Improve performance testing' but doesn't specify what to improve. Should I:
   > 1. Add specific p50/p95/p99 targets?
   > 2. Add more performance test scenarios?
   > 3. Both?"
4. Proceed based on user guidance

### Scenario 3: Action Conflicts with Existing Content

**Action**: "Add concurrent login test"
**Conflict**: QA plan already has concurrent login test

**Resolution**:
1. Check if existing test meets review requirements
2. If yes, mark action as "Already implemented"
3. If no, **enhance** existing test rather than duplicate
4. Document in review update: "Enhanced existing test to meet requirements"

### Scenario 4: Technical Claim Can't Be Verified

**Action**: "Add code reference: src/auth/login.ts:45"
**Problem**: File path doesn't exist or line numbers wrong

**Steps**:
1. Search for correct file via GitHub MCP or grep
2. If found, use correct path
3. If not found, document as:
   ```markdown
   Note: Code reference could not be verified. 
   Expected: src/auth/login.ts:45
   Actual: File not found in codebase
   Action: Flagged for developer verification
   ```
4. Mark action as "Pending verification"

## Integration with Other Skills

**Input from**:
- `qa-plan-review`: Review findings and action items
- `qa-plan-architect-orchestrator`: Original comprehensive plan
- Design/code sources: For verification when needed

**Output to**:
- Updated QA plan (ready for re-review or stakeholder approval)
- Updated review findings (with completion status)
- Can trigger another `qa-plan-review` cycle if major changes

## Error Handling

**If QA plan file not found**:
1. Ask user for file path
2. List available files in default directory
3. Confirm which file to update

**If review file not found**:
1. Ask user for review file path
2. Request user to provide action items manually
3. Proceed with manual action list

**If action item is ambiguous**:
1. Check reference materials for context
2. If still unclear, ask user for clarification
3. Don't guess - accuracy is critical

**If file is too large**:
1. Process in sections
2. Save intermediate state
3. Continue until all actions addressed

## Validation Checklist

Before completing refactor, verify:

**QA Plan Updates**:
- [ ] All action items addressed
- [ ] Changes are accurate and specific
- [ ] Formatting is consistent
- [ ] No content removed unless requested
- [ ] All tables properly formatted
- [ ] Code references verified (when possible)

**Review Findings Updates**:
- [ ] All completed action items marked [x]
- [ ] Completion notes added for each item
- [ ] Review status updated if all complete
- [ ] Update log added with timestamp

**Quality Checks**:
- [ ] Technical claims are accurate
- [ ] No typos or formatting errors
- [ ] Traceability maintained
- [ ] Priority labels consistent
- [ ] File paths are valid

## Output Files

**Updated files**:
1. `qa_plan_comprehensive_<feature_id>_<date>.md` - Original plan with updates
2. `qa_plan_review_<feature_id>_<date>.md` - Review findings with completed checkboxes

**Optional**:
3. `qa_plan_refactor_log_<feature_id>_<date>.md` - Detailed change log (if major refactor)

## Example Usage

**User Request**:
> "Update the QA plan for login feature based on the review feedback"

**Skill Actions**:
1. Read `qa_plan_comprehensive_login_2026-01-29.md`
2. Read `qa_plan_review_login_2026-01-29.md`
3. Extract 10 action items from review
4. For each action item:
   - Locate section in QA plan
   - Verify requirements if needed (read design doc)
   - Make specific update
   - Track completion
5. Save updated QA plan
6. Update review findings (mark all items [x])
7. Update review status to 🟢 Approved
8. Add update log with summary
9. Present summary to user:
   > "QA plan updated successfully. Addressed all 10 action items:
   > - Added 5 new test scenarios for edge cases
   > - Enhanced 15 tests with code references
   > - Specified performance metrics (p50/p95/p99)
   > - Updated risk mitigations with implementation details
   > Review status changed to ✅ Approved. Ready for stakeholder sign-off."

## Best Practices

### Be Methodical

- Process action items in order (don't skip around)
- Complete one item fully before moving to next
- Track progress to avoid missing items

### Be Precise

- Match the exact location specified in action
- Use exact formatting requested
- Verify technical details when making claims

### Be Consistent

- Maintain existing document style
- Use same priority labels throughout
- Keep table formatting consistent
- Preserve section numbering

### Be Thorough

- Don't just add minimal changes
- Ensure updates fully address the issue
- Add context where helpful
- Link to relevant references

### Document Changes

- Mark completed items clearly
- Add notes about what was changed
- Update timestamps
- Create change log for major refactors

## Notes

- This skill focuses on **implementation only** - no new analysis
- Always reference specific action items when updating
- Verify technical claims against actual code when possible
- Update review status only when ALL action items complete
- Maintain atomicity: QA plan and review findings updated together
- Ready for re-review cycle if user requests or if major gaps remain
