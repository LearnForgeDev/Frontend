# Cross-feature acceptance

These criteria complement module scenarios. They do not assert that every listed
behavior is implemented or covered. Use the [environment policy](environment.md)
and record the evidence actually obtained.

## Shared checks

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| COMMON-01 | P0 | Open each connected route and navigate across modules in the production build. | No uncaught page errors, failed scripts/styles or unusable lazy routes. |
| COMMON-02 | P1 | Make reads slow, empty and failed; retry each supported recovery. | Pending, empty and failed states differ and recovery does not require needless reauthentication. |
| COMMON-03 | P1 | Repeat submit/send clicks, cancel before submitting and recover from failure. | No duplicate entity/write, cancelled action or discarded input. |
| COMMON-04 | P1 | Navigate forms, menus and dialogs with a keyboard. | Controls have usable names/focus and dialog closure restores focus appropriately. |
| COMMON-05 | P0 | Warm A's data/drafts, log out into B and repeat across two schools with overlapping local identities. | No foreign state, roles, history, drafts or preview leaks; persisted recovery obeys the same ownership. |
| COMMON-06 | P1 | Write data, visit related modules, use history and reload. | Confirmed changes appear consistently; stale state cannot resurrect a deleted record. |
| COMMON-07 | P1 | Use narrow/desktop layouts, long Russian product text and reduced motion. | Primary controls remain accessible without overflow; existing editing restrictions remain explicit. |
| COMMON-08 | P0 | Display hostile markup/unsafe links through titles, messages and filenames. | Content cannot execute scripts or leak authorization; errors do not expose tokens or internal stacks. |

The target architecture also needs checks that components use only public feature
hooks and that domain operations keep one Redux state owner. Naming validation does
not prove those behavioral boundaries by itself.

## End-to-end journeys

| ID | Priority | Preparation and action | Expected result |
| --- | --- | --- | --- |
| JOURNEY-01 | P0 | Register, request a school, approve in an admin context, complete provisioning and reload Today. | Correct owner membership persists; old waiting pointers do not reappear on login. |
| JOURNEY-02 | P0 | Create an invitation, join from an independent account, read the roster and exchange direct messages. | Correct school membership/role and real two-user delivery persist. |
| JOURNEY-03 | P0 | Publish a lesson, add it to a course, assign a learner, read/complete it and inspect manager progress. | Content, program, access and progress agree after reload; fixture-created content alone does not test editor publication. |
| JOURNEY-04 | P0 | Create an event, read it as learner and enter the same permitted room from both users. | Time, attendees and room match; media requires an approved environment beyond token checks. |
| JOURNEY-05 | P0 | Upload a file, attach it to chat, download as another member and reload. | Original bytes and message linkage persist; outsiders cannot read the file. |
| JOURNEY-06 | P0 | Switch Teacher in A to Student in B, use modules, log out and sign in as another user. | Every scope/permission changes correctly and no earlier account state survives. |

Courses and calls remain subject to later design discussion. These journeys retain
acceptance intent without creating redesign tasks or choosing a new architecture.
