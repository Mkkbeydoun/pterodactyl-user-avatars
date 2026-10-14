<?php

namespace UserAvatars\Http;

use Illuminate\Foundation\Http\Events\RequestHandled;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\User;
use UserAvatars\Services\AvatarService;

/**
 * The panel's API resources build a user's "image" themselves and cannot be replaced,
 * so API responses are patched on the way out: every user (admin users, a server's
 * owner, subusers, activity actors) gets the uploaded or default picture.
 */
class UserImages
{
    /** Objects whose attributes are a user's, "image" included (subusers carry their user's). */
    private const array OBJECTS = ['user', 'server_subuser'];

    public function __construct(private readonly AvatarService $avatars) {}

    public function handle(RequestHandled $event): void
    {
        $response = $event->response;

        if (! $response instanceof JsonResponse || ! $event->request->is('api/*')) {
            return;
        }

        $content = (string) $response->getContent();
        if (! str_contains($content, '"image"')) {
            return;
        }

        $data = $response->getData();
        $users = [];
        $this->collect($data, $users);

        if ($users === []) {
            return;
        }

        $ids = User::query()->whereIn('uuid', array_keys($users))->pluck('id', 'uuid');

        foreach ($users as $uuid => $attributes) {
            if (! isset($ids[$uuid])) {
                continue;
            }

            $url = $this->avatars->urlFor((int) $ids[$uuid], $uuid);
            foreach ($attributes as $object) {
                $object->image = $url;
            }
        }

        $response->setData($data);
    }

    /** @param array<string, list<object>> $users uuid => attribute objects to update */
    private function collect(mixed $node, array &$users): void
    {
        if (is_array($node)) {
            foreach ($node as $child) {
                $this->collect($child, $users);
            }

            return;
        }

        if (! is_object($node)) {
            return;
        }

        if (in_array($node->object ?? null, self::OBJECTS, true) && isset($node->attributes) && is_object($node->attributes)) {
            $attributes = $node->attributes;
            if (is_string($attributes->uuid ?? null) && property_exists($attributes, 'image')) {
                $users[$attributes->uuid][] = $attributes;
            }
        }

        foreach (get_object_vars($node) as $child) {
            $this->collect($child, $users);
        }
    }
}
