---
id: "004"
title: tasks-phase4-k8s-todo-generation
stage: tasks
date: 2026-02-02
surface: claude-code
model: claude-opus-4-5-20251101
feature: 004-phase4-k8s-todo
branch: 001-phase4-k8s-todo
user: user
command: /sp.tasks
labels: [tasks, phase4, kubernetes, helm, docker, mcp, frontend, backend]
links:
  spec: specs/004-phase4-k8s-todo/spec.md
  ticket: ""
  adr: ""
  pr: ""
files:
  - specs/004-phase4-k8s-todo/tasks.md
tests:
  - N/A (task generation stage, tests not requested)
---

## Prompt

User invoked `/sp.tasks` to generate an actionable, dependency-ordered task list for the Phase IV Cloud-Native Todo AI Chatbot feature. Task generation consumed all available design documents: plan.md (26 implementation tasks across 7 phases), spec.md (6 user stories with priorities P1-P3, 25 functional requirements), data-model.md (Task entity with new due_date/due_time fields), contracts/backend-api.yaml (OpenAPI contract with /api/tasks endpoint), contracts/mcp-tools.yaml (5 MCP tool schemas with date/time extensions), and research.md (6 technical decisions).

## Response snapshot

Generated `specs/004-phase4-k8s-todo/tasks.md` with 43 tasks across 9 phases:

- **Phase 1 (Setup)**: 4 tasks — environment verification, standalone config, health endpoints
- **Phase 2 (Foundational)**: 5 tasks — Task model extension, database helpers, frontend types
- **Phase 3 (US1 - Date/Time Tasks)**: 5 tasks — MCP tool updates, agent prompt, tool registration
- **Phase 4 (US2 - Task View Pages)**: 9 tasks — backend API, frontend pages, navigation, checkboxes
- **Phase 5 (US5 - Chat MCP Operations)**: 3 tasks — guardrail verification, agent prompt rules
- **Phase 6 (US4 - Containerization)**: 3 tasks — Dockerfile verification, docker-compose update
- **Phase 7 (US3 - K8s Deployment)**: 6 tasks — umbrella chart, subcharts, template validation, deploy
- **Phase 8 (US6 - Helm Config)**: 4 tasks — parameterization, scaling test, secret scan
- **Phase 9 (Polish)**: 4 tasks — pod resilience, redeployment, E2E validation, compliance audit

Task counts per user story: US1=5, US2=9, US3=6, US4=3, US5=3, US6=4, Setup=4, Foundational=5, Polish=4.

Parallel opportunities: US1+US2 after foundational; MCP tools within US1; page files within US2; Dockerfiles within US4; subcharts within US3.

## Outcome

- Impact: Complete task decomposition enabling immediate execution of all 6 user stories
- Tests: Not generated (not requested in spec)
- Files: specs/004-phase4-k8s-todo/tasks.md
- Next prompts: /sp.implement
- Reflection: Tasks are organized by user story rather than by technical layer, enabling independent implementation and testing. US1 and US2 can run in parallel after Phase 2 since they touch different files (backend MCP tools vs frontend pages). The sequential chain US4→US3→US6 is unavoidable (must containerize before deploying to K8s before testing Helm config).

## Evaluation notes (flywheel)

- Failure modes observed: check-prerequisites.ps1 resolves to monorepo root instead of app directory; worked around by using known paths
- Graders run and results (PASS/FAIL): Format validation PASS (all 43 tasks follow checklist format with checkbox, ID, labels, file paths)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
