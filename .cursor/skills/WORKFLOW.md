# QA Planning Skills Workflow

## Visual Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOURCE ANALYSIS (Parallel)                    │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
    │  qa-plan-figma   │    │ qa-plan-github   │    │qa-plan-atlassian │
    │                  │    │                  │    │                  │
    │  Input:          │    │  Input:          │    │  Input:          │
    │  • Figma URL     │    │  • GitHub PR URL │    │  • Confluence ID │
    │  • Node ID       │    │  • Owner/Repo    │    │  • Jira Key      │
    │                  │    │                  │    │                  │
    │  MCP:            │    │  MCP:            │    │  MCP:            │
    │  figma-plugin    │    │  user-github     │    │  mcp-atlassian   │
    │                  │    │                  │    │                  │
    │  Output:         │    │  Output:         │    │  Output:         │
    │  • UI tests      │    │  • Code tests    │    │  • Requirements  │
    │  • E2E flows     │    │  • Risk areas    │    │  • Acceptance    │
    │  • Design refs   │    │  • Tech tests    │    │  • Context       │
    └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
             │                       │                       │
             └───────────────────────┼───────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                          CONSOLIDATION                           │
└─────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────┐
                    │ qa-plan-architect-         │
                    │      orchestrator          │
                    │                            │
                    │  Input:                    │
                    │  • 3 partial QA plans      │
                    │                            │
                    │  Process:                  │
                    │  • Merge test scenarios    │
                    │  • Deduplicate             │
                    │  • Cross-reference risks   │
                    │  • Aggregate summaries     │
                    │                            │
                    │  Output:                   │
                    │  • Comprehensive QA plan   │
                    │  • All sections complete   │
                    │  • Ready for review        │
                    └──────────┬─────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VISUALIZATION (Optional)                     │
└─────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────┐
                    │    xmind-generator         │
                    │                            │
                    │  Input:                    │
                    │  • Comprehensive plan      │
                    │                            │
                    │  MCP:                      │
                    │  xmind-generator           │
                    │                            │
                    │  Process:                  │
                    │  • Parse markdown          │
                    │  • Build hierarchy         │
                    │  • Add labels/markers      │
                    │  • Create relationships    │
                    │                            │
                    │  Output:                   │
                    │  • .xmind file             │
                    │  • Visual mind map         │
                    └──────────┬─────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REVIEW & REFACTOR LOOP                      │
└─────────────────────────────────────────────────────────────────┘

        ┌────────────────────────────┐
        │    qa-plan-review          │
        │                            │
        │  Input:                    │
        │  • Comprehensive plan      │
        │  • Source docs (optional)  │
        │                            │
        │  Process:                  │
        │  • Check structure         │
        │  • Verify technical depth  │
        │  • Analyze coverage gaps   │
        │  • Validate risks          │
        │                            │
        │  Output:                   │
        │  • Review findings         │
        │  • Action items            │
        │  • Status (🟢/🟡/🔴)      │
        └──────────┬─────────────────┘
                   │
                   │ If 🟡 or 🔴
                   │
                   ▼
        ┌────────────────────────────┐
        │   qa-plan-refactor         │
        │                            │
        │  Input:                    │
        │  • QA plan                 │
        │  • Review findings         │
        │  • Action items            │
        │                            │
        │  Process:                  │
        │  • Extract action items    │
        │  • Implement each update   │
        │  • Verify accuracy         │
        │  • Update review status    │
        │                            │
        │  Output:                   │
        │  • Updated QA plan         │
        │  • Completed action items  │
        │  • Status: 🟢 Approved    │
        └──────────┬─────────────────┘
                   │
                   │ If still issues
                   │
                   └──────────┐
                              │
                   ┌──────────┘
                   │
                   ▼
            Re-run Review
                   │
                   │ When 🟢 Approved
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                          FINAL OUTPUT                            │
└─────────────────────────────────────────────────────────────────┘

            Approved Comprehensive QA Plan
            Ready for Stakeholder Sign-off
```

## Skill Interaction Matrix

| Skill | Consumes | Produces | Requires MCP |
|-------|----------|----------|--------------|
| **qa-plan-figma** | Figma URL, Node ID | Partial QA plan (UI focus) | ✅ figma-plugin |
| **qa-plan-github** | GitHub PR URL | Partial QA plan (code focus) | ✅ user-github |
| **qa-plan-atlassian** | Confluence/Jira IDs | Partial QA plan (requirements) | ✅ mcp-atlassian |
| **orchestrator** | 3 partial plans | Comprehensive QA plan | ❌ No |
| **xmind-generator** | Any QA plan markdown | .xmind mind map | ✅ xmind-generator |
| **qa-plan-review** | Comprehensive plan | Review findings + action items | ⚠️ Optional |
| **qa-plan-refactor** | Plan + review findings | Updated plan + status | ⚠️ Optional |

## Data Flow

```
┌─────────┐
│ Figma   │──┐
│ Design  │  │
└─────────┘  │
             ├──► qa-plan-figma ──┐
┌─────────┐  │                     │
│ GitHub  │──┤                     │
│   PR    │  │                     ├──► Orchestrator ──► Comprehensive
└─────────┘  ├──► qa-plan-github ──┤                        QA Plan
             │                     │                           │
