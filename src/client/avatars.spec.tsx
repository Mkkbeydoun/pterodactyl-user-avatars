import { afterEach, beforeEach, expect, test } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createExtensionTestHost } from '@pterodactyl/sdk/testing';
import AccountAvatarCard from './components/AccountAvatarCard';
import AdminUserAvatar from './components/AdminUserAvatar';
import NavAvatar, { ROOT_CLASS, ROOT_VARIABLE } from './components/NavAvatar';
import { myAvatarQuery, userAvatarQuery } from './api';

let host: ReturnType<typeof createExtensionTestHost>;

beforeEach(() => {
    host = createExtensionTestHost({ extensionId: 'rustix-avatars', prefix: 'rxav' });
});

afterEach(() => {
    cleanup();
    host.dispose();
    document.documentElement.classList.remove(ROOT_CLASS);
    document.documentElement.style.removeProperty(ROOT_VARIABLE);
});

const UPLOADED = { url: 'http://panel.test/extensions/rustix-avatars/a/abc', uploaded: true, fallback: 'http://panel.test/d', max_kb: 2048 };
const GRAVATAR = { url: 'https://gravatar.com/avatar/x', uploaded: false, fallback: 'http://panel.test/d', max_kb: 2048 };

test('the account card offers to change and remove an uploaded picture', async () => {
    host.queryClient.setQueryData(myAvatarQuery().queryKey, UPLOADED);
    render(<AccountAvatarCard />, { wrapper: host.Wrapper });

    expect(await screen.findByText('Change picture')).toBeTruthy();
    expect(screen.getByText('Remove')).toBeTruthy();
    expect(screen.getByAltText('Your profile picture').getAttribute('src')).toBe(UPLOADED.url);
    expect(screen.getByText(/up to 2 MB/)).toBeTruthy();
});

test('the account card offers an upload when there is none', async () => {
    host.queryClient.setQueryData(myAvatarQuery().queryKey, GRAVATAR);
    render(<AccountAvatarCard />, { wrapper: host.Wrapper });

    expect(await screen.findByText('Upload picture')).toBeTruthy();
    expect(screen.queryByText('Remove')).toBeNull();
});

test('the navigation avatar is swapped only for uploaded pictures', async () => {
    host.queryClient.setQueryData(myAvatarQuery().queryKey, UPLOADED);
    const { unmount } = render(<NavAvatar />, { wrapper: host.Wrapper });

    await waitFor(() => expect(document.documentElement.classList.contains(ROOT_CLASS)).toBe(true));
    expect(document.documentElement.style.getPropertyValue(ROOT_VARIABLE)).toContain(UPLOADED.url);

    unmount();
    expect(document.documentElement.classList.contains(ROOT_CLASS)).toBe(false);

    host.queryClient.setQueryData(myAvatarQuery().queryKey, GRAVATAR);
    render(<NavAvatar />, { wrapper: host.Wrapper });
    await waitFor(() => expect(document.documentElement.classList.contains(ROOT_CLASS)).toBe(false));
});

test('admins see a remove button only for users with an upload', async () => {
    const user = (id: number) => ({ resource: { attributes: { id, email: `u${id}@example.com` } } });
    host.queryClient.setQueryData(userAvatarQuery(5).queryKey, { url: UPLOADED.url, uploaded: true });
    host.queryClient.setQueryData(userAvatarQuery(6).queryKey, { url: GRAVATAR.url, uploaded: false });

    render(<AdminUserAvatar data={user(5)} />, { wrapper: host.Wrapper });
    expect(await screen.findByText('Remove profile picture')).toBeTruthy();
    cleanup();

    render(<AdminUserAvatar data={user(6)} />, { wrapper: host.Wrapper });
    await waitFor(() => expect(screen.queryByText('Remove profile picture')).toBeNull());
});
