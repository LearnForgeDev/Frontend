import { createElement } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthRole } from '@/Assets/Types/commonTypes';
import type { SchoolInvite } from '@/Endpoints/invites/invites.contract.type';
import InviteListItem from '@/Services/Schools/StudentsPage/Components/InviteListItem';
import { getInviteRole, getInviteStatus, getInviteUrl, toLocalDateTime } from '@/Services/Schools/StudentsPage/Components/InviteWidget.utils';
import { useCopyInvite } from '@/Services/Schools/StudentsPage/hooks/useCopyInvite';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('@/Storage/useToastStore', () => ({ useToast: () => toast }));
const now = new Date(2026, 10, 14, 12).getTime();
const invite: SchoolInvite = {
  id: 7, role: AuthRole.STUDENT, maxUses: 5, usedCount: 2, createdAt: new Date(now).toISOString(),
  expiresAt: new Date(now + 3_600_000).toISOString(), revokedAt: null,
  uses: [{ userPublicId: 'student', userName: 'Вступивший ученик', joinedAt: new Date(now).toISOString() }],
};
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

function submitInvite() {
  const form = document.querySelector('form');
  if (!form) {
    throw new Error('Invitation form is missing');
  }
  fireEvent.submit(form);
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(Date, 'now').mockReturnValue(now);
});

afterEach(() => {
  cleanup();
  if (clipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  } else {
    Reflect.deleteProperty(navigator, 'clipboard');
  }
});

describe('Invitation lifecycle controls', () => {
  it('keeps revocation, expiration and exhausted usage distinct at their boundaries', () => {
    expect(getInviteStatus(invite)).toBe('Активна');
    expect(getInviteStatus({ ...invite, usedCount: invite.maxUses })).toBe('Лимит исчерпан');
    expect(getInviteStatus({ ...invite, expiresAt: new Date(now).toISOString() })).toBe('Истекла');
    expect(getInviteStatus({ ...invite, revokedAt: new Date(now).toISOString(), expiresAt: new Date(now - 1).toISOString() })).toBe('Удалена');
    expect(getInviteRole(AuthRole.TEACHER)).toBe('Преподаватель');
    expect(getInviteRole(AuthRole.OWNER)).toBe('Владелец');
    expect(getInviteRole(AuthRole.STUDENT)).toBe('Ученик');
    expect(getInviteUrl('a+/&b')).toBe(`${window.location.origin}/onboarding?invite=a%2B%2F%26b`);
  });

  it('rejects a limit below consumed uses and preserves edits until a valid save', () => {
    const onSave = vi.fn();
    render(createElement(InviteListItem, { invite, pending: false, onSave, onDelete: vi.fn(), onRotate: vi.fn() }));
    fireEvent.change(screen.getByLabelText(/^Лимит использований/), { target: { value: '1' } });
    submitInvite();
    expect(onSave).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledOnce();
    expect(screen.getByLabelText(/^Лимит использований/)).toHaveProperty('value', '1');
    const expiry = new Date(now + 7_200_000).toISOString();
    fireEvent.change(screen.getByLabelText(/^Лимит использований/), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/^Действует до/), { target: { value: toLocalDateTime(expiry) } });
    submitInvite();
    expect(onSave).toHaveBeenCalledWith({ maxUses: 3, expiresAt: expiry });
    expect(screen.getByText('Вступивший ученик')).toBeTruthy();
    expect(screen.getByText('История доступна для новых вступлений.')).toBeTruthy();
  });

  it('requires confirmation for rotation and revocation and allows canceling either', async () => {
    const onDelete = vi.fn();
    const onRotate = vi.fn();
    render(createElement(InviteListItem, { invite, pending: false, onSave: vi.fn(), onDelete, onRotate }));
    fireEvent.click(screen.getByTestId('invite-revoke'));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByTestId('invite-action-cancel'));
    expect(onDelete).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByTestId('invite-rotate'));
    fireEvent.click(screen.getByTestId('invite-action-confirm'));
    expect(onRotate).toHaveBeenCalledOnce();
    expect(onDelete).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByTestId('invite-revoke'));
    fireEvent.click(screen.getByTestId('invite-action-confirm'));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('disables pending writes and removes editors from revoked invitations', () => {
    const props = { invite, pending: true, onSave: vi.fn(), onDelete: vi.fn(), onRotate: vi.fn() };
    const view = render(createElement(InviteListItem, props));
    expect(screen.getByTestId('invite-save')).toHaveProperty('disabled', true);
    expect(screen.getByTestId('invite-revoke')).toHaveProperty('disabled', true);
    view.rerender(createElement(InviteListItem, { ...props, invite: { ...invite, revokedAt: new Date(now).toISOString(), uses: [], usedCount: 0 } }));
    expect(screen.queryByTestId('invite-save')).toBeNull();
    expect(screen.getByText('Пока никто не вступил')).toBeTruthy();
  });

  it('reports clipboard failure without claiming that the invitation was copied', async () => {
    const writeText = vi.fn().mockRejectedValueOnce(new Error('permission denied')).mockResolvedValueOnce(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const { result } = renderHook(() => useCopyInvite());
    await act(async () => {
      await result.current('token');
    });
    expect(toast.error).toHaveBeenCalledWith('Не удалось скопировать ссылку');
    expect(toast.success).not.toHaveBeenCalled();
    await act(async () => {
      await result.current('token');
    });
    expect(writeText).toHaveBeenLastCalledWith(getInviteUrl('token'));
    expect(toast.success).toHaveBeenCalledWith('Ссылка скопирована');
  });
});
