# QA Status Report: BCIN-6637 - Enhance Multi-Form Attribute Support in Modern Grid

**Feature Status:** `In Progress`
**Target Release:** 26.02
**QA Owner:** Xue Yin | **SE Owner:** Mengya Peng

## 1. Executive Summary
The feature is currently in active development (`In Progress`). While the core implementation (BCIN-6993) is underway, there are several active defects, including one **High Priority** blocker (BCIN-7064) causing render failures in specific dashboards. The main PR #8546 is marked as closed, indicating code has been merged or is in final stages, but regression testing has surfaced significant stability issues.

## 2. Feature Implementation Status
| Ticket | Summary | Status | Linked PRs |
|:---|:---|:---|:---|
| **BCIN-6637** | **[Parent]** Enhance multi-form attribute support | `In Progress` | #8546 |
| **BCIN-6993** | [Dev Task] SE dev implementation | `In Progress` | Included in #8546 |

## 3. Defect & Risk Analysis

### 🔴 Critical / High Risks
*   **Rendering Stability (BCIN-7064)**:
    *   **Status:** `In Progress` | **Priority:** `High`
    *   **Issue:** Specific dashboards fail to render visualizations entirely, throwing console errors (`Cannot read properties of undefined (reading 'hasAttrForms')`).
    *   **Risk:** Functional regression for existing dashboards with specific configurations. This is a potential ship-blocker.

### 🟡 Moderate / Low Risks
*   **Resize Interactions (BCIN-7063, BCIN-6711)**:
    *   **Status:** `In Progress` (7063), `Done` (6711)
    *   **Issue:** Several issues found with resizing columns. BCIN-6711 (fixed) involved resizing breaking after toggling multi-forms. BCIN-7063 involves inability to resize by dragging the right border.
    *   **Risk:** Degradation of user experience in basic grid manipulations.
*   **Visual Indicators (BCIN-7019)**:
    *   **Status:** `In Progress`
    *   **Issue:** Pin indicator missing when pinning a multiform attribute column.
    *   **Risk:** UI polish and consistency.

## 4. GitHub PR Review (#8546)
*   **Scope:** Large PR impacting core Grid rendering logic (`AgXtabBase.js`, `AgDataInterface.js`, `AgGridHandler.js`).
*   **Key Changes:**
    *   Implemented `fixMergedNdeCellWidth` for bidirectional spanning (complex DOM manipulation).
    *   Refactored Column Info map generation (`generateColInfoMapFn`).
    *   Added extensive CSS for pin borders and colspan cells.
*   **Review Notes:**
    *   Recent activity includes code reviews focusing on NDE handling and "Fit to Content" logic.
    *   The "Closed" status suggests it might have been merged, but active defects imply follow-up fixes are likely required or being handled in separate hotfix PRs.

## 5. Recommended QA Focus Areas

Based on the current defects and code changes, the following areas require immediate and deep exploration:

### 🔬 Area 1: Legacy Dashboard Regression (Priority: Highest)
*   **Context:** BCIN-7064 failure indicates specific data/config combinations break the new logic.
*   **Action:**
    *   Test heavily with "Aqueduct" and other complexity-heavy test objects.
    *   Focus on dashboards with **Custom Groups**, **Consolidations**, or **Derived Attributes** mixed with multi-forms.
    *   Verify dashboards created in versions < 25.12.

### 🔬 Area 2: Complex Interaction Flows (Resize & State)
*   **Context:** BCIN-7063 and BCIN-6711 show state management fragility.
*   **Action:**
    *   **Flow:** Pin Column -> Resize -> Unpin -> Sort -> Resize.
    *   **Flow:** Disable Multi-form (via context menu) -> Resize -> Enable Multi-form -> Check widths.
    *   **Flow:** "Fit to Content" triggering on a grid with hidden multi-form columns.

### 🔬 Area 3: Visual Polish & Edge Cases
*   **Context:** Pin indicators missing (BCIN-7019) and known "visual jitter" risk.
*   **Action:**
    *   Verify **Pin to Right** borders specifically (often overlooked vs Left Pin).
    *   Test **Freeze** (Lock Row Header) combined with horizontal scrolling on large merged headers.
    *   Check **Export to PDF** for grids with "funny" states (e.g., column spanned NDE cells).

## 6. Next Steps
1.  **Verify Fix for BCIN-7064:** Once a fix is available, this must be the top priority validation.
2.  **Clarify BCIN-5281 & BCIN-5765:** Ensure the core logic for these (Header Merging & NDE Colspan) is stable, as they are the foundation for the feature.
3.  **Automation:** Ensure unit tests from PR #8546 are running and passing in the CI pipeline to prevent regression of the complex width calculation logic.
