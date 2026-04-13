<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Control extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'control_ref',
        'name',
        'description',
        'theme',
        'status',
        'na_justification',
        'implementation_notes',
        'evidence',
        'owner_id',
        'last_review_date',
    ];

    protected function casts(): array
    {
        return [
            'evidence'         => 'array',
            'last_review_date' => 'date',
        ];
    }

    public function getIsApplicableAttribute(): bool
    {
        return $this->status !== 'Not Applicable';
    }

    public function getIsImplementedAttribute(): bool
    {
        return in_array($this->status, ['Implemented', 'Tested']);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function risks(): BelongsToMany
    {
        return $this->belongsToMany(Risk::class, 'risk_controls');
    }

    public function assets(): BelongsToMany
    {
        return $this->belongsToMany(Asset::class, 'asset_controls');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'resource_id');
    }

    public function scopeApplicable($query)
    {
        return $query->where('status', '!=', 'Not Applicable');
    }

    public function scopeImplemented($query)
    {
        return $query->whereIn('status', ['Implemented', 'Tested']);
    }

    public function scopeByTheme($query, string $theme)
    {
        return $query->where('theme', $theme);
    }
}
