<?php

namespace UserAvatars\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Pterodactyl\Models\User;
use UserAvatars\Models\Avatar;
use Symfony\Component\HttpFoundation\Response;

class ImageController extends Controller
{
    private const array HEADERS = [
        'X-Content-Type-Options' => 'nosniff',
        'Content-Security-Policy' => "default-src 'none'; style-src 'unsafe-inline'",
    ];

    /** An uploaded avatar. Tokens change on every upload, so the response can be cached for good. */
    public function show(string $token): Response
    {
        $avatar = Avatar::query()->where('token', $token)->firstOrFail();
        $disk = Storage::disk('local');

        abort_unless($disk->exists($avatar->path()), 404);

        return response($disk->get($avatar->path()), 200, self::HEADERS + [
            'Content-Type' => $avatar->mime,
            'Cache-Control' => 'private, max-age=31536000, immutable',
        ]);
    }

    /** The default picture for users without an upload: their initial on a colour from their UUID. */
    public function initial(string $uuid): Response
    {
        $user = User::query()->where('uuid', $uuid)->firstOrFail();
        $name = trim((string) ($user->name_first ?: $user->username));
        $initial = htmlspecialchars(mb_strtoupper(mb_substr($name, 0, 1)) ?: '?', ENT_XML1);
        $hue = hexdec(substr(md5($user->uuid), 0, 4)) % 360;

        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="hsl({$hue} 45% 42%)"/><text x="32" y="32" dy=".35em" text-anchor="middle" font-family="system-ui,sans-serif" font-size="30" font-weight="600" fill="#fff">{$initial}</text></svg>
SVG;

        return response($svg, 200, self::HEADERS + [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }
}
