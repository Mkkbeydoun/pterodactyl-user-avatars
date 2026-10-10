<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Up to 2.0.0 this extension was installed as "rustix-avatars". Copy its
 * pictures across so users keep them after switching to "user-avatars".
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('ext_rustix_avatars') || DB::table('ext_user_avatars')->exists()) {
            return;
        }

        $disk = Storage::disk('local');

        foreach (DB::table('ext_rustix_avatars')->get() as $row) {
            $extension = ['image/webp' => 'webp', 'image/png' => 'png', 'image/jpeg' => 'jpg'][$row->mime] ?? null;
            $from = "extensions/rustix-avatars/{$row->token}.{$extension}";

            if ($extension === null || ! $disk->exists($from)) {
                continue;
            }

            $disk->copy($from, "extensions/user-avatars/{$row->token}.{$extension}");
            DB::table('ext_user_avatars')->insert([
                'user_id' => $row->user_id,
                'token' => $row->token,
                'mime' => $row->mime,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }
    }

    public function down(): void
    {
        // The old extension's data is left untouched, so there is nothing to undo.
    }
};
