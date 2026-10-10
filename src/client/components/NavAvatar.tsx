import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { myAvatarQuery } from '../api';

export const ROOT_CLASS = 'uavt-has-avatar';
export const ROOT_VARIABLE = '--uavt-avatar';

/**
 * The navigation bar draws a generated avatar that extensions cannot replace,
 * so this puts the user's picture (their upload, or the default initial) behind
 * it with CSS (see styles.css). Renders nothing itself.
 */
export default function NavAvatar() {
    const { data } = useQuery(myAvatarQuery());
    const url = data?.url ?? null;

    useEffect(() => {
        const root = document.documentElement;

        if (!url) {
            root.classList.remove(ROOT_CLASS);
            root.style.removeProperty(ROOT_VARIABLE);

            return;
        }

        root.style.setProperty(ROOT_VARIABLE, `url(${JSON.stringify(url)})`);
        root.classList.add(ROOT_CLASS);

        return () => {
            root.classList.remove(ROOT_CLASS);
            root.style.removeProperty(ROOT_VARIABLE);
        };
    }, [url]);

    return null;
}
