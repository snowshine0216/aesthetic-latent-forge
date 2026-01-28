# QA Risk Report: Regression Defects for BCIN-6634
**Date:** 2026-01-27
**Feature:** BCIN-6634 (Grid Enhancements / Regression)
**Scope:** Review of Regression Defects linked to BCIN-6634.

## 1. Executive Summary
This report analyzes **3** regression defects parented to BCIN-6634. 
- **2** defects are **Fixed** (Done).
- **1** defect is **Open** (To Do).

The fixed defects primarily impact **Grid Column Sizing** (Auto-fit behavior) and **Layout Logic**. The fixes have been verified via code review of the linked Pull Requests.

## 2. Defect Analysis

| Defect ID | Summary | Status | Verified PR | Fix Analysis | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BCIN-7020** | [Modern Grid] Some column width are much longer than necessary when column width is set to fit to container | **Done** | [PR 8616](https://github.com/mstr-kiai/mojojs/pull/8616) | **Logic Fix:** Corrected row index calculation for picture columns in `AgDataInterface.js`. The fix subtracts header rows from the current row index (`rowIndexInAg`) to ensure the correct row is marked as having a picture. | 🟢 Low |
| **BCIN-6890** | [Report] The first time resize column width will not work when the report grid column size = fit to container | **Done** | [PR 8504](https://github.com/mstr-kiai/mojojs/pull/8504) | **Logic Update:** Switched from `willMaxWordLayoutApply()` to `isMaxWordLayoutEnabled()` in `AgXtabBase.js` and `AgDataInterface.js`. This ensures the code checks the correct state for enabling max-word layout logic. | 🟢 Low |
| **BCIN-7072** | [AG grid][Outline]The column header is cut off | **To Do** | N/A | **Open Issue:** Reported on 2026-01-26. No fix available yet. | 🔴 High (Open) |

## 3. Risk Assessment & Recommendations

### High Risk Areas
*   **Column Sizing & "Fit to Container"**: Both fixed regressions (BCIN-7020, BCIN-6890) specifically broke the "Fit to Container" functionality or column sizing logic. This suggests this feature area is fragile.
*   **Grid Headers**: BCIN-7072 indicates a new regression with column headers being cut off, which is a visual defect users will immediately notice.

### Medium Risk Areas
*   **Image/Picture Rendering in Grids**: BCIN-7020 involved logic for columns with pictures. Changes in `AgDataInterface.js` affecting picture row detection could theoretically impact image display if the index is wrong (though the fix looks safe).

### Low Risk Areas
*   **General Data Rendering**: The changes were specific to sizing and layout flags, unlikely to corrupt actual data values.

## 4. Exploratory Testing Advice

Based on the code changes and defect nature, we recommend the following exploratory scenarios:

1.  **"Fit to Container" Torture Test**:
    *   Enable "Fit to Container" on grids with various content types: Short text, very long text (wrapping), and **Images**.
    *   Verify column widths adjust reasonably.
    *   **Scenario from BCIN-7020**: Scroll horizontally to columns with short content (e.g., "Cost") and ensure they don't take up excessive white space.

2.  **Resize Interactions**:
    *   **Scenario from BCIN-6890**: Open a report, try to resize a column *immediately* after loading. Then switch to "Fit to Container" and check for truncation.
    *   Toggle between "Fixed" and "Fit to Container" multiple times.

3.  **Header Visibility**:
    *   **Scenario from BCIN-7072**: Check different grid headers (Multilevel headers vs. Single level). Ensure text is vertically centered and not cut off at the top or bottom.
    *   Zoom in/out to see if header height breaks.

4.  **Image Columns**:
    *   Verify grids with images render correctly in all rows (especially the first few rows/last few rows) to ensure the row index offset fix in PR 8616 works correctly.
