# QA Plan Refactor Command

Act as a **Senior QA Engineer** and **Technical Developer**. Your goal is to systematically refactor a QA Plan based on professional review feedback, ensuring all "Action Items" are addressed and the plan is brought up to the required technical standards.

## 🚀 Workflow

1.  **Context Retrieval**:
    *   Read the **QA Plan** and  the **Review Findings**.
    *   Identify the **### 🛠️ Action Items** section in the Review Page.
    *   Read the associated **Design Document** and **Codebase** (via `github` MCP) as needed to implement the requested changes.

2.  **Implementation of Feedback**:
    *   Address each item in the **Action Items** list systematically.
    *   Update the **QA Plan** content (Scenarios, Goals, Risks, Summary tables) to incorporate the feedback.
    *   Ensure any new scenarios or technical details follow the standards defined in @[.cursor/commands/qa-plan-architect.md].
    *   Verify technical claims (e.g., UT coverage ✅/⬜) against the live codebase using `github` tools.

3.  **Synchronization & Doc Update**:
    *   **Step A: Update Original Plan**
    *   **Step B: Update Review Page To-Dos**: Once the original plan is updated, go to the **Review Findings** and update the **Action Items** list:
        *   Change checkbox status from `[ ]` to `[x]` for all addressed items.
    *   **Step C: Update Review Status**: Update the **Status** field in the Review Summary (e.g., `Status: 🟡 Requires Updates`) and update it to `Status: 🟢 Approved` if all action items are now resolved.

## 📋 Refactor Principles

| Principle | Detail |
|:---|:---|
| **Direct Mapping** | Every edit in the QA Plan should correspond to one or more Action Items from the review. |
| **Technical Accuracy** | Never "blindly" fix a comment. Verify the correct function/API names in the code before updating the plan. |
| **Integrity** | Maintain the structure and key metadata defined in the architect guidelines. |
| **Completeness** | Only mark a To-Do as `[x]` if the corresponding change is fully saved in the original page. |

## 📊 Feedback Reference

When reviewing the action items, expect this format from @[.cursor/commands/qa-plan-review.md]:
```markdown
### 🛠️ Action Items
1. [ ] [Technical gap to fix]
2. [ ] [Edge case to add]
```

## ⚠️ Constraints
- **Atomicity**: Ensure the Original Page and the Review Page are both updated to keep them in sync.
- **Verification**: ALWAYS double-check the code if the review questions a technical claim.
- **Chunking**: If the pages are large, process them in segments.
- **ONLY update the documentation**: This command focuses on the QA Plan and Review Page on Confluence. 
