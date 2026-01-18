Use the `Retrieve Jira issue` tool from the `atlassian` MCP to get issue content with cloud id `strategyagile.atlassian.net` and output with below contents in compact single line json: 

```json
{
    "summary": "Summary",
    "title": "Title",
    "status": "Status",
    "priority": "Priority",
    "assignee": "Assignee",
    "release": "Release",
    "description": "Description",
    "solution": "Solution",
    "key details": {
        "lables": "Lables",
        "customers requesting": "Customers Requesting",
    },
    "comments highlight": {
        "key highlight": ["highlight1", "highlight2"],
        "github prs": ["pr1", "pr2"]    
    }
}
```