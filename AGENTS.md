# Agent Guidelines

When working on this codebase, adhere strictly to the following rules to maintain overall code styling and architecture:

## 1. UI Architecture & Framework
- **Use Material-UI (MUI):** All new UI components must be built using MUI components (`@mui/material`, `@mui/icons-material`, etc.).
- **MUI Global Theme:** Always prefer MUI variables from the global `theme` object for colors, typography, spacing, and shapes instead of hardcoded CSS values.
- **Prefer MUI over HTML:** Do not use native HTML elements like `<div>`, `<span>`, or `<button>` when equivalent MUI components (`<Box>`, `<Typography>`, `<Button>`) are available.

## 2. Styling Rules
- **All styling must be in separate files.** Do not clutter React component files (`.tsx`) with large inline style objects or extensive `sx` properties.
- **CSS Modules/Files:** Prefer `sx` styles over css. If that cannot be done use css to style components. Place custom styles in an external `.css` file next to the associated component (e.g., `ComponentName.css` imported into `ComponentName.tsx`).
- **MUI Styled Components:** If using MUI's `styled` or defining complicated `sx` objects, place these overrides and definitions into a separate file (e.g., `ComponentName.styles.ts`) and import them. Never mix complex style logic and component logic in the same file.

## 3. Strong Typing
- **TypeScript:** The project is strictly typed. Define interfaces and types rigorously.
- **Never use `any`:** Avoid `any`; use `unknown` if the type is truly dynamically resolved, or define proper Types and generic interfaces.
- **Organize Types:** Place reusable types into the `src/types/` directory based on the domain (`lessonTypes.ts`, `commonTypes.ts`, etc.).

## 4. File Structure & Component Organization
- **Colocation:** Keep related styling (`.css`) and minor sub-components grouped inside specific domain folders under `src/pages/` or `src/components/`.
- **Reusable Assets:** Treat `src/assets/CommonComponents/` as the hub for globally shared interface elements like `<Modal />` and `<Notification />`.
- **Pages and Routing:** Page entry points should be added correctly within `src/pages/` and exported logically into `AppRoutes.tsx`.

## 5. Imports
- Maintain clean and organized imports:
  1. Built-in React and framework libraries
  2. External dependencies like MUI
  3. Internal absolute imports and utilities
  4. Relative component imports (e.g., `./Components/...`)
  5. Styling files (e.g., `./ComponentName.css`) 

## 6. State Management & Hooks
- **Custom Hooks:** Extract complex state logic and side effects into custom hooks in the `src/hooks/` directory.
- **State Libraries:** If the project uses a state management library (like Redux, Zustand, or Context), keep state logic separate from UI components.

## 7. Error Handling & Loading States
- **Async Operations:** Always handle loading and error states for asynchronous operations.
- **User Feedback:** Use the global `<Notification />` component or inline MUI `<Alert>` components to show actionable error messages.

## 8. Accessibility (a11y)
- **ARIA Attributes:** Ensure all non-text interactive elements have descriptive `aria-label` or `aria-labelledby` attributes.
- **Keyboard Navigation:** Components must be fully usable via keyboard navigation.

## 9. Performance & Optimization
- **Memoization:** Use `React.memo`, `useMemo`, and `useCallback` judiciously to prevent unnecessary re-renders in performance-critical sections (e.g., large lists or complex data grids).

## 10. Naming Conventions
- **PascalCase for Components:** React components and interfaces should always use PascalCase (e.g., `LessonsMainPage.tsx`, `LessonItem`).
- **camelCase for Functions/Variables:** Variables, constants, and utility functions should use camelCase (e.g., `handleEdit`, `viewLesson`).
- **Hooks naming:** Custom hooks must start with `use` (e.g., `useNotification`).

## 11. Form Handling
- **Forms & Inputs:** If possible, use controlled components with MUI elements or a robust library like `react-hook-form` rather than managing all inputs manually.

## 12. Code Formatting & Linting
- **Strict Linting:** Ensure all code passes formatting and ESLint standards without warnings.
- **Avoid Commented Code:** Do not leave large blocks of commented-out code. Remove them before creating a PR or finalizing the task.
