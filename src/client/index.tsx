import './styles.css';
import { definePterodactylExtension } from '@pterodactyl/sdk';
import AccountAvatarCard from './components/AccountAvatarCard';
import AdminUserAvatar from './components/AdminUserAvatar';
import NavAvatar from './components/NavAvatar';

export default definePterodactylExtension({
    setup({ slots }) {
        slots.register('nav.items.after', NavAvatar);
        slots.register('account.overview.before', AccountAvatarCard);
        slots.register('panel.users.detail.actions', AdminUserAvatar);
    },
});
