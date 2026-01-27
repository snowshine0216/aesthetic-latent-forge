# BCDA-7522: Add Maximize Button for Visualizations in Panel Stacks - QA Plan

## 1. Summary Table

| Item | Details |
|:------|:---------|
| **Feature** | [BCDA-7522](https://strategyagile.atlassian.net/browse/BCDA-7522) / [BCDA-770](https://strategyagile.atlassian.net/browse/BCDA-770) |
| **Target Release** | 26.02 (I-Server 11.6.0200) |
| **QA Owner** | TBD |
| **SE Design** | [BCDA-770: Add Maximize Button for Visualizations in Panel Stacks](https://microstrategy.atlassian.net/wiki/spaces/TECCLIENTSMOBILECTCiOSANA/pages/5517640238) |
| **UX Design** | See SE Design |
| **GitHub PRs** | [mstr-kiai/server#10198](https://github.com/mstr-kiai/server/pull/10198), [mstr-kiai/binsource#981](https://github.com/mstr-kiai/binsource/pull/981), [mstr-kiai/mojojs#8512](https://github.com/mstr-kiai/mojojs/pull/8512) |

---

## 2. QA Goal

### E2E: End to End
- Validate complete user workflow from setting maximize mode to consuming maximized visualizations in dashboards with panel stacks
- Ensure dashboard save/reload preserves maximize mode setting correctly

### FUN: Functionality
- Verify new "Maximize to entire dashboard" mode works correctly for visualizations within panel stacks
- Ensure "Maximize to current panel" legacy behavior remains intact
- Validate maximize button visibility logic for single and multiple visualizations in panels

### UX: User Experience
- Confirm maximize/restore transitions are smooth with proper curtain behavior
- Verify dashboard properties panel displays new option correctly
- Ensure proper background color handling during maximize

### PERF: Performance
- Assess DOM manipulation performance during maximize/restore operations
- Monitor memory usage with frequent maximize/restore cycles

### SEC: Security
- Verify no CSP violations with new DOM manipulations
- Ensure property value is properly validated on server side

### ACC: Accessibility
- Verify maximize button is keyboard accessible
- Confirm screen reader announces maximize state changes

### CER: Platform Certifications
- Web (Chrome, Firefox, Safari, Edge)
- MicroStrategy Library
- Workstation (Mac/Windows)

### UPG: Upgrade and Compatibility
- Test dashboards created in older versions with multiple maximized viz
- Verify backward compatibility when feature flag is disabled

### INT: Internationalization
- Verify new strings (29403, 29404, 29405) are properly localized
- Confirm dropdown options display correctly in RTL languages

### AUTO: Automation
- Unit tests for `shouldMaximizeVizToPage()` logic
- Integration tests for property persistence via REST API

### REL: Reliability & Robustness
- Execute stress tests involving rapid maximize/restore cycles to verify DOM stability
- Conduct soak testing to identify intermittent initialization errors (e.g., duplicate page, info window insertion)
- Validate state integrity across complex transitions (Undo/Redo -> Resize -> Restore)

---

## 3. QA Plan

### 3.1 Test Key Points

| ID | Category | Priority | Related Code Change | Test Key Points | Expected Results |
|----|----------|----------|---------------------|-----------------|------------------|
| **E2E-01** | E2E | P0 | DocRelativePanel.js, VizBox.js | Create dashboard with panel stack, set "Maximize to entire dashboard", maximize viz | Viz expands to full page, not just panel |
| **E2E-02** | E2E | P0 | generalEditorConfig.ts | Change maximize mode in Dashboard Properties > General, save and reopen | Setting persists across sessions |
| **E2E-03** | E2E | P0 | applyGeneralPropsChanges.ts | Change maximize mode while viz is maximized | Current maximized viz auto-restores before mode change |
| **E2E-04** | E2E | P1 | DocModel.js, FormatModel.js | Create dashboard in Web, open in Library | Maximize mode setting applies consistently |

### 3.2 Functionality Tests

#### 3.2.1 Maximize Mode Settings

| ID | Priority | Related Code Change | Test Key Points | Expected Results |
|----|----------|---------------------|-----------------|------------------|
| **FUN-01** | P0 | generalEditorConstants.ts | Verify dropdown options in Dashboard Properties | Two options: "Maximize to current panel (Web only)", "Maximize to entire dashboard" |
| **FUN-02** | P0 | CDSSDocumentDefinition.cpp | Set mode via properties panel, check REST API response | `mvm` field reflects correct value (0=panel, 1=page) |
| **FUN-03** | P0 | DocModel.js | Test `shouldMaximizeVizToPage()` returns true when mvm=1 and feature supported | Method returns correct boolean |
| **FUN-04** | P1 | generalEditorConfig.ts | Default value when creating new dashboard | Default is "Maximize to current panel (Web only)" (mvm=0) |

#### 3.2.2 Maximize Behavior - "Maximize to Entire Dashboard" Mode

| ID | Priority | Related Code Change | Test Key Points | Expected Results |
|----|----------|---------------------|-----------------|------------------|
| **FUN-05** | P0 | DocRelativePanel.buildMaximizedBox | Maximize viz in panel stack | Viz fills entire dashboard page, curtain covers all content |
| **FUN-06** | P0 | DocRelativePanel.toggleCurtain | Curtain background color | Matches dashboard page background color |
| **FUN-07** | P0 | DocRelativePanel.setPortalState | Restore maximized viz | Viz returns to original position in panel stack |
| **FUN-08** | P0 | VizBox.shouldShowMaxRestoreBtn | Single viz in panel stack | Maximize button IS shown (new behavior) |
| **FUN-09** | P1 | DocRelativePanel.buildMaximizedBox | Auto layout dashboard with maximize to page | Scale and positioning calculated from root panel |
| **FUN-10** | P1 | DocRelativePanel.buildMaximizedBox | Manual layout dashboard with maximize to page | Z-index properly set, box moves to root curtain |

#### 3.2.3 Maximize Behavior - "Maximize to Current Panel" Mode (Legacy)

| ID | Priority | Related Code Change | Test Key Points | Expected Results |
|----|----------|---------------------|-----------------|------------------|
| **FUN-11** | P0 | DocRelativePanel.js | Maximize viz in panel stack with legacy mode | Viz fills only the containing panel, not entire page |
| **FUN-12** | P0 | VizBox.shouldShowMaxRestoreBtn | Single viz in panel stack with legacy mode | Maximize button NOT shown (existing behavior) |
| **FUN-13** | P1 | DocRelativePanel.toggleCurtain | Curtain in legacy mode | Uses panel-level curtain, not root curtain |

#### 3.2.4 DOM Manipulation & State Management

| ID | Priority | Related Code Change | Test Key Points | Expected Results |
|----|----------|---------------------|-----------------|------------------|
| **FUN-14** | P0 | DocRelativePanel.buildMaximizedBox | `originalParent` and `originalIndexInParent` tracking | Values correctly stored on maximized box |
| **FUN-15** | P0 | DocRelativePanel.setPortalState | DOM node restoration after restore | Node inserted at correct index in original parent |
| **FUN-16** | P1 | DocRelativePanel.restoreAnyMaxedVizBox | Restore when source panel differs from root | `maximizedBoxSourcePanel` used to find correct viz |
| **FUN-17** | P1 | DocRelativePanel.resetCurtain | Curtain style cleanup after restore | `transform`, `margin`, `height` styles reset |
| **FUN-18** | P1 | VizBox.js (destroy lifecycle) | Create VizBox with maximize mode enabled, destroy widget, verify event listener detached | No orphaned `maximizeVizModeChanged` listeners on `DocModel`; listener properly cleaned up in widget destroy |

### 3.3 Edge Cases & Error Handling

| ID | Priority | Related Code Change | Test Key Points | Expected Results |
|----|----------|---------------------|-----------------|------------------|
| **EDGE-01** | P0 | DocRelativePanel.toggleCurtain, setPortalState | Multiple maximized viz (saved from older version): verify `originalIndexInParent` tracking when multiple viz are maximized; validate DOM order preserved after restore sequence | All viz visible on root curtain; user restores one-by-one; after all restored, DOM order matches original state; `insertBefore`/`appendChild` fallback logic works correctly |
| **EDGE-02** | P0 | DocRelativePanel.js (`isInfoWindow` check in `buildMaximizedBox`), Design doc 3.1.1 | Viz inside info window: verify `shouldMaximizeVizToPage()` returns `false` or maximize behavior stays within info window bounds | Info window detection prevents page-level maximize; viz maximizes within info window container only |
| **EDGE-03** | P1 | DocRelativePanel.restoreAnyMaxedVizBox | Switch layout mode while viz maximized | Maximized viz auto-restores |
| **EDGE-04** | P1 | DocPropsEditorReact.js | Change maximize mode while viz maximized | Viz auto-restores before mode change |
| **EDGE-05** | P1 | OneTierApp.js, VisualInsightAppBase.js | Server version < 26.02 | Feature disabled, fallback to panel-only maximize |
| **EDGE-06** | P2 | DocRelativePanel.buildMaximizedBox | Nested panel stacks (panel within panel) | Viz maximizes to root page correctly |
| **EDGE-07** | P2 | VizBox.js | Maximize during selection/transaction mode | Button hidden, action blocked |
| **EDGE-08** | P2 | CDSSDocumentDefinition.cpp, REST API | Set `mvm` to invalid value (2, -1, null) via REST API | Server rejects invalid values or defaults to 0 (panel-only mode); no undefined behavior |
| **EDGE-09** | P0 | DocRelativePanel.js | 🐛 **BCDA-8011, BCDA-7993**: Maximize/restore 5x cycles in each mode (authoring/consumption/presentation) | Panel size restores correctly each cycle; viz renders non-empty; no stuck spinners |
| **EDGE-10** | P0 | DocRelativePanel.js, VizBox.js | 🐛 **BCDA-7995, BCDA-7990**: Undo after maximize in consumption mode | Panel returns to original size/state; compare with authoring mode |
| **EDGE-11** | P0 | DocRelativePanel.js | 🐛 **BCDA-7994, BCDA-8010**: Maximize -> undo -> redo -> resize window -> restore | Rendered marks/grid cells present; layout matches expected |
| **EDGE-12** | P1 | DocRelativePanel.js | 🐛 **BCDA-8029**: Responsive mode maximize with pinned TOC/filter | No unintended scrolling; viewport starts at top; no overlap/clipping |
| **EDGE-13** | P1 | VizBox.js, DocRelativePanel.js | 🐛 **BCDA-7988**: Loading indicator during maximize/restore in consumption mode | No unnecessary spinner; check performance side effects |
| **EDGE-RUNTIME-01** | P1 | Page duplication logic | 🐛 **BCDA-7991**: Access duplicate page immediately after creation | No JS error reading undefined property ('row'); page renders correctly |

### 3.4 Cross-Functional Tests

| ID | Priority | Related Code Change | Test Key Points | Expected Results |
|----|----------|---------------------|-----------------|------------------|
| **XFUN-01** | P1 | FormatModel.js | Export dashboard with maximize mode setting | Setting included in exported dossier |
| **XFUN-02** | P1 | REST API | Import dashboard with maximize mode | Setting correctly imported and applied |
| **XFUN-03** | P1 | DocPropsEditorReact.js, VizBox.preBuildRendering | `maximizeVizModeChanged` event propagation: (1) `DocPropsEditorReact` calls `dm.raiseEvent({ name: 'maximizeVizModeChanged' })`, (2) `VizBox.preBuildRendering` listener receives event, (3) `toggleMenuButtonTitleCSS()` updates toolbar visibility | All viz toolbars refresh when mode changes; event correctly propagates through model to all VizBox instances |
| **XFUN-04** | P1 | N/A | 🐛 **BCDA-8029, BCDA-7993**: Maximize viz + pinned TOC panel interaction | No visual conflicts; no overlap/clipping; viewport at top |
| **XFUN-05** | P1 | N/A | 🐛 **BCDA-8029, BCDA-7993**: Maximize viz + pinned Filter panel interaction | No visual conflicts; panels occupy available space |
| **XFUN-06** | P0 | PDF Export | 🐛 **BCDA-7986**: Export PDF while grid is maximized | Exported file contains expected row/column counts; sampled cell values match on-screen data |
| **XFUN-07** | P1 | DocRelativePanel.js | 🐛 **BCDA-8017**: Create panel -> insert info window -> verify visualization | Visualization renders correctly; refresh/reopen and re-verify |
| **XFUN-08** | P1 | DocRelativePanel.js | 🐛 **BCDA-7993**: Reopen dashboard after resize while maximized/restored | Panels occupy available space; no background gaps |

### 3.5 Platform Certification Tests

| ID | Priority | Platform | Related Code Change | Test Key Points | Expected Results |
|----|----------|----------|---------------------|-----------------|------------------|
| **CER-01** | P1 | Mac Workstation | DocRelativePanel.adjustWorkstationStyle | Maximize viz in panel stack with "Maximize to entire dashboard" mode | Style adjustments (`adjustWorkstationStyle(-2)` / `adjustWorkstationStyle(2)`) applied correctly; dimensions calculated accurately |
| **CER-02** | P1 | Windows Workstation | DocRelativePanel.adjustWorkstationStyle | Maximize viz in panel stack with "Maximize to entire dashboard" mode | Style adjustments applied correctly; no visual artifacts during maximize/restore |
| **CER-ANDROID-01** | P0 | Android | DocRelativePanel.js | 🐛 **BCDA-8016**: Restore visualization in panel stack configurations | Panel stack remains visible; repeated restore cycles work correctly |
| **CER-ANDROID-02** | P1 | Android | DocRelativePanel.js | 🐛 **BCDA-8015**: Maximize/restore across DPIs, gesture nav modes, orientation changes | No border clipping; container bounds correct; padding preserved |
| **CER-ANDROID-03** | P1 | Android | DocRelativePanel.js | Android: background/foreground transitions during maximize/restore | State preserved correctly after app resume |

### 3.6 Regression Tests

| ID | Priority | Test Key Points | Expected Results |
|----|----------|-----------------|------------------|
| **REG-01** | P0 | Maximize viz NOT in panel stack (standalone) | Existing behavior unchanged |
| **REG-02** | P0 | Dashboard without panel stacks | No regressions in maximize behavior |
| **REG-03** | P1 | Panel stack navigation (selector switching panels) | Works correctly with maximized viz |
| **REG-04** | P1 | Page-by selector with panel stacks | No maximize conflicts |

### 3.7 Test Case Summary by Priority and Level

| Level | P0 | P1 | P2 | Total |
|-------|----|----|----|----|
| E2E | 3 | 1 | 0 | 4 |
| Functionality | 8 | 7 | 0 | 15 |
| Edge Cases | 2 | 4 | 3 | 9 |
| Cross-Functional | 0 | 3 | 2 | 5 |
| Platform Certification | 0 | 2 | 0 | 2 |
| Regression | 2 | 2 | 0 | 4 |
| **Total** | **15** | **19** | **5** | **39** |

### 3.8 Unit Test Coverage Summary

| File | Test File | Coverage Notes | Status |
|------|-----------|----------------|--------|
| DocRelativePanel.js | UT_DocRelativePanel.js | Mock for `shouldMaximizeVizToPage()` returns `false` (legacy path only) | ⚠️ Partial - needs `true` path coverage |
| HasBoxLayout.js | UT_HasBoxLayout.js | Mock for `shouldMaximizeVizToPage()` returns `false` (legacy path only) | ⚠️ Partial - needs `true` path coverage |
| DocModel.js | UT_DocModel.js | **REQUIRED**: Unit test for `shouldMaximizeVizToPage()` with `mvm=0` and `mvm=1` | ⬜ Required |
| VizBox.js | UT_VizBox.js | **REQUIRED**: Unit test for updated `shouldShowMaxRestoreBtn()` with new maximize mode | ⬜ Required |
| VizBox.js | UT_VizBox.js | **REQUIRED**: Unit test for `maximizeVizModeChanged` listener cleanup in destroy | ⬜ Required |

**Unit Test Tracking**: The above required tests are blockers for automation sign-off. Mocks returning `false` only test legacy behavior; new tests must exercise `shouldMaximizeVizToPage() === true` code path.

---

## 4. Risk & Mitigation

| Risk | Severity | Likelihood | Related Code/Design | Mitigation |
|------|----------|------------|---------------------|------------|
| DOM state corruption on rapid maximize/restore | High | Medium | DocRelativePanel.buildMaximizedBox, setPortalState | Track `originalParent`/`originalIndexInParent`; fallback to `containerNode.appendChild` |
| Multiple maximized viz from legacy dashboards overlap | Medium | Medium | Design doc 3.1.1 (toggleCurtain) | Keep curtain visible until last viz restored; accepted UX trade-off |
| Memory leak from event listener | Medium | Low | VizBox.preBuildRendering (`maximizeVizModeChanged`) | Ensure listener cleanup in widget destroy |
| Feature flag version mismatch | Medium | Low | OneTierApp.js, VisualInsightAppBase.js | Version check `VERSION_11_6_0200` for server support |
| Performance degradation with complex dashboards | Medium | Low | DocRelativePanel.adjustWorkstationStyle calls | Style adjustments scoped to maximize action only |
| Info window maximize conflicts | Low | Low | Design doc 3.1.1 | Info window explicitly excluded from new behavior |
| React props editor not default | Low | Medium | Design doc 3.1.2 | New option only in React editor; Mojo editor unchanged |
| Android layout instability (hidden panels/clipping) | Medium | Medium | Android specific layout/render logic | Extensive device matrix testing (DPI, orientation) |
| Export data discrepancy when maximized | Medium | Low | Export pipeline vs On-screen state | Verify export row/counts match on-screen data |
| Fragile UI lifecycle (Undefined property errors) | Medium | Low | Page duplication / Info window insert logic | Soak testing and error path automation (new page/panel flows) |
| Responsive layout conflicts with pinned panels | Low | Medium | Layout calculation with pinned TOC/Filter | Verify viewport start position and no overlap/clipping |

---

## 5. QA Summary

### 5.1 Code Changes Summary

| Repository | PR | Files Changed | Status | Notes |
|------------|----|--------------:|--------|-------|
| mstr-kiai/server | [#10198](https://github.com/mstr-kiai/server/pull/10198) | 3 | Open | Backend property serialization |
| mstr-kiai/binsource | [#981](https://github.com/mstr-kiai/binsource/pull/981) | 1 | Open | Property definition (GUIPROP.PDS) |
| mstr-kiai/mojojs | [#8512](https://github.com/mstr-kiai/mojojs/pull/8512) | 15 | Open | Main frontend implementation |

### 5.2 E2E Testing & Functionality

| Item | Status | Notes |
|------|--------|-------|
| Status | 🔴 In Progress | PRs under review; 16 defects identified |
| Currently Open Defects | 16 | 12 Medium, 4 Low severity |
| Limitations | - Feature only in React dashboard properties panel<br>- Info windows excluded from "maximize to page" behavior<br>- Dashboards with multiple maximized viz require manual restore |

### 5.3 Defect Tracking

**Overall Risk Assessment**: 🔴 **HIGH** - Dense cluster of MEDIUM defects impacts core panel workflows (maximize/restore + undo/redo/resize) with failure modes that blank visualizations, corrupt layout/state, and affect exports.

#### 5.3.1 Defect Summary by Category

| Category | Risk Level | Count | Defect Keys |
|----------|:----------:|:-----:|-------------|
| Panel Visualization Issues | 🔴 High | 12 | BCDA-8011, BCDA-7986, BCDA-8014, BCDA-7993, BCDA-8029, BCDA-7995, BCDA-7990, BCDA-7994, BCDA-8010, BCDA-7997, BCDA-7992, BCDA-7988 |
| Android Specific Issues | 🟡 Medium | 2 | BCDA-8016, BCDA-8015 |
| Random Errors | 🟡 Medium | 2 | BCDA-8017, BCDA-7991 |

#### 5.3.2 Defect Severity Distribution

| Severity | Count | Defect Keys |
|:---------|:------|:------------|
| 🔴 High | 0 | N/A |
| 🟡 Medium | 12 | BCDA-8011, BCDA-7986, BCDA-8014, BCDA-7993, BCDA-8029, BCDA-7995, BCDA-7990, BCDA-7994, BCDA-8010, BCDA-8016, BCDA-8017, BCDA-7991 |
| 🟢 Low | 4 | BCDA-7997, BCDA-7992, BCDA-7988, BCDA-8015 |

#### 5.3.3 Critical Defect Patterns

| Pattern | Impact | Related Defects | Test Coverage |
|---------|--------|-----------------|---------------|
| Maximize/restore cycles desync layout vs render | Empty panels, incorrect sizing | BCDA-8011, BCDA-7986, BCDA-8014, BCDA-7993, BCDA-8029 | E2E-01, FUN-05, FUN-07, EDGE-01 |
| Undo/redo after maximize blanks viz | Visualization data loss | BCDA-7995, BCDA-7990, BCDA-7994, BCDA-8010 | E2E-03, EDGE-03, EDGE-04 |
| Responsive layout + pinned panels issues | Scroll/clipping/overlap | BCDA-8029, BCDA-7993 | XFUN-04, XFUN-05 |
| Info window insert/maximize failures | Missing viz, runtime errors | BCDA-8017 | EDGE-02, FUN-INFO-01 |
| PDF export missing data when maximized | Export data loss | BCDA-7986 | XFUN-EXPORT-01 |
| Android panel stack visibility | Panel stack hidden on restore | BCDA-8016, BCDA-8015 | CER-ANDROID-01, CER-ANDROID-02 |
| JS errors on duplicate page | Runtime undefined errors | BCDA-7991 | EDGE-RUNTIME-01 |

### 5.3 Performance

| Test Scenario | Status | Baseline | Acceptable | Result |
|---------------|--------|----------|------------|--------|
| Maximize transition time | Not Started | < 100ms | < 200ms | |
| Restore transition time | Not Started | < 100ms | < 200ms | |
| Memory delta per maximize/restore cycle | Not Started | < 1MB | < 5MB | |
| Memory growth after 50 consecutive cycles | Not Started | < 10MB | < 50MB | |
| Large dashboard (20+ panels) maximize performance | Not Started | < 150ms | < 300ms | |

### 5.4 Security

| Item | Status | Notes |
|------|--------|-------|
| CSP compliance | Not Started | New DOM manipulation via appendChild |
| Input validation | Not Started | Integer property (0 or 1) |

### 5.5 Platform Certifications

| Platform | Status | Notes |
|----------|--------|-------|
| Chrome (latest) | Not Started | |
| Firefox (latest) | Not Started | |
| Safari (latest) | Not Started | |
| Edge (latest) | Not Started | |
| Mac Workstation | Not Started | |
| Windows Workstation | Not Started | |
| MicroStrategy Library | Not Started | |

### 5.6 Upgrade and Compatibility

| Item | Status | Notes |
|------|--------|-------|
| Dashboards from 25.x | Not Started | Multiple maximized viz edge case |
| Server downgrade (< 11.6.0200) | Not Started | Feature flag disabled |

### 5.7 Internationalization

| Item | Status | Notes |
|------|--------|-------|
| New strings translated | Not Started | IDs: 29403, 29404, 29405 |
| RTL layout | Not Started | Dropdown alignment |

### 5.8 Automation

| Item | Status | Notes |
|------|--------|-------|
| Unit tests (mocks) | ⚠️ Partial | Mocks added to UT_DocRelativePanel.js, UT_HasBoxLayout.js - only test legacy path |
| Unit tests (new behavior) | ⬜ Required | UT_DocModel.js, UT_VizBox.js - must cover `shouldMaximizeVizToPage() === true` path |
| Unit tests (lifecycle) | ⬜ Required | UT_VizBox.js - must verify event listener cleanup |
| Integration tests | Not Started | |
| E2E automation | Not Started | |

### 5.9 Accessibility

| Item | Status | Notes |
|------|--------|-------|
| Keyboard navigation | Not Started | Maximize button focus |
| Screen reader | Not Started | State announcement |
| Color contrast | Not Started | Curtain overlay |

---

*Document generated: 2026-01-21*
*Last updated: 2026-01-21 (Review feedback incorporated)*
