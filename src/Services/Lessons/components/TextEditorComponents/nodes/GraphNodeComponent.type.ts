import type { NodeKey } from 'lexical';

export type DesmosCalculator = {
  destroy: () => void;
  setExpression: (expression: { id: string; latex: string }) => void;
};

export type DesmosWindow = Window & {
  Desmos?: {
    GraphingCalculator: (element: HTMLElement) => DesmosCalculator;
  };
};

export interface GraphComponentProps {
  nodeKey: NodeKey;
}
