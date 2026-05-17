import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

export type ChatMessage = {
  id: string;
  senderName: string;
  message: string;
  createdAt: string;
  status: "sending" | "sent" | "failed" | "queued";
};

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

type PendingMessage = {
  id: string;
  message: string;
  createdAt: string;
};

type SendResult = {
  ok: boolean;
  queued?: boolean;
  error?: string;
};

type SignalRChatOptions = {
  hubUrl: string | null;
  sendMethod: string;
  buildSendArgs: (message: string) => unknown[];
  jwtToken?: string;
  localUserName?: string;
  maxMessageLength?: number;
  throttleMs?: number;
  onUnauthorized?: () => void;
};

const defaultReconnectDelays = [0, 2000, 5000, 10000, 20000];

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function isUnauthorizedError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (error instanceof Error) {
    return /401|unauthorized/i.test(error.message);
  }

  return false;
}

export function useSignalRChat(options: SignalRChatOptions) {
  const {
    hubUrl,
    sendMethod,
    buildSendArgs,
    jwtToken,
    localUserName,
    maxMessageLength = 1000,
    throttleMs = 800,
    onUnauthorized,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const pendingQueueRef = useRef<PendingMessage[]>([]);
  const lastSendAtRef = useRef<number>(0);

  const clearError = useCallback(() => setError(null), []);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const reconcilePending = useCallback(
    (senderName: string, text: string) => {
      setMessages((prev) => {
        const pendingIndex = prev.findIndex(
          (item) =>
            item.status !== "sent" &&
            item.message === text &&
            (!localUserName || item.senderName === localUserName),
        );

        if (pendingIndex === -1) {
          return [
            ...prev,
            {
              id: createId(),
              senderName,
              message: text,
              createdAt: nowIso(),
              status: "sent",
            },
          ];
        }

        const updated = [...prev];
        updated[pendingIndex] = {
          ...updated[pendingIndex],
          status: "sent",
          senderName,
        };
        return updated;
      });
    },
    [localUserName],
  );

  const flushQueue = useCallback(async () => {
    const connection = connectionRef.current;
    if (
      !connection ||
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    const queued = [...pendingQueueRef.current];
    pendingQueueRef.current = [];

    await Promise.all(
      queued.map(async (item) => {
        try {
          await connection.invoke(sendMethod, ...buildSendArgs(item.message));
        } catch (err) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === item.id ? { ...msg, status: "failed" } : msg,
            ),
          );
          if (isUnauthorizedError(err)) {
            onUnauthorized?.();
          }
        }
      }),
    );
  }, [buildSendArgs, onUnauthorized, sendMethod]);

  useEffect(() => {
    if (!hubUrl) {
      setStatus("idle");
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true,
        accessTokenFactory: jwtToken ? () => jwtToken : undefined,
      })
      .withAutomaticReconnect(defaultReconnectDelays)
      .build();

    connection.on("ReceiveMessage", (senderName: string, message: string) => {
      reconcilePending(senderName, message);
    });

    connection.onreconnecting(() => {
      setStatus("reconnecting");
    });

    connection.onreconnected(() => {
      setStatus("connected");
      flushQueue();
    });

    connection.onclose((err) => {
      setStatus("disconnected");
      if (isUnauthorizedError(err)) {
        onUnauthorized?.();
      }
    });

    connectionRef.current = connection;
    setStatus("connecting");

    connection
      .start()
      .then(() => {
        setStatus("connected");
        flushQueue();
      })
      .catch((err) => {
        setStatus("disconnected");
        setError(
          err instanceof Error
            ? err.message
            : "Не удалось подключиться к чату.",
        );
        if (isUnauthorizedError(err)) {
          onUnauthorized?.();
        }
      });

    return () => {
      connection.off("ReceiveMessage");
      connection.stop();
    };
  }, [flushQueue, hubUrl, jwtToken, onUnauthorized, reconcilePending]);

  const sendMessage = useCallback(
    async (message: string): Promise<SendResult> => {
      const trimmed = message.trim();
      if (!trimmed) {
        return { ok: false, error: "Введите сообщение." };
      }

      if (trimmed.length > maxMessageLength) {
        return {
          ok: false,
          error: `Сообщение слишком длинное (макс. ${maxMessageLength} символов).`,
        };
      }

      const now = Date.now();
      if (now - lastSendAtRef.current < throttleMs) {
        return { ok: false, error: "Слишком часто. Подождите немного." };
      }

      lastSendAtRef.current = now;
      const id = createId();
      const createdAt = nowIso();

      appendMessage({
        id,
        senderName: localUserName ?? "Вы",
        message: trimmed,
        createdAt,
        status: "sending",
      });

      const connection = connectionRef.current;
      if (
        !connection ||
        connection.state !== signalR.HubConnectionState.Connected
      ) {
        pendingQueueRef.current.push({ id, message: trimmed, createdAt });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, status: "queued" } : msg,
          ),
        );
        return { ok: true, queued: true };
      }

      try {
        await connection.invoke(sendMethod, ...buildSendArgs(trimmed));
        return { ok: true };
      } catch (err) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, status: "failed" } : msg,
          ),
        );
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Не удалось отправить сообщение.";
        setError(errorMessage);
        if (isUnauthorizedError(err)) {
          onUnauthorized?.();
        }
        return { ok: false, error: errorMessage };
      }
    },
    [
      appendMessage,
      buildSendArgs,
      localUserName,
      maxMessageLength,
      onUnauthorized,
      sendMethod,
      throttleMs,
    ],
  );

  const resetMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const isConnected = status === "connected";

  return useMemo(
    () => ({
      status,
      messages,
      error,
      isConnected,
      sendMessage,
      clearError,
      resetMessages,
    }),
    [
      clearError,
      error,
      isConnected,
      messages,
      resetMessages,
      sendMessage,
      status,
    ],
  );
}
