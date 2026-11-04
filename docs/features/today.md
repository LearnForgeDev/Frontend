# Today dashboard

## Status and scope

Implemented at `today`: a school-scoped summary of today's events, upcoming event,
recent lessons and role-dependent shortcuts. It composes other modules rather than
owning another copy of their business data.

## Behavior and rules

The page combines current memberships, schedule and lessons. Teaching shortcuts
depend on school capabilities; the owner summary requests students only when school
management is available. Opening an event navigates to the schedule's event link.
Creating a lesson uses the existing lesson-creation flow and opens that editor.

Today includes events overlapping the local day. Events that cross midnight are
handled by interval overlap rather than matching only their start date. An event
that ends at the day boundary is not still part of the new day.
The upcoming/current event and day label must update at event/day boundaries even
when no network response arrives.

## Data and dependencies

[Scheduling](scheduling.md), [lessons](lessons-editor.md), [school access](schools-access.md)
and [students](students-invitations.md) own the source data. The dashboard derives
display values and keeps a clock; it must not introduce independent persisted copies.

## Failure handling and limitations

Schedule, lessons and owner-summary loading/error states are independent. A failed
summary query must not hide all other useful data. Do not present a failed student
query's fallback count as confirmed backend data.

## Verification

Scheduling audit tests check midnight,
overlapping events and end-time updates. Core browser tests
check Today section loading. Additional navigation journeys cover role-dependent
summaries, empty schools, event/lesson navigation and isolated schedule failure.

## When changing this feature

Recheck scheduling boundary calculations and capability-dependent fetches/actions.
Reuse domain hooks rather than implementing a second lesson or event write path.
