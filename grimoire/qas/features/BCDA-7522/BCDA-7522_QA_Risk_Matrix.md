# QA Risk & Exploration Matrix: Panel Maximize Feature

## 1. Feature Overview

- **Feature/Epic**: BCDA-7522 - Allow user to maximize visualization in a panel to the entire dashboard
- **Current Status**: In Progress
- **Summary**: Feature allowing users to maximize visualizations to entire dashboard or panel scope, with multiple configuration options and state management across authoring/consumption modes.
- **Risk Assessment**: 🔴 **HIGH** - Systematic issues with state management, data integrity on restore operations, and feature completeness across multiple dashboard modes.

---

## 2. QA Risk & Exploration Matrix

| Issue Key | Summary | Status | Risk Level | Why Risky? | Area to Explore (QA Focus) |
|-----------|---------|--------|------------|------------|----------------------------|
| BCDA-7997 | Panel maximize \| For viz in info window, it should not be maximized to entire dashboard | To Do | 🔴 High | UI boundary logic error - maximization scope not properly scoped to info window context; impacts feature core logic | Scope handling: Test maximize behavior in info window vs main dashboard; verify context-aware maximize logic |
| BCDA-7995 | Panel maximize \| In freeform layout dashboard, info window can not show on a maximized viz | To Do | 🔴 High | Layout rendering bug affecting freeform mode; info window display logic broken during maximize state | Layout rendering: Test info window overlay on maximized viz; test all dashboard layout types; verify z-index and DOM rendering |
| BCDA-7994 | Panel maximize \| When set to 'maximize to entire dashboard', export to PDF on grid will be no data | To Do | 🔴 High | Data export pipeline broken during maximize state; data context lost in export handler | Export functionality: Test PDF/export operations in maximized state; verify data context preservation; test all export formats |
| BCDA-7993 | Panel maximize \| Under consumption, it will show loading icon when maximize/restore, while there is no under authoring | To Do | 🟡 Medium | UX inconsistency between modes; loading state handling differs based on context | UX consistency: Compare loading states authoring vs consumption; verify async operation handling in both modes |
| BCDA-7992 | Panel maximize \| Should hide maximize button when only one panel with one viz, also in info window, otherwise, maximize it will be empty | To Do | 🔴 High | Dangerous UX: button exists but action causes empty state; UI doesn't properly validate maximize eligibility before allowing action | Button visibility logic: Test maximize button presence in edge cases (single panel, single viz); test result states; verify info window button handling |
| BCDA-7991 | Random \| Duplicate page will show error - cannot read properties of undefined (reading 'row') | To Do | 🔴 High | JavaScript null reference error in page duplication; nested panel stack duplication not properly handled; crashes functionality | State cloning: Test page duplication with nested panels; test with various panel stack configurations; verify all panel properties cloned correctly |
| BCDA-7990 | Panel Stack \| Maximize panel and undo under consumption, panel will not restore | To Do | 🔴 High | Undo/history state management bug; consumption mode doesn't properly restore maximize state; authoring mode works (indicates inconsistent implementation) | State history: Test undo after maximize in consumption vs authoring modes; test undo stack integrity; verify state restoration logic |
| BCDA-7988 | Panel Maximize \| Change maximize setting to entire dashboard, one still be maximized to panel | To Do | 🔴 High | Settings not applied retroactively to existing maximize states; mixed maximize modes can coexist; state sync failure between config and UI | Config synchronization: Test changing maximize settings with active maximize states; verify all panels update to new mode; test mixed mode states |
| BCDA-7986 | Panel Maximize \| Viz will be empty after undo etc. manipulations + restore | To Do | 🔴 High | Data context lost during state transitions; restore operation doesn't properly rehydrate visualization data; affects multiple workflows (undo, keep-only, resize) | Data rehydration: Test viz content after restore following undo/keep-only/resize; test with different viz types; verify data context preserved across state transitions |

**Risk Legend:**
- 🔴 **High**: Complex logic, critical dependency, or known instability (7 issues)
- 🟡 **Medium**: Moderate complexity or UI changes (1 issue)
- 🟢 **Low**: Simple text/asset changes or stable code (0 issues)

---

## 3. Key Testing Recommendations

### Critical Areas Requiring Deep Exploration:

#### 1. State Management & Data Context (BCDA-7986, BCDA-7990, BCDA-7991, BCDA-7988)
- Verify data binding across maximize/restore cycles
- Test undo/redo history with maximize states
- Validate state cloning in nested structures
- **Test Scenarios:**
  - Maximize → Undo → Restore → Verify data integrity
  - Page duplication with nested panel stacks
  - Multiple consecutive maximize/restore cycles
  - State persistence across page navigation

#### 2. Cross-Mode Behavior (BCDA-7993, BCDA-7995, BCDA-7997)
- Compare authoring vs consumption mode implementations
- Test all dashboard layout types (grid, freeform, panel stack)
- Verify info window behavior isolation
- **Test Scenarios:**
  - Maximize in authoring mode, switch to consumption
  - Info window context boundaries
  - Loading state consistency
  - Modal/overlay rendering in different modes

#### 3. Edge Cases & Boundary Conditions (BCDA-7992, BCDA-7994)
- Single panel/single viz scenarios
- Export operations during active maximize states
- Button visibility logic with various panel configurations
- **Test Scenarios:**
  - Maximize with single panel containing single viz
  - PDF export from maximized grid
  - Button visibility in info window contexts
  - Export with different data states (empty, partial, full)

#### 4. Integration Points
- PDF export engine with maximize state
- Panel duplication with nested structures
- Configuration changes with active states
- Undo/redo engine integration

---

## 4. Risk Distribution Summary

| Risk Level | Count | Issues |
|-----------|-------|--------|
| 🔴 High | 7 | BCDA-7997, BCDA-7995, BCDA-7994, BCDA-7992, BCDA-7991, BCDA-7990, BCDA-7988, BCDA-7986 |
| 🟡 Medium | 1 | BCDA-7993 |
| 🟢 Low | 0 | — |

---

## 5. Recommended QA Strategy

### Phase 1: Foundational Testing
- Test basic maximize/restore functionality across all contexts
- Verify state management integrity
- Test authoring vs consumption mode consistency

### Phase 2: Integration Testing
- Test with real-world panel configurations
- Test export operations in maximize states
- Test nested panel behaviors

### Phase 3: Edge Case & Regression Testing
- Test boundary conditions (single panel/viz)
- Test state transitions (undo, keep-only, resize)
- Test configuration changes with active states
- Test cross-browser compatibility

### Phase 4: User Acceptance Testing
- Test user workflows with mixed panel layouts
- Verify button visibility logic matches UX requirements
- Test responsive behavior at different breakpoints

---

**Generated**: 2026-01-17
**Status**: All defects in "To Do" state - Ready for development sprint
