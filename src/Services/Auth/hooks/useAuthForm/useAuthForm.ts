import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { authEndpoints } from '@/Endpoints';
import { normalizeRestoredSession } from '@/Endpoints/auth/utils';
import { useUser } from '@/Storage/UserContext/UserContext';
import { useToast } from '@/Storage/useToastStore';
import { getAuthErrorMessage } from '../../contexts/AuthFlowContext.utils';
import { AUTH_ERROR_MESSAGES } from '../../contexts/AuthFlowContext.const';
import { getAuthPath, getRedirectPath } from '../../Pages/AuthLayout/AuthLayout.utils';
import { AUTH_RETURN_PARAM } from '../../Pages/AuthLayout/AuthLayout.const';
import { validateAuthForm } from '../../validation/auth.validation';
import { storePasswordCredential } from '../../auth.credentials';
import { INITIAL_AUTH_FORM } from './useAuthForm.const';
import type { AuthFormState, AuthMode } from './useAuthForm.types';

function readTextField(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}

export function useAuthForm() {
  const location = useLocation();
  const mode: AuthMode = location.pathname === '/auth/register' ? 'register' : 'login';
  const [form, setForm] = useState<AuthFormState>(INITIAL_AUTH_FORM);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { error: showErrorToast } = useToast();
  const redirectPath = getRedirectPath({ fromLocation: searchParams.get(AUTH_RETURN_PARAM) });
  const mutation = useMutation({
    networkMode: 'always',
    mutationFn: async (values: AuthFormState) => {
      const result = await authEndpoints[mode](values);
      const identity = normalizeRestoredSession(result);
      if (!identity) {
        throw new Error(AUTH_ERROR_MESSAGES[mode]);
      }
      return identity;
    },
    onSuccess: (identity, values) => {
      storePasswordCredential(values);
      setUser(identity);
      navigate(redirectPath, { replace: true });
    },
    onError: (error) => showErrorToast(getAuthErrorMessage(error, mode)),
  });

  const setField = (field: keyof AuthFormState, value: string) => {
    if (mutation.isPending) {
      return;
    }
    setForm((previous) => ({ ...previous, [field]: value }));
    setValidationError(null);
    mutation.reset();
  };

  const submitForm = (element: HTMLFormElement) => {
    if (mutation.isPending) {
      return;
    }
    const data = new FormData(element);
    const submittedForm = {
      name: readTextField(data.get('name')),
      password: readTextField(data.get('password')),
      confirmPassword: readTextField(data.get('confirmPassword')),
    };
    setForm(submittedForm);
    const error = validateAuthForm(mode, submittedForm);
    setValidationError(error);
    if (!error) {
      mutation.mutate(submittedForm);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitForm(event.currentTarget);
  };

  return {
    ...form,
    setField,
    handleSubmit,
    submitForm,
    isLoading: mutation.isPending,
    error: validationError ?? (mutation.error ? getAuthErrorMessage(mutation.error, mode) : null),
    alternatePath: getAuthPath(mode === 'login' ? 'register' : 'login', redirectPath),
  };
}
