<?php

namespace UserAvatars;

use Pterodactyl\Extensions\ExtensionProvider;
use Pterodactyl\Services\Extensions\ExtensionSettingDefinition;
use Pterodactyl\Services\Extensions\ExtensionSettingFiles;
use Pterodactyl\Services\Extensions\ExtensionSettingsDefinition;
use Illuminate\Foundation\Http\Events\RequestHandled;
use Illuminate\Support\Facades\Event;
use UserAvatars\Http\UserImages;
use UserAvatars\Services\AvatarService;

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

        // Every API response that includes a user's "image" (admin user list, server
        // owner, subusers, activity) gets the uploaded or default picture.
        Event::listen(RequestHandled::class, [UserImages::class, 'handle']);
    }
}
