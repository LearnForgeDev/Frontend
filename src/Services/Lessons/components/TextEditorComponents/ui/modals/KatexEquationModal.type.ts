

export type Props = {
  initialEquation?: string;
  onConfirm: (equation: string, inline: boolean) => void;
  onClose: () => void;
};
