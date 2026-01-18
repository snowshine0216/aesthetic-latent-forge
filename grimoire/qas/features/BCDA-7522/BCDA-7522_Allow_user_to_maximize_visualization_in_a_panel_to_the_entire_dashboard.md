# 
BCDA-7522 Allow user to maximize visualization in a panel to the entire dashboard


## EndToEnd

### Maximize a visualization inside a panel stack to fill the whole dashboard page (Mode = “entire dashboard”)

- 1. Open dashboard with panel stack containing viz 2. Dashboard Properties > General: set "Maximize Visualization" = "Maximize to entire dashboard" 3. Maximize the viz 4. In devtools, verify maximized viz DOM node is appended under root curtainNode (not the panel stack’s curtain)

	- Viz covers entire dashboard page. Root curtain is visible; DOM parent is root curtainNode.

### Restore returns the visualization to the same place it came from (same panel + same ordering)

- 1. From the previous scenario, click Restore.
2. Confirm the visualization returns back into the panel stack exactly where it was before maximizing.

	- The visualization returns to its original location in the panel stack and looks the same as before maximize. The full-page curtain disappears when nothing is maximized anymore.

- **🔴 RISK: State Management & Data Context**
    - **Defect [BCDA-7990]:** Undo/history state management bug; consumption mode doesn't properly restore maximize state.
    - **Defect [BCDA-7986]:** Data context lost during state transitions; restore operation doesn't properly rehydrate visualization data.
    - **Action**: Test viz content after restore following undo/keep-only/resize; test with different viz types. Test undo after maximize in consumption vs authoring modes.

### The selected maximize mode is saved and still works after reopening the dashboard

- 1. Set Maximize Visualization = Maximize to entire dashboard.
2. Save the dashboard.
3. Close and reopen the same dashboard.
4. Maximize a visualization inside a panel stack.

	- The dropdown still shows Maximize to entire dashboard after reload, and panel visualizations maximize to the full dashboard page.

### platform

- mobile

	- iOS
	- Android

- Workstation
- Web

	- Authoring
	- Consumption

- **🟡 RISK: UX Consistency**
    - **Defect [BCDA-7993]:** Usage of loading icon inconsistencies between Authoring and Consumption modes.
    - **Action**: Compare loading states authoring vs consumption; verify async operation handling in both modes.

### UT

- DocRelativePanel.buildMaximizedBox()

	- P1: DOM re-parent to root curtain

- setPortalState(RESTORE)

	- P1: restore original parent/index ordering

## Core Functionalities

### Dashboard Properties shows "Maximize Visualization" dropdown (supported server)

- 1. Connect to server >= 26.02 2. Open dashboard in edit mode 3. Open Dashboard Properties > General

	- Dropdown is visible with two options; selection updates model value.

- generalEditorConfig.ts

	- P1: row gating + mvm mapping/default

- workstation

### Older servers hide the new dropdown (feature-gated)

- 1. Connect to a server version < 26.02.
2. Open Dashboard Properties → General.

	- The Maximize Visualization dropdown is not shown.
	- Technical notes: Risk: generalEditorConfig.ts currently sets visible: true and may require a follow-up fix if gating is not wired here.

### New dashboards default to “Maximize to current panel”

- 1. Create a new dashboard.
2. Open Dashboard Properties → General.

	- Default selection is Maximize to current panel (Web only).

### Show maximize button for single viz in panel when  "Maximize Visualization" = "Maximize to entire dashboard"

- 1. Use a panel stack that contains a single visualization.
2. Set Maximize Visualization = Maximize to entire dashboard.
3. Hover the visualization / open its toolbar.

	- Maximize button is visible even when the viz has no siblings, as long as it’s not in root panel and mode=1

- VizBox.shouldShowMaxRestoreBtn()

	- P1: visibility logic mode=1 vs 0

- **🔴 RISK: Edge Cases**
    - **Defect [BCDA-7992]:** Dangerous UX: button exists but action causes empty state; UI doesn't properly validate maximize eligibility.
    - **Action**: Test maximize button presence in edge cases (single panel, single viz); ensure button is hidden if maximize would result in empty state or is redundant.

### Toolbar updates after saving the new setting (not before)

- 1. Change the dropdown selection.
2. Save the dashboard successfully.
3. Confirm the maximize button availability/behavior updates after save completes.

	- The UI updates only after a successful save; users don’t see the toolbar “flip” early and then revert.

- DocPropsEditorReact.js + maximizeVizModeChanged

	- P2: event fires only on save success

- workstation / iOS / Android

### Switching the maximize mode doesn’t leave the dashboard in a mixed/half-maximized state

- 1. Set mode to entire dashboard and maximize a visualization in a panel stack.
2. While it’s maximized, change the dropdown back to Maximize to current panel.

	- The current maximized visualization is restored first, then the mode changes. You never end up with “old maximize behavior” still active while the setting shows something else.

- applyGeneralPropsChanges.ts (restoreAnyMaxedVizBox)

	-  P1: restore-before-change prevents mixed state

- **🔴 RISK: Configuration Sync**
    - **Defect [BCDA-7988]:** Settings not applied retroactively to existing maximize states; mixed maximize modes can coexist.
    - **Action**: Test changing maximize settings with active maximize states; verify all panels update to new mode immediately.

- workstation / iOS / Android

### Full-page maximize curtain matches the dashboard page background

- 1. Set the dashboard page background color to something obvious (e.g., blue).
2. Set mode to entire dashboard.
3. Maximize a panel visualization.

	- The full-page backdrop behind the maximized visualization uses the same page background color (e.g., blue).

- toggleCurtain()

	- P2: root curtain background selection

- workstation / iOS / Android

### Full-page maximize positioning looks correct (no offset/scale issues)

