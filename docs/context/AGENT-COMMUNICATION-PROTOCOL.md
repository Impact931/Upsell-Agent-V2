# Agent Communication Protocol

## Overview
This protocol ensures efficient, context-aware communication between agents in the Upsell Agent multi-agent workflow. It standardizes handoffs, status reporting, and context preservation.

---

## Core Principles

### 1. Context Efficiency
- **Minimal Context**: Each agent receives only information relevant to their current task
- **Just-in-Time**: Context provided when needed, not preemptively
- **Progressive Detail**: Start with summary, provide detail on request

### 2. Clear Handoffs
- **Defined Triggers**: Specific conditions that initiate agent handoffs
- **Success Criteria**: Clear definition of completion before handoff
- **Dependency Mapping**: Explicit requirements and prerequisites

### 3. Accountability
- **Single Owner**: Each work stream has one primary responsible agent
- **Status Transparency**: Regular updates to Context Manager
- **Issue Escalation**: Clear path for resolving blockers

---

## Communication Formats

### Standard Agent Briefing Template

```markdown
# Agent Briefing: [Agent Role] - [Task Name]

## Context Summary
- **Project Phase**: [Current phase]
- **Previous Work**: [Key completed items]
- **Current State**: [What's ready for this agent]

## Specific Task
- **Primary Objective**: [What needs to be accomplished]
- **Success Criteria**: [How to know when done]
- **Timeline**: [Expected completion]

## Resources Available
- **Files**: [Relevant existing files]
- **Dependencies**: [What this agent needs from others]
- **Tools**: [Recommended tools/approaches]

## Constraints
- **Technical**: [Technology limitations]
- **Business**: [Business rules/requirements]
- **Timeline**: [Hard deadlines]

## Handoff Instructions
- **Next Agent**: [Who receives the output]
- **Deliverables**: [What to produce for handoff]
- **Context to Preserve**: [What must be documented]
```

### Status Report Template

```markdown
# Status Report: [Agent Role] - [Date]

## Progress Summary
- **Completed**: [Finished tasks]
- **In Progress**: [Current work with % complete]
- **Blocked**: [Issues preventing progress]

## Key Decisions Made
- **Decision**: [What was decided]
- **Rationale**: [Why this approach]
- **Impact**: [Effect on project/other agents]

## Context Updates
- **New Information**: [Discoveries affecting other work]
- **Changed Requirements**: [Any modifications to original task]
- **Dependencies Resolved**: [Blockers that are now clear]

## Next Actions
- **Immediate (24h)**: [Urgent next steps]
- **Short Term (Week)**: [Planned activities]
- **Handoff Timing**: [When work will be ready for next agent]
```

---

## Agent Interaction Patterns

### Sequential Handoff
**Use Case**: Linear dependencies (Backend → Frontend → Testing)

1. **Pre-Handoff Check**: Validate all success criteria met
2. **Context Package**: Create focused briefing for next agent
3. **Clean Handoff**: Complete current work before starting new tasks
4. **Validation**: Next agent confirms they have what they need

### Parallel Coordination
**Use Case**: Independent work streams that need coordination

1. **Sync Points**: Regular check-ins to share relevant updates
2. **Interface Agreements**: Clear contracts between parallel work
3. **Integration Planning**: Scheduled combination of parallel outputs
4. **Conflict Resolution**: Process for handling overlapping concerns

### Specialist Consultation
**Use Case**: On-call experts providing targeted input

1. **Focused Request**: Specific question or problem statement
2. **Context Packaging**: Minimal but sufficient background
3. **Expert Response**: Targeted recommendation or solution
4. **Integration**: Primary agent incorporates specialist input

---

## Context Manager Role

### Proactive Coordination
- **Monitor Progress**: Track all active work streams
- **Identify Conflicts**: Spot potential integration issues early
- **Optimize Handoffs**: Ensure smooth transitions between agents
- **Maintain Standards**: Enforce communication protocols

### Context Preservation
- **Decision Logging**: Record all significant choices and rationale
- **Pattern Recognition**: Identify reusable solutions
- **Knowledge Transfer**: Share insights across agents
- **Memory Management**: Archive completed context, surface active items

### Issue Resolution
- **Blocker Identification**: Recognize stalled progress
- **Resource Allocation**: Suggest alternative approaches or agents
- **Scope Management**: Clarify requirements when agents disagree
- **Timeline Adjustment**: Recommend schedule changes when needed

---

## Handoff Triggers

### Automatic Triggers
- **Completion**: All success criteria met
- **Dependency**: Required input becomes available
- **Timeline**: Scheduled handoff time reached
- **Resource**: Agent capacity exhausted

### Manual Triggers
- **Blocker**: Agent cannot proceed without help
- **Scope Change**: Requirements modification affects other work
- **Quality Issue**: Output needs specialist review
- **Integration**: Multiple work streams need coordination

---

## Quality Gates

### Before Agent Assignment
- [ ] Clear task definition with success criteria
- [ ] Sufficient context provided
- [ ] Dependencies identified and available
- [ ] Timeline realistic and agreed

### During Execution
- [ ] Regular progress updates to Context Manager
- [ ] Issues escalated promptly
- [ ] Context updates shared when relevant
- [ ] Quality maintained throughout

### Before Handoff
- [ ] All success criteria met
- [ ] Output validated and tested
- [ ] Next agent briefing prepared
- [ ] Context properly documented

---

## Communication Channels

### Formal Communication
- **Agent Briefings**: Structured task assignments
- **Status Reports**: Regular progress updates
- **Handoff Documents**: Transition packages
- **Decision Records**: Architectural Decision Records (ADRs)

### Informal Communication
- **Quick Updates**: Brief progress notifications
- **Questions**: Clarification requests
- **Discoveries**: New information sharing
- **Alerts**: Urgent issue notifications

---

## Success Metrics

### Communication Efficiency
- **Handoff Time**: Time between completion and next agent start
- **Rework Rate**: Frequency of returning work for revision
- **Context Clarity**: Agent feedback on briefing quality
- **Issue Resolution**: Time to resolve blockers

### Project Coordination
- **Milestone Achievement**: On-time completion of checkpoints
- **Scope Stability**: Frequency of requirement changes
- **Resource Utilization**: Effective use of agent specializations
- **Quality Consistency**: Maintainence of standards across agents