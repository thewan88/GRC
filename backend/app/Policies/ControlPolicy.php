<?php

namespace App\Policies;

use App\Models\Control;
use App\Models\User;

class ControlPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Control $control): bool
    {
        return true;
    }

    public function update(User $user, Control $control): bool
    {
        return $user->hasAnyRole(['admin', 'risk_manager']);
    }
}
