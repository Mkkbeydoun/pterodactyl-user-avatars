import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, httpErrorToHuman, toast } from '@pterodactyl/sdk';
import { removeUserAvatar, userAvatarQuery } from '../api';

interface Props {
    data: { resource: { attributes: { id?: number; email: string } } };
}

/** Lets an admin take down a user's uploaded picture. Shows nothing when the user has none. */
export default function AdminUserAvatar({ data }: Props) {
    const id = data.resource.attributes.id;
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const { data: avatar } = useQuery({ ...userAvatarQuery(id ?? 0), enabled: id !== undefined });

    if (id === undefined || !avatar?.uploaded) return null;

    const onConfirm = async () => {
        try {
            await removeUserAvatar(id);
            toast.success('Profile picture removed.');
            setOpen(false);
            await queryClient.invalidateQueries();
        } catch (error) {
            toast.error(httpErrorToHuman(error));
        }
    };

    return (
        <div className='uavt:mb-4 uavt:flex uavt:items-center uavt:gap-3'>
            <img
                src={avatar.url}
                alt=''
                className='uavt:h-10 uavt:w-10 uavt:rounded-full uavt:border uavt:border-border uavt:object-cover'
            />
            <Button.Danger size='small' onClick={() => setOpen(true)}>
                Remove profile picture
            </Button.Danger>
            <Dialog.Confirm
                open={open}
                onClose={() => setOpen(false)}
                title='Remove profile picture?'
                confirm='Remove'
                onConfirmed={() => void onConfirm()}
            >
                {data.resource.attributes.email} can upload a new one afterwards.
            </Dialog.Confirm>
        </div>
    );
}
