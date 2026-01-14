import type { ReactNode } from 'react';

interface IconBackgroundProps {
  children: ReactNode;
  backgroundColor: string;
  size: number | string;
}

export function IconBackground({ children, backgroundColor, size }: IconBackgroundProps) {
  return (
    <div
      style={{
        backgroundColor,
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        padding: '3%',
      }}
    >
      {children}
    </div>
  );
}
