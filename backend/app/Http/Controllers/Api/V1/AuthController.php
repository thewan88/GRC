<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Redirect to Microsoft Entra ID login page.
     * Frontend calls: GET /api/v1/auth/redirect
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('azure')->redirect();
    }

    /**
     * Handle callback from Entra ID after successful authentication.
     * Entra ID redirects to: GET /api/v1/auth/callback
     */
    public function callback(Request $request): RedirectResponse
    {
        $azureUser = Socialite::driver('azure')->user();

        // Attach Entra ID identities to invited users by email, otherwise
        // update/create by the stable Azure object ID.
        $user = User::where('azure_oid', $azureUser->getId())
            ->orWhere(function ($query) use ($azureUser) {
                $query->whereNull('azure_oid')
                    ->where('email', $azureUser->getEmail());
            })
            ->first();

        $wasRecentlyCreated = false;

        if ($user) {
            $user->update([
                'azure_oid' => $azureUser->getId(),
                'email'     => $azureUser->getEmail(),
                'full_name' => $azureUser->getName(),
                'password'  => null, // Entra ID users have no local password
            ]);
        } else {
            $user = User::create([
                'azure_oid' => $azureUser->getId(),
                'email'     => $azureUser->getEmail(),
                'full_name' => $azureUser->getName(),
                'password'  => null,
            ]);
            $wasRecentlyCreated = true;
        }

        // First-time login: assign default viewer role
        if ($wasRecentlyCreated) {
            $user->assignRole('viewer');
        }

        // Block inactive users
        if (!$user->is_active) {
            return redirect(env('APP_URL', 'http://localhost:3000') . '/login?error=inactive');
        }

        $user->update(['last_login' => now()]);

        Auth::login($user);

        // Redirect to internal GRC dashboard after auth
        return redirect(env('APP_URL', 'http://localhost:3000') . '/dashboard');
    }

    /**
     * Return the authenticated user's profile.
     * GET /api/v1/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');

        return response()->json([
            'data' => [
                'id'        => $user->id,
                'email'     => $user->email,
                'full_name' => $user->full_name,
                'role'      => $user->role_name,
                'is_active' => $user->is_active,
                'last_login' => $user->last_login?->toIso8601String(),
            ],
            'errors' => null,
        ]);
    }

    /**
     * Log out — clear Sanctum session.
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['data' => ['message' => 'Logged out.'], 'errors' => null]);
    }
}
