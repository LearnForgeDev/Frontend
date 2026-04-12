import type { JSX } from 'react';

export default function AdminPlaceholder(): JSX.Element {
  return (
    <div className="admin-empty-state">
      <h3 className="admin-widget-title">Choose a service</h3>
      <p>Select a service from the sidebar to configure access, limits, and integration settings.</p>
    </div>
  );
}

