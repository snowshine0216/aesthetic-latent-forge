# QA Planning Skills - Overview

This document provides an overview of the QA planning skills ecosystem created for comprehensive test planning and review workflows.

## 📋 Skills Overview

### 1. qa-plan-figma
**Purpose**: Generate QA plans from Figma designs  
**Focus**: UI testing and E2E workflow testing  
**MCP Required**: `plugin-figma-figma`

**Key Capabilities**:
- Extract design components from Figma
- Generate UI test scenarios (visual, interactive)
- Create E2E workflow tests from design flows
- Output design reference data (colors, typography, spacing)

**Triggers**: "QA plan from Figma", "test plan from design", "UI testing from Figma"

---

### 2. qa-plan-github
**Purpose**: Generate QA plans from GitHub pull request analysis  
**Focus**: Code changes, risk areas, technical testing  
**MCP Required**: `user-github` (or fallback to `gh` CLI)

**Key Capabilities**:
- Analyze PR diffs and code changes
- Filter out non-functional files (*.json, *.lock, *.md)
- Identify risk areas (High/Medium/Low)
- Map code changes to test scenarios
- Generate technical test plans (unit, integration, E2E)

**Triggers**: "QA plan from PR", "analyze code changes", "test plan from GitHub"

---

### 3. qa-plan-atlassian
**Purpose**: Generate QA plans from Confluence and Jira  
**Focus**: Requirements analysis, acceptance criteria, background context  
**MCP Required**: `user-mcp-atlassian`

**Key Capabilities**:
- Read Confluence design documents
- Extract Jira acceptance criteria
- Map requirements to test scenarios
- Identify dependencies and stakeholders
- Generate requirement-driven test plans

**Triggers**: "QA plan from requirements", "test plan from Jira", "Confluence QA analysis"

---

### 4. qa-plan-architect-orchestrator
**Purpose**: Consolidate partial QA plans into comprehensive plan  
**Focus**: Merging, deduplication, comprehensive user-facing documentation  
**MCP Required**: None (reads files)

**Key Capabilities**:
- Merge QA plans from Figma, GitHub, Atlassian
- Deduplicate test scenarios
- Cross-reference risks and mitigations
- Generate comprehensive QA summary
- Create final stakeholder-ready document

**Triggers**: "consolidate QA plans", "merge QA analysis", "create final QA plan"

---

### 5. xmind-generator
**Purpose**: Generate XMind mind maps from QA plans  
**Focus**: Visual representation with hierarchical drill-down  
**MCP Required**: `user-xmind-generator`

**Key Capabilities**:
- Parse QA plan markdown structure
- Build hierarchical mind map (root → topics → subtopics → children)
- Add labels (P0, P1, P2, categories)
- Add markers (status indicators, priorities)
- Create relationships (dependencies)
- Drill down to bullet-level detail

**Triggers**: "create mind map", "visualize QA plan", "generate XMind"

---

### 6. qa-plan-review
**Purpose**: Review QA plans for quality and completeness  
**Focus**: Technical excellence, coverage analysis, gap detection  
**MCP Required**: Optional (`user-mcp-atlassian`, `user-github` for verification)

**Key Capabilities**:
- Structural integrity review
- Technical depth assessment
- Edge case coverage analysis
- Risk mitigation validation
- Requirement traceability check
- Generate action items for improvement

**Triggers**: "review QA plan", "audit QA plan", "check QA quality"

---

### 7. qa-plan-refactor
**Purpose**: Systematically update QA plans based on review feedback  
**Focus**: Implementing action items, maintaining consistency  
**MCP Required**: Optional (for verification)

**Key Capabilities**:
- Extract action items from review
- Systematically implement each update
- Verify technical claims against code
- Update review findings (mark complete)
- Update review status when done
- Maintain document integrity

**Triggers**: "update QA plan", "implement review feedback", "fix QA issues"

---

## 🔄 Workflow Integration

### Complete QA Planning Workflow

```
1. Source Analysis (Parallel)
   ├─ qa-plan-figma → Analyze Figma design
   ├─ qa-plan-github → Analyze GitHub PR
   └─ qa-plan-atlassian → Analyze Confluence/Jira

2. Consolidation
   └─ qa-plan-architect-orchestrator → Merge all plans

3. Visualization (Optional)
   └─ xmind-generator → Create mind map

4. Review & Refactor Loop
   ├─ qa-plan-review → Review consolidated plan
   ├─ qa-plan-refactor → Address action items
   └─ (Repeat if needed)

5. Final Output
   └─ Approved comprehensive QA plan
```

### Example User Commands

**Initial Planning**:
```
"Create QA plan for login feature from:
- Figma: https://figma.com/design/abc123/Login?node-id=1-2
- GitHub PR: https://github.com/org/repo/pull/456
- Jira: PROJ-123"
```

**Consolidation**:
```
"Consolidate all QA plans for login feature into comprehensive plan"
```

**Visualization**:
```
"Generate XMind mind map from the comprehensive QA plan"
```

**Review Cycle**:
```
"Review the comprehensive QA plan for completeness"
"Update the QA plan based on review feedback"
```

---

## 📂 File Structure

```
.cursor/skills/
├── qa-plan-figma/
│   └── SKILL.md (274 lines)
├── qa-plan-github/
│   └── SKILL.md (457 lines)
├── qa-plan-atlassian/
│   └── SKILL.md (~500 lines)
├── qa-plan-architect-orchestrator/
│   └── SKILL.md (~500 lines)
├── xmind-generator/
│   └── SKILL.md (~350 lines)
├── qa-plan-review/
│   └── SKILL.md (~500 lines)
└── qa-plan-refactor/
    └── SKILL.md (~450 lines)
```

