# Pre-PRD Brief: Upsell Agent

## BLUF (Bottom Line Up Front)

Upsell Agent equips spa, salon, and wellness center staff with AI-generated, product-specific sales training materials. By converting product specifications into tailored scripts and guides, the platform enables consistent upselling strategies that drive a proven 15–20% revenue lift while reducing managers’ training burden and increasing staff confidence.

---

## Project Overview

### Business Context

* **Problem Statement**: Managers struggle with inconsistent sales training and time-consuming manual material creation. Staff lack confidence in upselling, leading to lost revenue opportunities.
* **Target Audience**: Primary – Spa/Salon Managers. Secondary – Service staff in wellness settings.
* **Market Opportunity**: Growing med-spa/salon industry with untapped upsell revenue potential; small businesses prefer unified tools.
* **Success Vision (12 months)**: A validated platform adopted by salons that consistently generates sales training materials in <5 minutes, improves staff sales confidence, and achieves measurable 15–20% revenue uplift.

### Constraints

* **Budget**: Early MVP with minimal overhead; leverage existing Next.js/TypeScript/OpenAI stack.
* **Timeline**: Phase 1 MVP in 2–3 weeks; Phase 1.5 enhancement in +1 week.
* **Compliance**: Must avoid medical claims, include disclaimers, and comply with wellness marketing guidelines. No PII collection.
* **Technical**: Limited to MVP simplicity—browser-based OCR, JWT authentication, no OAuth or complex integrations.
* **Team**: Core deployment team includes backend architect, frontend developer, UI/UX designer, and business analyst. Specialists (marketer, DB architect, security audit) available on-call.

### Risks

1. **File Processing Reliability**: Failures in OCR or uploads could block workflow. Mitigation: fallback manual entry.
2. **AI Output Quality**: Poor script quality may undermine trust. Mitigation: use validated prompt templates.
3. **Market Adoption Risk**: Small businesses may hesitate. Mitigation: pilot with 3–5 salons for proof of value.

### Non-Goals

* No complex OAuth or enterprise authentication in V1.
* No CRM or advanced analytics integrations.
* No automated social scheduling (copy/paste only in Phase 1.5).
* Role-playing AI and dashboards are out of scope until Phase 2.

---

## Readiness Criteria

### Definition of Ready (DoR)

* [ ] Business case and pain points validated
* [ ] Target personas (managers, staff) identified
* [ ] Success metrics defined (training in <5 min, 15–20% revenue lift)
* [ ] Technical feasibility with Next.js, TypeScript, OpenAI confirmed
* [ ] Core team roles allocated
* [ ] MVP timeline agreed (2–3 weeks)
* [ ] Risk mitigation strategies documented
* [ ] Compliance disclaimers and data handling requirements defined

### Definition of Done (DoD)

* [ ] Product intake, ICP analysis, and training material generation working end-to-end
* [ ] File upload success rate >95%
* [ ] Training docs generated under 5 minutes
* [ ] Mobile scripts accessible and tested
* [ ] Compliance disclaimers included
* [ ] User acceptance from 3–5 pilot salons
* [ ] Documentation and developer setup finalized
* [ ] Monitoring and feedback channels in place

---

## Stakeholders

* **Project Sponsor**: \[TBD – likely Jayson / Impact Consulting]
* **Product Owner**: \[TBD – Business analyst/Product lead]
* **Technical Lead**: Backend architect (Next.js/TypeScript stack)
* **Key Users**: Spa/Salon managers, service staff

---

## Next Steps

1. Finalize this brief for stakeholder review.
2. Confirm pilot salon partners (3–5).
3. Validate team readiness via Claude Code orchestrator.
4. Proceed with full PRD execution and MVP build once DoR is satisfied.

