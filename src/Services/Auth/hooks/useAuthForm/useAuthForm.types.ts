export type AuthMode = 'login' | 'register';

export type AuthFormState = {
  name: string;
  password: string;
  confirmPassword: string;
};
