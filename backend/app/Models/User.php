<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, HasUuids, Notifiable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'azure_oid',
        'email',
        'full_name',
        'password',
        'is_active',
        'last_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
            'last_login' => 'datetime',
        ];
    }

    public function getRoleNameAttribute(): string
    {
        return $this->roles->first()?->name ?? 'viewer';
    }

    public function ownedRisks(): HasMany
    {
        return $this->hasMany(Risk::class, 'owner_id');
    }

    public function createdRisks(): HasMany
    {
        return $this->hasMany(Risk::class, 'created_by_id');
    }

    public function ownedAssets(): HasMany
    {
        return $this->hasMany(Asset::class, 'owner_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}
