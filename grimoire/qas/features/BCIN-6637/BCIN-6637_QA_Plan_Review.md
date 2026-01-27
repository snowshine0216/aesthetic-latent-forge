## QA Plan Review Summary

- **Review Date**: 2026-01-20
- **Reviewer**: Antigravity (QA Architect AI)
- **Status**: **Requires Updates**

## Key Findings

- **High Priority**
  - **Unit test coverage isn’t verifiable from PR #8546**: the PR diff shows only production-file changes (no test files). The QA plan should explicitly state whether UTs already exist, will be added in this PR, or will land in a follow-up PR, and list concrete test targets per function.
  - **Missing explicit negative-path scenarios for excluded modes**: implementation gates dynamic NDE `colSpan` behind flags (no Outline / no Pin / no Freeze / no Hidden Columns). The plan mentions “Outline mode excluded” but should add explicit scenario rows asserting **`colSpan = 1`** and no bidirectional-span workaround in each excluded mode.
  - **ACC plan needs to match how ARIA is used**: code uses `aria-colspan` as a workaround flag on `.nde-bidirectional-span`. Add scenarios to ensure it’s only applied where intended and that keyboard/SR navigation isn’t degraded.
  - **PR gating**: the PR currently shows failing checks (unit-test job and premerge stage). Add a QA sign-off gate note (UT/E2E must be green before release sign-off).

- **Technical Improvements**
  - Add explicit scenarios for **Hide Columns** behavior (design says hide keeps `colSpan = 1`), with expected “no merging” outcomes.
  - Add scenarios validating **Freeze applies to last form only**, while **Pin/Hide apply to all forms** (aligned to `XtabHelper.modifyColInfoByColumn` changes), including mixed-history flows (resize at attribute-level → enable forms → resize form-level → pin/hide/freeze).
  - Add scenarios for **column reorder / move** and **show/hide forms toggle**, because width fixes rely on cached `colId → index` maps (`mergeAttributeFormsHeaderWidth`, `fixMergedNdeCellWidth`).
  - Add a scenario confirming **Advanced Sort is not offered** for attribute-form cells (new `isFromAttributeForm` logic).
  - Add a scenario for **Dynamic Link attribute sorting** regression risk (still has special-case form-id logic).
  - Turn “PERF: Monitor” into a measurable check (baseline vs after, plus resize/fit loops), since the fixes are DOM-based.

- **Positive Highlights**
  - Strong structure and conciseness; includes all required sections.
  - Good traceability: “Related Code Change” references align well with PR #8546 touched areas (e.g., `AgDataInterface.js::colSpan`, `_AgGridInternalUtils.js::fixMergedNdeCellWidth`, `XtabHelper.js::modifyColInfoByColumn`).
  - Risks are mostly project-specific and mapped to real mitigations.

## Action Items

1. [ ] Add explicit negative-path test scenarios for Outline/Pin/Freeze/Hidden Columns (assert `colSpan=1`, no unintended merging/workarounds).
2. [ ] Update UT section to reflect reality (existing vs to-be-added) and list concrete UT targets per function.
3. [ ] Add Hide Columns + mixed-history colInfo flow scenarios (resize → toggle forms → pin/freeze/hide).
4. [ ] Add ACC scenarios aligned with actual ARIA/DOM behavior.
5. [ ] Add a minimal perf test plan with concrete measurements + threshold.

