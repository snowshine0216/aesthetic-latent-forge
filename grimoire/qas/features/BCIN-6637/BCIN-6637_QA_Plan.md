# BCIN-6637: Enhance Multi-Form Attribute Support in Modern Grid - QA Plan

---

## 1. Summary Table

| **Item** | **Details** |
|:---|:---|
| **Feature** | [BCIN-6637](https://strategyagile.atlassian.net/browse/BCIN-6637) |
| **Release** | 26.02 |
| **QA Owner** | Xue Yin |
| **SE Owner** | Mengya Peng |
| **SE Design** | [BCIN-6637 Design Doc](https://microstrategy.atlassian.net/wiki/spaces/TPAC/pages/5578359311/BCIN-6637+Enhance+the+multi-form+attribute+support+in+modern+grid.) |
| **UX Design** | N/A (Behavior Enhancement) |
| **GitHub PR** | [PR #8546](https://github.com/mstr-kiai/mojojs/pull/8546) |
| **Status** | In Progress |

---

## 2. QA Goals

| **Category** | **Goal Description** |
|:---|:---|
| **E2E: End to End** | Verify multi-form attribute column spanning and header merging work correctly across complete user workflows |
| **FUN: Functionality** | Validate column spanning for NDE cells, merged row headers, context menu adjustments, and all related grid operations |
| **UX: User Experience** | Ensure visual consistency with Normal Grid, proper border styles, and smooth resize/scroll interactions |
| **PERF: Performance** | Measure rendering/resize/fit performance for complex multi-form + NDE cases and ensure no material regressions vs baseline |
| **SEC: Security** | No security impact expected for this feature |
| **ACC: Accessibility** | Verify screen reader compatibility with merged headers and colspan cells |
| **CER: Platform Certifications** | Cross-browser testing (Chrome, Firefox, Safari, Edge) |
| **UPG: Upgrade and Compatibility** | Validate dashboards created in earlier versions render correctly after upgrade |
| **INT: Internationalization** | Verify long attribute names with different character sets display correctly |
| **AUTO: Automation** | Add automation coverage for column spanning and header merging scenarios |

---

## 3. QA Plan

### 3.1 Test Key Points

#### 3.1.1 Column Spanning for NDE Cells (BCIN-5765)
- Column spanning for grid cells with NDE (enabled only when **no Outline / no Pin / no Freeze / no Hidden Columns**)
- Empty columns rendered narrower for grouped attribute elements
- Correct border styles for colspanned cells in Lock Row Header case
- Bidirectional merged span (row-span + column-span) handling
- Resize column behavior with colSpan cells

#### 3.1.2 Merge Row Header for Multiple Forms (BCIN-5281)
- First column header width merges all related form columns
- Resize handle position adjusted correctly
- Visual consistency with Normal Grid header behavior
- Pin to Left/Right indicator line visibility

#### 3.1.3 Context Menu Adjustments
- **RMC on Header (first attribute form)**:
  - Sort Ascending/Descending on first form
  - Advanced Sort menu
  - Freeze Up to This Column (applies to last form)
  - Pin Column (applies to all forms)
  - Hide Column (applies to all forms)
  - Removed: Reset Column Widths / Column Width Limit from header
- **RMC on Cells (each attribute form)**:
  - Sort Ascending/Descending per form
  - Reset Column Widths / Column Width Limit per form

#### 3.1.4 Related Defect Fixes
- BCIN-6700: Hide column with multiple attribute forms
- BCIN-6711: Disable/enable multiple form with resize
- BCIN-5692: Row header disappears after converting to modern grid
- BCIN-5274: Incorrect visualization of average calculation

#### 3.1.5 Release / Sign-off Gates (PR #8546)
- QA sign-off requires **all CI checks green** (at minimum: unit-test job and premerge stage).
- If unit tests are not included in PR #8546, QA sign-off must include a **documented follow-up** (issue/PR link) with a clear owner and delivery timeline.

---

### 3.2 Test Case Summary by Priority and Level

| **Priority** | **E2E** | **Functional** | **Regression** | **Edge Case** | **Total** |
|:---|:---:|:---:|:---:|:---:|:---:|
| **P0 (Blocking)** | 3 | 12 | 4 | 2 | 21 |
| **P1 (High)** | 4 | 13 | 10 | 4 | 31 |
| **P2 (Medium)** | 2 | 8 | 4 | 3 | 17 |
| **P3 (Low)** | 1 | 4 | 2 | 2 | 9 |
| **Total** | 10 | 37 | 20 | 11 | 78 |

---

### 3.3 Test Scenarios

#### 3.3.1 Column Spanning for NDE Cells

| **Priority** | **Related Code Change** | **Test Key Points** | **Expected Results** |
|:---|:---|:---|:---|
| P0 | `AgDataInterface.js::colSpan` | Multi-form attribute with NDE - basic column spanning | NDE cells span across empty form columns correctly |
| P0 | `AgXtabBase.js::nde-bidirectional-span` | Bidirectional merged span (row + column) | Both row and column spanning applied, width calculated correctly |
| P0 | `_ag-theme-mstrv29.scss` | Lock Row Header with colSpan cells | Gray border styles applied correctly to pinned colspanned cells |
| P1 | `AgDataInterface.js::colSpan` | NDE with Show Total enabled | Subtotal rows display correctly with column spanning |
| P1 | `_AgGridInternalUtils.js::fixMergedNdeCellWidth` | Fit to Content mode with NDE colspan | Cell widths recalculated correctly after fit to content |
| P1 | `AgGridHandler.js::getColUpdateFn` | Switch to Fit to Container with NDE | Width adjustment applied correctly during mode switch |
| P1 | `AgXtabBase.js::getOnGridSizeChangedFunc` | Fixed mode with filter changes | NDE cell widths updated after filter modification |
| P2 | `AgDataInterface.js` | NDE with multiple row headers | Column spanning applies only to appropriate columns |
| P2 | `AgXtabBase.js` | NDE with incremental fetch | Colspan cells render correctly during lazy loading |
| P0 | `AgDataInterface.js::colSpan` | **Negative path: Outline mode** (excluded) | **`colSpan = 1`**; no unintended merging; no `.nde-bidirectional-span` workaround applied |
| P0 | `AgDataInterface.js::colSpan` | **Negative path: Pin enabled** (left/right) | **`colSpan = 1`** while pin is active; no unintended merging/workaround in pinned state |
| P0 | `AgDataInterface.js::colSpan` | **Negative path: Freeze enabled** | **`colSpan = 1`** while freeze is active; no unintended merging/workaround in frozen state |
| P0 | `AgDataInterface.js::colSpan` | **Negative path: Hidden columns exist** (Hide Columns) | **`colSpan = 1`** when any columns are hidden; no unintended merging/workaround; restoring visibility restores expected spanning |

#### 3.3.2 Merge Row Header for Multiple Forms

| **Priority** | **Related Code Change** | **Test Key Points** | **Expected Results** |
|:---|:---|:---|:---|
| P0 | `AgXtabBase.js::mergeAttributeFormsHeaderWidth` | Header width merging for multi-form attributes | First header width = sum of all form column widths |
| P0 | `AgDataInterface.js::markNotLastMultiAttrColumns` | CSS class marking for multi-attribute headers | `has-multi-attribute-forms` and `is-not-last-one` classes applied correctly |
| P0 | `_ag-theme-mstrv29.scss` | Pin to Left with multi-form attribute | Pin indicator line visible for merged header |
| P1 | `AgXtabBase.js::getOnColumnResizedFunc` | Resize first attribute column | Blue guideline updates, header text wraps appropriately |
| P1 | `AgXtabBase.js` | Resize during drag (params.finished === false) | Header width and avatar position update in real-time |
| P1 | `mstrmojo.js::enableAGGridLegacyStyles` | Pin to Right indicator line | Right pin border styles applied correctly |
| P2 | `AgXtabBase.js` | Fit to Content + Long attribute name | Header width calculated correctly for long names |
| P2 | `AgDataInterface.js` | Multi-form attribute in column (not row) | Related to BCIN-5695 - multi-layer headers |

#### 3.3.3 Context Menu - Header Actions

| **Priority** | **Related Code Change** | **Test Key Points** | **Expected Results** |
|:---|:---|:---|:---|
| P0 | `XtabHelper.js::modifyColInfoByColumn` | Freeze Up to This Column on multi-form header | Only last form frozen, `pfv: 1` stored at last form level |
| P0 | `XtabHelper.js::modifyColInfoByColumn` | Pin to Left on multi-form header | All forms pinned, `pfv: 2` stored for all forms |
| P0 | `XtabHelper.js::modifyColInfoByColumn` | Pin to Right on multi-form header | All forms pinned, `pfv: 4` stored for all forms |
| P0 | `XtabHelper.js::modifyColInfoByColumn` | Hide Column on multi-form header | All forms hidden, `hide: 1` stored for all forms |
| P1 | `XtabMenuConfig.js::addSortMenuItem` | Sort Ascending on header | First form sorted ascending |
| P1 | `XtabMenuConfig.js::addSortMenuItem` | Sort Descending on header | First form sorted descending |
| P1 | `AgXtabMenuConfig.js` | Advanced Sort from header | Advanced sort dialog opens |
| P2 | `XtabMenuConfig.js` | Verify removed menu items | Reset Column Widths / Column Width Limit NOT shown on header |

#### 3.3.4 Context Menu - Cell Actions

| **Priority** | **Related Code Change** | **Test Key Points** | **Expected Results** |
|:---|:---|:---|:---|
| P0 | `XtabMenuConfig.js::addSortMenuItem` | Sort Ascending on form cell | Specific form sorted, sort icon shown |
| P0 | `_XtabModelShared.js::getSortAction` | Sort with `isFromAttributeForm` flag | `sortKey` built correctly using cell's `fid` |
| P1 | `AgXtabMenuConfig.js::addColumnWidthItems` | Reset Column Widths on form cell | Column width reset for that specific form |
| P1 | `AgXtabMenuConfig.js::addColumnWidthItems` | Column Width Limit on form cell | Width limit applied to specific form |
| P1 | `AgXtabMenuConfig.js` | Skip menu for multi-form row header cells | No width items shown for merged header cells |
| P2 | `XtabMenuConfig.js` | Sort status icon on form cell | Icon reflects current sort state |
| P1 | `AgXtabMenuConfig.js` | **Advanced Sort not offered on attribute-form cells** | Advanced Sort menu item is **absent** when right-clicking attribute-form cells |
| P1 | `_XtabModelShared.js` / `XtabMenuConfig.js` | **Dynamic Link attribute sorting** regression | Sorting works correctly for Dynamic Link attributes (correct key/form-id mapping; no wrong column sorted) |

#### 3.3.5 Cross-Functional / Regression

| **Priority** | **Related Code Change** | **Test Key Points** | **Expected Results** |
|:---|:---|:---|:---|
| P0 | All | Normal Grid to Modern Grid conversion | Multi-form attributes display correctly after conversion |
| P0 | `XtabHelper.js::generateColInfoMapFn` | Mixed data structure (attribute + form level props) | Both resize and form-level properties preserved |
| P1 | All | Outline mode excluded | `colSpan = 1` (no spanning) in Outline mode |
| P1 | All | Export to PDF/Excel | UI matches exported output |
| P1 | `XtabHelper.js::modifyColInfoByColumn` | Freeze applies to last form only | Freeze set on the **last** form only; other forms remain unfrozen |
| P1 | `XtabHelper.js::modifyColInfoByColumn` | Pin/Hide apply to all forms | Pin/Hide operations apply to **all** forms consistently |
| P1 | `AgDataInterface.js::colSpan` | Pin/Freeze/Hidden-columns disable NDE colSpan | With pin/freeze/any hidden columns active, **`colSpan = 1`** and no bidirectional-span workaround; removing the condition restores spanning |
| P2 | All | Grid template style with multi-form | Styles applied correctly across forms |
| P2 | All | Filter with multi-form NDE | Grid updates correctly after filter changes |
| P1 | `AgXtabBase.js::mergeAttributeFormsHeaderWidth` / `_AgGridInternalUtils.js::fixMergedNdeCellWidth` | **Column reorder / move** | After moving columns (including form columns), merged header widths and NDE cell widths remain correct (no stale colId→index mapping effects) |
| P1 | `AgXtabBase.js` / `XtabHelper.js` | **Toggle show/hide forms** | Enabling/disabling multi-forms after resize/reorder preserves correct widths and header merging; no UI corruption |
| P1 | `XtabHelper.js::generateColInfoMapFn` / `XtabHelper.js::modifyColInfoByColumn` | **Mixed-history colInfo flow** (resize → toggle forms → resize → pin/hide/freeze) | Resizes and form-level props persist correctly across transitions; freeze/pin/hide outcomes match design (freeze last form, pin/hide all forms) |

#### 3.3.6 Edge Cases

| **Priority** | **Related Code Change** | **Test Key Points** | **Expected Results** |
|:---|:---|:---|:---|
| P0 | `AgXtabBase.js` | Column width set to 0 | Column still visible with merged header (BCIN-5692 fix) |
| P1 | `XtabHelper.js` | Disable multi-form → resize → enable multi-form | Resize preserved correctly (BCIN-6711 fix) |
| P1 | All | Visual jitter during resize | Minimal UI jumping during header resize |
| P2 | `_AgGridInternalUtils.js` | Many columns in fit-to-container | Empty columns narrower, text readable |
| P2 | All | Horizontal scroll with subtotals | Subtotal rows display correctly during scroll |
| P3 | All | Recursive attribute with multi-form | Custom sort and grouping work correctly |


---

## 4. Risk & Mitigation

| **Risk** | **Impact** | **Likelihood** | **Mitigation** |
|:---|:---|:---|:---|
| **AG Grid colSpan + Pin limitation** | AG Grid doesn't natively support colSpan with pinning | Medium | Added `nde-colspan-cell` class and custom border styles |
| **AG Grid rowSpan + colSpan limitation** | Bidirectional spanning not natively supported (AG-14648) | High | Implemented `fixMergedNdeCellWidth` workaround with DOM post-processing |
| **Mixed data structure (attribute + form level)** | Properties stored at different levels may conflict | Medium | Modified `generateColInfoMapFn` to use `key` instead of `objectId` for leaf detection |
| **Visual jitter during resize** | Header text may wrap during drag | Low | Accepted limitation; documented in design |
| **Long attribute names in Fit to Content** | First form column may be larger than expected | Low | Verify header width calculation logic |
| **Performance with many NDE cells** | DOM manipulation for width fixes may be slow | Medium | Cache colId-to-index maps for performance |
| **Regression in existing features** | Pin/Freeze/Hide behavior changed | Medium | Comprehensive regression testing required |

---

## 5. QA Summary

### 5.1 Code Changes Summary

| **File** | **Type** | **Changes** | **Status** |
|:---|:---|:---|:---|
| `_ag-theme-mstrv29.scss` | CSS | Pin border styles for multi-form headers and colspan cells | 🔄 In Review |
| `_XtabModelShared.js` | JS | Sort action handling for `isFromAttributeForm` cells | 🔄 In Review |
| `AgGridHandler.js` | JS | Call `fixMergedNdeCellWidth` on mode switch | 🔄 In Review |
| `AgXtabBase.js` | JS | Header merging, NDE colspan handling, resize adjustments | 🔄 In Review |
| `_AgGridInternalUtils.js` | JS | `fixMergedNdeCellWidth` for bidirectional span | 🔄 In Review |
| `AgDataInterface.js` | JS | `colSpan` for NDE, `markNotLastMultiAttrColumns` | 🔄 In Review |
| `AgXtabMenuConfig.js` | JS | Column width menu items for form cells | 🔄 In Review |
| `mstrmojo.js` | JS | Legacy CSS rule removal for right pinned cells | 🔄 In Review |
| `XtabMenuConfig.js` | JS | Sort menu for attribute form cells | 🔄 In Review |
| `XtabHelper.js` | JS | `modifyColInfoByColumn` (freeze last form; pin/hide all forms) | 🔄 In Review |

### 5.2 E2E Testing & Functionality

| **Status** | **Currently Open Defects** | **Limitations** |
|:---|:---|:---|
| 🔄 In Progress | BCIN-6711 (resize with disable/enable forms) - To Do | Visual jitter during column resize with long names |
| | BCIN-6700 (hide column with multi-forms) - To Do | Fit to Content with long names may have larger first column |
| | BCIN-5692 (row header disappears after convert) - To Do | |
| | BCIN-5274 (incorrect visualization) - In Progress | |

### 5.3 Performance

| **Scenario** | **Status** | **Notes** |
|:---|:---|:---|
| Grid with many NDE cells | ⏳ Pending | Capture baseline vs after: initial render time, scroll FPS/jank, and resize responsiveness; target **≤10% regression** vs baseline on same machine/browser |
| Large multi-form attributes | ⏳ Pending | Stress test with many multi-form attributes and repeated resize; ensure no exponential reflows; validate cached colId→index map stays correct after reorder |
| Fit to Content recalculation | ⏳ Pending | Measure time for Fit-to-Content run (start click → stable layout) and ensure no resize/fit loops; record timings in DevTools Performance |

### 5.4 Security

| **Status** | **Notes** |
|:---|:---|
| ✅ N/A | No security-sensitive changes in this feature |

### 5.5 Platform Certifications

| **Browser** | **Status** |
|:---|:---|
| Chrome | ⏳ Pending |
| Firefox | ⏳ Pending |
| Safari | ⏳ Pending |
| Edge | ⏳ Pending |

### 5.6 Upgrade and Compatibility

| **Scenario** | **Status** |
|:---|:---|
| Dashboard from 25.12 with multi-form | ⏳ Pending |
| Dashboard with existing column info | ⏳ Pending |
| Migration from Normal Grid | ⏳ Pending |

### 5.7 Internationalization

| **Scenario** | **Status** |
|:---|:---|
| Long CJK attribute names | ⏳ Pending |
| RTL language support | ⏳ Pending |
| Special characters in form names | ⏳ Pending |

### 5.8 Automation

| **Coverage** | **Status** |
|:---|:---|
| Unit tests for new functions | ⏳ Pending |
| E2E tests for column spanning | ⏳ Pending |
| E2E tests for header merging | ⏳ Pending |
| Regression suite update | ⏳ Pending |

### 5.9 Accessibility

| **Scenario** | **Status** |
|:---|:---|
| `aria-colspan` usage aligns with implementation (`.nde-bidirectional-span`) | ⏳ Pending |
| `aria-colspan` is **not** applied in excluded modes (Outline/Pin/Freeze/Hidden Columns) | ⏳ Pending |
| Screen reader navigation across merged headers / spanned cells | ⏳ Pending |
| Keyboard navigation (Tab/Arrow) with merged headers and spanned cells | ⏳ Pending |

---

## 6. Test Objects

| **Description** | **URL** |
|:---|:---|
| Aqueduct - NDE test object 1 | https://aqueduct.microstrategy.com/MicroStrategyLibrary/app/0730F68F4B8B4B52AA23F0AAB46F3CA8/E4EA300E594EC14F5798A387D8C217EA/K53--K46/edit |
| Aqueduct - NDE test object 2 | https://aqueduct.microstrategy.com/MicroStrategyLibrary/app/0730F68F4B8B4B52AA23F0AAB46F3CA8/5400BA24FC458BFED9AFEBBB6D0E0DFE/K9E0B880FA246CDD6F3B9A3B292B3B4E0--K6BC38CDF1B4FACD57BA3BCB6202F7D60/edit |
| Test object for BCIN-5765 | tqmsuser/ddset login |

---

*Last Updated: 2026-01-20*
