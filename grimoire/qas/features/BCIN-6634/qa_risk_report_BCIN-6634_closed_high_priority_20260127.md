# QA Risk Report for BCIN-6634: Modern Grid Fit to Container Content Experience Improvement
**Date**: 2026-01-27
**Feature**: BCIN-6634
**Author**: Antigravity (AI Agent)

## 1. Executive Summary
The feature "Modern Grid Fit to Container Content Experience Improvement" has undergone significant refinement through defect fixes. A total of **9 key defects** were analyzed, with fixes primarily targeting the `_AgMaxWordLayout.js` logic, which controls the new "max word" layout algorithm. 

The fixes address critical usability issues such as column shrinking during scroll, row cutoffs, application crashes (NPE) during undo/redo, and specific rendering issues with Microcharts and images. 

**Overall Status**: The feature is stabilizing, but the core layout logic has been touched multiple times. Regression testing on grid layout consistency and performance is crucial.

## 2. Defect Analysis & Verification

| Defect ID | Summary | Status | Root Cause | Fix Verification |
| :--- | :--- | :--- | :--- | :--- |
| **BCIN-6986** | Console error on Undo/Redo | Done | NPE when grid is destroyed during layout calculation. | **Verified**: Added null checks for `api` before access. |
| **BCIN-7001** | Column width reduces after scroll | Done | Layout logic applied incorrectly during scroll/outline interaction. | **Verified**: Restricted auto-sizing in outline mode; added source context to layout calls. |
| **BCIN-7002** | Last row cut off in Outline Mode | Done | Incorrect row index calculation. | **Verified**: Introduced `agStartRow` to correctly calculate row indices ignoring headers. |
| **BCIN-7020** | Column width too long (Image/HTML) | Done | Index mismatch for rows with images. | **Verified**: Fixed row index calculation for image detection (`curRow - headerRowSpan`). |
| **BCIN-7026** | Column truncated (MDX RA) | Done | Incompatibility with MDX RA datasets. | **Verified**: Explicitly disabled new layout algorithm for MDX RA datasets. |
| **BCIN-7027** | Microchart column width varies/flickers | Done | Unnecessary redraws during auto-sizing. | **Verified**: Prevented `redrawRows` during max-word auto-sizing; limited scroll calculation to visible columns. |
| **BCIN-7061** | Text cut off ('Greenwood') | Done | Character width estimation accuracy. | **Verified**: Added support for more whitespace characters and updated 'narrow header' logic. |
| **BCIN-6913** | Page unresponsive (9000+ cols) | Done | O(N) string matching in layout loop. | **Verified**: Optimized to check `cellRenderer` property (O(1)) instead of string search. |
| **BCVE-6349** | Content display issue resizing AG grid | Done | Layout baseline issue. | **Verified**: Fixed in Build 11.6.0200.0029 (No PR linked). |

**Note**: Defect `BCVE-6363` (Data loss) was also verified as fixed in recent builds.

## 3. Risk Assessment

### High Risk Areas
*   **Grid Layout Stability**: The `_AgMaxWordLayout.js` file is the brain of this feature. Multiple patches suggest edge cases were missed initially. There is a risk of **Regression** where fixing one case (e.g., cutoff) causes another (e.g., extra whitespace or shrinking).
*   **Performance (Scrolling)**: Changes were made to how layout is calculated during scrolling (PR 8611, 8641). We must ensure no scroll lag or visual "jumping" occurs, especially on lower-end devices.

### Medium Risk Areas
*   **Outline Mode**: Interaction between outline mode (expand/collapse) and "Fit to Container" was a source of bugs (BCIN-7001, 7002).
*   **Complex Cell Content**: Columns with Images, HTML, or Microcharts have special handling that was tweaked.

### Low Risk Areas
*   **Undo/Redo**: The fix for BCIN-6986 is a straightforward null check, low risk of side effects.

## 4. Exploratory Testing Advice

Beyond scripted test cases, please focus on these scenarios:

1.  **"Stress" Scrolling**: 
    *   Load a grid with 100+ rows and varied column content lengths.
    *   Scroll up and down rapidly. Watch for column widths "snapping" or changing size visibly.
    *   Verify data at the very bottom (last row) is fully visible (not cut off).

2.  **Outline Mode Interaction**:
    *   Use a grid with multiple group levels.
    *   Expand all -> Collapse all.
    *   Verify column widths adjust sensibly and don't get "stuck" at a small width.

3.  **Special Character Widths**:
    *   Test data with various whitespace types (tabs, non-breaking spaces) and narrow/wide characters (e.g., 'iiii' vs 'MMMM') to ensure no text cutoff.

4.  **MDX / Cube Datasets**:
    *   Verify that grids based on MDX RA datasets fall back to the *old* layout behavior and do not break.

5.  **Microcharts & Images**:
    *   Resize a grid containing Microcharts. Ensure they resize smoothly without flickering or disappearing.
