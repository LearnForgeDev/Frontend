import type { NavigateOptions, To } from 'react-router-dom';

declare module 'react-router-dom' {
  interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
    (delta: number): void;
  }

  function useNavigate(): NavigateFunction;
}
