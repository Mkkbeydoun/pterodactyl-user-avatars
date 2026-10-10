import { queryOptions } from '@tanstack/react-query';
import { http } from '@pterodactyl/sdk';

export interface MyAvatar {
    url: string;
    uploaded: boolean;
    max_kb: number;
}

export interface UserAvatar {
    url: string;
    uploaded: boolean;
}

const CLIENT = '/api/client/extensions/rustix-avatars/me';
const ADMIN = '/api/admin/extensions/rustix-avatars/users';

export const myAvatarQuery = () =>
    queryOptions({
        queryKey: ['rustix-avatars', 'me'],
        queryFn: async () => (await http.get<MyAvatar>(CLIENT)).data,
        staleTime: 5 * 60_000,
    });

export const userAvatarQuery = (id: number) =>
    queryOptions({
        queryKey: ['rustix-avatars', 'user', id],
        queryFn: async () => (await http.get<UserAvatar>(`${ADMIN}/${id}`)).data,
    });

export async function uploadAvatar(file: File): Promise<MyAvatar> {
    const body = new FormData();
    body.append('avatar', file);

    return (await http.post<MyAvatar>(CLIENT, body)).data;
}

export async function removeAvatar(): Promise<void> {
    await http.delete(CLIENT);
}

export async function removeUserAvatar(id: number): Promise<void> {
    await http.delete(`${ADMIN}/${id}`);
}
