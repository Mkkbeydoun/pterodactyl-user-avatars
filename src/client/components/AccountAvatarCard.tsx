import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleUser } from 'lucide-react';
import { Button, TitledGreyBox, httpErrorToHuman, toast } from '@pterodactyl/sdk';
import { myAvatarQuery, removeAvatar, uploadAvatar } from '../api';

export const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

export default function AccountAvatarCard() {
    const queryClient = useQueryClient();
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState<'upload' | 'remove' | null>(null);
    const { data } = useQuery(myAvatarQuery());

    const refresh = () => queryClient.invalidateQueries({ queryKey: ['rustix-avatars'] });

    const onFile = async (file: File | undefined) => {
        if (!file || !data) return;
        if (file.size > data.max_kb * 1024) {
            toast.error(`That image is over the ${Math.round(data.max_kb / 1024) || 1} MB limit.`);
            return;
        }

        setBusy('upload');
        try {
            queryClient.setQueryData(myAvatarQuery().queryKey, await uploadAvatar(file));
            toast.success('Profile picture updated.');
        } catch (error) {
            toast.error(httpErrorToHuman(error));
        } finally {
            setBusy(null);
            if (input.current) input.current.value = '';
            void refresh();
        }
    };

    const onRemove = async () => {
        setBusy('remove');
        try {
            await removeAvatar();
            toast.success('Profile picture removed.');
        } catch (error) {
            toast.error(httpErrorToHuman(error));
        } finally {
            setBusy(null);
            void refresh();
        }
    };

    return (
        <TitledGreyBox icon={CircleUser} title='Profile picture' className='rxav:mb-6'>
            <div className='rxav:flex rxav:flex-wrap rxav:items-center rxav:gap-4'>
                {data ? (
                    <img
                        src={data.url}
                        alt='Your profile picture'
                        onError={(event) => {
                            if (event.currentTarget.src !== data.fallback) event.currentTarget.src = data.fallback;
                        }}
                        className='rxav:h-16 rxav:overflow-hidden rxav:text-[0px] rxav:w-16 rxav:shrink-0 rxav:rounded-full rxav:border rxav:border-border rxav:bg-background rxav:object-cover'
                    />
                ) : (
                    <div className='rxav:h-16 rxav:w-16 rxav:shrink-0 rxav:rounded-full rxav:bg-background' />
                )}
                <div className='rxav:min-w-0 rxav:flex-1'>
                    <p className='rxav:text-sm rxav:text-muted-foreground'>
                        PNG, JPEG, WebP or GIF{data ? `, up to ${Math.round(data.max_kb / 1024) || 1} MB` : ''}. It is
                        cropped to a square.
                    </p>
                    <div className='rxav:mt-3 rxav:flex rxav:flex-wrap rxav:gap-2'>
                        <input
                            ref={input}
                            id='rxav-file'
                            type='file'
                            accept={ACCEPT}
                            className='rxav:hidden'
                            onChange={(event) => void onFile(event.currentTarget.files?.[0])}
                        />
                        <Button
                            size='small'
                            disabled={!data || busy !== null}
                            isLoading={busy === 'upload'}
                            onClick={() => input.current?.click()}
                        >
                            {data?.uploaded ? 'Change picture' : 'Upload picture'}
                        </Button>
                        {data?.uploaded && (
                            <Button.Text
                                size='small'
                                disabled={busy !== null}
                                isLoading={busy === 'remove'}
                                onClick={() => void onRemove()}
                            >
                                Remove
                            </Button.Text>
                        )}
                    </div>
                </div>
            </div>
        </TitledGreyBox>
    );
}
