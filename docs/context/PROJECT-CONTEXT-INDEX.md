# Upsell Agent - Project Context Index

## Project Status: INITIALIZATION PHASE
**Last Updated**: 2025-08-26
**Context Manager**: Active
**Current Phase**: MVP Setup & Agent Coordination

---

## Quick Reference

### Core Mission
AI-generated sales training materials for spa/salon/wellness centers targeting 15-20% revenue lift through consistent upselling strategies.

### Technical Stack
- **Framework**: Next.js with TypeScript
- **AI Engine**: OpenAI API
- **Authentication**: JWT (no OAuth in V1)
- **File Processing**: Browser-based OCR
- **Target**: 95% file upload success rate, <5 min training generation

### Timeline
- **Phase 1 MVP**: 2-3 weeks
- **Phase 1.5 Enhancement**: +1 week

---

## Active Work Streams

### 1. FOUNDATION SETUP (Week 1)
**Status**: In Progress
**Lead**: Backend Architect + Context Manager
**Dependencies**: None
**Deliverables**:
- [ ] Project architecture design
- [ ] Database schema planning
- [ ] API endpoint specifications
- [ ] Development environment setup

### 2. CORE FEATURES (Week 1-2)
**Status**: Pending
**Lead**: Frontend Developer + UI/UX Designer
**Dependencies**: Foundation Setup
**Deliverables**:
- [ ] File upload with OCR processing
- [ ] Training material generation UI
- [ ] Mobile-responsive interface
- [ ] JWT authentication implementation

### 3. BUSINESS VALIDATION (Week 2-3)
**Status**: Pending
**Lead**: Business Analyst + Content Marketer
**Dependencies**: Core Features 50% complete
**Deliverables**:
- [ ] Pilot salon recruitment (3-5 partners)
- [ ] Compliance disclaimer templates
- [ ] User acceptance testing framework
- [ ] Success metrics tracking

---

## Agent Coordination Matrix

| Agent Role | Primary Responsibility | Active During | Dependencies | Handoff To |
|------------|----------------------|---------------|--------------|------------|
| Context Manager | Project coordination, context preservation | All phases | None | All agents |
| Backend Architect | API design, database schema, core architecture | Week 1-2 | Context briefing | Frontend Dev |
| Frontend Developer | UI implementation, client-side features | Week 1-3 | Backend APIs | UI/UX Designer |
| UI/UX Designer | User experience, mobile responsiveness | Week 1-2 | Frontend framework | Business Analyst |
| Business Analyst | Requirements validation, pilot coordination | Week 2-3 | Core features | Security Auditor |

### On-Call Specialists
- **Database Architect**: Complex query optimization
- **Security Auditor**: Pre-launch security review
- **Content Marketer**: Compliance and messaging

---

## Context Checkpoints

### Checkpoint 1: Foundation Complete
**Target**: End of Week 1
**Success Criteria**:
- [ ] Architecture decisions documented
- [ ] Development environment operational
- [ ] Database schema finalized
- [ ] Core API endpoints defined

### Checkpoint 2: MVP Feature Complete
**Target**: End of Week 2
**Success Criteria**:
- [ ] File upload with OCR working
- [ ] Training material generation functional
- [ ] Mobile interface responsive
- [ ] Authentication implemented

### Checkpoint 3: Validation Ready
**Target**: End of Week 3
**Success Criteria**:
- [ ] Pilot salons onboarded
- [ ] User acceptance testing complete
- [ ] Compliance disclaimers integrated
- [ ] Performance benchmarks met

---

## Critical Decisions Log

### Architecture Decisions
- **Stack Selection**: Next.js/TypeScript/OpenAI (confirmed)
- **Authentication**: JWT-only for V1 simplicity
- **File Processing**: Browser-based OCR to avoid server overhead
- **Database**: [TBD - awaiting Backend Architect input]

### Business Decisions
- **Target Market**: Spa/salon/wellness centers (confirmed)
- **Success Metrics**: 15-20% revenue lift, <5 min generation time
- **Pilot Strategy**: 3-5 salon partners for validation
- **Compliance Approach**: Wellness marketing disclaimers, no medical claims

---

## Communication Protocols

### Agent Handoff Format
1. **Context Summary**: Current state and completed work
2. **Specific Requirements**: What needs to be accomplished
3. **Dependencies**: Prerequisites and blockers
4. **Success Criteria**: Definition of done
5. **Timeline**: Expected completion and next handoff

### Status Update Schedule
- **Daily**: Active agents report progress to Context Manager
- **Milestone**: Full context review at each checkpoint
- **Issue Escalation**: Immediate context manager involvement for blockers

### Context Distribution Rules
- **Minimal Context**: Only relevant information for current task
- **Full Context**: Provided at major handoffs and milestones
- **Historical Context**: Archived decisions accessible but not pushed

---

## Risk Management

### Technical Risks
1. **OCR Processing Reliability**: Fallback to manual entry
2. **AI Output Quality**: Validated prompt templates
3. **Performance Issues**: Progressive optimization approach

### Business Risks
1. **Market Adoption**: Pilot validation strategy
2. **Compliance Issues**: Legal review of all materials
3. **Timeline Pressure**: Phased delivery approach

---

## Next Actions

### Immediate (Next 24 hours)
1. Brief Backend Architect on architecture requirements
2. Validate technical feasibility with Sequential Thinking MCP
3. Initialize development environment
4. Define API specifications

### Short Term (Week 1)
1. Complete foundation setup
2. Begin core feature development
3. Establish pilot salon contacts
4. Create compliance framework

### Medium Term (Week 2-3)
1. Feature completion and testing
2. Pilot salon onboarding
3. Performance optimization
4. Launch preparation