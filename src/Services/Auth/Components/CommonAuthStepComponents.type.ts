

export type AuthCredentialsStepProps = {
    name: string;
    password: string;
    confirmPassword: string;
    isLoading: boolean;
    onNameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
};
