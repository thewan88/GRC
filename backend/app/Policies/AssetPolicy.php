<?php

namespace App\Policies;

use App\Models\Asset;
use App\Models\User;

class AssetPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Asset $asset): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'risk_manager', 'asset_owner']);
    }

    public function update(User $user, Asset $asset): bool
    {
        // Asset owners can only edit their own assets
        if ($user->hasRole('asset_owner')) {
            return $asset->owner_id === $user->id;
        }
        return $user->hasAnyRole(['admin', 'risk_manager']);
    }

    public function delete(User $user, Asset $asset): bool
    {
        return $user->hasRole('admin');
    }
}
