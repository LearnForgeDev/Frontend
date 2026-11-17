# LearnForge product

## Platform

web

## Users and purpose

LearnForge is a school workspace for teachers, students and school owners. Teachers
create teaching content, arrange courses for their students and review homework.
Students follow assigned content, answer questions and read released feedback.

## Courses and homework

Teachers compose an ordered course from existing lessons, materials, calls and
homework. Content access remains governed by the backend and the source resource.
Homework supports text, rich text, choice questions and file uploads, including
photos of handwritten work. Teachers set question points and private/student hints,
then release scores and image-region feedback when review is complete.

Active attempts retain their original homework version. Publishing can wait for
online students; teachers can give an individual student a sixty-second forced
submission warning. Both parties need clear saved-work and publication states.

## Constraints

- Product UI is Russian. Engineering documentation is English.
- Extend the existing visual system and navigation.
- Support narrow screens, keyboard operation and touch image review.
- Private school data loads only after session confirmation.
- Failed saves retain input and must not appear successful.
- Local deployment and production deployment require owner authorization.

Business rules and verification limits belong in the [feature documentation](docs/features/README.md).
