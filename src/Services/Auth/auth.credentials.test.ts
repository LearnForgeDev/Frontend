import { afterEach, describe, expect, it, vi } from 'vitest';
import { storePasswordCredential } from './auth.credentials';

const values = { name: 'Ученик', password: 'old' };

afterEach(() => vi.unstubAllGlobals());

describe('Browser credential storage', () => {
  it('does nothing without password credential support', () => {
    const store = vi.fn();
    vi.stubGlobal('PasswordCredential', undefined);
    vi.stubGlobal('navigator', { credentials: { store } });
    storePasswordCredential(values);
    expect(store).not.toHaveBeenCalled();
  });

  it('does nothing without a credential store', () => {
    const constructor = vi.fn();
    vi.stubGlobal('PasswordCredential', constructor);
    vi.stubGlobal('navigator', {});
    storePasswordCredential(values);
    expect(constructor).not.toHaveBeenCalled();
  });

  it('passes the unchanged successful credentials to the browser', () => {
    const credential = { id: values.name, type: 'password' };
    const constructor = vi.fn(function () {
      return credential;
    });
    const store = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('PasswordCredential', constructor);
    vi.stubGlobal('navigator', { credentials: { store } });
    storePasswordCredential(values);
    expect(constructor).toHaveBeenCalledWith({ id: values.name, password: values.password });
    expect(store).toHaveBeenCalledWith(credential);
  });

  it('does not throw when the browser rejects storage or construction', async () => {
    vi.stubGlobal('PasswordCredential', vi.fn(function () {
      return { id: values.name, type: 'password' };
    }));
    vi.stubGlobal('navigator', { credentials: { store: vi.fn().mockRejectedValue(new Error('denied')) } });
    expect(() => storePasswordCredential(values)).not.toThrow();
    await Promise.resolve();
    vi.stubGlobal('PasswordCredential', vi.fn(function () {
      throw new Error('unavailable');
    }));
    expect(() => storePasswordCredential(values)).not.toThrow();
  });
});
