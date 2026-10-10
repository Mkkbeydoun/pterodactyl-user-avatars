<?php

namespace UserAvatars\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Pterodactyl\Models\User;
use UserAvatars\Services\AvatarService;

class AdminAvatarController extends Controller
{
    public function __construct(private readonly AvatarService $avatars) {}

    public function show(int $user): JsonResponse
    {
        $model = User::query()->findOrFail($user);

        return new JsonResponse([
            'url' => $this->avatars->url($model),
            'uploaded' => $this->avatars->hasUpload($model),
        ]);
    }

    public function destroy(int $user): Response
    {
        $this->avatars->remove(User::query()->findOrFail($user));

        return response()->noContent();
    }
}