**Total**: 7 comprehensive skills with ~3,000+ lines of detailed guidance

---

## 🔧 MCP Requirements

### Required MCP Servers

| Skill | MCP Server | Configuration |
|-------|------------|---------------|
| qa-plan-figma | `plugin-figma-figma` | Figma API key required |
| qa-plan-github | `user-github` | GitHub token required |
| qa-plan-atlassian | `user-mcp-atlassian` | Atlassian credentials |
| xmind-generator | `user-xmind-generator` | Output path configured |

### Verify MCP Configuration

```bash
# Check available MCP servers
ls ~/.cursor/projects/*/mcps/

# Verify Figma MCP
ls ~/.cursor/projects/*/mcps/plugin-figma-figma/tools/

# Verify GitHub MCP
ls ~/.cursor/projects/*/mcps/user-github/tools/

# Verify Atlassian MCP
ls ~/.cursor/projects/*/mcps/user-mcp-atlassian/tools/

# Verify XMind MCP
ls ~/.cursor/projects/*/mcps/user-xmind-generator/tools/
```

---

## 📝 Output Files

### Default Output Location
```
/Users/xuyin/Documents/FeatureTest/QAPlans/
```

### File Naming Conventions

| File Type | Naming Pattern | Example |
|-----------|----------------|---------|
| Figma QA Plan | `qa_plan_figma_<feature_id>_<date>.md` | `qa_plan_figma_login_2026-01-29.md` |
| GitHub QA Plan | `qa_plan_github_<feature_id>_<date>.md` | `qa_plan_github_login_2026-01-29.md` |
| Atlassian QA Plan | `qa_plan_atlassian_<feature_id>_<date>.md` | `qa_plan_atlassian_login_2026-01-29.md` |
| Comprehensive Plan | `qa_plan_comprehensive_<feature_id>_<date>.md` | `qa_plan_comprehensive_login_2026-01-29.md` |
| XMind Map | `qa_plan_<feature_id>_<date>.xmind` | `qa_plan_login_2026-01-29.xmind` |
| Review Findings | `qa_plan_review_<feature_id>_<date>.md` | `qa_plan_review_login_2026-01-29.md` |
| Review References | `qa_plan_review_<feature_id>_<date>_references.md` | `qa_plan_review_login_2026-01-29_references.md` |

---

## 🎯 Key Features

### Comprehensive Coverage

- **UI Testing**: Visual components, interactive elements, responsive design
- **Backend Testing**: API endpoints, database operations, business logic
- **E2E Testing**: Complete user workflows, integration testing
- **Performance**: Load testing, response times, scalability
- **Security**: Auth, validation, vulnerabilities, encryption
- **Accessibility**: WCAG compliance, keyboard navigation, screen readers

### Intelligent Analysis

- **Risk Assessment**: Automatic risk level detection (High/Medium/Low)
- **Gap Detection**: Identifies missing test coverage
- **Traceability**: Links tests to requirements, code, design
- **Prioritization**: Consistent P0/P1/P2 labeling

### Quality Assurance

- **Technical Depth**: Code references, specific values, file paths
- **Actionable Tests**: Clear scenarios, expected results, test data
- **Review Process**: Systematic quality checks and feedback
- **Iterative Refinement**: Review → Refactor → Re-review cycle

---

## 🚀 Getting Started

### Quick Start

1. **Ensure MCP servers are configured** (see README.md)
2. **Gather source materials**:
   - Figma design URL
   - GitHub PR URL
   - Jira issue key or Confluence page
3. **Run analysis skills** (parallel):
   ```
   "Create QA plan from [source]"
   ```
4. **Consolidate** results:
   ```
   "Consolidate QA plans"
   ```
5. **Review** and iterate:
   ```
   "Review QA plan"
   "Update QA plan based on feedback"
   ```

### Advanced Usage

- **Selective Analysis**: Run only needed skills (e.g., just GitHub if only code exists)
- **Iterative Updates**: Re-run skills as sources change
- **Multiple Views**: Generate XMind for different audiences (exec, engineer, QA)
- **Automated CI/CD**: Integrate with PR workflows

---

## 📚 Reference

### Related Commands

These skills complement the existing commands:
- `.cursor/commands/qa-plan-architect.md` - QA plan generation command
- `.cursor/commands/qa-plan-review.md` - QA plan review command  
- `.cursor/commands/qa-plan-refactor.md` - QA plan refactor command

### Best Practices

1. **Always run all three source skills** (Figma, GitHub, Atlassian) for complete coverage
2. **Use orchestrator** to merge - don't manually combine plans
3. **Review before stakeholder presentation** - catch issues early
4. **Iterate** - use review/refactor cycle until approved
5. **Visualize** - XMind helps stakeholders understand scope
6. **Maintain traceability** - always link tests to sources

---

## 🔮 Future Enhancements

Potential additions:
- **qa-plan-playwright**: Generate Playwright test code from QA plan
- **qa-plan-jira-sync**: Sync QA plan to Jira test cases
- **qa-plan-coverage**: Analyze actual test coverage vs. plan
- **qa-plan-metrics**: Track QA plan quality metrics over time

---

**Created**: 2026-01-29  
**Version**: 1.0  
**Status**: Complete - All 7 skills implemented  
**Total Lines**: ~3,000+ lines of skill documentation
