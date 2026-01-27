# BCDA-7522: QA Plan Review

## 📝 QA Plan Review Summary

| Item | Details |
|------|---------|
| **Review Date** | 2026-01-21 |
| **Reviewer** | Antigravity (QA Architect AI) |
| **QA Plan Reviewed** | [BCDA-7522_QA_Plan.md](./BCDA-7522_QA_Plan.md) |
| **Status** | 🟢 Approved |

---

## 🔍 Key Findings

### 🔴 High Priority Issues

#### 1. Version Number Discrepancy - Critical Clarification Required

**Issue**: The QA Plan states target release `26.01` with I-Server `11.6.0200`. However, code inspection reveals:

```javascript
// EnumReleaseVersions.js
VERSION_11_6_0100: '11.6.0100',  // 26.01
VERSION_11_6_0200: '11.6.0200'   // 26.02
```

The feature flag `SUPPORT_MAXIMIZE_VIZ_MODE` checks against `VERSION_11_6_0200` which corresponds to **26.02**, not 26.01 as stated in the Summary Table.

**Code Reference**: `OneTierApp.js` and `VisualInsightAppBase.js`:
```javascript
case FEATURES.SUPPORT_MAXIMIZE_VIZ_MODE:
    return isRestfulServerSupported.call(this, RELEASES.VERSION_11_6_0200, false);
```

**Impact**: QA may test against wrong server version, causing false negatives or missed compatibility testing.

**Recommendation**: Confirm with SE owner whether target release is 26.01 or 26.02 and update accordingly.

---

#### 2. Event Listener Cleanup Not Tested - Memory Leak Risk

**Issue**: The Risk & Mitigation table correctly identifies "Memory leak from event listener" in `VizBox.preBuildRendering`, but there is no corresponding test case to validate listener cleanup.

**Code Analysis** (`VizBox.js`):
```javascript
preBuildRendering: function preBuildRendering() {
    var me = this,
        model = this.getDocModel();
    model.attachEventListener('maximizeVizModeChanged', me.id, function (evt) {
        toggleMenuButtonTitleCSS.call(me);
    });
    return this._super();
}
```

**Missing Test**: No test validates that this listener is properly detached in the widget's `destroy` lifecycle.

**Recommendation**: Add test case:

| ID | Priority | Test Key Points | Expected Results |
|----|----------|-----------------|------------------|
| **FUN-18** | P1 | Create VizBox with maximize mode, destroy widget, verify listener detached | No orphaned event listeners on `DocModel` |

---

#### 3. Info Window Exclusion Logic Not Verifiable

**Issue**: EDGE-02 references "Info window exclusion: maximize stays within info window bounds" but the QA Plan doesn't specify how this is technically validated.

**Design Document Reference**: "We will exclude info window from this feature, i.e. for visualizations inside an info window, it could still be as big as the info window itself."

**Missing**: No code reference showing how info window detection is implemented in `shouldMaximizeVizToPage()` or `buildMaximizedBox`.

**Recommendation**: 
- Add code reference to info window detection logic
- Create explicit test verifying `shouldMaximizeVizToPage()` returns `false` or different behavior for viz inside info windows

---

### 🟡 Medium Priority Issues

#### 4. Workstation-Specific Style Adjustments Not Tested

**Issue**: Code shows `adjustWorkstationStyle(-2)` and `adjustWorkstationStyle(2)` calls during dimension calculations, but no test case validates these Workstation-specific behaviors.

**Code Reference** (`DocRelativePanel.js`):
```javascript
if (isBoxWithinPanelStack) {
    panel.adjustWorkstationStyle(-2);
}
// ... dimension calculations ...
if (isBoxWithinPanelStack) {
    panel.adjustWorkstationStyle(2);
}
```

**Recommendation**: Add test case under Platform Certifications:

| ID | Priority | Platform | Test Key Points | Expected Results |
|----|----------|----------|-----------------|------------------|
| **CER-01** | P1 | Mac Workstation | Maximize viz in panel stack | Style adjustments applied correctly |
| **CER-02** | P1 | Windows Workstation | Maximize viz in panel stack | Style adjustments applied correctly |

---

#### 5. Incomplete Unit Test Coverage Verification

**Issue**: QA Plan states unit test coverage exists but verification against codebase shows only mocks were added:

| File | Claimed Coverage | Actual Code Change |
|------|------------------|-------------------|
| `UT_DocRelativePanel.js` | "Added mock" | `shouldMaximizeVizToPage: function() { return false; }` |
| `UT_HasBoxLayout.js` | "Added mock" | `shouldMaximizeVizToPage: function() { return false; }` |
| `DocModel.js` | Recommend new UT | ❌ No test added |
| `VizBox.js` | Recommend new UT | ❌ No test added |

**Impact**: Mocks returning `false` only test legacy behavior. No tests exercise the new `shouldMaximizeVizToPage() === true` path.

**Recommendation**: Elevate from "Recommend" to "Required" and track as automation blocker.

---

#### 6. Missing Negative Test for Invalid Property Values

**Issue**: No test validates server-side behavior for invalid `mvm` values.

**Code Reference** (`CDSSDocumentDefinition.cpp`):
```cpp
if (hr == S_OK && lValue.vt == VT_I4)
{
    lpJSONContext->mCJSON.StartNameValue(const_cast<wchar_t*>(BLP_RW_MAXIMIZE_VIZ_MODE.c_str()), lValue.intVal);
}
```

The server accepts any integer. What happens when `mvm = 2`, `mvm = -1`, or `mvm = null`?

**Recommendation**: Add edge case:

| ID | Priority | Test Key Points | Expected Results |
|----|----------|-----------------|------------------|
| **EDGE-08** | P2 | Set `mvm` to invalid value (2, -1) via REST API | Server rejects or defaults to 0 |

