import { useParams } from 'react-router-dom';

/**
 * Resolves the active school's public id (GUID) from the route.
 *
 * This is the `useSchoolId()` convention named in ARCHITECTURE.md; in this
 * codebase the school scope is carried as the `:schoolPublicId` route param
 * (same as `useLessons`). Throws if it is absent so callers never silently
 * issue an unscoped, multi-tenant-violating request.
 */
export function useSchoolId(): string {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();

  if (!schoolPublicId) {
    throw new Error('No active school public id');
  }

  return schoolPublicId;
}
