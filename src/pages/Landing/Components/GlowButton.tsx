import { useCallback, useEffect, useRef, type ButtonHTMLAttributes, type PointerEvent as ReactPointerEvent } from 'react';
import './GlowButton.css';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const setButtonVars = (button: HTMLElement, x: number, y: number) => {
  const xPos = clampPercent(x);
  const yPos = clampPercent(y);
  button.style.setProperty('--btn-bg-x', `${xPos}%`);
  button.style.setProperty('--btn-bg-y', `${yPos}%`);
  button.style.setProperty('--btn-glow-x', `${xPos}%`);
  button.style.setProperty('--btn-glow-y', `${yPos}%`);
};

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function GlowButton({
  className,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  ...props
}: GlowButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!buttonRef.current) {
      return;
    }
    setButtonVars(buttonRef.current, 50, 50);
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setButtonVars(target, x, y);
      onPointerMove?.(event);
    },
    [onPointerMove],
  );

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      handlePointerMove(event);
      onPointerEnter?.(event);
    },
    [handlePointerMove, onPointerEnter],
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      setButtonVars(event.currentTarget, 50, 50);
      onPointerLeave?.(event);
    },
    [onPointerLeave],
  );

  return (
    <button
      ref={buttonRef}
      className={['glow-button', className].filter(Boolean).join(' ')}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      {...props}
    />
  );
}
