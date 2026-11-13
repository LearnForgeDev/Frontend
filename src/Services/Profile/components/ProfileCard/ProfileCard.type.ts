

export interface ProfileCardProps {
  user: {
    userName: string;
    email?: string;
    phone?: string;
  };
  onLogout: () => void;
}
