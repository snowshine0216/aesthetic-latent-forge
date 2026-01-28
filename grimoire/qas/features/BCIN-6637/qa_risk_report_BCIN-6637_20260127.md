# QA Risk Report - BCIN-6637: Enhance Multi-form Attribute Support
**Date**: 2026-01-27
**Feature**: Enhance the multi-form attribute support in modern grid
**Author**: Antigravity

## 1. Executive Summary
The feature "Enhance the multi-form attribute support in modern grid" is in active development with significant progress on High priority defects.
*   **Resolved/Verified**: Several critical UI/Rendering issues (`BCIN-7064`, `BCIN-7063`, `BCIN-7059`) have fixes merged.
*   **Pending/Regressed**: `BCIN-7048` (Freeze/Pin regression) failed verification after the latest fix attempts. `BCIN-7057` and `BCIN-7056` regarding NDE (Non-Data Entry) behavior require ongoing attention.
*   **Overall Risk**: **Medium-High**. The logic for handling multi-form attributes involves complex interactions between AG Grid's native behavior and custom handlers (`AgGridHandler`, `AgXtabBase`), leading to regression risks in basic grid operations like resizing, pinning, and freezing.

## 2. Risk Analysis

### High Risk Areas
*   **Pin/Freeze/Hide Operations**:
    *   **Context**: Fixes involved moving logic from attribute-form level to attribute level.
    *   **Concern**: `BCIN-7048` failure confirms this is fragile. Switching grid types (Normal <-> AG Grid) and re-applying frozen states is a known failure point.
    *   **Impact**: Users might lose grid configuration or see broken layouts when toggling these features.
*   **Layout & Resizing**:
    *   **Context**: Changes in `_AgMaxWordLayout.js` and `AgXtabBase.js` modify how widths are calculated and distributed among merged forms.
    *   **Concern**: Potential for slight misalignments or "jumping" widths during resize, or incorrect background rendering (as seen in `BCIN-7063`).

### Medium Risk Areas
*   **NDE (Non-Data Entry) Scrolling**:
    *   **Context**: Fixes for `BCIN-7023` introduced `requestAnimationFrame` hooks into scroll events.
    *   **Concern**: Performance impact during fast scrolling on heavy grids. Race conditions where the width fix might apply too late, causing a visual flicker.

## 3. Defect Analysis

| Defect ID | Summary | Status | Linked PR | PR Risk / Complexity | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BCIN-7064** | AG grid cannot success render in specific dashboard | In Progress | [#8634](https://github.com/mstr-kiai/mojojs/pull/8634) | Low | Fixes undefined `hasAttrForms` error. Safe fallback added. |
| **BCIN-7063** | Cannot resize multiform attribute | In Progress | [#8642](https://github.com/mstr-kiai/mojojs/pull/8642) | Medium | Hooks `fixMergedNdeCellWidth` into resize. Checks for outline mode. |
| **BCIN-7059** | Merged header column width issue | In Progress | [#8643](https://github.com/mstr-kiai/mojojs/pull/8643) | Low | Adjusts width distribution logic when header > body width. |
| **BCIN-7039** | Pin/Freeze/Hide behavior incorrect | Done | [#8637](https://github.com/mstr-kiai/mojojs/pull/8637) | Medium | Changed scope of pin/freeze to attribute level. |
| **BCIN-7023** | NDE col-span incorrect during scroll | Done | [#8619](https://github.com/mstr-kiai/mojojs/pull/8619) | Medium | Adds scroll/RAF hooks. Potential performance consideration. |
| **BCIN-7048** | Pin column, convert grid type, freeze fails | In Progress | [#8637](https://github.com/mstr-kiai/mojojs/pull/8637) | **High** | **Regression**. Fix in PR 8637 did not resolve it. Needs investigation. |
| **BCIN-7057** | NDE col-span incorrect during switch page | In Progress | N/A | Unknown | Waiting for fix. |
| **BCIN-7014** | Header wrapped when enough space (Fit to content) | Done | [#8591](https://github.com/mstr-kiai/mojojs/pull/8591), [#8603](https://github.com/mstr-kiai/mojojs/pull/8603) | Low | Verified w/ Unit Tests. Logic adjustment in AgMaxWordLayout. |
| **BCIN-5765** | [Group] DE shows empty columns for ungrouped forms | Done | [#8399](https://github.com/mstr-kiai/mojojs/pull/8399) | Medium | Added case in PR 8399. Verified. |

## 4. Exploratory Testing Advice

### Focused Scenarios
1.  **Grid Mode Switching w/ State**:
    *   Pin a multi-form column -> Switch to Normal Grid -> Switch Back -> Freeze another column.
    *   *Goal*: Verify `BCIN-7048` and ensure state persistence doesn't corrupt the grid view.

2.  **Aggressive Resizing**:
    *   Resize merged headers to their minimum and maximum limits.
    *   Drag the right border of "Group" attributes rapidly.
    *   *Goal*: Check if `fixMergedNdeCellWidth` (PR 8642) keeps up with rapid updates without visual artifacts.

3.  **Scroll & Virtualization**:
    *   Scroll vertically and horizontally on a grid with NDE columns.
    *   Stop abruptly and check column alignment.
    *   *Goal*: Verify `BCIN-7023` fix works smoothly without flicker.

4.  **Complex Form Visibility**:
    *   Hide one form of a 3-form attribute -> Pin the attribute -> Unhide the form.
    *   *Goal*: Verify logic in PR 8637 handles dynamic form visibility changes correctly (Attribute vs Form level).
