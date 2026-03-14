import type {NotificationProps} from "../types/commonTypes";
import Notification from "../assets/CommonComponents/Notification";
import {createRoot} from "react-dom/client";

export default function sendNotification ({success, title = '', message, durationMS}: NotificationProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const cleanup = () => {
    root.unmount();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  root.render(
    <Notification
      success={success}
      title={title}
      message={message}
      durationMS={durationMS}
      onClose={cleanup}
    />
  );

  return cleanup;
}
