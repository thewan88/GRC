<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasUuids;

    protected $table = 'audit_log';

    // Append-only: no updated_at
    const UPDATED_AT = null;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'user_email',
        'action',
        'resource_type',
        'resource_id',
        'resource_ref',
        'old_values',
        'new_values',
        'changed_fields',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'old_values'     => 'array',
            'new_values'     => 'array',
            'changed_fields' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
