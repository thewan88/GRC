<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DevAuthController extends Controller
{
    public function login(): JsonResponse
    {
        $user = User::firstOrCreate(
            ['email' => 'dev@localhost'],
            [
                'full_name' => 'Dev Admin',
                'password'  => null,
                'is_active' => true,
            ]
        );

        if ($user->wasRecentlyCreated) {
            $user->assignRole('admin');
        }

        $user->update(['last_login' => now()]);
        Auth::login($user);

        return response()->json([
            'data'   => ['message' => 'Dev login successful.', 'role' => $user->role_name],
            'errors' => null,
        ]);
    }
}
