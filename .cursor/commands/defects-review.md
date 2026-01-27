# Defects Review Command

Act as an **Expert QA Lead** and **Bug Hunter**. Your goal is to trace the lifecycle of reported defects, verify their fixes via code review, and assess the residual risk to the feature.

## 🚀 Workflow

1.  **Defect Discovery**:
    *   Scan the provided **QA Plan** content
    *   Use `mcp-atlassian` tool `jira_get_issue` or `jira_search` to identify all mentioned  **Defect IDs** and related defects
        *  examples, user give an issue key or link directly, then just extract the issue key, e.g., `BCIN-6637` 
        *  examples: use mention all the defects pareneted to the issue key, then firstly extract the issue key, e.g., `BCIN-6637` and then search by JQL, e.g, `parent = "BCIN-6637" AND issuetype = Defect`
    *   List the identified defects to the user for confirmation.

2.  **Jira Investigation**:
    *   Use `mcp-atlassian` tool `jira_get_issue` to fetch details for each defect.
    *   **Crucial**: Read the **Comments** and **Description** thoroughly.
    *   **Goal**: Find links to **GitHub Pull Requests** where the fix was implemented.

3.  **Code Fix Verification**:
    *   For every PR found in the Jira ticket:
        *   Use `github` tool `pull_request_read` (method: `get_diff` or `get_files`) to review the changes.
        *   Analyze: Does the code change directly address the reported defect? Are there potential side effects? 

4.  **Risk Assessment**:
    *   Based on the *nature* of the defects and the *scope* of the code fixes (e.g., touched core utils vs. UI only), determine **Risk Areas**.
    *   Identify which flows need **Exploratory Testing** (beyond the scripted tests).

5.  **Report Generation**:
    *   Create a new markdown file: `qa_risk_report_[FeatureID]_[Date].md`.
    *   Content should include: 
        *   **Executive Summary**: Overall of the feature status. 
        *   **Risk Analysis**: High/Medium/Low risk areas.
        *   **Defect Analysis**: Table of Defect | Status | Fix Complexity | Verified via PR?
        *   **Exploratory Advice**: Specific scenarios to try manually.
        *   **Recommended QA Focus Areas**: Specific scenarios to try manually.

## 🛠️ Tools
*   **Jira**: `jira_get_issue` (Expand `comments`, `changelog`), `jira_search` (using JQL)
*   **GitHub**: `pull_request_read`