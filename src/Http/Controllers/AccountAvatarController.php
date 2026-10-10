<?php

namespace UserAvatars\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use UserAvatars\Services\AvatarService;

class AccountAvatarController extends Controller
{
    public function __construct(private readonly AvatarService $avatars) {}

    public function show(Request $request): JsonResponse
    {
        return new JsonResponse($this->payload($request));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'file', 'mimes:png,jpg,jpeg,webp,gif', 'max:'.$this->avatars->maxKilobytes()],
        ]);

        $this->avatars->store($request->user(), $request->file('avatar'));

        return new JsonResponse($this->payload($request));
    }

    public function destroy(Request $request): Response
    {
        $this->avatars->remove($request->user());

        return response()->noContent();
    }

    /** @return array<string, mixed> */
    private function payload(Request $request): array
    {
        $user = $request->user();

        return [
            'url' => $this->avatars->url($user),
            'uploaded' => $this->avatars->hasUpload($user),
            'max_kb' => $this->avatars->maxKilobytes(),
        ];
    }
}
