<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'risk_manager']);
    }

    public function export(User $user): bool
    {
        return $user->hasRole('admin');
    }
}