- 1. Set mode to entire dashboard.
2. Maximize a panel visualization.
3. Verify the visualization aligns to the page correctly (no unexpected offsets).

	- The maximized visualization aligns correctly to the dashboard page; no weird scaling or shifting.

- toggleCurtain()

	- P2: transform/margin reset avoids regressions

- workstation / iOS / Android

### Page Duplication & State Cloning

- 1. Create a dashboard with nested panel stacks and maximized visualizations.
2. Duplicate the page/chapter.

    - **🔴 RISK: State Cloning**
    - **Defect [BCDA-7991]:** JavaScript null reference error in page duplication; nested panel stack duplication not properly handled.
    - **Action**: Test page duplication with nested panels; test with various panel stack configurations; verify all panel properties cloned correctly.

## X-function tests

### Switching layouts while a visualization is maximized does not break the dashboard

- 1. Set mode to entire dashboard and maximize a panel visualization.
2. Change the dashboard layout mode (manual/auto, or other supported layout switch).

	- The visualization is restored cleanly before the layout switch completes; no broken maximize state remains.
	- Technical notes: avoid stale maximizedBoxSourcePanel

- restoreAnyMaxedVizBox() + maximizedBoxSourcePanel

	- P2: source-panel restore reference handling

### Info window visualizations do not maximize to the full dashboard page

- 1. Set mode to entire dashboard.
2. Open an info window visualization.
3. Click Maximize.

	- The visualization maximizes within the info window (not across the full page).

- UT P2: exclude info-window path

- **🔴 RISK: Info Window Logic**
    - **Defect [BCDA-7997]:** UI boundary logic error - maximization scope not properly scoped to info window context.
    - **Defect [BCDA-7995]:** Layout rendering bug affecting freeform mode; info window display logic broken during maximize.
    - **Action**: Test maximize behavior in info window vs main dashboard. Test info window overlay on maximized viz in freeform layout.

### Manual layout mode overlays look correct (no z-index conflicts)

- 1. Use a dashboard in manual layout mode.
2. Set mode to entire dashboard and maximize a panel visualization.

	- The maximize overlay appears above the right layers and doesn’t conflict with other masks/overlays.
	- Technical notes: ENUM_ZINDEX.MANUAL_MASK path.

- ENUM_ZINDEX.MANUAL_MASK

	- manual-mode z-index path

### Auto layout pages with scrolling are fully covered when maximized

- 1. Use an auto layout dashboard that requires scrolling.
2. Set mode to entire dashboard and maximize a panel visualization.

	- The full-page curtain covers the scrollable area; underlying content isn’t visible beneath the maximized view.
	- Technical notes: curtain height should match scroll viewport.

- phone / ipad / tablet / responsive view
- curtainNode.style.height

	- P2: curtain height covers scroll viewport

### export

- curtain height covers scroll viewport

- **🔴 RISK: Data Export**
    - **Defect [BCDA-7994]:** When set to 'maximize to entire dashboard', export to PDF on grid will be no data.
    - **Action**: Test PDF/export operations in maximized state; verify data context preservation; test all export formats.


## Error handling / Special cases

### If saving the dashboard fails, the UI should not partially update maximize behavior

- 1. Change the dropdown selection.
2. Force a save failure (e.g., network issue / session timeout).
3. Observe the UI and maximize button behavior.

	- No “phantom” toolbar refresh happens. The UI shows a save error per product standard and does not appear half-updated.
	- maximizeVizModeChanged should not fire on failure.

- DocPropsEditorReact.js (success-only event)

	-  P2: ensure no event/toolbar side effects

### Legacy dashboards saved with multiple maximized visualizations behave predictably

- 1. Open a legacy dashboard that already has multiple visualizations saved in maximized state (if available).
2. Observe how they appear.
3. Restore them one by one.

	- multiple maximized visualizations may overlap until restored. The curtain remains visible until the last one is restored. After everything is restored, future maximize behavior enforces the current product rule (single maximized visualization per page).

- root curtain hosting

	- P2: overlap/restore sequencing keeps curtain visible

### No memory/leak-like behavior after repeated navigation and property changes

- 1. Navigate across dashboards/pages and open/close Dashboard Properties repeatedly.
2. Toggle the maximize mode multiple times (saving each time).
3. Observe for duplicated refresh effects or slowdown

	- No duplicated toolbar refreshes and no gradual slowdown over time.
	- ensure no accumulating maximizeVizModeChanged listeners.

- VizBox.preBuildRendering() listener attach

	- P1: prevent accumulating listeners on navigation

## Security Test

## pendo

## performance

## Accessibility

### Keyboard-only operation for “Maximize Visualization” dropdown

- 1. Use Tab/Shift+Tab to move focus to the dropdown.
2. Open/select options using keyboard (arrows/enter/space, per platform behavior).
3. Save and confirm the setting applies.

	- Fully keyboard operable; focus order is sensible; selected option is visible and persists after save.

### Screen reader announces the new control correctly

- 1. Turn on a screen reader (VoiceOver/NVDA).
2. Navigate to the dropdown.
3. Change the selection and confirm announcements.

	- Control has a clear accessible name and role; option changes are announced and understandable.

## Platform

### browser

- Chroma / Edge / Safari

### system

- mac
- windows

### iOS app / AndroidApp

- phone
- tablet

## upgrade  / compitability

### Workstation

## Accessibility

## embedding

## i18n

### new string added in report authoring mode

## Team Icon

### Server

### Web

### Mobile

### Both Server And Web

### Workstation

## Priority Design

### Component Level

- Scrum team will take the testing automation
- E2E will sanity cover

### E2E Manual Test

- E2E test but out of automation scope

### E2E level

- E2E will cover and do automation

### E2E Low Priority Test

- Only Test when have time

