import type { AuthFormState } from './hooks/useAuthForm/useAuthForm.type';

export function storePasswordCredential({ name, password }: Pick<AuthFormState, 'name' | 'password'>): void {
  if (!window.PasswordCredential || !navigator.credentials?.store) {
    return;
  }
  try {
    const credential = new window.PasswordCredential({ id: name, password });
    void navigator.credentials.store(credential).catch(() => undefined);
  } catch {
    return;
  }
}
