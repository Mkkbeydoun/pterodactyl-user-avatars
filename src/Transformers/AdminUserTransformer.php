<?php

namespace UserAvatars\Transformers;

use Pterodactyl\Models\User;
use Pterodactyl\Transformers\Api\Admin\UserTransformer;
use UserAvatars\Services\AvatarService;

class AdminUserTransformer extends UserTransformer
{
    public function transform(User $user): array
    {
        return ['image' => app(AvatarService::class)->url($user)] + parent::transform($user);
    }
}
