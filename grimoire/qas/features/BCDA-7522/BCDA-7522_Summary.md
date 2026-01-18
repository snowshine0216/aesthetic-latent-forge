# BCDA-7522 Feature Summary

**Feature**: Allow user to maximize visualization in a panel to the entire dashboard
**Status**: In Progress with multiple identified defects.

## Overview
This feature allows users to maximize a visualization within a panel stack to cover the entire dashboard. Configuration is managed via Dashboard Properties.

## Documents
- **QA Plan**: [BCDA-7522_Allow_user_to_maximize_visualization_in_a_panel_to_the_entire_dashboard.md](./BCDA-7522_Allow_user_to_maximize_visualization_in_a_panel_to_the_entire_dashboard.md)
- **Risk Assessment**: [BCDA-7522_QA_Risk_Matrix.md](./BCDA-7522_QA_Risk_Matrix.md)

## Risk Summary (🔴 HIGH)
The feature currently presents **High Risk** due to 8 identified defects, primarily revolving around:
1.  **State Management**: Issues with Undo/Redo, page duplication, and maximizing state persistence (e.g., [BCDA-7990], [BCDA-7991]).
2.  **Cross-Mode Data Integrity**: Loss of data context during export ([BCDA-7994]) and inconsistencies between Authoring and Consumption modes ([BCDA-7993]).
3.  **UI/UX Boundaries**: Maximizing logic failing in restricted scopes like Info Windows ([BCDA-7997]) or causing empty states ([BCDA-7992]).,

## Action Items
- Run regression tests on Undo/Redo workflows immediately.
- Verify fixes for high-priority defects (BCDA-7997, BCDA-7995, BCDA-7994).
- Ensure integration tests cover mixed layout modes (Freeform/Grid) ensuring the curtain renders correctly.
