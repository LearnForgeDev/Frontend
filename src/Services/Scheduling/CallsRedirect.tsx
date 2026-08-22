import { Navigate } from 'react-router-dom';

export default function CallsRedirect() {
  return <Navigate to="../schedule" replace relative="path" />;
}
