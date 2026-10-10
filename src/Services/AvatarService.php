<?php

namespace RustixAvatars\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Pterodactyl\Models\User;
use Pterodactyl\Services\Extensions\ExtensionSettings;
use RustixAvatars\Models\Avatar;

class AvatarService
{
    public const int SIZE = 256;

    private const string CACHE_KEY = 'rustix-avatars:tokens';

    /** @var array<int, string>|null user id => token, for every user with an upload */
    private ?array $tokens = null;

    public function __construct(private readonly ExtensionSettings $settings) {}

    public function maxKilobytes(): int
    {
        return (int) $this->settings->get('max_kb', 2048);
    }

    public function hasUpload(User $user): bool
    {
        return isset($this->tokens()[$user->id]);
    }

    /** The URL core components put in <img src>. They append "?s=<size>", so it must take a query string. */
    public function url(User $user): string
    {
        $token = $this->tokens()[$user->id] ?? null;

        if ($token !== null) {
            return url('/extensions/rustix-avatars/a/'.$token);
        }

        return url('/extensions/rustix-avatars/d/'.$user->uuid);
    }

    public function store(User $user, UploadedFile $file): Avatar
    {
        [$bytes, $mime] = $this->normalize($file);

        $previous = Avatar::query()->where('user_id', $user->id)->first();
        $avatar = $previous ?? new Avatar(['user_id' => $user->id]);
        $oldPath = $previous?->path();

        $avatar->token = Str::random(40);
        $avatar->mime = $mime;

        Storage::disk('local')->put($avatar->path(), $bytes);
        $avatar->save();

        if ($oldPath !== null) {
            Storage::disk('local')->delete($oldPath);
        }

        $this->flush();

        return $avatar;
    }

    public function remove(User $user): bool
    {
        $avatar = Avatar::query()->where('user_id', $user->id)->first();

        if ($avatar === null) {
            return false;
        }

        Storage::disk('local')->delete($avatar->path());
        $avatar->delete();
        $this->flush();

        return true;
    }

    /**
     * Re-encode the upload as a square image so nothing but pixels is kept
     * (no metadata, no trailing data, no animation). Without GD, only plain
     * PNG, JPEG and WebP files are accepted and stored unchanged.
     *
     * @return array{0: string, 1: string}
     */
    private function normalize(UploadedFile $file): array
    {
        $contents = (string) file_get_contents($file->getRealPath());

        if (! function_exists('imagecreatefromstring')) {
            $mime = (string) (new \finfo(FILEINFO_MIME_TYPE))->buffer($contents);

            if (! isset(Avatar::EXTENSIONS[$mime]) || @getimagesizefromstring($contents) === false) {
                throw ValidationException::withMessages(['avatar' => 'Upload a PNG, JPEG or WebP image.']);
            }

            return [$contents, $mime];
        }

        $source = @imagecreatefromstring($contents);

        if ($source === false) {
            throw ValidationException::withMessages(['avatar' => 'That file could not be read as an image.']);
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $side = min($width, $height);
        $size = min(self::SIZE, $side);

        $target = imagecreatetruecolor($size, $size);
        imagealphablending($target, false);
        imagesavealpha($target, true);
        imagefill($target, 0, 0, imagecolorallocatealpha($target, 0, 0, 0, 127));
        imagecopyresampled($target, $source, 0, 0, intdiv($width - $side, 2), intdiv($height - $side, 2), $size, $size, $side, $side);

        ob_start();
        if (function_exists('imagewebp')) {
            imagewebp($target, null, 85);
            $mime = 'image/webp';
        } else {
            imagepng($target, null, 6);
            $mime = 'image/png';
        }
        $bytes = (string) ob_get_clean();

        imagedestroy($source);
        imagedestroy($target);

        return [$bytes, $mime];
    }

    /** @return array<int, string> */
    private function tokens(): array
    {
        return $this->tokens ??= Cache::rememberForever(
            self::CACHE_KEY,
            fn () => Avatar::query()->pluck('token', 'user_id')->all(),
        );
    }

    private function flush(): void
    {
        $this->tokens = null;
        Cache::forget(self::CACHE_KEY);
    }
}
