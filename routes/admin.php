<?php

use Illuminate\Support\Facades\Route;
use RustixAvatars\Http\Controllers\AdminAvatarController;

Route::get('/users/{user}', [AdminAvatarController::class, 'show'])->whereNumber('user');
Route::delete('/users/{user}', [AdminAvatarController::class, 'destroy'])->whereNumber('user');
