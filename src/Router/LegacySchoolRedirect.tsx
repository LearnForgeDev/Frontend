import { Navigate, useParams } from 'react-router-dom';

export default function LegacySchoolRedirect() {
  const { schoolPublicId, '*': rest = '' } = useParams<{ schoolPublicId: string; '*': string }>();

  if (!schoolPublicId) {
    return <Navigate to="/app" replace />;
  }

  const normalizedPath = rest === 'calls'
    ? 'schedule'
    : rest === 'settings'
      ? 'today'
      : rest || 'today';

  return (
    <Navigate
      to={`/app/schools/${encodeURIComponent(schoolPublicId)}/${normalizedPath}`}
      replace
    />
  );
}