┌─────────┐  │                     │                           │
│Confluence│──┤                     │                           │
│  Jira   │  │                     │                           ▼
└─────────┘  └──► qa-plan-atlassian─┘                     ┌──────────┐
                                                           │ Review   │
                                        ┌──────────────────┤   +      │
                                        │                  │ Refactor │
                                        │                  └──────────┘
                                        ▼
                                  ┌──────────┐
                                  │  XMind   │
                                  │Mind Map  │
                                  └──────────┘
```

## Usage Patterns

### Pattern 1: Full Pipeline (Comprehensive)

```bash
# Step 1: Analyze all sources
"Create QA plan from Figma: [url]"
"Create QA plan from PR: [pr-url]"  
"Create QA plan from Jira: [issue-key]"

# Step 2: Consolidate
"Consolidate all QA plans for [feature-name]"

# Step 3: Visualize
"Generate XMind from comprehensive QA plan"

# Step 4: Review & iterate
"Review the comprehensive QA plan"
"Update QA plan based on review feedback"
```

### Pattern 2: Code-Only Analysis

```bash
# When only PR exists (early development)
"Create QA plan from PR: [pr-url]"

# Skip orchestrator, go straight to review
"Review the GitHub QA plan"

# Refactor if needed
"Update based on review"
```

### Pattern 3: Design-First Approach

```bash
# When design exists but no code yet
"Create QA plan from Figma: [url]"
"Create QA plan from Jira: [issue-key]"

# Consolidate design + requirements
"Consolidate Figma and Atlassian QA plans"

# Use as pre-implementation test plan
# Later: Add GitHub analysis when code is ready
```

### Pattern 4: Iterative Updates

```bash
# Initial creation
"Create comprehensive QA plan for [feature]"

# After code changes
"Update GitHub QA plan for latest PR"
"Re-consolidate QA plans"

# After design changes  
"Update Figma QA plan for new design"
"Re-consolidate QA plans"
```

## File Dependencies

```
Input Files:
├── (External) Figma design file
├── (External) GitHub pull request
├── (External) Confluence pages
└── (External) Jira issues

Generated Files:
├── qa_plan_figma_[feature]_[date].md
├── qa_plan_github_[feature]_[date].md
├── qa_plan_atlassian_[feature]_[date].md
│
├── qa_plan_comprehensive_[feature]_[date].md    ← Primary artifact
│
├── qa_plan_[feature]_[date].xmind               ← Visual representation
│
├── qa_plan_review_[feature]_[date].md           ← Review findings
├── qa_plan_review_[feature]_[date]_references.md
│
└── (Updated) qa_plan_comprehensive_[feature]_[date].md
```

## Parallel Execution Strategy

Skills can run in parallel at each stage:

### Stage 1: Source Analysis (Parallel)
```
[qa-plan-figma] ────┐
[qa-plan-github] ───┼──► Run simultaneously
[qa-plan-atlassian]─┘
```

### Stage 2: Sequential
```
[orchestrator] → Must wait for all stage 1 to complete
```

### Stage 3: Parallel (Optional)
```
[xmind-generator] ──┐
[qa-plan-review] ───┘──► Can run simultaneously on comprehensive plan
```

### Stage 4: Sequential
```
[qa-plan-refactor] → Must wait for review to complete
```

## Error Handling Flow

```
┌─────────────────┐
│ Skill Execution │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │Success?│
    └───┬────┘
        │
   ┌────┼────┐
   │    │    │
  Yes   No   │
   │    │    │
   │    ▼    │
   │  ┌──────────────┐
   │  │MCP Available?│
   │  └──────┬───────┘
   │         │
   │    ┌────┼────┐
   │    │    │    │
   │   Yes   No   │
   │    │    │    │
   │    │    ▼    │
   │    │  ┌────────────┐
   │    │  │Try Fallback│
   │    │  │(gh CLI)    │
   │    │  └──────┬─────┘
   │    │         │
   │    │    ┌────┼────┐
   │    │    │    │    │
   │    │   Yes   No   │
   │    │    │    │    │
   │    │    │    ▼    │
   │    │    │  ┌───────────────┐
   │    │    │  │Ask User Input │
   │    │    │  └──────┬────────┘
   │    │    │         │
   │    ▼    ▼         ▼
   │  ┌────────────────────┐
   │  │  Continue with     │
   │  │  available data    │
   │  └────────────────────┘
   │            │
   └────────────┘
                │
                ▼
         ┌─────────────┐
         │ Next Skill  │
         └─────────────┘
```

## Quality Gates

Each skill has built-in quality checks:

| Skill | Quality Gate | Failure Action |
|-------|--------------|----------------|
| **figma** | Valid Figma URL, node exists | Prompt for correct URL |
| **github** | PR exists, accessible | Fallback to gh CLI or manual |
| **atlassian** | Page/issue exists, readable | Prompt for correct ID |
| **orchestrator** | At least 1 input plan | Request missing plans |
| **xmind** | Valid markdown structure | Simplify hierarchy |
| **review** | Plan has required sections | Flag structural issues |
| **refactor** | All action items addressable | Ask for clarification |

---

Created: 2026-01-29  
Version: 1.0  
Last Updated: 2026-01-29
