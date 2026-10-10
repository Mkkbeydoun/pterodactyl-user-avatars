<?php

namespace RustixAvatars\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string $token
 * @property string $mime
 */
class Avatar extends Model
{
    protected $table = 'ext_rustix_avatars';

    protected $fillable = ['user_id', 'token', 'mime'];

    public const array EXTENSIONS = [
        'image/webp' => 'webp',
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
    ];

    public function path(): string
    {
        return 'extensions/rustix-avatars/'.$this->token.'.'.self::EXTENSIONS[$this->mime];
    }
}
