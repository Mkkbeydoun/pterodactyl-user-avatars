<?php

use Illuminate\Support\Facades\Route;
use RustixAvatars\Http\Controllers\AccountAvatarController;

Route::get('/me', [AccountAvatarController::class, 'show']);
Route::post('/me', [AccountAvatarController::class, 'store']);
Route::delete('/me', [AccountAvatarController::class, 'destroy']);
