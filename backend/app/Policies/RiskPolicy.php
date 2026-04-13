<?php

namespace App\Policies;

use App\Models\Risk;
use App\Models\User;

class RiskPolicy
{
    // Admin gate in AppServiceProvider bypasses all checks for admins

    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view risks
    }

    public function view(User $user, Risk $risk): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'risk_manager']);
    }

    public function update(User $user, Risk $risk): bool
    {
        return $user->hasAnyRole(['admin', 'risk_manager']);
    }

    public function delete(User $user, Risk $risk): bool
    {
        return $user->hasRole('admin');
    }
}
