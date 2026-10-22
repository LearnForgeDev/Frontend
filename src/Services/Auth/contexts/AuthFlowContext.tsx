import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useNavigate } from 'react-router-dom';

import { authEndpoints } from '@/Endpoints';
import { getAuthErrorMessage } from './AuthFlowContext.utils';
import { useToast } from '@/Storage/useToastStore';
import { useUser } from '@/Storage/UserContext/UserContext.tsx';
import { normalizeRestoredSession } from '@/Endpoints/auth/utils';

type AuthFormState = {
  name: string;
  password: string;
  confirmPassword: string;
};

type AuthMode = "login" | "register";

type AuthFlowContextValue = {
  name: string;
  password: string;
  confirmPassword: string;
  error: string | null;
  isLoading: boolean;
  setField: (field: keyof AuthFormState, value: string) => void;
  handleSubmit: (mode: AuthMode, event: FormEvent) => Promise<void>;
};

const AuthFlowContext = createContext<AuthFlowContextValue | undefined>(
  undefined,
);

function getInitialAuthState(): AuthFormState {
  return {
    name: "",
    password: "",
    confirmPassword: "",
  };
}

export function AuthFlowProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { error: showErrorToast } = useToast();
  const [authState, setAuthState] = useState<AuthFormState>(() =>
    getInitialAuthState(),
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setField = useCallback((field: keyof AuthFormState, value: string) => {
    setAuthState((previousState) => ({
      ...previousState,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (mode: AuthMode, event: FormEvent) => {
      event.preventDefault();
      setError(null);

      if (
        mode === "register" &&
        authState.password !== authState.confirmPassword
      ) {
        setError("Пароли не совпадают");
        return;
      }

      setIsLoading(true);

      try {
        if (mode === "login") {
          const result = await authEndpoints.login({
            name: authState.name,
            password: authState.password,
          });
          const userIdentity = normalizeRestoredSession(result);

          if (!userIdentity) {
            setError("Ошибка входа. Пожалуйста, проверьте ваши данные.");
            return;
          }

          setUser(userIdentity);
          navigate('/app');
          return;
        }

        const result = await authEndpoints.register({
          name: authState.name,
          password: authState.password,
          confirmPassword: authState.confirmPassword,
        });

        const userIdentity = normalizeRestoredSession(result);
        if (userIdentity) {
          setUser(userIdentity);
        }

        navigate('/app');
      } catch (err: unknown) {
        const message = getAuthErrorMessage(err, mode);
        setError(message);
        showErrorToast(message);
      } finally {
        setIsLoading(false);
      }
    },
    [authState, navigate, setUser, showErrorToast],
  );

  const value = useMemo<AuthFlowContextValue>(
    () => ({
      name: authState.name,
      password: authState.password,
      confirmPassword: authState.confirmPassword,
      error,
      isLoading,
      setField,
      handleSubmit,
    }),
    [authState, error, handleSubmit, isLoading, setField],
  );

  return (
    <AuthFlowContext.Provider value={value}>
      {children}
    </AuthFlowContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthFlow(): AuthFlowContextValue {
  const context = useContext(AuthFlowContext);

  if (!context) {
    throw new Error("useAuthFlow must be used within an AuthFlowProvider");
  }

  return context;
}
