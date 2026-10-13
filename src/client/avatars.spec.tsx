import { afterEach, beforeEach, expect, test } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createExtensionTestHost } from '@pterodactyl/sdk/testing';
import AccountAvatarCard from './components/AccountAvatarCard';
import ActivityAvatars, { ACTIVITY_CLASS } from './components/ActivityAvatars';
import AdminUserAvatar from './components/AdminUserAvatar';
import NavAvatar, { ROOT_CLASS, ROOT_VARIABLE } from './components/NavAvatar';
import { myAvatarQuery, userAvatarQuery } from './api';

let host: ReturnType<typeof createExtensionTestHost>;

beforeEach(() => {
    host = createExtensionTestHost({ extensionId: 'user-avatars', prefix: 'uavt' });
});

afterEach(() => {
    cleanup();
    host.dispose();
    document.documentElement.classList.remove(ROOT_CLASS);
    document.documentElement.style.removeProperty(ROOT_VARIABLE);
});

const UPLOADED = { url: 'http://panel.test/extensions/user-avatars/a/abc', uploaded: true, max_kb: 2048 };
const DEFAULT = { url: 'http://panel.test/extensions/user-avatars/d/u-1', uploaded: false, max_kb: 2048 };

test('the account card offers to change and remove an uploaded picture', async () => {
    host.queryClient.setQueryData(myAvatarQuery().queryKey, UPLOADED);
    render(<AccountAvatarCard />, { wrapper: host.Wrapper });

    expect(await screen.findByText('Change picture')).toBeTruthy();
    expect(screen.getByText('Remove')).toBeTruthy();
    expect(screen.getByAltText('Your profile picture').getAttribute('src')).toBe(UPLOADED.url);
    expect(screen.getByText(/up to 2 MB/)).toBeTruthy();
});

test('the account card offers an upload when there is none', async () => {
    host.queryClient.setQueryData(myAvatarQuery().queryKey, DEFAULT);
    render(<AccountAvatarCard />, { wrapper: host.Wrapper });

    expect(await screen.findByText('Upload picture')).toBeTruthy();
    expect(screen.queryByText('Remove')).toBeNull();
});

test('the navigation avatar shows the upload, or the default picture without one', async () => {
    host.queryClient.setQueryData(myAvatarQuery().queryKey, UPLOADED);
    const { unmount } = render(<NavAvatar />, { wrapper: host.Wrapper });

    await waitFor(() => expect(document.documentElement.classList.contains(ROOT_CLASS)).toBe(true));
    expect(document.documentElement.style.getPropertyValue(ROOT_VARIABLE)).toContain(UPLOADED.url);

    unmount();
    expect(document.documentElement.classList.contains(ROOT_CLASS)).toBe(false);

    host.queryClient.setQueryData(myAvatarQuery().queryKey, DEFAULT);
    render(<NavAvatar />, { wrapper: host.Wrapper });
    await waitFor(() => expect(document.documentElement.style.getPropertyValue(ROOT_VARIABLE)).toContain(DEFAULT.url));
});

test('admins see a remove button only for users with an upload', async () => {
    const user = (id: number) => ({ resource: { attributes: { id, email: `u${id}@example.com` } } });
    host.queryClient.setQueryData(userAvatarQuery(5).queryKey, { url: UPLOADED.url, uploaded: true });
    host.queryClient.setQueryData(userAvatarQuery(6).queryKey, { url: DEFAULT.url, uploaded: false });

    render(<AdminUserAvatar data={user(5)} />, { wrapper: host.Wrapper });
    expect(await screen.findByText('Remove profile picture')).toBeTruthy();
    cleanup();

    render(<AdminUserAvatar data={user(6)} />, { wrapper: host.Wrapper });
    await waitFor(() => expect(screen.queryByText('Remove profile picture')).toBeNull());
});

test('activity rows show the actor picture in place of the generated avatar', async () => {
    host.queryClient.setQueryData(['activity-test'], {
        object: 'list',
        data: [
            {
                object: 'activity_log',
                attributes: {
                    event: 'server:settings.rename',
                    relationships: {
                        actor: { object: 'user', attributes: { username: 'admin', image: UPLOADED.url } },
                    },
                },
            },
        ],
    });

    const row = (username: string) => `
        <div class="grid grid-cols-10">
            <div><div class="w-10 h-10 rounded-full overflow-hidden"><svg role="img"></svg></div></div>
            <div><div class="flex items-center text-foreground"><span>${username}</span><span>&nbsp;-&nbsp;</span></div></div>
        </div>`;
    const list = document.createElement('div');
    list.innerHTML = row('admin') + row('System');
    document.body.appendChild(list);

    render(<ActivityAvatars />, { wrapper: host.Wrapper });

    const [admin, system] = list.querySelectorAll<HTMLElement>('div.rounded-full');
    await waitFor(() => expect(admin.classList.contains(ACTIVITY_CLASS)).toBe(true));
    expect(admin.style.backgroundImage).toContain(UPLOADED.url);
    expect(system.classList.contains(ACTIVITY_CLASS)).toBe(false);

    list.remove();
});
