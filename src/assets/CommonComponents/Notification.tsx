import type { NotificationProps } from "../../types/commonTypes.ts";
import { useEffect, useState } from "react";

type NotificationWithClose = NotificationProps & {
  onClose?: () => void;
};

export default function Notification({
  title,
  message,
  success,
  durationMS,
  onClose,
}: NotificationWithClose) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // trigger slide-in on mount
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!durationMS || !onClose) return;
    const id = setTimeout(onClose, durationMS);
    return () => clearTimeout(id);
  }, [durationMS, onClose]);

  const notificationTitle =
    title !== undefined && title !== ""
      ? title
      : success !== undefined
      ? success
        ? "Успешно"
        : "Ошибка"
      : "Уведомление";

  return (
    <div
      className={`notification ${success !== undefined ? (success ? "success" : "error") : ""} ${
        visible ? "visible" : ""
      }`}
    >
      <p>{notificationTitle}</p>
      <p>{message ?? ""}</p>
    </div>
  );
}