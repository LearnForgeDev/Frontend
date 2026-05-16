import {theme} from "../../../../styles/theme.ts";

const WARNING_COLOR = theme.palette.warning.main;

export const container = {
    border: '1px solid var(--admin-border)',
    borderRadius: '1.5rem',
    background: 'var(--admin-surface)',
    boxShadow: 'var(--admin-shadow)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
};

export const title = {
    display: 'flex',
    margin: 0,
    fontSize: '1rem',
    padding: 0,
    fontWeight: 700,
    alignItems: 'center',
    color: WARNING_COLOR,
};

export const description = {
    margin: 0,
    color: 'var(--admin-muted)',
    lineHeight: 1.5,
};

export const icon = {
    marginRight: '0.25rem',
    height: '1.25rem',
    color: WARNING_COLOR,
}
