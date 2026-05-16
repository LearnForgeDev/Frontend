import { theme } from "../../../../styles/theme.ts";

const WARNING_COLOR = theme.palette.warning.main;
const SUCCESS_COLOR = theme.palette.success.main;
const ERROR_COLOR = theme.palette.error.main;

export const container = (status?: string) => ({
  border: "1px solid var(--admin-border)",
  borderRadius: "1.5rem",
  background: "var(--admin-surface)",
  boxShadow: "var(--admin-shadow)",
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  borderLeft:
    status === "Approved"
      ? `4px solid ${SUCCESS_COLOR}`
      : status === "Rejected"
        ? `4px solid ${ERROR_COLOR}`
        : `1px solid var(--admin-border)`,
});

export const title = (status?: string) => ({
  display: "flex",
  margin: 0,
  fontSize: "1rem",
  padding: 0,
  fontWeight: 700,
  alignItems: "center",
  color:
    status === "Approved"
      ? SUCCESS_COLOR
      : status === "Rejected"
        ? ERROR_COLOR
        : WARNING_COLOR,
});

export const description = {
  margin: 0,
  color: "var(--admin-muted)",
  lineHeight: 1.5,
};

export const icon = (status?: string) => ({
  marginRight: "0.25rem",
  height: "1.25rem",
  color:
    status === "Approved"
      ? SUCCESS_COLOR
      : status === "Rejected"
        ? ERROR_COLOR
        : WARNING_COLOR,
});
