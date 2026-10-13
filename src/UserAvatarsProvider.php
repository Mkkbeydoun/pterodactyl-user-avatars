<?php

namespace UserAvatars;

use Pterodactyl\Extensions\ExtensionProvider;
use Pterodactyl\Services\Extensions\ExtensionSettingDefinition;
use Pterodactyl\Services\Extensions\ExtensionSettingFiles;
use Pterodactyl\Services\Extensions\ExtensionSettingsDefinition;
use Pterodactyl\Transformers\Api\Admin\UserTransformer as CoreAdminUserTransformer;
use Pterodactyl\Transformers\Api\Client\UserTransformer as CoreClientUserTransformer;
use UserAvatars\Services\AvatarService;
use UserAvatars\Transformers\AdminUserTransformer;
use UserAvatars\Transformers\ClientUserTransformer;

class UserAvatarsProvider extends ExtensionProvider
{
    public function boot(): void
    {
        // routes/client.php (the signed-in user's own avatar) and routes/admin.php.
        $this->registerApiRoutes();
        // Images are only served to signed-in users.
        $this->registerAuthenticatedWebRoutes(__DIR__.'/../routes/web.php');

        $this->registerSettings(new ExtensionSettingsDefinition($this->settings(), [
            ExtensionSettingDefinition::make('max_kb', 'max_kb', 2048, ['integer', 'min:64', 'max:10240'])
                ->field('number')
                ->label('Largest upload (KB)')
                ->help('Uploads are cropped to a square and resized to 256 pixels, so the stored file is much smaller than this.'),
            ExtensionSettingDefinition::make('system_picture', 'system_picture', null)
                ->file(ExtensionSettingFiles::IMAGES, 1024)
                ->frontend()
                ->label('System picture')
                ->help('Shown in activity logs on rows with no user behind them, like failed logins and scheduled tasks. Leave empty for a plain system icon.'),
        ]));

        $this->app->scoped(AvatarService::class, fn () => new AvatarService($this->settings()));

        // Core user transformers are resolved through the container, so every API
        // response that includes a user's "image" (admin user list, server owner,
        // subusers) picks up the uploaded avatar.
        $this->app->bind(CoreClientUserTransformer::class, ClientUserTransformer::class);
        $this->app->bind(CoreAdminUserTransformer::class, AdminUserTransformer::class);
    }
}
