# QA Risk Policy Report: BCIN-6637 Open Defects Analysis
**Date**: 2026-01-27
**Feature**: AG Grid Enhancements (Multi-form, Layout, resizing)
**Focus**: Open Defects (High Priority & Regressions)

## 1. Executive Summary
This report analyzes **10 open defects** related to feature **BCIN-6637**. 
- **4** defects have **merged code fixes** ready for verification.
- **6** defects are still in **active investigation/development**.
- **Key Risk Areas**: Multi-form attribute layout (width/resizing), Pin/Freeze interaction, and Recursive Attribute sorting.

## 2. Defect Analysis & Code Verification
| Defect ID | Summary | Status | Linked PR | Risk | Fix Analysis / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BCIN-7077** | [Keeponly] Layout broken after keep only NDE | To Do | N/A | **High** | No fix yet. Layout calculation fails after filtering. |
| **BCIN-7064** | Grid render failure in specific dashboard | In Progress | N/A | **High** | Console error prevents rendering. Critical blocker for specific datasets. |
| **BCIN-7063** | Cannot resize multiform attribute via right border | In Progress | N/A | **High** | UI interaction bug. Resizing handle likely obstructed or event missing. |
| **BCIN-7060** | Column width incorrect (Fit to Content) | In Progress | [PR #8643](https://github.com/mstr-kiai/mojojs/pull/8643) | Low | **Fix Verified**: adjusted `_AgMaxWordLayout.js` to correctly handle cases where `headerMeasuredWidth > sumWidth`. |
| **BCIN-7059** | Body width logic error | In Progress | [PR #8648](https://github.com/mstr-kiai/mojojs/pull/8648) | Low | **Fix Verified**: Follow-up to layout logic. Enforces strict width comparison in `_AgMaxWordLayout`. |
| **BCIN-7057** | [Keeponly] Header misaligned after keep only | In Progress | N/A | Med | Related to BCIN-7077. Repaint issue after data subset execution. |
| **BCIN-7056** | [Sort] Sorting blocked on specific forms | In Progress | N/A | Med | Sorting interaction issue. |
| **BCIN-7048** | Pin/Freeze/Convert Type breakage | In Progress | [PR #8637](https://github.com/mstr-kiai/mojojs/pull/8637) | Med | **Fix Verified**: Modified `AgGridHandler.js` to stop recursion for `hasAttrForms` during Freeze/Pin. Fixes granular state sync. |
| **BCIN-7016** | Sort failure on Recursive Attribute | In Progress | [PR #8610](https://github.com/mstr-kiai/mojojs/pull/8610) | Low | **Fix Verified**: Added MDX RA dataset check in `_XtabModelShared.js` to correctly resolve `ROW_AXIS`. |
| **BCIN-5274** | Incorrect Visualization of Avg Calc | In Progress | N/A | Low | Data calculation/grouping issue. Likely backend or aggregation logic. |

## 3. Risk Assessment
### 🔴 High Risk (Active Bugs)
*   **Layout & Rendering**: BCIN-7077 and BCIN-7064 represent significant instability in grid rendering, especially after interactive filtering ("Keep Only"). This suggests the layout engine isn't ensuring a safe repaint cycle after data model updates.
*   **Resizing**: BCIN-7063 indicates potential collision issues with column resize handles in multi-form scenarios.

### 🟡 Medium Risk (Regression Candidates)
*   **Pin/Freeze Interaction**: The fix for BCIN-7048 involved changing how operations propagate to children columns.
    *   *Risk*: Pinning a standard (single-form) attribute might accidentally be affected if the `hasAttrForms` check is false positive or if the logic is too restrictive.
*   **Column Widths**: PRs #8643 & #8648 touched the core `_AgMaxWordLayout`.
    *   *Risk*: "Fit to Content" might behave unexpectedly for simple grids or extremely long text if the new "header > body" logic has edge cases.

## 4. Exploratory Testing Advice
### Focus Areas
1.  **Multi-form Attribute Layout**:
    *   Create a grid with multi-form attributes.
    *   Toggle "Fit to Content" vs "Fit to Container".
    *   **Action**: Perform "Keep Only" on a few rows. Observer layout stability (BCIN-7077).
    *   **Action**: Try to resize the column using the *rightmost* border of the attribute group (BCIN-7063).

2.  **Pinning & Freezing**:
    *   **Scenario**: Pin a multi-form attribute to the left.
    *   **Scenario**: Freeze the first column.
    *   **Transition**: Convert Grid to "Normal Grid" and back to "AG Grid" (BCIN-7048 regression check). Ensure pinned state persists correctly.

3.  **Recursive Attributes (RA)**:
    *   Use an MDX dataset with a recursive attribute (e.g., Employee Hierarchy).
    *   **Action**: Attempt to Sort by different forms of the RA. Verify request is sent with correct Axis ID (BCIN-7016).
