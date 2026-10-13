import { useEffect } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';

export const ACTIVITY_CLASS = 'uavt-activity-avatar';

interface ActorAttributes {
    username?: string;
    image?: string;
}

/** Usernames to pictures, from every activity list the panel has loaded with its actors. */
export function actorImages(client: QueryClient): Map<string, string> {
    const images = new Map<string, string>();

    for (const query of client.getQueryCache().getAll()) {
        const rows = (query.state.data as { data?: unknown } | undefined)?.data;
        if (!Array.isArray(rows)) {
            continue;
        }

        for (const row of rows) {
            if (row?.object !== 'activity_log') {
                continue;
            }

            const actor = row.attributes?.relationships?.actor?.attributes as ActorAttributes | undefined;
            if (actor?.username && actor.image) {
                images.set(actor.username, actor.image);
            }
        }
    }

    return images;
}

/** Put each activity row's picture behind its generated avatar (hidden by styles.css). */
export function decorateActivityRows(root: ParentNode, images: Map<string, string>): void {
    for (const svg of root.querySelectorAll<SVGElement>('div.rounded-full > svg[role="img"]')) {
        const circle = svg.parentElement as HTMLElement;
        const row = circle.closest('.grid');
        const username = row?.querySelector('.text-foreground > span:first-child')?.textContent?.trim();
        const image = username ? images.get(username) : undefined;

        if (!image) {
            if (circle.classList.contains(ACTIVITY_CLASS)) {
                circle.classList.remove(ACTIVITY_CLASS);
                circle.style.removeProperty('background-image');
            }
            continue;
        }

        const value = `url(${JSON.stringify(image)})`;
        if (circle.style.backgroundImage !== value) {
            circle.style.backgroundImage = value;
        }
        circle.classList.add(ACTIVITY_CLASS);
    }
}

/**
 * Activity rows draw a generated avatar from the username and ignore the
 * actor's picture, and extensions cannot replace that component. The activity
 * API already returns each actor's picture, so this matches rows to it by
 * username and shows it in place of the generated one. Renders nothing itself.
 */
export default function ActivityAvatars() {
    const client = useQueryClient();

    useEffect(() => {
        let frame = 0;
        const run = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => decorateActivityRows(document, actorImages(client)));
        };

        const observer = new MutationObserver(run);
        observer.observe(document.body, { childList: true, subtree: true });
        const unsubscribe = client.getQueryCache().subscribe(run);
        run();

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            unsubscribe();
        };
    }, [client]);

    return null;
}
