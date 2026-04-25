<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /** GET /api/v1/users — list all users (admin only) */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $users = User::with('roles')
            ->when($request->search, fn($q) =>
                $q->where('full_name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when(isset($request->is_active), fn($q) =>
                $q->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN))
            )
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $users->map(fn($u) => $this->formatUser($u)),
            'meta' => [
                'page'     => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total'    => $users->total(),
            ],
            'errors' => null,
        ]);
    }

    /** POST /api/v1/users — create an invited/pending user (admin only) */
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', User::class);

        $validated = $request->validate([
            'email'     => ['required', 'email:rfc', 'max:255', 'unique:users,email'],
            'full_name' => ['required', 'string', 'max:255'],
            'role'      => ['required', Rule::in(['admin', 'risk_manager', 'asset_owner', 'viewer'])],
        ]);

        $user = DB::transaction(function () use ($validated) {
            $user = User::create([
                'email'     => strtolower($validated['email']),
                'full_name' => $validated['full_name'],
                'password'  => null,
                'is_active' => true,
            ]);

            $user->assignRole($validated['role']);

            return $user;
        });

        return response()->json([
            'data'   => $this->formatUser($user->fresh()->load('roles')),
            'errors' => null,
        ], 201);
    }

    /** GET /api/v1/users/{id} */
    public function show(User $user): JsonResponse
    {
        Gate::authorize('view', $user);
        return response()->json(['data' => $this->formatUser($user->load('roles')), 'errors' => null]);
    }

    /** PATCH /api/v1/users/{id}/role — change user role (admin only) */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        Gate::authorize('update', $user);

        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'risk_manager', 'asset_owner', 'viewer'])],
        ]);

        $user->syncRoles([$validated['role']]);

        return response()->json(['data' => $this->formatUser($user->fresh()->load('roles')), 'errors' => null]);
    }

    /** PATCH /api/v1/users/{id}/deactivate — deactivate user (admin only, never hard delete) */
    public function deactivate(User $user): JsonResponse
    {
        Gate::authorize('update', $user);

        if ($user->id === auth()->id()) {
            return response()->json(['data' => null, 'errors' => ['message' => 'Cannot deactivate your own account.']], 422);
        }

        $user->update(['is_active' => false]);

        return response()->json(['data' => $this->formatUser($user->load('roles')), 'errors' => null]);
    }

    /** PATCH /api/v1/users/{id}/activate */
    public function activate(User $user): JsonResponse
    {
        Gate::authorize('update', $user);
        $user->update(['is_active' => true]);
        return response()->json(['data' => $this->formatUser($user->load('roles')), 'errors' => null]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id'         => $user->id,
            'email'      => $user->email,
            'full_name'  => $user->full_name,
            'role'       => $user->role_name,
            'is_active'  => $user->is_active,
            'last_login' => $user->last_login?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }
}
