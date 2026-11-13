

declare global {
  interface Window {
    PasswordCredential?: new (data: { id: string; password: string }) => Credential;
  }
}

export {};