---

#### 7. DOM Restoration Validation for Legacy Dashboards Needs Specificity

**Issue**: EDGE-01 tests legacy dashboards but lacks specific DOM validation criteria.

**Code Reference** (`setPortalState` in `DocRelativePanel.js`):
```javascript
if (box.originalParent && box.originalIndexInParent !== undefined) {
    var insertIdx = Math.min(box.originalIndexInParent, box.originalParent.childNodes.length);
    var referenceNode = box.originalParent.childNodes[insertIdx];
    if (referenceNode) {
        box.originalParent.insertBefore(box.domNode, referenceNode);
    } else {
        box.originalParent.appendChild(box.domNode);
    }
}
```

**Recommendation**: Add validation criteria to EDGE-01:
- Verify `originalIndexInParent` tracking when multiple viz are maximized
- Verify DOM order is preserved after restore sequence

---

### 🟢 Technical Improvements

#### 8. XFUN-03 Event Propagation Path Should Be Explicit

**Current**: "All viz toolbars refresh when mode changes"

**Improved**: Event flow validation:
1. `DocPropsEditorReact.js` calls `dm.raiseEvent({ name: 'maximizeVizModeChanged' })`
2. `VizBox.preBuildRendering` listener receives event
3. `toggleMenuButtonTitleCSS()` updates toolbar visibility

**Recommendation**: Update test description to include event tracing.

---

#### 9. Performance Test Baselines Not Defined

**Issue**: Performance tests have "Not Started" status but no acceptance criteria.

**Recommendation**: Define baselines:

| Metric | Baseline | Acceptable |
|--------|----------|------------|
| Maximize transition time | < 100ms | < 200ms |
| Restore transition time | < 100ms | < 200ms |
| Memory delta per cycle | < 1MB | < 5MB |
| 50-cycle memory growth | < 10MB | < 50MB |

---

### ✅ Positive Highlights

1. **Excellent Code Traceability**: Test cases correctly reference specific functions (`buildMaximizedBox`, `setPortalState`, `toggleCurtain`, `shouldShowMaxRestoreBtn`)

2. **Comprehensive Edge Case Coverage**: 
   - Nested panel stacks (EDGE-06)
   - Layout mode switching while maximized (EDGE-03)
   - Legacy dashboards with multiple maximized viz (EDGE-01)

3. **Risk Mitigation Is Technically Sound**:
   - DOM state tracking via `originalParent`/`originalIndexInParent`
   - Curtain visibility management for legacy compatibility
   - Version check using `VERSION_11_6_0200`

4. **Cross-Functional Tests Cover Critical Paths**:
   - Export/Import preserve settings (XFUN-01, XFUN-02)
   - Event-driven toolbar refresh (XFUN-03)

5. **Regression Test Strategy Preserves Existing Behavior**:
   - Standalone viz maximize unchanged (REG-01)
   - Dashboards without panel stacks work correctly (REG-02)

---

## 🛠️ Action Items

| # | Priority | Action Item | Assignee | Status |
|---|----------|-------------|----------|--------|
| 1 | 🔴 High | Clarify target release version (26.01 vs 26.02) with SE owner | QA Owner | [x] Updated to 26.02 based on `VERSION_11_6_0200` mapping |
| 2 | 🔴 High | Add test case for event listener cleanup in `VizBox` destroy lifecycle | QA Owner | [x] Added FUN-18 |
| 3 | 🔴 High | Add code reference for info window exclusion logic | QA Owner | [x] Updated EDGE-02 with `isInfoWindow` check reference |
| 4 | 🟡 Medium | Add Workstation-specific style adjustment tests | QA Owner | [x] Added CER-01, CER-02 in new section 3.5 |
| 5 | 🟡 Medium | Elevate unit test recommendations to requirements and track | QA Owner | [x] Updated section 3.8 with Required status and tracking notes |
| 6 | 🟡 Medium | Add negative test for invalid `mvm` property values | QA Owner | [x] Added EDGE-08 |
| 7 | 🟡 Medium | Enhance EDGE-01 with DOM restoration validation criteria | QA Owner | [x] Enhanced with `originalIndexInParent` and DOM order validation |
| 8 | 🟢 Low | Make XFUN-03 event propagation path explicit | QA Owner | [x] Updated with full event flow details |
| 9 | 🟢 Low | Define performance test baselines with acceptance criteria | QA Owner | [x] Added baselines in section 5.3 |

---

## 📊 Review Verdict

The QA Plan demonstrates **strong technical depth** and **comprehensive scenario coverage**. The test cases correctly reference implementation details from the design document and align with the actual code changes in the PRs.

~~However, the **version number discrepancy** must be resolved before testing begins, and the **event listener lifecycle test** should be added to prevent potential memory leaks from reaching production.~~

~~Once the High Priority items are addressed, the plan can be approved for execution.~~

**✅ All action items have been addressed.** The plan is now approved for execution.

**Summary of Changes (2026-01-21):**
- Target release corrected to 26.02 (matches `VERSION_11_6_0200`)
- Added FUN-18 for event listener cleanup validation
- Enhanced EDGE-02 with info window detection code reference
- Added CER-01, CER-02 for Workstation-specific style adjustments
- Elevated unit test recommendations to required status with tracking
- Added EDGE-08 for invalid `mvm` property value handling
- Enhanced EDGE-01 with DOM restoration validation criteria
- Enhanced XFUN-03 with explicit event propagation path
- Added performance baselines with acceptance criteria
- Updated test count: 35 → 39 test cases

---

*Review completed: 2026-01-21*
*Review updated: 2026-01-21 (All action items resolved)*
