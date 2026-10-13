import './styles.css';
import { definePterodactylExtension } from '@pterodactyl/sdk';
import AccountAvatarCard from './components/AccountAvatarCard';
import ActivityAvatars, { setSystemPicture } from './components/ActivityAvatars';
import AdminUserAvatar from './components/AdminUserAvatar';
import NavAvatar from './components/NavAvatar';

export default definePterodactylExtension({
    setup({ slots, config }) {
        setSystemPicture(config.system_picture);

        slots.register('nav.items.after', NavAvatar);
        slots.register('account.overview.before', AccountAvatarCard);
        slots.register('panel.users.detail.actions', AdminUserAvatar);
        slots.register('server.activity.after', ActivityAvatars);
        slots.register('account.activity.after', ActivityAvatars);
        slots.register('panel.activity.after', ActivityAvatars);
    },
});
