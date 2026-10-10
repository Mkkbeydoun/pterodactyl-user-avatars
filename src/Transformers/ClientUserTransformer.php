<?php

namespace RustixAvatars\Transformers;

use Pterodactyl\Models\User;
use Pterodactyl\Transformers\Api\Client\UserTransformer;
use RustixAvatars\Services\AvatarService;

class ClientUserTransformer extends UserTransformer
{
    public function transform(User $model): array
    {
        return ['image' => app(AvatarService::class)->url($model)] + parent::transform($model);
    }
}
