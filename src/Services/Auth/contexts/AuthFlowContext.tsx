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

import { login, registerFounder } from '@/Endpoints/apiAuth';
import type { UserIdentity } from '@/Assets/Types/commonTypes';
import { useUser } from '@/Storage/Context/UserContext';

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

function toUserIdentity(result: Partial<UserIdentity>): UserIdentity | null {
  if (
    !result.jwtToken ||
    !result.refreshToken ||
    !result.userName ||
    !result.userPublicId
  ) {
    return null;
  }

  return {
    jwtToken: result.jwtToken,
    refreshToken: result.refreshToken,
    userName: result.userName,
    userPublicId: result.userPublicId,
  };
}

export function AuthFlowProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { setUser } = useUser();
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
          const result = (await login({
            name: authState.name,
            password: authState.password,
          })) as Partial<UserIdentity>;
          const userIdentity = toUserIdentity(result);

          if (!userIdentity) {
            setError("Ошибка входа. Пожалуйста, проверьте ваши данные.");
            return;
          }

          setUser(userIdentity);
          navigate("/admin");
          return;
        }

        const result = (await registerFounder({
          name: authState.name,
          password: authState.password,
          confirmPassword: authState.confirmPassword,
        })) as Partial<UserIdentity>;

        const userIdentity = toUserIdentity(result);
        if (userIdentity) {
          setUser(userIdentity);
        }

        navigate("/admin");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setIsLoading(false);
      }
    },
    [authState, navigate, setUser],
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
