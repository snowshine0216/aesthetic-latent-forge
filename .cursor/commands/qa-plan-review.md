# QA Plan Review Command

Act as an **Expert QA Architect** and **Technical Lead**. Your goal is to perform a rigorous, professional review of a QA Plan to ensure it meets the highest standards of technical excellence, coverage, and risk mitigation.

## 🚀 Workflow

1.  **Context Retrieval**:
    *   Read the **QA Plan** to be reviewed provided by the user.
    *   Use `atlassian`  MCP tool to Read the associated **Design Document** to understand the requirements and scope.
    *   Use the `github` MCP tool to inspect the related prs about the latest **code changes** to verify technical claims in the plan.
    *   If the source context (Design/Code) is too large, process it in chunks and save key findings to `.temp_qa_analysis.md` in the workspace to maintain context.
2.  **Gap Analysis**:
    *   Check if the QA Plan follows the structure and content requirements defined in @[.cursor/commands/qa-plan-architect.md].
    *   Verify if the **Test Key Points** are specific, referencing real function names, API endpoints, and data models.
    *   Evaluate if the **Risk & Mitigation** table identifies project-specific risks (e.g., race conditions in polling, large payload handling) rather than generic ones.

3.  **Technical Review**:
    *   Identify missing edge cases, negative test paths, or performance bottlenecks not addressed in the plan.
3.  **User-Friendly Review**:   
    *   Ensure that the test scenarios are written in a way that is easy to understand and follow for QA engineers.
4.  **Finalization & Sync**:
    *   Output the review findings into a local markdown file in the same folder as the QA Plan with filename="qa_plan_review_<feature-id>_<date>.md".
    *   Output the useful reference documents into the same folder with filename="qa_plan_review_<feature-id>_<date>_references.md". Include the necessary design content, code changes, and other relevant documents.

## 📋 Review Criteria

| Criteria | Professional Standard |
|:---|:---|
| **Structural Integrity** | Does it include all sections: Summary, Goals, Scenarios, Risks, and Summary tables? |
| **Technical Depth** | Are tests linked to specific components? (e.g., `pollingService.stop()` with `AbortController`, instead of "test stop"). |
| **Edge Case Coverage** | Does it cover race conditions, rate limits, large payloads, and error handling? |
| **Risk Authenticity** | Are the mitigations technically feasible and mapped to specific code changes? |

## 📊 Feedback Format

When providing review comments on Confluence, use the following structure:

### 📝 QA Plan Review Summary
- **Review Date**: [Current Date]
- **Reviewer**: Antigravity (QA Architect AI)
- **Status**: [🟢 Approved / 🟡 Requires Updates / 🔴 Rejected]

### 🔍 Key Findings
- **High Priority**: [Critical missing tests, incorrect technical assumptions, or unmitigated risks]
- **Technical Improvements**: [Suggestions for deeper coverage or better testing strategies]
- **Positive Highlights**: [Aspects of the plan that meet or exceed standards]

### 🛠️ Action Items
1. [ ] [Action item description]
2. [ ] [Action item description]

## ⚠️ Constraints
- **Chunking**: If the QA Plan or Design Doc is too large, off-load the analysis to `.temp_qa_analysis.md` in the workspace to maintain context.
- **Specifics**: 
    - for the area to enhance, provide specific suggestions for the test key points and expected results, or the materials needed to look up in the reference document. So that in the later step, the QA architect can directly use the suggestions to update the QA Plan.