<?php

use Illuminate\Support\Facades\Route;
use UserAvatars\Http\Controllers\ImageController;

Route::get('/a/{token}', [ImageController::class, 'show'])->where('token', '[A-Za-z0-9]{40}');
Route::get('/d/{uuid}', [ImageController::class, 'initial'])->whereUuid('uuid');
