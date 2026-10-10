<?php

use Illuminate\Support\Facades\Route;
use UserAvatars\Http\Controllers\AdminAvatarController;

Route::get('/users/{user}', [AdminAvatarController::class, 'show'])->whereNumber('user');
Route::delete('/users/{user}', [AdminAvatarController::class, 'destroy'])->whereNumber('user');
