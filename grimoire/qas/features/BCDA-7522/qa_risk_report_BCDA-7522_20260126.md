# QA Risk Report: BCDA-7522 (Maximize Button for Visualizations)

**Date:** 2026-01-26
**Reviewer:** Antigravity
**Feature:** [BCDA-7522](https://strategyagile.atlassian.net/browse/BCDA-7522) "Add Maximize Button for Visualizations in Panel Stacks"

---

## 1. Executive Summary

The feature implementations in `mojojs` have stabilized significantly with PRs #8549 and #8574, addressing critical "Data Loss" and "layout corruption" issues (`BCDA-7986`, `BCDA-8029`). 

However, **High Risk** remains due to:
1.  **Open Defects**: Several defects (`BCDA-7990`, `BCDA-7991`, `BCDA-7993`) regarding "Consumption Mode" and "Undo/Redo" are still in **To Do** status.
2.  **Complex Restore Logic**: The fix for layout corruption introduces complex iteration over `maximizedBoxSourcePanels`, which needs rigorous testing.
3.  **Export Limitation**: "Maximize to Dashboard" is explicitly disabled during Export (`BCDA-7994`), meaning exports will revert to legacy "Panel Only" maximization.

---

## 2. Defect Analysis

### 2.1 Resolved Defects (Verified)

| Defect ID | Summary | Status | Fix/PR | Verification Notes |
| :--- | :--- | :---: | :---: | :--- |
| **BCDA-8029** | Viz becomes empty after restore + setting change | Done | [mojojs#8574](https://github.com/mstr-kiai/mojojs/pull/8574) | **Verified**: Fix added `hasOtherMaximizedBox` check in `DocRelativePanel.js` to handle multi-source restore correctly. |
| **BCDA-7986** | Viz empty after Undo + Restore | Done | [mojojs#8549](https://github.com/mstr-kiai/mojojs/pull/8549) | **Verified**: Refactored `restoreMaximizedBox` to better track state. |
| **BCDA-7994** | PDF Export shows No Data | Done | [mojojs#8549](https://github.com/mstr-kiai/mojojs/pull/8549) | **Verified**: Logic added to `DocModel.js`: `shouldMaximizeVizToPage` now returns `false` if `mstrApp.isExporting`. |
| **BCDA-8011** | Panel resize incorrect with Pinned TOC | Done | #8549 (Linked) | Addressed by layout refactor in `DocRelativePanel.js`. |
| **BCDA-8014** | Responsive mode layout issue | Done | #8549 (Linked) | Addressed by layout refactor. |
| **BCDA-7997** | Info Window maximize issue | Done | #8549 | **Verified**: Added `isInInfoWindow` check to prevent invalid maximize. |
| **BCDA-8016** | Android: Panel stack disappears | Done | N/A | Validated on Mobile. |

### 2.2 Open / To Do Defects (Critical Attention Needed)

| Defect ID | Summary | Status | Risk Level | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **BCDA-7990** | Undo after maximize in **Consumption Mode** fails to restore | **To Do** | 🔴 High | Indicates state management (`maximizeVizModeDidChange`) might verify in Edit mode but fail in Consumption/Presentation. |
| **BCDA-7991** | Duplicate page error: `cannot read properties of undefined` | **To Do** | 🔴 High | Runtime crash. Suggests object lifecycle/initialization gap. |
| **BCED-4346** | Error when inserting **Info Window** | **To Do** | 🟡 Medium | (Previously `BCDA-8017`). Info Window interactions remain fragile. |
| **BCDA-7993** | Loading icon stuck in Consumption Mode | **To Do** | 🟡 Medium | UX Polish. |

---

## 3. Risk Assessment

### 🔴 High Risk: Restoration Logic & State Desync
The new `restoreMaximizedBox` and `restoreAnyMaxedVizBox` methods in `DocRelativePanel.js` (PR #8574) iterate through `rootPanel.maximizedBoxSourcePanels`. 
*   **Risk**: If `maximizedBoxSourcePanels` gets out of sync (e.g., during Undo/Redo or network lag), the UI may believe a valid viz is maximized when it's not, or fail to restore the correct one.
*   **Mitigation**: "Torture Test" involving multiple panel stacks and rapid switching.

### 🟡 Medium Risk: Export Consistency
The fix for `BCDA-7994` is a "Big Hammer" (`!mstrApp.isExporting`).
*   **Risk**: Users expecting "What You See Is What You Get" (WYSIWYG) might be confused that their full-screen viz exports as a small panel viz. This is a design trade-off that should be communicated.

---

## 4. Exploratory Testing Advice

Focus testing on the **Open Defect** areas and the **Complex Logic** introduced in recent fixes.

#### Scenario 1: Consumption Mode Cycle (Targeting BCDA-7990)
1.  Enter **Presentation Mode**.
2.  Maximize a Viz in a Panel Stack.
3.  Navigate to another page, then Back.
4.  **Undo** (if available) or **Restore**.
5.  **Verify**: Does the panel return to exact original size?

#### Scenario 2: The "Multi-Stack" Restore (Targeting PR #8574 logic)
1.  Create a dashboard with **3 separate Panel Stacks**.
2.  Set all to "Maximize to Dashboard".
3.  Maximize Stack 1 -> Restore.
4.  Maximize Stack 2 -> Maximize Stack 3 (if allowed directly) -> Restore Stack 3.
5.  **Verify**: Does Stack 2 become visible? Or does the "Curtain" close prematurely?

#### Scenario 3: Object Lifecycle (Targeting BCDA-7991)
1.  Create a complex page with maximized viz.
2.  **Duplicate the Page**.
3.  Immediately switch to the new page and try to interact (Maximize/Restore).
4.  **Verify**: No Console Errors (`undefined`).

#### Scenario 4: Info Window Nesting (Targeting BCED-4346)
1.  Insert an Info Window.
2.  Place a Panel Stack *inside* the Info Window.
3.  Try to maximize the inner viz.
4.  **Verify**: It should maximize *within the Info Window* (Legacy behavior), NOT the whole page.
