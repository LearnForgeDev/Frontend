# Browser acceptance catalogue

This catalogue records user journeys and required outcomes, not a list of passing
tests. Read the [feature map](../features/README.md) for connected behavior versus
required changes and deferred design. Use [naming](../guides/naming.md) to find code.

All product-facing text remains Russian. Instructions and test descriptions here
are English. P0 denotes a critical data/access/workflow check; P1 denotes additional
recovery, interaction and boundary checks. Scenario IDs remain stable across edits.

| Area | Scenario groups |
| --- | --- |
| [Authentication](auth-and-session.md) | AUTH, SESSION |
| [Onboarding and schools](onboarding-and-schools.md) | ONB, INV, DEV |
| [Navigation, access, Today and profile](navigation-and-access.md) | NAV, ACCESS, TODAY, PROFILE |
| [Lessons and editor](lessons-and-editor.md) | LESSON, EDITOR |
| [Courses](courses.md) | COURSE; architecture discussion deferred |
| [Scheduling and calls](schedule-and-calls.md) | SCHEDULE, CALL; call architecture discussion deferred |
| [Files and chat](files-and-chat.md) | FILE, CHAT, including required local retention/update UX |
| [Cross-feature checks](cross-cutting.md) | COMMON, JOURNEY |

Use [environment policy](environment.md) for isolation and approval requirements,
[coverage](coverage.md) for evidence gaps and [testing](../guides/testing.md) for
verification policy. A scenario, screenshot or test file alone is not proof of a
passing run or implemented behavior.

Validate persisted changes after reload and through an independent authorized user
when sharing is part of the flow. Keep local draft outcomes distinct from published
backend records. Do not infer a complete workflow from a DTO field or old component.
